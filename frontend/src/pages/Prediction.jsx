import { useState } from "react";
import Layout from "../layout/Layout";
import { useNavigate } from "react-router-dom";
import { predictYield } from "../services/predictionService";

import {
    FaCloudSun,
    FaLeaf,
    FaRobot,
    FaChartLine,
} from "react-icons/fa";

import "../styles/Prediction.css";


export default function Prediction() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        country: "India",
        state: "Andhra Pradesh",
        area: "India",
        item: "",
        year: 2020,
        season: "Kharif",
        rainfall: "",
        pesticides: "",
        temperature: ""
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);


    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // =========================================================
    // PREDICT
    // =========================================================

    const handlePredict = async () => {

        // -----------------------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------------------

        const user =
            JSON.parse(localStorage.getItem("user")) || {};

        if (!user.email) {

            alert(
                "User email not found. Please login again."
            );

            return;
        }


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!form.country.trim()) {

            alert("Please enter country");

            return;
        }


        if (!form.state.trim()) {

            alert("Please enter state");

            return;
        }


        if (!form.area.trim()) {

            alert("Please enter area");

            return;
        }


        if (!form.item.trim()) {

            alert("Please enter crop");

            return;
        }


        if (!form.season) {

            alert("Please select season");

            return;
        }


        if (
            !form.rainfall ||
            !form.pesticides ||
            !form.temperature
        ) {

            alert(
                "Please fill all weather and agricultural details"
            );

            return;
        }


        try {

            setLoading(true);
            setResult(null);


            // =================================================
            // CREATE REQUEST DATA
            // =================================================

            const data = {

                user_email: user.email,

                country: form.country,

                state: form.state,

                area: form.area,

                item: form.item,

                year: Number(form.year),

                // IMPORTANT
                // Season is now sent to FastAPI
                season: form.season,

                rainfall: Number(form.rainfall),

                pesticides: Number(form.pesticides),

                temperature: Number(form.temperature)

            };


            console.log(
                "Prediction Request:",
                data
            );


            // =================================================
            // CALL BACKEND
            // =================================================

            const res =
                await predictYield(data);


            console.log(
                "Prediction Response:",
                res
            );


            // =================================================
            // CREATE PREDICTION RECORD
            // =================================================

            const latestPrediction = {

                ...data,

                predicted_yield:
                    res.predicted_yield,

                predicted_yield_tonnes:
                    res.predicted_yield_tonnes_ha,

                model:
                    res.model,

                prediction_id:
                    res.prediction_id,

                created_at:
                    new Date().toISOString()

            };


            // =================================================
            // SAVE LATEST PREDICTION
            // =================================================

            localStorage.setItem(
                "latestPrediction",
                JSON.stringify(
                    latestPrediction
                )
            );


            // =================================================
            // SAVE PREDICTION HISTORY
            // =================================================

            const existingHistory =
                JSON.parse(
                    localStorage.getItem(
                        "predictionHistory"
                    )
                ) || [];


            existingHistory.push(
                latestPrediction
            );


            localStorage.setItem(
                "predictionHistory",
                JSON.stringify(
                    existingHistory
                )
            );


            console.log(
                "Prediction History:",
                existingHistory
            );


            // =================================================
            // SHOW RESULT
            // =================================================

            setTimeout(() => {

                setResult(
                    res.predicted_yield
                );

                setLoading(false);

            }, 1000);


        } catch (err) {

            console.error(
                "Prediction Error:",
                err
            );

            setLoading(false);

            alert(
                err.message ||
                "Prediction failed"
            );

        }

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <Layout>

            <div className="prediction-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="prediction-header">

                    <div>

                        <h1>
                            🌾 Crop Yield Prediction
                        </h1>

                        <p>
                            AI Powered Smart Agriculture Prediction System
                        </p>

                    </div>

                </div>


                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="prediction-grid">


                    {/* =================================================
                        LEFT SIDE - FORM
                    ================================================= */}

                    <div className="prediction-card">

                        <h2>

                            <FaLeaf />

                            Prediction Details

                        </h2>


                        <div className="form-grid">


                            {/* COUNTRY */}

                            <div className="input-group">

                                <label>
                                    Country
                                </label>

                                <input
                                    type="text"
                                    name="country"
                                    placeholder="India"
                                    value={form.country}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* STATE */}

                            <div className="input-group">

                                <label>
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Andhra Pradesh"
                                    value={form.state}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* AREA */}

                            <div className="input-group">

                                <label>
                                    Area / Country
                                </label>

                                <input
                                    type="text"
                                    name="area"
                                    placeholder="India"
                                    value={form.area}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* CROP */}

                            <div className="input-group">

                                <label>
                                    Crop
                                </label>

                                <input
                                    type="text"
                                    name="item"
                                    placeholder="Maize"
                                    value={form.item}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* YEAR */}

                            <div className="input-group">

                                <label>
                                    Year
                                </label>

                                <input
                                    type="number"
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* SEASON */}

                            <div className="input-group">

                                <label>
                                    Season
                                </label>

                                <select
                                    name="season"
                                    value={form.season}
                                    onChange={handleChange}
                                >

                                    <option value="Kharif">
                                        Kharif
                                    </option>

                                    <option value="Rabi">
                                        Rabi
                                    </option>

                                    <option value="Zaid">
                                        Zaid
                                    </option>

                                </select>

                            </div>


                            {/* RAINFALL */}

                            <div className="input-group">

                                <label>
                                    Rainfall (mm)
                                </label>

                                <input
                                    type="number"
                                    name="rainfall"
                                    placeholder="1200"
                                    value={form.rainfall}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* PESTICIDES */}

                            <div className="input-group">

                                <label>
                                    Pesticides (tonnes)
                                </label>

                                <input
                                    type="number"
                                    name="pesticides"
                                    placeholder="100"
                                    value={form.pesticides}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* TEMPERATURE */}

                            <div className="input-group">

                                <label>
                                    Temperature (°C)
                                </label>

                                <input
                                    type="number"
                                    name="temperature"
                                    placeholder="25"
                                    value={form.temperature}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PREDICT BUTTON
                        ================================================= */}

                        <button
                            className="predict-btn"
                            onClick={handlePredict}
                            disabled={loading}
                        >

                            <FaRobot />

                            {loading
                                ? " Analysing..."
                                : " Predict Yield"
                            }

                        </button>

                    </div>


                    {/* =================================================
                        RIGHT SIDE - RESULT
                    ================================================= */}

                    <div className="prediction-result">


                        <div className="result-header">

                            <h2>

                                <FaChartLine />

                                AI Prediction

                            </h2>

                            <span className="ai-badge">
                                Random Forest AI
                            </span>

                        </div>


                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading ? (

                            <div className="loading-box">

                                <FaRobot className="loading-icon" />

                                <h3>
                                    AI is analysing...
                                </h3>

                                <div className="loader"></div>

                                <p>
                                    Checking weather...
                                </p>

                                <p>
                                    Checking soil...
                                </p>

                                <p>
                                    Analysing {form.season} season...
                                </p>

                                <p>
                                    Running Random Forest Model...
                                </p>

                            </div>


                        ) : result !== null ? (

                            <>


                                {/* =================================================
                                    RESULT
                                ================================================= */}

                                <div className="yield-card">

                                    <div className="yield-icon">
                                        🌾
                                    </div>


                                    <h1>
                                        {(result / 10000).toFixed(2)}
                                    </h1>


                                    <span>
                                        Tonnes / Hectare
                                    </span>


                                    <div className="progress">

                                        <div className="progress-fill"></div>

                                    </div>


                                    <h3>
                                        Predicted Crop Yield
                                    </h3>


                                    <p>

                                        Model Output:{" "}

                                        <strong>
                                            {result.toLocaleString()}
                                        </strong>{" "}

                                        hg/ha

                                    </p>


                                    <p>

                                        Model:{" "}

                                        <strong>
                                            Random Forest Regressor
                                        </strong>

                                    </p>

                                </div>


                                {/* =================================================
                                    WEATHER INFORMATION
                                ================================================= */}

                                <div className="info-card">

                                    <h3>

                                        <FaCloudSun />

                                        Weather & Agricultural Parameters

                                    </h3>


                                    <div className="info-row">

                                        <span>
                                            Season
                                        </span>

                                        <b>
                                            {form.season}
                                        </b>

                                    </div>


                                    <div className="info-row">

                                        <span>
                                            Temperature
                                        </span>

                                        <b>
                                            {form.temperature} °C
                                        </b>

                                    </div>


                                    <div className="info-row">

                                        <span>
                                            Rainfall
                                        </span>

                                        <b>
                                            {form.rainfall} mm
                                        </b>

                                    </div>


                                    <div className="info-row">

                                        <span>
                                            Pesticides
                                        </span>

                                        <b>
                                            {form.pesticides}
                                        </b>

                                    </div>

                                </div>


                                {/* =================================================
                                    REPORT BUTTON
                                ================================================= */}

                                <button
                                    className="predict-btn"
                                    onClick={() =>
                                        navigate("/report")
                                    }
                                >

                                    📊 Open Agricultural Report

                                </button>


                            </>


                        ) : (


                            /* =================================================
                                EMPTY RESULT
                            ================================================= */

                            <div className="empty-result">

                                <FaRobot className="empty-icon" />

                                <h2>
                                    No Prediction Yet
                                </h2>

                                <p>

                                    Enter crop details and click

                                    <strong>
                                        {" "}Predict Yield{" "}
                                    </strong>

                                    to view AI results.

                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </Layout>

    );

}