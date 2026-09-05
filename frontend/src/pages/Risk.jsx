import { useEffect, useState } from "react";

import {
    FaExclamationTriangle,
    FaTemperatureHigh,
    FaTint,
    FaCloudRain,
    FaWind,
    FaLeaf,
    FaShieldAlt,
    FaMapMarkerAlt,
    FaSeedling,
    FaCheckCircle,
    FaRobot,
    FaRedo,
    FaChartLine
} from "react-icons/fa";

import { getWeather } from "../services/weatherService";
import { analyzeSoil } from "../services/soilService";
import { getLatestPrediction } from "../services/predictionService";

import "../styles/Risk.css";

const BASE_URL = "http://127.0.0.1:8000";

export default function Risk() {

    // =========================================================
    // BASIC INPUTS
    // =========================================================

    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [crop, setCrop] = useState("");

    // =========================================================
    // AGRICULTURAL DATA
    // =========================================================

    const [soil, setSoil] = useState(null);
    const [weather, setWeather] = useState(null);
    const [prediction, setPrediction] = useState(null);

    // =========================================================
    // RISK RESULT
    // =========================================================

    const [riskResult, setRiskResult] = useState(null);

    // =========================================================
    // LOADING
    // =========================================================

    const [soilLoading, setSoilLoading] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [riskLoading, setRiskLoading] = useState(false);

    // =========================================================
    // MESSAGES
    // =========================================================

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // CROP OPTIONS
    // =========================================================

    const cropOptions = [
        "Rice",
        "Wheat",
        "Maize",
        "Potatoes",
        "Tomatoes",
        "Cotton",
        "Sugarcane",
        "Groundnut",
        "Millets",
        "Barley",
        "Soybean",
        "Chickpea",
        "Banana",
        "Mango",
        "Onion"
    ];

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        const savedState =
            localStorage.getItem("selectedState");

        if (savedState) {
            setState(savedState);
        }

        const savedWeather =
            localStorage.getItem("latestWeather");

        if (savedWeather) {

            try {

                const weatherData =
                    JSON.parse(savedWeather);

                /*
                 * We intentionally DO NOT automatically use
                 * saved weather as current weather.
                 *
                 * Weather must belong to the city entered by
                 * the farmer.
                 */

                if (weatherData?.city) {
                    setCity(weatherData.city);
                }

            } catch (err) {

                console.error(
                    "Saved weather loading error:",
                    err
                );

            }

        }

    }, []);


    // =========================================================
    // HELPER - GET USER EMAIL
    // =========================================================

    const getUserEmail = () => {

        const possibleUsers = [
            localStorage.getItem("user"),
            localStorage.getItem("currentUser"),
            localStorage.getItem("loggedInUser")
        ];

        for (const item of possibleUsers) {

            if (!item) {
                continue;
            }

            try {

                const parsed = JSON.parse(item);

                if (parsed?.email) {
                    return parsed.email;
                }

                if (parsed?.user?.email) {
                    return parsed.user.email;
                }

            } catch {
                // Ignore invalid JSON
            }

        }

        return (
            localStorage.getItem("userEmail") ||
            localStorage.getItem("email") ||
            ""
        );

    };


    // =========================================================
    // NORMALIZE SOIL RESPONSE
    // =========================================================

    const normalizeSoil = (data) => {

        if (!data) {
            return null;
        }

        /*
         * Different versions of the soil API may return the
         * actual values directly or inside data/result.
         */

        const source =
            data?.data ||
            data?.result ||
            data?.soil ||
            data;

        return {

            ...source,

            nitrogen:
                source?.nitrogen ??
                source?.N ??
                source?.Nitrogen,

            phosphorus:
                source?.phosphorus ??
                source?.P ??
                source?.Phosphorus,

            potassium:
                source?.potassium ??
                source?.K ??
                source?.Potassium,

            ph:
                source?.ph ??
                source?.pH ??
                source?.PH

        };

    };


    // =========================================================
    // NORMALIZE PREDICTION RESPONSE
    // =========================================================

    const normalizePrediction = (data) => {

        if (!data) {
            return null;
        }

        const source =
            data?.data ||
            data?.result ||
            data?.prediction ||
            data;

        const predictedCrop =
            source?.item ||
            source?.crop ||
            source?.predicted_crop ||
            source?.crop_name ||
            source?.Item ||
            "";

        let yieldValue =
            source?.predicted_yield_tonnes_ha ??
            source?.yield_tonnes_ha ??
            source?.predictedYieldTonnesHa;

        /*
         * Your backend prediction route previously converted
         * hg/ha to tonnes/ha.
         *
         * But this also handles older stored predictions that
         * may still contain predicted_yield in hg/ha.
         */

        if (
            yieldValue === undefined ||
            yieldValue === null
        ) {

            const rawYield =
                source?.predicted_yield ??
                source?.yield ??
                source?.prediction;

            if (
                rawYield !== undefined &&
                rawYield !== null
            ) {

                const numericYield =
                    Number(rawYield);

                /*
                 * If the backend value looks like hg/ha,
                 * convert it to tonnes/ha.
                 *
                 * Example:
                 * 60000 hg/ha = 6 tonnes/ha
                 */

                if (numericYield > 1000) {
                    yieldValue =
                        numericYield / 10000;
                } else {
                    yieldValue =
                        numericYield;
                }

            }

        }

        const numericYield =
            Number(yieldValue);

        return {

            ...source,

            crop: predictedCrop,

            predicted_yield_tonnes_ha:
                Number.isFinite(numericYield)
                    ? numericYield
                    : null

        };

    };


    // =========================================================
    // LOAD SOIL FOR STATE
    // =========================================================

    const handleLoadSoil = async () => {

        if (!state.trim()) {

            setError(
                "Please enter the farmer state before loading soil data."
            );

            return;

        }

        try {

            setError("");
            setSuccess("");
            setSoilLoading(true);

            /*
             * IMPORTANT:
             *
             * Soil is now actually requested using the
             * state entered by the farmer.
             *
             * It is NOT blindly taken from latestSoil.
             */

            const data =
                await analyzeSoil(state.trim());

            const normalized =
                normalizeSoil(data);

            if (!normalized) {

                throw new Error(
                    "Soil analysis returned no usable data."
                );

            }

            const nitrogen =
                Number(
                    normalized.nitrogen
                );

            const phosphorus =
                Number(
                    normalized.phosphorus
                );

            const potassium =
                Number(
                    normalized.potassium
                );

            const ph =
                Number(
                    normalized.ph
                );

            if (
                !Number.isFinite(nitrogen) ||
                !Number.isFinite(phosphorus) ||
                !Number.isFinite(potassium) ||
                !Number.isFinite(ph)
            ) {

                throw new Error(
                    "Soil analysis did not return valid N, P, K and pH values."
                );

            }

            const finalSoil = {

                ...normalized,

                nitrogen,
                phosphorus,
                potassium,
                ph,

                state: state.trim()

            };

            setSoil(finalSoil);

            /*
             * Save the actual newly loaded soil.
             */

            localStorage.setItem(
                "latestSoil",
                JSON.stringify(finalSoil)
            );

            /*
             * A new state means the previous risk result is
             * no longer valid.
             */

            setRiskResult(null);

            setSuccess(
                `Soil data loaded successfully for ${state.trim()}.`
            );

        } catch (err) {

            console.error(
                "Soil loading error:",
                err
            );

            setSoil(null);

            setError(
                err?.message ||
                "Unable to load soil data."
            );

        } finally {

            setSoilLoading(false);

        }

    };


    // =========================================================
    // GET WEATHER FOR CITY
    // =========================================================

    const handleGetWeather = async () => {

        if (!city.trim()) {

            setError(
                "Please enter the farmer city before getting weather."
            );

            return;

        }

        try {

            setError("");
            setSuccess("");
            setWeatherLoading(true);

            /*
             * Weather is always requested for the CURRENT city.
             */

            const data =
                await getWeather(city.trim());

            if (!data) {

                throw new Error(
                    "Weather service returned no data."
                );

            }

            setWeather(data);

            /*
             * Save latest weather only for convenience.
             * It is NOT automatically reused for another city.
             */

            localStorage.setItem(
                "latestWeather",
                JSON.stringify(data)
            );

            setRiskResult(null);

            setSuccess(
                `Live weather loaded for ${data.city || city.trim()}.`
            );

        } catch (err) {

            console.error(
                "Weather error:",
                err
            );

            setWeather(null);

            setError(
                err?.message ||
                "Unable to get weather data."
            );

        } finally {

            setWeatherLoading(false);

        }

    };


    // =========================================================
    // LOAD YIELD PREDICTION FOR SELECTED CROP
    // =========================================================

    const handleLoadPrediction = async () => {

        if (!crop.trim()) {

            setError(
                "Please select a crop before loading the yield prediction."
            );

            return;

        }

        try {

            setError("");
            setSuccess("");
            setPredictionLoading(true);

            /*
             * First try the existing latestPrediction.
             *
             * This is important because your Prediction page
             * already stores the prediction there.
             */

            let rawPrediction = null;

            const savedPrediction =
                localStorage.getItem(
                    "latestPrediction"
                );

            if (savedPrediction) {

                try {

                    rawPrediction =
                        JSON.parse(
                            savedPrediction
                        );

                } catch (err) {

                    console.warn(
                        "Stored prediction could not be parsed.",
                        err
                    );

                }

            }

            /*
             * If localStorage does not contain it, try the
             * existing backend latest-prediction endpoint.
             */

            if (!rawPrediction) {

                const userEmail =
                    getUserEmail();

                if (!userEmail) {

                    throw new Error(
                        "No saved crop prediction was found. Please make a crop yield prediction first."
                    );

                }

                rawPrediction =
                    await getLatestPrediction(
                        userEmail
                    );

            }

            const normalized =
                normalizePrediction(
                    rawPrediction
                );

            if (!normalized) {

                throw new Error(
                    "No crop prediction was found."
                );

            }

            if (
                !normalized.predicted_yield_tonnes_ha &&
                normalized.predicted_yield_tonnes_ha !== 0
            ) {

                throw new Error(
                    "The latest crop prediction does not contain a valid predicted yield."
                );

            }

            /*
             * CRITICAL:
             *
             * Do NOT silently use a prediction for another crop.
             *
             * Example:
             *
             * User selects Potatoes
             * latest prediction = Wheat
             *
             * That prediction must NOT be sent to risk model.
             */

            const predictedCrop =
                String(
                    normalized.crop || ""
                )
                .trim()
                .toLowerCase();

            const selectedCrop =
                crop.trim()
                    .toLowerCase();

            if (
                predictedCrop &&
                predictedCrop !== selectedCrop
            ) {

                setPrediction(null);

                throw new Error(
                    `The latest prediction is for "${normalized.crop}", not "${crop}". Please make a yield prediction for ${crop} first.`
                );

            }

            setPrediction(normalized);

            localStorage.setItem(
                "latestPrediction",
                JSON.stringify(normalized)
            );

            setRiskResult(null);

            setSuccess(
                `Yield prediction loaded for ${crop}: ${Number(
                    normalized.predicted_yield_tonnes_ha
                ).toFixed(2)} tonnes/ha.`
            );

        } catch (err) {

            console.error(
                "Prediction loading error:",
                err
            );

            setPrediction(null);

            setError(
                err?.message ||
                "Unable to load crop yield prediction."
            );

        } finally {

            setPredictionLoading(false);

        }

    };


    // =========================================================
    // ASSESS RISK
    // =========================================================

    const handleAssessRisk = async () => {

        // -----------------------------------------------------
        // STATE
        // -----------------------------------------------------

        if (!state.trim()) {

            setError(
                "Please enter the farmer state."
            );

            return;

        }

        // -----------------------------------------------------
        // SOIL
        // -----------------------------------------------------

        if (!soil) {

            setError(
                "Please click 'Load Soil Data' and load soil conditions for the selected state."
            );

            return;

        }

        // -----------------------------------------------------
        // CITY
        // -----------------------------------------------------

        if (!city.trim()) {

            setError(
                "Please enter the farmer city."
            );

            return;

        }

        // -----------------------------------------------------
        // WEATHER
        // -----------------------------------------------------

        if (!weather) {

            setError(
                "Please click 'Get Weather' and load weather conditions for the selected city."
            );

            return;

        }

        // -----------------------------------------------------
        // CROP
        // -----------------------------------------------------

        if (!crop.trim()) {

            setError(
                "Please select a crop."
            );

            return;

        }

        // -----------------------------------------------------
        // PREDICTION
        // -----------------------------------------------------

        if (!prediction) {

            setError(
                `Please load the yield prediction for ${crop} before assessing agricultural risk.`
            );

            return;

        }

        try {

            setError("");
            setSuccess("");
            setRiskLoading(true);

            // =================================================
            // SOIL VALUES
            // =================================================

            const nitrogen =
                Number(
                    soil.nitrogen ??
                    soil.N ??
                    0
                );

            const phosphorus =
                Number(
                    soil.phosphorus ??
                    soil.P ??
                    0
                );

            const potassium =
                Number(
                    soil.potassium ??
                    soil.K ??
                    0
                );

            const ph =
                Number(
                    soil.ph ??
                    soil.pH ??
                    0
                );

            // =================================================
            // WEATHER VALUES
            // =================================================

            const temperature =
                Number(
                    weather.temperature ??
                    0
                );

            const humidity =
                Number(
                    weather.humidity ??
                    0
                );

            const rainfall =
                Number(
                    weather.rainfall ??
                    0
                );

            const wind =
                Number(
                    weather.wind ??
                    0
                );

            // =================================================
            // PREDICTED YIELD
            // =================================================

            const predictedYield =
                Number(
                    prediction.predicted_yield_tonnes_ha
                );

            // =================================================
            // FINAL VALIDATION
            // =================================================

            const values = [
                nitrogen,
                phosphorus,
                potassium,
                ph,
                temperature,
                humidity,
                rainfall,
                wind,
                predictedYield
            ];

            if (
                values.some(
                    value =>
                        !Number.isFinite(value)
                )
            ) {

                throw new Error(
                    "One or more agricultural input values are invalid."
                );

            }

            // =================================================
            // FINAL CROP CHECK
            // =================================================

            const predictionCrop =
                String(
                    prediction.crop || ""
                )
                .trim()
                .toLowerCase();

            const selectedCrop =
                crop.trim()
                    .toLowerCase();

            if (
                predictionCrop &&
                predictionCrop !== selectedCrop
            ) {

                throw new Error(
                    `Yield prediction mismatch. The selected crop is "${crop}", but the loaded prediction is for "${prediction.crop}".`
                );

            }

            // =================================================
            // FINAL PAYLOAD
            // =================================================

            const payload = {

                state:
                    state.trim(),

                city:
                    weather.city ||
                    city.trim(),

                crop:
                    crop.trim(),

                nitrogen,

                phosphorus,

                potassium,

                ph,

                temperature,

                humidity,

                rainfall,

                wind,

                predicted_yield_tonnes_ha:
                    predictedYield

            };

            console.log(
                "===================================="
            );

            console.log(
                "FINAL RISK ASSESSMENT PAYLOAD"
            );

            console.log(
                payload
            );

            console.log(
                "===================================="
            );

            // =================================================
            // API CALL
            // =================================================

            const response =
                await fetch(
                    `${BASE_URL}/risk/assess`,
                    {
                        method: "POST",

                        headers: {
                            "Accept":
                                "application/json",

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                let message =
                    "Risk assessment failed.";

                if (
                    typeof result?.detail ===
                    "string"
                ) {

                    message =
                        result.detail;

                }

                if (
                    Array.isArray(
                        result?.detail
                    )
                ) {

                    message =
                        result.detail
                            .map(
                                item =>
                                    `${item.loc?.join(".") || "field"}: ${item.msg}`
                            )
                            .join("\n");

                }

                throw new Error(
                    message
                );

            }

            console.log(
                "RISK ASSESSMENT RESULT:",
                result
            );

            setRiskResult(result);

            setSuccess(
                "AI agricultural risk assessment completed successfully."
            );

        } catch (err) {

            console.error(
                "Risk assessment error:",
                err
            );

            setError(
                err?.message ||
                "AI risk assessment failed."
            );

        } finally {

            setRiskLoading(false);

        }

    };


    // =========================================================
    // RESET ASSESSMENT
    // =========================================================

    const handleReset = () => {

        setRiskResult(null);

        setError("");

        setSuccess("");

        /*
         * We intentionally keep state, city, soil and weather.
         * User can simply select another crop and load its
         * prediction.
         */

        setPrediction(null);

        setCrop("");

    };


    // =========================================================
    // HELPERS
    // =========================================================

    const getRiskClass = (risk) => {

        if (!risk) {
            return "";
        }

        return String(risk)
            .toLowerCase()
            .trim();

    };


    const getRiskIcon = (risk) => {

        const value =
            String(
                risk || ""
            ).toLowerCase();

        if (value === "low") {
            return <FaCheckCircle />;
        }

        if (value === "medium") {
            return <FaExclamationTriangle />;
        }

        if (value === "high") {
            return <FaExclamationTriangle />;
        }

        return <FaShieldAlt />;

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="risk-page">

            <div className="risk-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="risk-header">

                    <div className="risk-header-content">

                        <div className="risk-title-icon">
                            <FaShieldAlt />
                        </div>

                        <div>

                            <h1>
                                Agricultural Risk Assessment
                            </h1>

                            <p>
                                AI-powered analysis of soil, weather
                                and crop conditions.
                            </p>

                        </div>

                    </div>

                    <div className="risk-header-status">

                        <span className="status-dot"></span>

                        AI Model Ready

                    </div>

                </header>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (

                    <div className="risk-alert error">

                        <FaExclamationTriangle />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {success && !error && (

                    <div className="risk-alert success">

                        <FaCheckCircle />

                        <span>
                            {success}
                        </span>

                    </div>

                )}


                {/* =================================================
                    INPUT SECTION
                ================================================= */}

                <section className="risk-panel">

                    <div className="panel-heading">

                        <div>

                            <h2>
                                <FaSeedling />
                                Risk Assessment Inputs
                            </h2>

                            <p>
                                Enter the farmer's location, load the
                                latest soil and weather data, then select
                                the crop to retrieve its yield prediction.
                            </p>

                        </div>

                    </div>


                    <div className="risk-input-grid">


                        {/* =================================================
                            STATE
                        ================================================= */}

                        <div className="risk-input-card">

                            <div className="input-card-icon">
                                <FaMapMarkerAlt />
                            </div>

                            <div className="input-card-content">

                                <label>
                                    Farmer State
                                </label>

                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => {

                                        setState(
                                            e.target.value
                                        );

                                        /*
                                         * Existing soil no longer
                                         * belongs to the new state.
                                         */

                                        setSoil(null);

                                        setPrediction(null);

                                        setRiskResult(null);

                                    }}
                                    placeholder="e.g. Andhra Pradesh"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleLoadSoil
                                    }
                                    disabled={
                                        soilLoading
                                    }
                                    className="secondary-button"
                                >

                                    <FaLeaf />

                                    {soilLoading
                                        ? "Analyzing Soil..."
                                        : "Load Soil Data"
                                    }

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            CITY
                        ================================================= */}

                        <div className="risk-input-card">

                            <div className="input-card-icon location">
                                <FaMapMarkerAlt />
                            </div>

                            <div className="input-card-content">

                                <label>
                                    Farmer City
                                </label>

                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => {

                                        setCity(
                                            e.target.value
                                        );

                                        setWeather(null);

                                        setRiskResult(null);

                                    }}
                                    placeholder="e.g. Visakhapatnam"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleGetWeather
                                    }
                                    disabled={
                                        weatherLoading
                                    }
                                    className="secondary-button"
                                >

                                    <FaCloudRain />

                                    {weatherLoading
                                        ? "Getting Weather..."
                                        : "Get Weather"
                                    }

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            CROP
                        ================================================= */}

                        <div className="risk-input-card">

                            <div className="input-card-icon crop">
                                <FaSeedling />
                            </div>

                            <div className="input-card-content">

                                <label>
                                    Crop
                                </label>

                                <select
                                    value={crop}
                                    onChange={(e) => {

                                        setCrop(
                                            e.target.value
                                        );

                                        /*
                                         * A different crop requires
                                         * a different yield prediction.
                                         */

                                        setPrediction(null);

                                        setRiskResult(null);

                                        setError("");

                                        setSuccess("");

                                    }}
                                >

                                    <option value="">
                                        Select crop
                                    </option>

                                    {cropOptions.map(
                                        item => (

                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>

                                        )
                                    )}

                                </select>

                                <button
                                    type="button"
                                    onClick={
                                        handleLoadPrediction
                                    }
                                    disabled={
                                        predictionLoading ||
                                        !crop
                                    }
                                    className="secondary-button"
                                >

                                    <FaChartLine />

                                    {predictionLoading
                                        ? "Loading Prediction..."
                                        : "Load Yield Prediction"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SOIL + WEATHER
                ================================================= */}

                <div className="data-sections">


                    {/* =================================================
                        SOIL
                    ================================================= */}

                    <section className="risk-panel">

                        <div className="section-heading">

                            <div className="section-heading-left">

                                <div className="section-icon soil">
                                    <FaLeaf />
                                </div>

                                <div>

                                    <h2>
                                        Soil Conditions
                                    </h2>

                                    <p>
                                        Latest analyzed soil parameters
                                    </p>

                                </div>

                            </div>

                            {soil && (

                                <span className="data-ready">

                                    <FaCheckCircle />

                                    Data Ready

                                </span>

                            )}

                        </div>


                        {soil ? (

                            <div className="metric-grid">

                                <div className="metric-card">

                                    <span className="metric-label">
                                        Nitrogen
                                    </span>

                                    <strong>
                                        {soil.nitrogen}
                                    </strong>

                                    <small>
                                        N
                                    </small>

                                </div>


                                <div className="metric-card">

                                    <span className="metric-label">
                                        Phosphorus
                                    </span>

                                    <strong>
                                        {soil.phosphorus}
                                    </strong>

                                    <small>
                                        P
                                    </small>

                                </div>


                                <div className="metric-card">

                                    <span className="metric-label">
                                        Potassium
                                    </span>

                                    <strong>
                                        {soil.potassium}
                                    </strong>

                                    <small>
                                        K
                                    </small>

                                </div>


                                <div className="metric-card">

                                    <span className="metric-label">
                                        Soil pH
                                    </span>

                                    <strong>
                                        {soil.ph}
                                    </strong>

                                    <small>
                                        pH
                                    </small>

                                </div>

                            </div>

                        ) : (

                            <div className="empty-data">

                                <FaLeaf />

                                <div>

                                    <strong>
                                        Soil data not loaded
                                    </strong>

                                    <p>
                                        Enter the farmer state and click
                                        "Load Soil Data".
                                    </p>

                                </div>

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        WEATHER
                    ================================================= */}

                    <section className="risk-panel">

                        <div className="section-heading">

                            <div className="section-heading-left">

                                <div className="section-icon weather">
                                    <FaCloudRain />
                                </div>

                                <div>

                                    <h2>
                                        Current Weather
                                    </h2>

                                    <p>
                                        Latest conditions for the selected city
                                    </p>

                                </div>

                            </div>

                            {weather && (

                                <span className="data-ready">

                                    <FaCheckCircle />

                                    Live Data

                                </span>

                            )}

                        </div>


                        {weather ? (

                            <div className="weather-grid">

                                <div className="weather-card">

                                    <FaTemperatureHigh />

                                    <div>

                                        <strong>
                                            {weather.temperature}°C
                                        </strong>

                                        <span>
                                            Temperature
                                        </span>

                                    </div>

                                </div>


                                <div className="weather-card">

                                    <FaTint />

                                    <div>

                                        <strong>
                                            {weather.humidity}%
                                        </strong>

                                        <span>
                                            Humidity
                                        </span>

                                    </div>

                                </div>


                                <div className="weather-card">

                                    <FaCloudRain />

                                    <div>

                                        <strong>
                                            {weather.rainfall} mm
                                        </strong>

                                        <span>
                                            Rainfall
                                        </span>

                                    </div>

                                </div>


                                <div className="weather-card">

                                    <FaWind />

                                    <div>

                                        <strong>
                                            {weather.wind} km/h
                                        </strong>

                                        <span>
                                            Wind
                                        </span>

                                    </div>

                                </div>

                            </div>

                        ) : (

                            <div className="empty-data">

                                <FaCloudRain />

                                <div>

                                    <strong>
                                        Weather data not loaded
                                    </strong>

                                    <p>
                                        Enter the farmer city and click
                                        "Get Weather".
                                    </p>

                                </div>

                            </div>

                        )}

                    </section>

                </div>


                {/* =================================================
                    YIELD PREDICTION
                ================================================= */}

                <section className="risk-panel">

                    <div className="section-heading">

                        <div className="section-heading-left">

                            <div className="section-icon result">
                                <FaChartLine />
                            </div>

                            <div>

                                <h2>
                                    Crop Yield Prediction
                                </h2>

                                <p>
                                    Prediction that will be supplied to
                                    the agricultural risk model.
                                </p>

                            </div>

                        </div>

                        {prediction && (

                            <span className="data-ready">

                                <FaCheckCircle />

                                Prediction Ready

                            </span>

                        )}

                    </div>


                    {prediction ? (

                        <div className="metric-grid">

                            <div className="metric-card">

                                <span className="metric-label">
                                    Selected Crop
                                </span>

                                <strong>
                                    {prediction.crop || crop}
                                </strong>

                                <small>
                                    Crop
                                </small>

                            </div>


                            <div className="metric-card">

                                <span className="metric-label">
                                    Predicted Yield
                                </span>

                                <strong>
                                    {Number(
                                        prediction.predicted_yield_tonnes_ha
                                    ).toFixed(2)}
                                </strong>

                                <small>
                                    tonnes/ha
                                </small>

                            </div>


                            <div className="metric-card">

                                <span className="metric-label">
                                    State
                                </span>

                                <strong>
                                    {state}
                                </strong>

                                <small>
                                    Location
                                </small>

                            </div>


                            <div className="metric-card">

                                <span className="metric-label">
                                    City
                                </span>

                                <strong>
                                    {weather?.city || city}
                                </strong>

                                <small>
                                    Weather Location
                                </small>

                            </div>

                        </div>

                    ) : (

                        <div className="empty-data">

                            <FaChartLine />

                            <div>

                                <strong>
                                    Yield prediction not loaded
                                </strong>

                                <p>
                                    Select a crop and click
                                    "Load Yield Prediction".
                                </p>

                            </div>

                        </div>

                    )}

                </section>


                {/* =================================================
                    PROFILE
                ================================================= */}

                <section className="risk-panel profile-panel">

                    <div className="section-heading">

                        <div className="section-heading-left">

                            <div className="section-icon profile">
                                <FaShieldAlt />
                            </div>

                            <div>

                                <h2>
                                    Assessment Profile
                                </h2>

                                <p>
                                    Exact conditions that will be sent
                                    to the AI risk model
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="profile-grid">

                        <div className="profile-item">

                            <FaLeaf />

                            <div>

                                <span>
                                    State
                                </span>

                                <strong>
                                    {state || "Not selected"}
                                </strong>

                            </div>

                        </div>


                        <div className="profile-item">

                            <FaMapMarkerAlt />

                            <div>

                                <span>
                                    City
                                </span>

                                <strong>
                                    {weather?.city ||
                                        city ||
                                        "Not selected"}
                                </strong>

                            </div>

                        </div>


                        <div className="profile-item">

                            <FaSeedling />

                            <div>

                                <span>
                                    Crop
                                </span>

                                <strong>
                                    {crop ||
                                        "Not selected"}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    AI ASSESSMENT
                ================================================= */}

                <section className="ai-assessment-card">

                    <div className="ai-content">

                        <div className="ai-icon">

                            <FaRobot />

                        </div>

                        <div>

                            <h2>
                                AI Risk Analysis
                            </h2>

                            <p>
                                The trained Isolation Forest model
                                evaluates soil, weather, crop and
                                predicted yield together.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="assess-button"
                        onClick={
                            handleAssessRisk
                        }
                        disabled={
                            riskLoading ||
                            !soil ||
                            !weather ||
                            !prediction ||
                            !crop
                        }
                    >

                        <FaRobot />

                        {riskLoading
                            ? "Analyzing Agricultural Risk..."
                            : "Assess Agricultural Risk"
                        }

                    </button>

                </section>


                {/* =================================================
                    RESULT
                ================================================= */}

                {riskResult && (

                    <div className="risk-results">


                        {/* =================================================
                            RESULT HERO
                        ================================================= */}

                        <section
                            className={`result-hero ${getRiskClass(
                                riskResult.overall_risk
                            )}`}
                        >

                            <div className="result-hero-content">

                                <span className="result-eyebrow">
                                    AI ASSESSMENT COMPLETE
                                </span>

                                <h2>
                                    Overall Agricultural Risk
                                </h2>

                                <div className="result-risk-level">

                                    <span>
                                        {getRiskIcon(
                                            riskResult.overall_risk
                                        )}
                                    </span>

                                    <strong>
                                        {riskResult.overall_risk}
                                    </strong>

                                </div>

                                <p>
                                    AI Risk Score
                                </p>

                                <div className="big-score">

                                    {Number(
                                        riskResult.risk_score
                                    ).toFixed(2)}

                                    <span>
                                        /100
                                    </span>

                                </div>

                            </div>


                            <div className="score-circle">

                                <div>

                                    <strong>
                                        {Number(
                                            riskResult.risk_score
                                        ).toFixed(0)}
                                    </strong>

                                    <span>
                                        RISK
                                    </span>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            RESULT SUMMARY
                        ================================================= */}

                        <div className="result-grid">


                            <section className="result-card">

                                <div className="result-card-icon">
                                    <FaRobot />
                                </div>

                                <span className="result-card-label">
                                    MODEL
                                </span>

                                <h3>
                                    {riskResult.model ||
                                        "Isolation Forest"}
                                </h3>

                                <p>
                                    Machine learning model used
                                    for anomaly detection.
                                </p>

                            </section>


                            <section className="result-card">

                                <div className="result-card-icon">
                                    <FaShieldAlt />
                                </div>

                                <span className="result-card-label">
                                    CLASSIFICATION
                                </span>

                                <h3>
                                    {riskResult.model_prediction ||
                                        "—"}
                                </h3>

                                <p>
                                    Current agricultural conditions
                                    classified by the trained model.
                                </p>

                            </section>


                            <section className="result-card">

                                <div className="result-card-icon">
                                    <FaSeedling />
                                </div>

                                <span className="result-card-label">
                                    CROP
                                </span>

                                <h3>
                                    {riskResult.crop ||
                                        crop}
                                </h3>

                                <p>
                                    Crop included in this assessment.
                                </p>

                            </section>

                        </div>


                        {/* =================================================
                            RESULT DETAILS
                        ================================================= */}

                        <section className="risk-panel">

                            <div className="section-heading">

                                <div className="section-heading-left">

                                    <div className="section-icon result">
                                        <FaShieldAlt />
                                    </div>

                                    <div>

                                        <h2>
                                            AI Risk Analysis
                                        </h2>

                                        <p>
                                            Exact inputs used by the
                                            trained model.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="analysis-grid">


                                {/* SOIL */}

                                <div className="analysis-card">

                                    <div className="analysis-title">

                                        <FaLeaf />

                                        <h3>
                                            Soil Input
                                        </h3>

                                    </div>

                                    <div className="analysis-list">

                                        <div>

                                            <span>
                                                Nitrogen
                                            </span>

                                            <strong>
                                                {riskResult.input?.nitrogen ??
                                                    soil?.nitrogen ??
                                                    "—"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Phosphorus
                                            </span>

                                            <strong>
                                                {riskResult.input?.phosphorus ??
                                                    soil?.phosphorus ??
                                                    "—"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Potassium
                                            </span>

                                            <strong>
                                                {riskResult.input?.potassium ??
                                                    soil?.potassium ??
                                                    "—"}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                pH
                                            </span>

                                            <strong>
                                                {riskResult.input?.ph ??
                                                    soil?.ph ??
                                                    "—"}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* WEATHER */}

                                <div className="analysis-card">

                                    <div className="analysis-title">

                                        <FaCloudRain />

                                        <h3>
                                            Weather Input
                                        </h3>

                                    </div>

                                    <div className="analysis-list">

                                        <div>

                                            <span>
                                                Temperature
                                            </span>

                                            <strong>
                                                {riskResult.input?.temperature ??
                                                    weather?.temperature ??
                                                    "—"}°C
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Humidity
                                            </span>

                                            <strong>
                                                {riskResult.input?.humidity ??
                                                    weather?.humidity ??
                                                    "—"}%
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Rainfall
                                            </span>

                                            <strong>
                                                {riskResult.input?.rainfall ??
                                                    weather?.rainfall ??
                                                    "—"} mm
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Wind
                                            </span>

                                            <strong>
                                                {riskResult.input?.wind ??
                                                    weather?.wind ??
                                                    "—"} km/h
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* PROFILE */}

                                <div className="analysis-card">

                                    <div className="analysis-title">

                                        <FaMapMarkerAlt />

                                        <h3>
                                            Assessment Profile
                                        </h3>

                                    </div>

                                    <div className="analysis-list">

                                        <div>

                                            <span>
                                                State
                                            </span>

                                            <strong>
                                                {riskResult.state ||
                                                    state}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                City
                                            </span>

                                            <strong>
                                                {riskResult.city ||
                                                    city}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Crop
                                            </span>

                                            <strong>
                                                {riskResult.crop ||
                                                    crop}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Predicted Yield
                                            </span>

                                            <strong>
                                                {Number(
                                                    riskResult.input?.predicted_yield_tonnes_ha ??
                                                    prediction?.predicted_yield_tonnes_ha ??
                                                    0
                                                ).toFixed(2)}
                                                {" "}tonnes/ha
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            INTERPRETATION
                        ================================================= */}

                        <section className="interpretation-card">

                            <div className="interpretation-header">

                                <div className="interpretation-icon">

                                    <FaRobot />

                                </div>

                                <div>

                                    <h2>
                                        AI Risk Interpretation
                                    </h2>

                                    <p>
                                        Understanding the model result
                                    </p>

                                </div>

                            </div>


                            <p className="interpretation-text">

                                The Isolation Forest model compares the
                                current combination of agricultural
                                conditions with patterns learned during
                                model training. Conditions that differ
                                significantly from learned patterns may
                                be classified as anomalous.

                            </p>


                            <div className="interpretation-grid">

                                <div>

                                    <span>
                                        Model
                                    </span>

                                    <strong>
                                        {riskResult.model ||
                                            "Isolation Forest"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Risk Score
                                    </span>

                                    <strong>
                                        {Number(
                                            riskResult.risk_score
                                        ).toFixed(2)}
                                        /100
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Classification
                                    </span>

                                    <strong>
                                        {riskResult.model_prediction ||
                                            "—"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Predicted Yield
                                    </span>

                                    <strong>
                                        {Number(
                                            riskResult.input?.predicted_yield_tonnes_ha ??
                                            prediction?.predicted_yield_tonnes_ha ??
                                            0
                                        ).toFixed(2)}
                                        {" "}t/ha
                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            RESET
                        ================================================= */}

                        <div className="result-actions">

                            <button
                                type="button"
                                onClick={
                                    handleReset
                                }
                                className="reset-button"
                            >

                                <FaRedo />

                                New Assessment

                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}