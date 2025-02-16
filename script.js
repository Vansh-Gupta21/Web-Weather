const inputCity = document.querySelector('#inputCity');
const searchBtn = document.querySelector('#searchBtn');

const notFoundSection = document.querySelector('#notFound');
const weatherInfoSection = document.querySelector('#weatherInfo');

const cityName = document.querySelector('#cityName');
const TempinCel = document.querySelector('#TempinCel');
const weatherStatus = document.querySelector('#weatherStatus');
const HumidityValue = document.querySelector('#HumidityValue');
const windSpeedValue = document.querySelector('#windSpeedValue');
const imgTemp = document.querySelector('#imgTemp');
const cityDate = document.querySelector('#cityDate');


const apiKey = `76323bbf37b7b1d7897ac76304744acc`;


document.addEventListener("DOMContentLoaded", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getLocationWeather, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
});

async function getLocationWeather(position) {
    const { latitude, longitude } = position.coords;

    try {
        // Reverse geocoding API to get the city name
        const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        const response = await fetch(geoApiUrl);
        const data = await response.json();

        if (data.cod === 200) {
            const city = data.name; // Extract city name
            updateCityWeather(city); // Fetch weather for detected city
        } else {
            console.log("Unable to fetch city name.");
        }
    } catch (error) {
        console.log("Error fetching location data:", error);
    }
}

function showError(error) {
    console.log("Geolocation Error:", error.message);
}



searchBtn.addEventListener('click', () => {
    if (inputCity.value.trim() != '') {
        console.log(inputCity.value);
        updateCityWeather(inputCity.value);
    }
});

inputCity.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
        if (inputCity.value.trim() != '') {
            console.log(inputCity.value);
            updateCityWeather(inputCity.value);
        }
    }
});

async function getFetchWeatherData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl);

    return response.json();
}

async function updateCityWeather(city) {
    const weatherData = await getFetchWeatherData('weather', city);

    if (weatherData.cod != 200) {
        showSection(notFoundSection);
        return;
    }

    console.log(weatherData);

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
        name,
        dt,
        timezone
    } = weatherData;

    console.log(convertTimestamp(dt+timezone));

    cityName.textContent = country;
    TempinCel.textContent = Math.round(temp) + '°C';
    weatherStatus.textContent = main;
    HumidityValue.textContent = humidity + '%';
    windSpeedValue.textContent = Math.round(speed) + ' m/s';

    cityDate.textContent = getFetchCurrentDate(name, timezone);
    imgTemp.src = `assets/weather/${getFetchWeatherIcon(id)}.png`;

    // console.log(convertTimestamp(dt));

    await getHourlyForecast(city, timezone);
    showSection(weatherInfoSection);
}

function showSection(sectionToShow) {
    [notFoundSection, weatherInfoSection].forEach(section => {
        section.style.display = 'none';
    });

    sectionToShow.style.display = 'block';
}

function getFetchWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
    if (id <= 321) return 'weather_snowy_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
    if (id <= 531) return 'rainy_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
    if (id <= 622) return 'ac_unit_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
    if (id <= 781) return 'foggy_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
    if (id === 800) return 'sunny_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
    else return 'cloud_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24';
}

function getFetchCurrentDate(name, timezoneOffset) {
    const currentUTC = new Date();
    const localTime = new Date(currentUTC.getTime() + timezoneOffset * 1000);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };

    const formattedTime = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Ensure 24-hour format
        timeZone: "UTC", // Keep it as UTC, since we already applied the offset
    }).format(localTime);
    
    console.log(localTime.toISOString());
    const timeStamp = localTime.toISOString();
    const date = timeStamp.split("T")[0];
    console.log(date);
    
    // console.log(formatDate(timeStamp));
    const finalDate = formatDate(timeStamp);

    console.log(`📍 City: ${name}`);
    console.log(`📅 Date: ${finalDate}`);
    console.log(`⏰ Time: ${formattedTime}`);

    return finalDate;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    
    // Extract UTC components to prevent timezone shifts
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
    const day = String(date.getUTCDate()).padStart(2, '0'); // Ensures two-digit day
    const month = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });

    return `${weekday}, ${day} ${month}`;
}

async function getHourlyForecast(city, timezone) {
    const forecastData = await getFetchWeatherData('forecast', city);
    console.log(forecastData);

    const forecastList = forecastData.list;
    console.log(forecastList);

    for (const item of forecastList) {
        const forecastTimeStr = convertTimestamp(item.dt + timezone);
        const timeOnly = forecastTimeStr.split(" ")[4].slice(0, 5);
        console.log(timeOnly);
    }
    
}

function convertTimestamp(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toUTCString(); // Convert to human-readable format in UTC
}


