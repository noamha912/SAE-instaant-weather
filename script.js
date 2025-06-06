let currentCityData = null;
let currentWeatherData = null;
let isDarkMode = false;

const elements = {
    form: document.getElementById('weatherForm'),
    postalCodeInput: document.getElementById('postalCode'),
    cityGroup: document.getElementById('cityGroup'),
    citySelect: document.getElementById('citySelect'),
    daysValue: document.getElementById('daysValue'),
    dayButtons: document.querySelectorAll('.day-button'),
    submitBtn: document.getElementById('submitBtn'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    resultsSection: document.getElementById('resultsSection'),
    weatherCards: document.getElementById('weatherCards'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    cityFeedback: document.getElementById('cityFeedback')
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserPreferences();
    
    setTimeout(async () => {
        const results = await apiService.testApiConnections();
        console.log('Résultats des tests API:', results);
    }, 1000);
});

function initializeApp() {
    console.log('Initialisation d\'Instant Weather V2');
    updateDaysDisplay(1);
    hideError();
    hideResults();
    hideCityFeedback();
    
    apiService.clearCache();
    
    setInterval(() => {
        apiService.cleanExpiredCache();
    }, 60000);
}

function setupEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.postalCodeInput.addEventListener('input', debounce(handlePostalCodeInput, 500));
    elements.dayButtons.forEach(button => {
        button.addEventListener('click', handleDayButtonClick);
    });
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.citySelect.addEventListener('change', handleCitySelectChange);
}

function handleCitySelectChange() {
    const inseeCode = elements.citySelect.value;
    console.log('Commune sélectionnée:', inseeCode); // Log pour débogage
    if (inseeCode) {
        elements.submitBtn.disabled = false;
    } else {
        elements.submitBtn.disabled = true;
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    showLoading();

    try {
        const postalCode = apiService.sanitizePostalCode(elements.postalCodeInput.value);
        const inseeCode = elements.citySelect.value;
        const days = parseInt(document.querySelector('.day-button.active')?.dataset.days || '1');
        const selectedOptions = getSelectedOptions();

        if (!apiService.isValidPostalCode(postalCode)) {
            throw new Error('Code postal invalide');
        }
        if (!inseeCode) {
            throw new Error('Veuillez sélectionner une ville valide');
        }

        const weatherData = await apiService.getWeatherForecast(inseeCode, days);
        currentWeatherData = weatherData;
        WeatherCard.renderMultiple(weatherData, elements.weatherCards, { selectedOptions });
        showResults();
    } catch (error) {
        showError(apiService.handleApiError(error));
    } finally {
        hideLoading();
    }
}

async function handlePostalCodeInput() {
    const postalCode = apiService.sanitizePostalCode(elements.postalCodeInput.value);
    console.log('Postal code input:', postalCode); // Log pour débogage
    if (!apiService.isValidPostalCode(postalCode)) {
        elements.cityGroup.style.display = 'none';
        hideCityFeedback();
        elements.citySelect.disabled = true;
        elements.submitBtn.disabled = true;
        return;
    }

    try {
        showLoading();
        const cities = await apiService.searchCitiesByPostalCode(postalCode);
        if (!cities || cities.length === 0) {
            throw new Error(`Aucune commune trouvée pour le code postal ${postalCode}`);
        }
        updateCitySelect(cities);
        elements.cityGroup.style.display = 'block';
        elements.citySelect.disabled = false;
        showCityFeedback(cities.length);
        elements.submitBtn.disabled = !elements.citySelect.value;
    } catch (error) {
        console.error('Erreur lors de la recherche des communes:', error.message);
        showError(apiService.handleApiError(error));
        elements.cityGroup.style.display = 'none';
        elements.citySelect.disabled = true;
        hideCityFeedback();
        elements.submitBtn.disabled = true;
    } finally {
        hideLoading();
    }
}

function updateCitySelect(cities) {
    elements.citySelect.innerHTML = '<option value="">Sélectionnez une commune</option>';
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.code;
        option.textContent = city.displayName;
        elements.citySelect.appendChild(option);
    });
    console.log('City select updated with:', cities);
    elements.citySelect.disabled = false;
}

function showCityFeedback(count) {
    elements.cityFeedback.style.display = 'block';
    elements.cityFeedback.textContent = `${count} commune${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''} pour ce code postal`;
}

function hideCityFeedback() {
    elements.cityFeedback.style.display = 'none';
}

function handleDayButtonClick(event) {
    elements.dayButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updateDaysDisplay(parseInt(event.target.dataset.days));
}

function updateDaysDisplay(days) {
    elements.daysValue.textContent = `${days} jour(s)`;
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    elements.darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    saveUserPreferences();
}

function getSelectedOptions() {
    const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function saveUserPreferences() {
    localStorage.setItem('weatherApp', JSON.stringify({
        darkMode: isDarkMode
    }));
}

function loadUserPreferences() {
    const prefs = localStorage.getItem('weatherApp');
    if (prefs) {
        const { darkMode } = JSON.parse(prefs);
        isDarkMode = darkMode;
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            elements.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function showLoading() {
    elements.loading.style.display = 'flex';
    elements.submitBtn.disabled = true;
}

function hideLoading() {
    elements.loading.style.display = 'none';
    elements.submitBtn.disabled = !elements.citySelect.value;
}

function showError(message) {
    elements.errorMessage.style.display = 'flex';
    elements.errorText.textContent = message;
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

function showResults() {
    elements.resultsSection.style.display = 'block';
}

function hideResults() {
    elements.resultsSection.style.display = 'none';
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}