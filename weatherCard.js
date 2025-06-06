/**
 * Classe WeatherCard pour créer et gérer les cartes météorologiques
 */
class WeatherCard {
    constructor(weatherData, options = {}) {
        this.data = weatherData;
        this.options = options;
        this.selectedOptions = options.selectedOptions || [];
    }

    /**
     * Obtient l'icône météo appropriée basée sur le code météo
     * @param {number} weatherCode - Code météo de l'API
     * @returns {string} - Classe d'icône Font Awesome
     */
    getWeatherIcon(weatherCode) {
        const iconMap = {
            0: 'fas fa-sun', // Soleil
            1: 'fas fa-cloud-sun', // Peu nuageux
            2: 'fas fa-cloud', // Nuageux
            3: 'fas fa-cloud', // Très nuageux
            4: 'fas fa-smog', // Brouillard
            5: 'fas fa-cloud-rain', // Pluie légère
            6: 'fas fa-cloud-rain', // Pluie modérée
            7: 'fas fa-cloud-showers-heavy', // Pluie forte
            8: 'fas fa-snowflake', // Neige légère
            9: 'fas fa-snowflake', // Neige modérée
            10: 'fas fa-snowflake', // Neige forte
            11: 'fas fa-bolt', // Orage
            12: 'fas fa-bolt', // Orage violent
            13: 'fas fa-cloud-rain', // Averses
            14: 'fas fa-cloud-rain', // Averses orageuses
            15: 'fas fa-wind' // Vent fort
        };
        
        return iconMap[weatherCode] || 'fas fa-question';
    }

    /**
     * Formate la date en français
     * @param {string} dateString - Date au format ISO
     * @returns {string} - Date formatée
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('fr-FR', options);
    }

    /**
     * Obtient la description météo en français
     * @param {number} weatherCode - Code météo
     * @returns {string} - Description météo
     */
    getWeatherDescription(weatherCode) {
        const descriptions = {
            0: 'Soleil',
            1: 'Peu nuageux',
            2: 'Nuageux',
            3: 'Très nuageux',
            4: 'Brouillard',
            5: 'Pluie légère',
            6: 'Pluie modérée',
            7: 'Pluie forte',
            8: 'Neige légère',
            9: 'Neige modérée',
            10: 'Neige forte',
            11: 'Orage',
            12: 'Orage violent',
            13: 'Averses',
            14: 'Averses orageuses',
            15: 'Vent fort'
        };
        
        return descriptions[weatherCode] || 'Conditions inconnues';
    }

