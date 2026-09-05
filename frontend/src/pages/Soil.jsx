import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaLeaf,
    FaSeedling,
    FaFlask,
    FaChartLine,
    FaLightbulb,
    FaCheckCircle
} from "react-icons/fa";

import { analyzeSoil } from "../services/soilService";

import "../styles/Soil.css";


export default function Soil() {

    const navigate = useNavigate();

    const [state, setState] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);


    // =========================================================
    // ANALYZE SOIL
    // =========================================================

    const handleAnalyze = async () => {

        if (!state.trim()) {

            alert("Please enter a state");

            return;

        }


        try {

            setLoading(true);


            const data = await analyzeSoil(
                state.trim()
            );


            console.log(
                "Soil Analysis:",
                data
            );


            // -------------------------------------------------
            // Save latest soil for Recommendation and Risk
            // -------------------------------------------------

            localStorage.setItem(
                "latestSoil",
                JSON.stringify(data)
            );

            localStorage.setItem(
                "selectedState",
                data.state || state.trim()
            );


            setResult(data);

        }
        catch (err) {

            console.error(
                "Soil analysis error:",
                err
            );

            alert(
                err.message ||
                "Unable to analyze soil."
            );

        }
        finally {

            setLoading(false);

        }

    };


    return (

        <div className="soil-container">


            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
                type="button"
                className="soil-back-button"
                onClick={() => navigate(-1)}
            >

                <FaArrowLeft />

                <span>
                    Back
                </span>

            </button>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="soil-header">


                <div className="soil-title-icon">

                    <FaLeaf />

                </div>


                <div>

                    <h1>
                        Soil Health Analysis
                    </h1>

                    <p>
                        Analyze soil nutrients and receive
                        AI-powered agricultural insights.
                    </p>

                </div>

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="soil-search">


                <div className="soil-input-wrapper">

                    <FaLeaf />

                    <input
                        type="text"
                        placeholder="Enter State (Example: Andhra Pradesh)"
                        value={state}
                        onChange={(e) =>
                            setState(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                handleAnalyze();

                            }

                        }}
                    />

                </div>


                <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading}
                >

                    <FaChartLine />

                    {loading
                        ? "Analyzing..."
                        : "Analyze Soil"
                    }

                </button>

            </div>


            {/* =================================================
                RESULT
            ================================================= */}

            {result && (

                <div className="soil-results">


                    {/* =================================================
                        SOIL SCORE
                    ================================================= */}

                    <div className="soil-score-card">


                        <div className="score-icon">

                            <FaCheckCircle />

                        </div>


                        <div>

                            <span>
                                Overall Soil Health
                            </span>

                            <h1>
                                {result.soil_score}/100
                            </h1>

                            <p>
                                {result.state}
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        NUTRIENTS
                    ================================================= */}

                    <section className="soil-section">


                        <div className="soil-section-heading">

                            <div className="section-title-icon">

                                <FaLeaf />

                            </div>

                            <div>

                                <h2>
                                    Soil Nutrients
                                </h2>

                                <p>
                                    Current nutrient levels detected
                                    for the selected state.
                                </p>

                            </div>

                        </div>


                        <div className="soil-grid">


                            {/* NITROGEN */}

                            <div className="soil-card">

                                <span>
                                    Nitrogen
                                </span>

                                <strong>
                                    {result.nitrogen}
                                </strong>

                                <small>
                                    N · {result.nitrogen_status}
                                </small>

                            </div>


                            {/* PHOSPHORUS */}

                            <div className="soil-card">

                                <span>
                                    Phosphorus
                                </span>

                                <strong>
                                    {result.phosphorus}
                                </strong>

                                <small>
                                    P · {result.phosphorus_status}
                                </small>

                            </div>


                            {/* POTASSIUM */}

                            <div className="soil-card">

                                <span>
                                    Potassium
                                </span>

                                <strong>
                                    {result.potassium}
                                </strong>

                                <small>
                                    K · {result.potassium_status}
                                </small>

                            </div>


                            {/* PH */}

                            <div className="soil-card">

                                <span>
                                    Soil pH
                                </span>

                                <strong>
                                    {result.ph}
                                </strong>

                                <small>
                                    pH · {result.ph_status}
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        INTELLIGENCE
                    ================================================= */}

                    <section className="soil-info">


                        {/* RECOMMENDED CROPS */}

                        <div className="recommend-card">

                            <div className="recommend-heading">

                                <div>
                                    <FaSeedling />
                                </div>

                                <h2>
                                    Suitable Crops
                                </h2>

                            </div>


                            <div className="crop-list">

                                {result.crops?.map(
                                    (crop, index) => (

                                        <span
                                            key={index}
                                        >
                                            {crop}
                                        </span>

                                    )
                                )}

                            </div>

                        </div>


                        {/* FERTILIZER */}

                        <div className="recommend-card">

                            <div className="recommend-heading">

                                <div>
                                    <FaFlask />
                                </div>

                                <h2>
                                    Fertilizer Recommendation
                                </h2>

                            </div>


                            <div className="fertilizer-result">

                                <strong>
                                    {result.fertilizer}
                                </strong>

                                <p>
                                    Recommended based on the
                                    detected nutrient deficiencies.
                                </p>

                            </div>

                        </div>


                        {/* AI RECOMMENDATION */}

                        <div className="recommend-card">

                            <div className="recommend-heading">

                                <div>
                                    <FaChartLine />
                                </div>

                                <h2>
                                    AI Soil Recommendation
                                </h2>

                            </div>


                            <p className="ai-soil-text">
                                {result.recommendation}
                            </p>

                        </div>


                        {/* IMPROVEMENT */}

                        <div className="recommend-card">

                            <div className="recommend-heading">

                                <div>
                                    <FaLightbulb />
                                </div>

                                <h2>
                                    Soil Improvement Advice
                                </h2>

                            </div>


                            <ul className="soil-improvements">

                                {result.improvements?.map(
                                    (item, index) => (

                                        <li
                                            key={index}
                                        >
                                            {item}
                                        </li>

                                    )
                                )}

                            </ul>

                        </div>

                    </section>

                </div>

            )}

        </div>

    );

}