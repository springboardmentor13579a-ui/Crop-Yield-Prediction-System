import { useEffect, useState } from "react";
import {
    FaLeaf,
    FaCloudSun,
    FaTint,
    FaTemperatureHigh,
    FaCloudRain
} from "react-icons/fa";

import { getWeather } from "../services/weatherService";
import { analyzeSoil } from "../services/soilService";
import BASE_URL from "../services/api";

import "../styles/Recommendation.css";

export default function Recommendation() {

    // =========================================================
    // STATE / CITY
    // =========================================================

    const [state, setState] = useState("");
    const [city, setCity] = useState("");

    // =========================================================
    // SOIL / WEATHER / RECOMMENDATION
    // =========================================================

    const [soil, setSoil] = useState(null);
    const [weather, setWeather] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    // =========================================================
    // LOADING
    // =========================================================

    const [soilLoading, setSoilLoading] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    // =========================================================
    // LOAD PREVIOUS STATE/CITY ONLY AS INPUT VALUES
    // DO NOT AUTOMATICALLY USE OLD SOIL/WEATHER RESULTS
    // =========================================================

    useEffect(() => {

        const savedSoil =
            localStorage.getItem("latestSoil");

        const savedWeather =
            localStorage.getItem("latestWeather");

        if (savedSoil) {

            try {

                const soilData =
                    JSON.parse(savedSoil);

                if (soilData?.state) {
                    setState(soilData.state);
                }

            } catch (err) {

                console.error(
                    "Failed to load saved soil location:",
                    err
                );

            }

        }

        if (savedWeather) {

            try {

                const weatherData =
                    JSON.parse(savedWeather);

                if (weatherData?.city) {
                    setCity(weatherData.city);
                }

            } catch (err) {

                console.error(
                    "Failed to load saved weather location:",
                    err
                );

            }

        }

    }, []);


    // =========================================================
    // ANALYZE SOIL FOR SELECTED STATE
    // =========================================================

    const handleAnalyzeSoil = async () => {

        if (!state.trim()) {

            setError(
                "Please enter the farmer's state."
            );

            return;

        }

        try {

            setError("");
            setSoilLoading(true);

            // Analyze soil specifically for the entered state
            const data =
                await analyzeSoil(state.trim());

            setSoil(data);

            // Save latest soil for other pages
            localStorage.setItem(
                "latestSoil",
                JSON.stringify(data)
            );

            // Clear old recommendation because
            // soil conditions have changed
            setRecommendation(null);

        } catch (err) {

            console.error(
                "Soil Analysis Error:",
                err
            );

            setSoil(null);

            setError(
                err.message ||
                "Unable to analyze soil."
            );

        } finally {

            setSoilLoading(false);

        }

    };


    // =========================================================
    // GET WEATHER FOR SELECTED CITY
    // =========================================================

    const handleGetWeather = async () => {

        if (!city.trim()) {

            setError(
                "Please enter the farmer's city or district."
            );

            return;

        }

        try {

            setError("");
            setWeatherLoading(true);

            const data =
                await getWeather(city.trim());

            setWeather(data);

            localStorage.setItem(
                "latestWeather",
                JSON.stringify(data)
            );

            // Clear old recommendation because
            // weather conditions have changed
            setRecommendation(null);

        } catch (err) {

            console.error(
                "Weather Error:",
                err
            );

            setWeather(null);

            setError(
                err.message ||
                "Unable to get weather data."
            );

        } finally {

            setWeatherLoading(false);

        }

    };


    // =========================================================
    // GENERATE AI RECOMMENDATION
    // =========================================================

    const handleRecommendation = async () => {

        if (!soil) {

            setError(
                "Please analyze the farmer's soil first."
            );

            return;

        }

        if (!weather) {

            setError(
                "Please get the current weather for the farmer's city first."
            );

            return;

        }

        try {

            setError("");
            setLoading(true);

            // =================================================
            // THESE ARE THE ACTUAL VALUES SENT TO ML MODEL
            // =================================================

            const requestData = {

                nitrogen:
                    Number(soil.nitrogen),

                phosphorus:
                    Number(soil.phosphorus),

                potassium:
                    Number(soil.potassium),

                ph:
                    Number(soil.ph),

                temperature:
                    Number(weather.temperature),

                humidity:
                    Number(weather.humidity),

                rainfall:
                    Number(weather.rainfall),

                predicted_yield_tonnes_ha:
                    0,

                soil_score:
                    Number(
                        soil.soil_score || 0
                    ),

                nitrogen_status:
                    soil.nitrogen_status || "",

                phosphorus_status:
                    soil.phosphorus_status || "",

                potassium_status:
                    soil.potassium_status || "",

                ph_status:
                    soil.ph_status || ""

            };

            console.log(
                "Recommendation Inputs:",
                requestData
            );


            // =================================================
            // CALL FASTAPI RECOMMENDATION MODEL
            // =================================================

            const response = await fetch(
                `${BASE_URL}/recommendation/generate`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(requestData)
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail ||
                    "Crop recommendation failed."
                );

            }


            // =================================================
            // SAVE RESULT
            // =================================================

            setRecommendation(result);

            localStorage.setItem(
                "latestRecommendation",
                JSON.stringify(result)
            );


        } catch (err) {

            console.error(
                "Recommendation Error:",
                err
            );

            setError(
                err.message ||
                "AI crop recommendation failed."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // FARMING SUGGESTIONS
    // BASED ON SAME SOIL + WEATHER INPUTS
    // =========================================================

    const getFarmingSuggestions = () => {

        if (!soil || !weather) {
            return [];
        }

        const suggestions = [];


        // =================================================
        // TEMPERATURE
        // =================================================

        if (weather.temperature > 35) {

            suggestions.push(
                "🌡️ High temperature detected. Irrigate crops during early morning or evening."
            );

        } else if (weather.temperature < 15) {

            suggestions.push(
                "❄️ Low temperature detected. Protect sensitive crops from cold conditions."
            );

        } else {

            suggestions.push(
                "🌱 Temperature is generally favorable for farming activities."
            );

        }


        // =================================================
        // HUMIDITY
        // =================================================

        if (weather.humidity > 80) {

            suggestions.push(
                "💧 High humidity may increase fungal disease risk. Monitor crops regularly."
            );

        } else if (weather.humidity < 40) {

            suggestions.push(
                "💦 Humidity is low. Monitor soil moisture and irrigate when necessary."
            );

        }


        // =================================================
        // RAINFALL
        // =================================================

        if (weather.rainfall > 20) {

            suggestions.push(
                "🌧️ Significant rainfall detected. Avoid unnecessary irrigation and check field drainage."
            );

        } else if (weather.rainfall === 0) {

            suggestions.push(
                "☀️ No current rainfall detected. Monitor soil moisture before irrigation."
            );

        }


        // =================================================
        // WIND
        // =================================================

        if (weather.wind > 10) {

            suggestions.push(
                "💨 Strong winds detected. Avoid pesticide spraying and protect young plants."
            );

        }


        // =================================================
        // NITROGEN
        // =================================================

        if (
            soil.nitrogen_status &&
            soil.nitrogen_status
                .toLowerCase() === "high"
        ) {

            suggestions.push(
                "🧪 Nitrogen is high. Avoid excessive nitrogen fertilizer application."
            );

        }


        // =================================================
        // PHOSPHORUS
        // =================================================

        if (
            soil.phosphorus_status &&
            soil.phosphorus_status
                .toLowerCase() === "low"
        ) {

            suggestions.push(
                "🌿 Phosphorus is low. Consider an appropriate phosphorus-rich fertilizer."
            );

        }


        // =================================================
        // POTASSIUM
        // =================================================

        if (
            soil.potassium_status &&
            soil.potassium_status
                .toLowerCase() === "low"
        ) {

            suggestions.push(
                "🥔 Potassium is low. MOP or another suitable potassium-rich fertilizer may help."
            );

        }


        // =================================================
        // pH
        // =================================================

        if (
            soil.ph_status &&
            soil.ph_status
                .toLowerCase() === "acidic"
        ) {

            suggestions.push(
                "⚗️ Soil is acidic. Consider suitable soil amendments after proper soil testing."
            );

        }


        if (
            soil.ph_status &&
            soil.ph_status
                .toLowerCase() === "alkaline"
        ) {

            suggestions.push(
                "⚗️ Soil is alkaline. Consider suitable organic matter and soil management practices."
            );

        }


        // =================================================
        // GENERAL OPTIMIZATION
        // =================================================

        suggestions.push(
            "📊 Use soil and weather conditions together when planning irrigation, fertilizer application and crop management."
        );


        return suggestions;

    };


    const farmingSuggestions =
        getFarmingSuggestions();


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="recommendation-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="recommendation-header">

                <h1>
                    🌾 AI Crop Recommendations
                </h1>

                <p>
                    Get AI-powered crop recommendations
                    and personalized farming suggestions
                    using the farmer's soil and current weather.
                </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="recommendation-error">

                    ⚠️ {error}

                </div>

            )}


            {/* =================================================
                FARMER LOCATION
            ================================================= */}

            <section className="recommendation-section">

                <div className="section-title">

                    <FaLeaf />

                    <div>

                        <h2>
                            📍 Farmer Location
                        </h2>

                        <p>
                            Enter the farmer's state and city
                            to generate location-specific conditions.
                        </p>

                    </div>

                </div>


                <div className="weather-input">

                    <input
                        type="text"
                        placeholder="Enter State (Example: Tamil Nadu)"
                        value={state}
                        onChange={(e) => {

                            setState(e.target.value);

                            // New state means new soil data
                            setSoil(null);
                            setRecommendation(null);

                        }}
                    />

                    <button
                        onClick={handleAnalyzeSoil}
                        disabled={soilLoading}
                    >

                        {soilLoading
                            ? "Analyzing Soil..."
                            : "Analyze Soil"
                        }

                    </button>

                </div>


                <div className="weather-input">

                    <input
                        type="text"
                        placeholder="Enter City / District (Example: Coimbatore)"
                        value={city}
                        onChange={(e) => {

                            setCity(e.target.value);

                            // New city means new weather data
                            setWeather(null);
                            setRecommendation(null);

                        }}
                    />

                    <button
                        onClick={handleGetWeather}
                        disabled={weatherLoading}
                    >

                        {weatherLoading
                            ? "Getting Weather..."
                            : "Get Weather"
                        }

                    </button>

                </div>

            </section>


            {/* =================================================
                SOIL SUMMARY
            ================================================= */}

            {soil && (

                <section className="recommendation-section">

                    <div className="section-title">

                        <FaLeaf />

                        <div>

                            <h2>
                                🌱 Soil Conditions
                            </h2>

                            <p>
                                Soil analysis for:
                                {" "}
                                <strong>
                                    {soil.state}
                                </strong>
                            </p>

                        </div>

                    </div>


                    <div className="recommendation-stats">

                        <div className="recommendation-stat">

                            <span>
                                Nitrogen
                            </span>

                            <strong>
                                {soil.nitrogen}
                            </strong>

                            <small>
                                {soil.nitrogen_status}
                            </small>

                        </div>


                        <div className="recommendation-stat">

                            <span>
                                Phosphorus
                            </span>

                            <strong>
                                {soil.phosphorus}
                            </strong>

                            <small>
                                {soil.phosphorus_status}
                            </small>

                        </div>


                        <div className="recommendation-stat">

                            <span>
                                Potassium
                            </span>

                            <strong>
                                {soil.potassium}
                            </strong>

                            <small>
                                {soil.potassium_status}
                            </small>

                        </div>


                        <div className="recommendation-stat">

                            <span>
                                pH
                            </span>

                            <strong>
                                {soil.ph}
                            </strong>

                            <small>
                                {soil.ph_status}
                            </small>

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
                WEATHER SUMMARY
            ================================================= */}

            {weather && (

                <section className="recommendation-section">

                    <div className="section-title">

                        <FaCloudSun />

                        <div>

                            <h2>
                                🌦 Current Weather
                            </h2>

                            <p>
                                Current weather for:
                                {" "}
                                <strong>
                                    {weather.city}
                                </strong>
                            </p>

                        </div>

                    </div>


                    <div className="weather-summary">

                        <div className="weather-item">

                            <FaTemperatureHigh />

                            <strong>
                                {weather.temperature}°C
                            </strong>

                            <span>
                                Temperature
                            </span>

                        </div>


                        <div className="weather-item">

                            <FaTint />

                            <strong>
                                {weather.humidity}%
                            </strong>

                            <span>
                                Humidity
                            </span>

                        </div>


                        <div className="weather-item">

                            <FaCloudRain />

                            <strong>
                                {weather.rainfall} mm
                            </strong>

                            <span>
                                Rainfall
                            </span>

                        </div>


                        <div className="weather-item">

                            <FaCloudSun />

                            <strong>
                                {weather.city}
                            </strong>

                            <span>
                                Location
                            </span>

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
                GENERATE BUTTON
            ================================================= */}

            <section className="generate-section">

                <button
                    className="generate-button"
                    onClick={handleRecommendation}
                    disabled={
                        loading ||
                        !soil ||
                        !weather
                    }
                >

                    {loading
                        ? "🤖 Generating Recommendations..."
                        : "🌾 Get AI Crop Recommendations"
                    }

                </button>

            </section>


            {/* =================================================
                AI RESULT
            ================================================= */}

            {recommendation && (

                <section className="ai-result">

                    <div className="result-header">

                        <h2>
                            🤖 AI Crop Recommendation
                        </h2>

                        <p>
                            Recommendation generated using:
                            {" "}
                            <strong>
                                {soil.state}
                            </strong>
                            {" "}
                            soil +{" "}
                            <strong>
                                {weather.city}
                            </strong>
                            {" "}
                            weather conditions.
                        </p>

                    </div>


                    {/* BEST CROP */}

                    <div className="best-crop">

                        <span>
                            🌾 Best Crop Predicted
                        </span>

                        <h1>
                            {recommendation.recommended_crop}
                        </h1>

                        <p>
                            Best crop predicted by the
                            Random Forest recommendation model.
                        </p>

                    </div>


                    {/* TOP CROPS */}

                    {recommendation.recommendations &&
                        recommendation.recommendations.length > 0 && (

                            <div className="top-crops">

                                <h2>
                                    🌱 Top Suitable Crops
                                </h2>

                                <div className="crop-results">

                                    {recommendation.recommendations.map(
                                        (item, index) => {

                                            if (
                                                typeof item ===
                                                "string"
                                            ) {

                                                return (

                                                    <div
                                                        className="crop-result"
                                                        key={index}
                                                    >

                                                        <strong>
                                                            {index + 1}.
                                                        </strong>

                                                        <span>
                                                            {item}
                                                        </span>

                                                    </div>

                                                );

                                            }


                                            const cropName =
                                                item.crop ||
                                                item.name ||
                                                item.label ||
                                                "Crop";


                                            const confidence =
                                                item.confidence ??
                                                item.probability ??
                                                item.score;


                                            return (

                                                <div
                                                    className="crop-result"
                                                    key={index}
                                                >

                                                    <strong>
                                                        {index + 1}.
                                                    </strong>

                                                    <span>
                                                        {cropName}
                                                    </span>

                                                    {confidence !==
                                                        undefined && (

                                                        <b>
                                                            {confidence}%
                                                        </b>

                                                    )}

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            </div>

                        )}

                </section>

            )}


            {/* =================================================
                FARMING SUGGESTIONS
            ================================================= */}

            {soil && weather && (

                <section className="farming-section">

                    <div className="section-title">

                        <FaLeaf />

                        <div>

                            <h2>
                                💡 Farming Suggestions & Optimization
                            </h2>

                            <p>
                                Practical suggestions based on
                                the same soil and weather conditions
                                used for crop recommendation.
                            </p>

                        </div>

                    </div>


                    <div className="suggestions-list">

                        {farmingSuggestions.map(
                            (suggestion, index) => (

                                <div
                                    className="suggestion-item"
                                    key={index}
                                >

                                    {suggestion}

                                </div>

                            )
                        )}

                    </div>

                </section>

            )}

        </div>

    );

}