class ApiService {
    constructor() {
        this.geoApiUrl = 'https://geo.api.gouv.fr/communes';
        this.meteoApiUrl = 'https://api.meteo-concept.com/api';
        
        this.meteoApiToken = '3d7c911dc63115c2675b8c1153c8baa709638c6f8e9f30e00f93a96cfbc8fe5e';
        
        this.cache = new Map();
        
        this.cacheExpiry = 5 * 60 * 1000;
    }

    /**
     * La requete HTTP est géré cii
     * @param {string} url
     * @param {Object} options
     * @returns {Promise}
     */
    async fetchWithErrorHandling(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('API response:', { url, status: response.status, data });
            return data;
        } catch (error) {
            console.error('Erreur lors de la requête:', error.message, { url, options });
            throw error;
        }
    }

    /**
     * ici c'est le cache des requetes
     * @param {string} key
     * @param {Function} fetchFunction
     * @returns {Promise}
     */
    async getCachedData(key, fetchFunction) {
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log('Données récupérées du cache:', key);
            return cached.data;
        }

        try {
            const data = await fetchFunction();
            this.cache.set(key, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.warn('Erreur API, utilisation du cache expiré:', error.message, { key });
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }

    /**
     * Recherche des communes par code postal
     * @param {string} postalCode
     * @returns {Promise<Array>}
     */
    async searchCitiesByPostalCode(postalCode) {
        if (!postalCode || postalCode.length !== 5) {
            throw new Error('Le code postal doit contenir exactement 5 chiffres');
        }

        const cacheKey = `cities_${postalCode}`;
        
        this.cache.delete(cacheKey);
        console.log('Cache supprimé pour:', cacheKey);

        return this.getCachedData(cacheKey, async () => {
            const url = `${this.geoApiUrl}?codePostal=${postalCode}&fields=nom,code,codesPostaux,centre&format=json&geometry=centre`;
            console.log('Fetching cities for postal code:', postalCode);
            const cities = await this.fetchWithErrorHandling(url);
            
            if (!Array.isArray(cities)) {
                console.error('Réponse Geo API invalide, pas un tableau:', cities);
                throw new Error('Format des données des communes inattendu');
            }

            if (cities.length === 0) {
                console.warn('Aucune commune trouvée dans la réponse API pour:', postalCode);
                throw new Error(`Aucune commune trouvée pour le code postal ${postalCode}`);
            }

            const formattedCities = cities.map(city => ({
                name: city.nom,
                code: city.code,
                postalCode: postalCode,
                latitude: city.centre?.coordinates?.[1] || null,
                longitude: city.centre?.coordinates?.[0] || null,
                displayName: `${city.nom} (${city.code})`
            }));
            console.log('Formatted cities:', formattedCities);
            return formattedCities;
        });
    }

    /**
     * Récuperation des prévisions météo pour une commune
     * @param {string} cityCode
     * @param {number} days
     * @returns {Promise<Array>}
     */
    async getWeatherForecast(cityCode, days = 1) {
        if (!cityCode) {
            throw new Error('Le code de la commune est requis');
        }

        if (days < 1 || days > 7) {
            throw new Error('Le nombre de jours doit être entre 1 et 7');
        }

        if (!this.meteoApiToken) {
            throw new Error('Token API Météo Concept non configuré. Veuillez configurer votre token dans apiService.js');
        }

        const cacheKey = `weather_${cityCode}_${days}`;
        
        return this.getCachedData(cacheKey, async () => {
            const url = `${this.meteoApiUrl}/forecast/daily?token=${this.meteoApiToken}&insee=${cityCode}`;
            console.log('Fetching weather for INSEE code:', cityCode, 'Days:', days);
            const weatherData = await this.fetchWithErrorHandling(url);
            
            if (!weatherData) {
                console.error('Réponse API Météo vide:', weatherData);
                throw new Error('Aucune donnée météorologique reçue');
            }

            if (!weatherData.forecast) {
                console.error('Propriété forecast absente dans la réponse:', weatherData);
                throw new Error('Données météorologiques non disponibles');
            }

            if (!Array.isArray(weatherData.forecast)) {
                console.error('weatherData.forecast n\'est pas un tableau:', weatherData.forecast);
                throw new Error('Format des données météo inattendu: forecast n\'est pas un tableau');
            }

            const forecast = weatherData.forecast.slice(0, days);

            if (forecast.length === 0) {
                throw new Error('Aucune prévision météo disponible pour cette commune');
            }

            return forecast.map(day => ({
                datetime: day.datetime || new Date().toISOString().split('T')[0],
                tmin: Math.round(day.tmin || 0),
                tmax: Math.round(day.tmax || 0),
                probarain: day.probarain || 0,
                sun_hours: day.sun_hours ? Math.round(day.sun_hours * 10) / 10 : 0,
                rr10: day.rr10 || 0,
                wind10m: day.wind10m ? Math.round(day.wind10m) : 0,
                dirwind10m: day.dirwind10m || 0,
                weather: day.weather || 0,
                latitude: weatherData.city?.latitude || null,
                longitude: weatherData.city?.longitude || null
            }));
        });
    }

    /**
     * Récupère les informations de la commune 
     * @param {string} cityCode
     * @returns {Promise<Object>}
     */
    async getCityDetails(cityCode) {
        const cacheKey = `city_details_${cityCode}`;
        
        return this.getCachedData(cacheKey, async () => {
            const url = `${this.geoApiUrl}/${cityCode}?fields=nom,code,codesPostaux,centre,surface,population&format=json&geometry=centre`;
            const cityData = await this.fetchWithErrorHandling(url);
            
            return {
                name: cityData.nom,
                code: cityData.code,
                postalCodes: cityData.codesPostaux,
                latitude: cityData.centre?.coordinates?.[1] || null,
                longitude: cityData.centre?.coordinates?.[0] || null,
                surface: cityData.surface || null,
                population: cityData.population || null
            };
        });
    }

    /**
     * Valide et nettoie un code postal
     * @param {string} postalCode
     * @returns {string}
     */
    sanitizePostalCode(postalCode) {
        if (!postalCode) return '';
        
        const cleaned = postalCode.replace(/\D/g, '');
        
        return cleaned.slice(0, 5);
    }

    /**
     * Validation du code postal
     * @param {string} postalCode
     * @returns {boolean}
     */
    isValidPostalCode(postalCode) {
        const regex = /^[0-9]{5}$/;
        return regex.test(postalCode);
    }

    /**
     * Gère les erreurs d'API
     * @param {Error} error
     * @returns {string}
     */
    handleApiError(error) {
        console.error('Erreur API détaillée:', error.message, error.stack);
        
        if (error.message.includes('Failed to fetch')) {
            return 'Impossible de se connecter au service. Vérifiez votre connexion internet.';
        }
        
        if (error.message.includes('404')) {
            return 'Service non disponible. Veuillez réessayer plus tard.';
        }
        
        if (error.message.includes('401') || error.message.includes('403')) {
            return 'Erreur d\'authentification avec l\'API. Vérifiez votre configuration.';
        }
        
        if (error.message.includes('429')) {
            return 'Trop de requêtes. Veuillez patienter avant de réessayer.';
        }
        
        if (error.message.includes('500')) {
            return 'Erreur du serveur. Veuillez réessayer plus tard.';
        }
        
        if (error.message.includes('Token API')) {
            return error.message;
        }
        
        if (error.message.includes('code postal')) {
            return error.message;
        }
        
        if (error.message.includes('commune')) {
            return error.message;
        }
        
        return `Une erreur inattendue s'est produite: ${error.message}. Veuillez réessayer.`;
    }

    clearCache() {
        this.cache.clear();
        console.log('Cache effacé');
    }

    /**
     * récup les statistiques du cache
     * @returns {Object}
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp < this.cacheExpiry) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }
        
        return {
            total: this.cache.size,
            valid: validEntries,
            expired: expiredEntries
        };
    }

    cleanExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.cacheExpiry) {
                expiredKeys.push(key);
            }
        }
        
        expiredKeys.forEach(key => this.cache.delete(key));
        
        if (expiredKeys.length > 0) {
            console.log(`${expiredKeys.length} entrées expirées supprimées du cache`);
        }
    }

    /**
     * Configure le token API
     * @param {string} token
     */
    setMeteoApiToken(token) {
        this.meteoApiToken = token;
        console.log('Token API Météo Concept configuré');
    }

    /**
     * Test la connexion aux API
     * @returns {Promise<Object>}
     */
    async testApiConnections() {
        const results = {
            geoApi: { status: 'unknown', message: '' },
            meteoApi: { status: 'unknown', message: '' }
        };

        try {
            await this.searchCitiesByPostalCode('75001');
            results.geoApi = { status: 'success', message: 'API Geo fonctionnelle' };
        } catch (error) {
            results.geoApi = { status: 'error', message: this.handleApiError(error) };
        }

        try {
            if (!this.meteoApiToken) {
                results.meteoApi = { status: 'error', message: 'Token API non configuré' };
            } else {
                await this.getWeatherForecast('75056', 1); // Paris
                results.meteoApi = { status: 'success', message: 'API Météo fonctionnelle' };
            }
        } catch (error) {
            results.meteoApi = { status: 'error', message: this.handleApiError(error) };
        }

        return results;
    }
}

const apiService = new ApiService();