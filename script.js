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
        dt,
        timezone
    } = weatherData;

    cityName.textContent = country;
    TempinCel.textContent = Math.round(temp) + '°C';
    weatherStatus.textContent = main;
    HumidityValue.textContent = humidity + '%';
    windSpeedValue.textContent = Math.round(speed) + ' m/s';

    cityDate.textContent = getFetchCurrentDate(dt, timezone);
    imgTemp.src = `assets/weather/${getFetchWeatherIcon(id)}.png`;

    await updateCityForecast(city);
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

function getFetchCurrentDate(timestamp, timezoneOffset) {
    const date = new Date((timestamp + timezoneOffset) * 1000);

    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-GB', options);
}

async function updateCityForecast(city) {
    const forecastData = await getFetchWeatherData('forecast', city);
    console.log(forecastData);

    const dailyForecasts = getDailyForecast(forecastData.list);
    const forecastItems = document.querySelectorAll('.forecastItem');

    if (forecastItems.length === 0) {
        console.error("No forecast elements found in the DOM.");
        return;
    }

    dailyForecasts.forEach((day, index) => {
        if (index < forecastItems.length) {
            // Update existing forecast elements
            forecastItems[index].querySelector('forecastDate').textContent = day.date;
            forecastItems[index].querySelector('forecastTempImage').src = `assets/weather/${getFetchWeatherIcon(day.weatherId)}.png`;
            // forecastItems[index].querySelector("img").alt = day.weather;
            forecastItems[index].querySelector('forecastItemTemp').textContent = `${day.temp}°C`;

            forecastItems[index].style.display = "block";

        }
    });

    // forecastItems.forEach((item, index) => {
    //     if (index >= dailyForecasts.length) {
    //         item.style.display = "none"; // Hide extra forecast items
    //     }
    // });

    // const forecastContainer = document.querySelector('.forecastContainer');
    // if (forecastContainer) {
    //     forecastContainer.style.display = "block"; // Ensure it's visible
    // } else {
    //     console.error("forecastContainer not found in the DOM.");
    // }


}

function getDailyForecast(forecastDataList) {
    const dailyForecastData = [];
    const usedDates = new Set();

    forecastDataList.forEach(forecast => {
        const dateObj = new Date(forecast.dt * 1000);
        const dateStr = dateObj.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });

        if (!usedDates.has(dateStr) && dateObj.getHours() === 12) {
            usedDates.add(dateStr);
            dailyForecastData.push({
                date: dateStr,
                temp: Math.round(forecast.main.temp),
                weather: forecast.weather[0].main,
                weatherId: forecast.weather[0].id
            });
        }
    });

    return dailyForecastData;
}