    /**
     * Convertit la direction du vent en cardinal
     * @param {number} degrees - Direction en degrés
     * @returns {string} - Direction cardinale
     */
    getWindDirection(degrees) {
        const directions = [
            'N', 'NNE', 'NE', 'ENE',
            'E', 'ESE', 'SE', 'SSE',
            'S', 'SSO', 'SO', 'OSO',
            'O', 'ONO', 'NO', 'NNO'
        ];
        
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    /**
     * Crée les détails optionnels de la carte
     * @returns {string} - HTML des détails optionnels
     */
    createOptionalDetails() {
        let detailsHTML = '';
        
        this.selectedOptions.forEach(option => {
            switch(option) {
                case 'latitude':
                    if (this.data.latitude !== undefined) {
                        detailsHTML += `
                            <div class="weather-detail">
                                <i class="fas fa-globe weather-detail-icon"></i>
                                <div class="weather-detail-value">${this.data.latitude.toFixed(4)}°</div>
                                <div class="weather-detail-label">Latitude</div>
                            </div>
                        `;
                    }
                    break;
                    
                case 'longitude':
                    if (this.data.longitude !== undefined) {
                        detailsHTML += `
                            <div class="weather-detail">
                                <i class="fas fa-globe weather-detail-icon"></i>
                                <div class="weather-detail-value">${this.data.longitude.toFixed(4)}°</div>
                                <div class="weather-detail-label">Longitude</div>
                            </div>
                        `;
                    }
                    break;
                    
                case 'rainfall':
                    if (this.data.rr10 !== undefined) {
                        detailsHTML += `
                            <div class="weather-detail">
                                <i class="fas fa-cloud-rain weather-detail-icon"></i>
                                <div class="weather-detail-value">${this.data.rr10} mm</div>
                                <div class="weather-detail-label">Cumul pluie</div>
                            </div>
                        `;
                    }
                    break;
                    
                case 'wind':
                    if (this.data.wind10m !== undefined) {
                        detailsHTML += `
                            <div class="weather-detail">
                                <i class="fas fa-wind weather-detail-icon"></i>
                                <div class="weather-detail-value">${this.data.wind10m} km/h</div>
                                <div class="weather-detail-label">Vent moyen</div>
                            </div>
                        `;
                    }
                    break;
                    
                case 'windDirection':
                    if (this.data.dirwind10m !== undefined) {
                        const cardinal = this.getWindDirection(this.data.dirwind10m);
                        detailsHTML += `
                            <div class="weather-detail">
                                <i class="fas fa-compass weather-detail-icon"></i>
                                <div class="weather-detail-value">${cardinal} (${this.data.dirwind10m}°)</div>
                                <div class="weather-detail-label">Direction vent</div>
                            </div>
                        `;
                    }
                    break;
            }
        });
        
        return detailsHTML;
    }

    /**
     * Crée les détails de base de la carte météo
     * @returns {string} - HTML des détails de base
     */
    createBaseDetails() {
        return `
            <div class="weather-detail">
                <i class="fas fa-eye weather-detail-icon"></i>
                <div class="weather-detail-value">${this.data.probarain || 0}%</div>
                <div class="weather-detail-label">Prob. pluie</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-sun weather-detail-icon"></i>
                <div class="weather-detail-value">${this.data.sun_hours || 0}h</div>
                <div class="weather-detail-label">Ensoleillement</div>
            </div>
        `;
    }

    /**
     * Génère le HTML complet de la carte météo
     * @returns {string} - HTML de la carte météo
     */
    render() {
        const weatherIcon = this.getWeatherIcon(this.data.weather);
        const weatherDescription = this.getWeatherDescription(this.data.weather);
        const formattedDate = this.formatDate(this.data.datetime);
        const baseDetails = this.createBaseDetails();
        const optionalDetails = this.createOptionalDetails();
        
        return `
            <div class="weather-card" data-date="${this.data.datetime}">
                <div class="weather-card-header">
                    <div class="weather-card-date">${formattedDate}</div>
                    <div class="weather-card-icon">
                        <i class="${weatherIcon}" title="${weatherDescription}"></i>
                    </div>
                </div>
                
                <div class="weather-card-main">
                    <div class="temperature-range">
                        <div class="temp-max">${this.data.tmax}°C</div>
                        <div class="temp-min">${this.data.tmin}°C</div>
                    </div>
                    <div class="weather-description">
                        <strong>${weatherDescription}</strong>
                    </div>
                </div>
                
                <div class="weather-card-details">
                    ${baseDetails}
                    ${optionalDetails}
                </div>
            </div>
        `;
    }

    /**
     * Crée et insère la carte dans le DOM
     * @param {HTMLElement} container - Conteneur où insérer la carte
     */
    appendTo(container) {
        const cardHTML = this.render();
        container.insertAdjacentHTML('beforeend', cardHTML);
    }

    /**
     * Méthode statique pour créer plusieurs cartes
     * @param {Array} weatherDataArray - Tableau de données météo
     * @param {Object} options - Options pour les cartes
     * @returns {Array} - Tableau d'instances WeatherCard
     */
    static createMultiple(weatherDataArray, options = {}) {
        return weatherDataArray.map(data => new WeatherCard(data, options));
    }

    /**
     * Méthode statique pour rendre plusieurs cartes dans un conteneur
     * @param {Array} weatherDataArray - Tableau de données météo
     * @param {HTMLElement} container - Conteneur DOM
     * @param {Object} options - Options pour les cartes
     */
    static renderMultiple(weatherDataArray, container, options = {}) {
        // Vider le conteneur
        container.innerHTML = '';
        
        // Créer et ajouter chaque carte
        weatherDataArray.forEach((data, index) => {
            const card = new WeatherCard(data, options);
            
            // Ajouter un délai d'animation pour chaque carte
            setTimeout(() => {
                card.appendTo(container);
            }, index * 100);
        });
    }

    /**
     * Compare deux cartes météo (pour la fonctionnalité de comparaison)
     * @param {WeatherCard} otherCard - Autre carte à comparer
     * @returns {Object} - Objet de comparaison
     */
    compareTo(otherCard) {
        return {
            temperatureDiff: {
                max: this.data.tmax - otherCard.data.tmax,
                min: this.data.tmin - otherCard.data.tmin
            },
            rainProbabilityDiff: (this.data.probarain || 0) - (otherCard.data.probarain || 0),
            sunHoursDiff: (this.data.sun_hours || 0) - (otherCard.data.sun_hours || 0),
            date1: this.data.datetime,
            date2: otherCard.data.datetime
        };
    }

    /**
     * Crée une carte de comparaison
     * @param {WeatherCard} otherCard - Autre carte à comparer
     * @param {string} city1Name - Nom de la première ville
     * @param {string} city2Name - Nom de la deuxième ville
     * @returns {string} - HTML de la carte de comparaison
     */
    createComparisonCard(otherCard, city1Name, city2Name) {
        const comparison = this.compareTo(otherCard);
        
        return `
            <div class="comparison-card">
                <h4 class="comparison-card-title">
                    Comparaison: ${city1Name} vs ${city2Name}
                </h4>
                
                <div class="comparison-details">
                    <div class="comparison-item">
                        <span class="comparison-label">Température max:</span>
                        <span class="comparison-values">
                            ${this.data.tmax}°C vs ${otherCard.data.tmax}°C
                            <span class="comparison-diff ${comparison.temperatureDiff.max > 0 ? 'positive' : 'negative'}">
                                (${comparison.temperatureDiff.max > 0 ? '+' : ''}${comparison.temperatureDiff.max}°C)
                            </span>
                        </span>
                    </div>
                    
                    <div class="comparison-item">
                        <span class="comparison-label">Température min:</span>
                        <span class="comparison-values">
                            ${this.data.tmin}°C vs ${otherCard.data.tmin}°C
                            <span class="comparison-diff ${comparison.temperatureDiff.min > 0 ? 'positive' : 'negative'}">
                                (${comparison.temperatureDiff.min > 0 ? '+' : ''}${comparison.temperatureDiff.min}°C)
                            </span>
                        </span>
                    </div>
                    
                    <div class="comparison-item">
                        <span class="comparison-label">Probabilité de pluie:</span>
                        <span class="comparison-values">
                            ${this.data.probarain || 0}% vs ${otherCard.data.probarain || 0}%
                            <span class="comparison-diff ${comparison.rainProbabilityDiff < 0 ? 'positive' : 'negative'}">
                                (${comparison.rainProbabilityDiff > 0 ? '+' : ''}${comparison.rainProbabilityDiff}%)
                            </span>
                        </span>
                    </div>
                    
                    <div class="comparison-item">
                        <span class="comparison-label">Ensoleillement:</span>
                        <span class="comparison-values">
                            ${this.data.sun_hours || 0}h vs ${otherCard.data.sun_hours || 0}h
                            <span class="comparison-diff ${comparison.sunHoursDiff > 0 ? 'positive' : 'negative'}">
                                (${comparison.sunHoursDiff > 0 ? '+' : ''}${comparison.sunHoursDiff}h)
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}