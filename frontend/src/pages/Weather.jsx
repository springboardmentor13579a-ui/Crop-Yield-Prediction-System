import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaCloudSun,
    FaMapMarkerAlt,
    FaTemperatureHigh,
    FaTint,
    FaWind,
    FaCloudRain,
    FaSearch,
    FaLeaf,
    FaSeedling,
    FaArrowLeft,
    FaTachometerAlt
} from "react-icons/fa";

import { getWeather } from "../services/weatherService";

import "../styles/Weather.css";


export default function Weather() {

    const navigate = useNavigate();

    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);


    // =========================================================
    // GET WEATHER
    // =========================================================

    const handlePredict = async () => {

        if (!city.trim()) {

            alert("Please enter a city");

            return;
        }

        try {

            setLoading(true);

            const data = await getWeather(
                city.trim()
            );


            // -------------------------------------------------
            // Weather-based farming recommendation
            // -------------------------------------------------

            let recommendation = "";

            if (data.temperature > 35) {

                recommendation =
                    "🌞 High temperature detected. Irrigate crops during morning or evening.";

            }
            else if (data.humidity > 80) {

                recommendation =
                    "💧 High humidity detected. Monitor crops for fungal diseases.";

            }
            else if (data.wind > 10) {

                recommendation =
                    "💨 Strong winds expected. Avoid pesticide spraying.";

            }
            else {

                recommendation =
                    "🌱 Weather conditions are favorable for farming activities.";

            }


            const weatherData = {

                ...data,

                recommendation

            };


            setWeather(weatherData);


            // -------------------------------------------------
            // Save latest weather
            // Used by Recommendation and Risk pages
            // -------------------------------------------------

            localStorage.setItem(
                "latestWeather",
                JSON.stringify(weatherData)
            );

        }
        catch (err) {

            console.error(
                "Weather error:",
                err
            );

            alert(
                err.message ||
                "Unable to retrieve weather information."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="weather-container">


            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
                type="button"
                className="weather-back-button"
                onClick={() => navigate(-1)}
            >

                <FaArrowLeft />

                <span>
                    Back
                </span>

            </button>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="weather-hero">


                <div className="hero-left">


                    {/* TITLE */}

                    <div className="weather-title-row">

                        <div className="weather-title-icon">

                            <FaCloudSun />

                        </div>

                        <div>

                            <h1>
                                Weather Intelligence
                            </h1>

                            <p>
                                AI Powered Weather Monitoring
                                for Smart Agriculture
                            </p>

                        </div>

                    </div>


                    {/* SEARCH */}

                    <div className="search-box">

                        <FaMapMarkerAlt
                            className="search-icon"
                        />


                        <input
                            type="text"
                            placeholder="Enter City / District"
                            value={city}
                            onChange={(e) =>
                                setCity(e.target.value)
                            }
                            onKeyDown={(e) => {

                                if (e.key === "Enter") {

                                    handlePredict();

                                }

                            }}
                        />


                        <button
                            type="button"
                            onClick={handlePredict}
                            disabled={loading}
                        >

                            <FaSearch />

                            {loading
                                ? "Checking..."
                                : "Predict"
                            }

                        </button>

                    </div>

                </div>


                <div className="hero-right">

                    <FaCloudSun
                        className="big-weather-icon"
                    />

                </div>

            </section>


            {/* =================================================
                WEATHER RESULTS
            ================================================= */}

            {weather && (

                <>


                    {/* =================================================
                        WEATHER CARDS
                    ================================================= */}

                    <section className="weather-cards">


                        {/* TEMPERATURE */}

                        <div className="card">

                            <FaTemperatureHigh />

                            <h2>
                                {weather.temperature ?? "—"}°C
                            </h2>

                            <span>
                                Temperature
                            </span>

                        </div>


                        {/* HUMIDITY */}

                        <div className="card">

                            <FaTint />

                            <h2>
                                {weather.humidity ?? "—"}%
                            </h2>

                            <span>
                                Humidity
                            </span>

                        </div>


                        {/* RAINFALL */}

                        <div className="card">

                            <FaCloudRain />

                            <h2>
                                {weather.rainfall ?? "—"} mm
                            </h2>

                            <span>
                                Current Rainfall
                            </span>

                        </div>


                        {/* CLOUD */}

                        <div className="card">

                            <FaCloudSun />

                            <h2>
                                {weather.cloud ?? "—"}%
                            </h2>

                            <span>
                                Cloud Cover
                            </span>

                        </div>


                        {/* WIND */}

                        <div className="card">

                            <FaWind />

                            <h2>
                                {weather.wind ?? "—"} km/h
                            </h2>

                            <span>
                                Wind Speed
                            </span>

                        </div>

                    </section>


                    {/* =================================================
                        WEATHER DASHBOARD
                    ================================================= */}

                    <section className="weather-dashboard">


                        {/* =================================================
                            LEFT PANEL
                        ================================================= */}

                        <div className="left-panel">

                            <div className="forecast-card">


                                <div className="forecast-location">

                                    <FaMapMarkerAlt />

                                    <span>
                                        {weather.city}
                                    </span>

                                </div>


                                <h1>
                                    {weather.condition}
                                </h1>


                                <p className="forecast-description">
                                    {weather.description}
                                </p>


                                <div className="forecast-details">


                                    {/* PRESSURE */}

                                    <div>

                                        <FaTachometerAlt />

                                        <strong>
                                            Pressure
                                        </strong>

                                        <p>
                                            {weather.pressure ?? "—"} hPa
                                        </p>

                                    </div>


                                    {/* CLOUD COVER */}

                                    <div>

                                        <FaCloudSun />

                                        <strong>
                                            Cloud Cover
                                        </strong>

                                        <p>
                                            {weather.cloud ?? "—"}%
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            RIGHT PANEL
                        ================================================= */}

                        <div className="right-panel">


                            {/* AI RECOMMENDATION */}

                            <div className="ai-card">

                                <div className="weather-section-heading">

                                    <FaSeedling />

                                    <h2>
                                        AI Recommendation
                                    </h2>

                                </div>

                                <p>
                                    {weather.recommendation}
                                </p>

                            </div>


                            {/* RECOMMENDED CROPS */}

                            <div className="crop-card">

                                <div className="weather-section-heading">

                                    <FaLeaf />

                                    <h2>
                                        Recommended Crops
                                    </h2>

                                </div>


                                <div className="crop-tags">

                                    <span>
                                        Rice
                                    </span>

                                    <span>
                                        Maize
                                    </span>

                                    <span>
                                        Groundnut
                                    </span>

                                    <span>
                                        Millets
                                    </span>

                                </div>

                            </div>


                            {/* FARMING TIPS */}

                            <div className="soil-card">

                                <div className="weather-section-heading">

                                    <FaSeedling />

                                    <h2>
                                        Farming Tips
                                    </h2>

                                </div>


                                <ul>

                                    <li>
                                        ✔ Monitor soil moisture regularly.
                                    </li>

                                    <li>
                                        ✔ Avoid pesticide spraying during strong winds.
                                    </li>

                                    <li>
                                        ✔ Use current weather conditions when planning irrigation.
                                    </li>

                                    <li>
                                        ✔ Monitor rainfall and humidity for the next 24 hours.
                                    </li>

                                </ul>

                            </div>

                        </div>

                    </section>

                </>

            )}

        </div>

    );

}