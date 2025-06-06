class ApiService {
    constructor() {
        this.geoApiUrl = 'https://geo.api.gouv.fr/communes';
        this.meteoApiUrl = 'https://api.meteo-concept.com/api';
        
        this.meteoApiToken = '3d7c911dc63115c2675b8c1153c8baa709638c6f8e9f30e00f93a96cfbc8fe5e';
        
        this.cache = new Map();
        
        this.cacheExpiry = 5 * 60 * 1000;
    }

    /**
     * La requete HTTP est géré ci
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
}