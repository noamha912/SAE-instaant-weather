class WeatherCard {
    constructor(weatherData, options = {}) {
        this.data = weatherData;
        this.options = options;
        this.selectedOptions = options.selectedOptions || [];
    }

    /**
     * icones météo
     * @param {number} weatherCode
     * @returns {string}
     */
    getWeatherIcon(weatherCode) {
        const iconMap = {
            0: 'fas fa-sun',
            1: 'fas fa-cloud-sun',
            2: 'fas fa-cloud',
            3: 'fas fa-cloud',
            4: 'fas fa-smog',
            5: 'fas fa-cloud-rain',
            6: 'fas fa-cloud-rain',
            7: 'fas fa-cloud-showers-heavy',
            8: 'fas fa-snowflake',
            9: 'fas fa-snowflake',
            10: 'fas fa-snowflake',
            11: 'fas fa-bolt',
            12: 'fas fa-bolt',
            13: 'fas fa-cloud-rain',
            14: 'fas fa-cloud-rain',
            15: 'fas fa-wind'
        };
        
        return iconMap[weatherCode] || 'fas fa-question';
    }

    /**
     * datebon format
     * @param {string} dateString
     * @returns {string}
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
     * description météo
     * @param {number} weatherCode
     * @returns {string}
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
     * direction du vent
     * @param {number} degrees
     * @returns {string}
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
     * détail carte
     * @returns {string}
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
     * détail de base carte
     * @returns {string}
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
     * le html de la carte
     * @returns {string}
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
     * @param {HTMLElement} container
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
     * @param {Array} weatherDataArray
     * @param {HTMLElement} container
     * @param {Object} options
     */
    static renderMultiple(weatherDataArray, container, options = {}) {
        container.innerHTML = '';
        
        weatherDataArray.forEach((data, index) => {
            const card = new WeatherCard(data, options);
            
            setTimeout(() => {
                card.appendTo(container);
            }, index * 100);
        });
    }

    /**
     * Compare deux cartes météo (pour la fonctionnalité de comparaison)
     * @param {WeatherCard} otherCard
     * @returns {Object}
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
}