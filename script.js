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

searchBtn.addEventListener('click', () =>{
    if(inputCity.value.trim() != ''){
        console.log(inputCity.value);
        updateCityWeather(inputCity.value);
    }
});

inputCity.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
        if(inputCity.value.trim() != ''){
            console.log(inputCity.value);
            updateCityWeather(inputCity.value);
        }
    }
}); 

async function getFetchWeatherData(endpoint,city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl);

    return response.json();
}

async function updateCityWeather(city){
    const weatherData = await getFetchWeatherData('weather', city);

    if(weatherData.cod != 200){
        showSection(notFoundSection);
        return;
    }

    console.log(weatherData);

    const{
        name: country,
        main: { temp, humidity},
        weather: [{id, main}],
        wind: {speed},
    } = weatherData;

    cityName.textContent = country;
    TempinCel.textContent = Math.round(temp) + '°C';
    weatherStatus.textContent = main;
    HumidityValue.textContent = humidity + '%';
    windSpeedValue.textContent = Math.round(speed) + ' m/s';
    

    showSection(weatherInfoSection);
}

function showSection(sectionToShow){
    [notFoundSection, weatherInfoSection].forEach(section => {
        section.style.display = 'none';
    });

    sectionToShow.style.display = 'flex';
}