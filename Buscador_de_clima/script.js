// Reemplaza con tu propia API Key de OpenWeatherMap
const apiKey = 'API Key real';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

// Referencias al DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');
const cityName = document.getElementById('cityName');
const tempValue = document.getElementById('tempValue');
const weatherDescription = document.getElementById('weatherDescription');
const weatherIcon = document.getElementById('weatherIcon');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

/**
 * Función asíncrona para obtener y mostrar el clima
 * @param {string} city - El nombre de la ciudad
 */
const getWeather = async (city) => {
    try {
        // Ocultar resultados previos y errores, mostrar loader
        weatherResult.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loading.classList.remove('hidden');

        // Normalizar la ciudad: quitar tildes y convertir a minúsculas
        const normalizedCity = city
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Petición a la API usando fetch y await (unidades métricas y en español)
        const response = await fetch(`${baseUrl}?q=${normalizedCity}&appid=${apiKey}&units=metric&lang=es`);

        // Manejar errores HTTP (ej: 404 ciudad no encontrada o 401 API Key inválida)
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('La API Key es inválida o aún no está activada (puede tardar un par de horas).');
            } else if (response.status === 404) {
                throw new Error('Ciudad no encontrada. Verifica el nombre e intenta de nuevo.');
            } else {
                throw new Error('Error al conectar con el servidor del clima.');
            }
        }

        // Convertir la respuesta a JSON
        const data = await response.json();

        // Actualizar el DOM con los datos obtenidos
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        tempValue.textContent = Math.round(data.main.temp);
        weatherDescription.textContent = data.weather[0].description;

        // Configurar el ícono del clima
        const iconCode = data.weather[0].icon;
        weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="Icono de clima">`;

        // Almacenar en localStorage la ciudad para la próxima vez
        localStorage.setItem('lastCity', city);

        // Ocultar loader y mostrar el resultado
        loading.classList.add('hidden');
        weatherResult.classList.remove('hidden');

    } catch (error) {
        // En caso de error, mostramos el mensaje específico
        loading.classList.add('hidden');
        
        // Buscamos la etiqueta <p> dentro del errorMessage y le asignamos el texto del error
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = error.message;
        }
        
        errorMessage.classList.remove('hidden');
        console.error('Error obteniendo el clima:', error);
    }
};

// Evento click del botón buscar
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city !== '') {
        getWeather(city);
    }
});

// Evento para buscar al presionar la tecla 'Enter'
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city !== '') {
            getWeather(city);
        }
    }
});

// Al cargar la página, verificamos el localStorage
window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        // Si hay una ciudad guardada, buscamos el clima de esa ciudad
        getWeather(lastCity);
    }
});
