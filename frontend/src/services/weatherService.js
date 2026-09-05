const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function getWeather(city) {

    const response = await fetch(
        `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
        throw new Error("City not found");
    }

    const data = await response.json();

    // Current rainfall
    let rainfall = 0;

    if (data.rain) {
        rainfall = data.rain["1h"] || data.rain["3h"] || 0;
    }

    return {

        city: data.name,

        country: data.sys.country,

        temperature: Math.round(data.main.temp),

        feelsLike: Math.round(data.main.feels_like),

        humidity: data.main.humidity,

        pressure: data.main.pressure,

        wind: Math.round(data.wind.speed * 3.6), // km/h

        condition: data.weather[0].main,

        description: data.weather[0].description,

        icon: data.weather[0].icon,

        cloud: data.clouds.all,

        rainfall: rainfall,

        latitude: data.coord.lat,

        longitude: data.coord.lon,

        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),

        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString()

    };

}