import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaChartLine,
    FaMapMarkerAlt,
    FaSeedling,
    FaCloudSun,
    FaTint,
    FaFlask,
    FaThermometerHalf,
    FaRobot,
    FaPrint,
    FaLeaf,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaArrowUp,
    FaBalanceScale,
} from "react-icons/fa";

import Layout from "../layout/Layout";
import BASE_URL from "../services/api";

import "../styles/report.css";


/* =========================================================
   SYNC REPORT WITH PREDICTION HISTORY
   ========================================================= */

function syncReportToHistory(report) {

    if (!report) {
        return;
    }

    try {

        const existing =
            JSON.parse(
                localStorage.getItem("predictionHistory")
            ) || [];

        const history =
            Array.isArray(existing)
                ? existing
                : [];


        /*
         * Create a stable identifier for the report.
         *
         * If backend gives created_at, use it.
         * Otherwise use the important prediction fields.
         */

        const reportId =
            report._id ||
            report.id ||
            report.prediction_id ||
            report.predictionId ||
            report.created_at ||
            report.createdAt ||
            `${report.year || ""}-${report.crop || report.item || ""}-${report.predicted_yield_hg_ha || report.predicted_yield || ""}`;


        /*
         * Do not insert the same report repeatedly.
         */

        const alreadyExists =
            history.some((item) => {

                const itemId =
                    item?._id ||
                    item?.id ||
                    item?.prediction_id ||
                    item?.predictionId ||
                    item?.created_at ||
                    item?.createdAt ||
                    `${item?.year || ""}-${item?.crop || item?.item || ""}-${item?.predicted_yield_hg_ha || item?.predicted_yield || ""}`;

                return String(itemId) === String(reportId);

            });


        if (alreadyExists) {
            return;
        }


        /*
         * Store the report in the same format that
         * PSReports can understand.
         */

        const historyItem = {

            ...report,

            /*
             * Keep both crop names so the existing
             * normalization logic works.
             */

            crop:
                report.crop ||
                report.item ||
                report.crop_name ||
                "",

            item:
                report.item ||
                report.crop ||
                report.crop_name ||
                "",


            /*
             * Keep yield values.
             */

            predicted_yield:
                report.predicted_yield ??
                report.predicted_yield_hg_ha ??
                report.yield ??
                0,

            predicted_yield_hg_ha:
                report.predicted_yield_hg_ha ??
                report.predicted_yield ??
                0,

            predicted_yield_tonnes_ha:
                report.predicted_yield_tonnes_ha ??
                report.predicted_yield_tonnes ??
                undefined,


            /*
             * Preserve date information.
             */

            created_at:
                report.created_at ||
                report.createdAt ||
                new Date().toISOString(),

        };


        const updatedHistory = [
            ...history,
            historyItem,
        ];


        localStorage.setItem(
            "predictionHistory",
            JSON.stringify(updatedHistory)
        );


    } catch (error) {

        console.error(
            "Unable to synchronize report history:",
            error
        );

    }

}


/* =========================================================
   MAIN REPORT PAGE
   ========================================================= */

export default function Report() {

    const [report, setReport] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* =====================================================
       FETCH LATEST REPORT
       ===================================================== */

    useEffect(() => {

        async function fetchReport() {

            try {

                setLoading(true);
                setError("");


                const response =
                    await fetch(
                        `${BASE_URL}/report/latest`
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        typeof data.detail === "string"
                            ? data.detail
                            : "Failed to load report"
                    );

                }


                setReport(data);


                /*
                 * IMPORTANT:
                 *
                 * The main report comes from the backend.
                 * Synchronize that same report into the
                 * prediction history used by PSReports.
                 */

                syncReportToHistory(data);


            } catch (err) {

                console.error(
                    "Report Error:",
                    err
                );


                setError(
                    err.message ||
                    "Unable to load report"
                );


            } finally {

                setLoading(false);

            }

        }


        fetchReport();

    }, []);


    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {

        return (

            <Layout>

                <div className="report-loading">

                    <FaRobot
                        className="report-loading-icon"
                    />

                    <h2>
                        Generating Agricultural Report...
                    </h2>

                    <p>
                        Fetching the latest prediction,
                        weather and soil analysis.
                    </p>

                    <div className="report-loader"></div>

                </div>

            </Layout>

        );

    }


    /* =========================================================
       ERROR
       ========================================================= */

    if (error || !report) {

        return (

            <Layout>

                <div className="report-error">

                    <FaExclamationTriangle />

                    <h2>
                        Report Not Available
                    </h2>

                    <p>
                        {error ||
                            "No prediction has been generated yet."}
                    </p>

                    <button
                        onClick={() =>
                            window.location.href =
                                "/prediction"
                        }
                    >
                        Go to Prediction
                    </button>

                </div>

            </Layout>

        );

    }


    /* =========================================================
       DATA
       ========================================================= */

    const soil =
        report.soil || null;


    const yieldTonnes =
        report.predicted_yield_tonnes_ha !== undefined &&
        report.predicted_yield_tonnes_ha !== null

            ? Number(
                report.predicted_yield_tonnes_ha
            )

            : Number(
                report.predicted_yield_hg_ha || 0
            ) / 10000;


    const yieldHg =
        Number(
            report.predicted_yield_hg_ha || 0
        );


    const soilScore =
        soil?.soil_score !== undefined &&
        soil?.soil_score !== null

            ? Number(
                soil.soil_score
            )

            : null;


    const generatedDate =
        report.created_at

            ? new Date(
                report.created_at
            ).toLocaleString()

            : new Date().toLocaleString();


    /* =========================================================
       PRODUCTIVITY ANALYSIS
       ========================================================= */

    const productivityLevel =
        yieldTonnes >= 5

            ? "High Productivity"

            : yieldTonnes >= 2.5

                ? "Moderate Productivity"

                : "Low Productivity";


    const productivityMessage =
        yieldTonnes >= 5

            ? "The predicted yield indicates strong agricultural productivity for the selected crop and region."

            : yieldTonnes >= 2.5

                ? "The predicted yield indicates moderate productivity. Improving soil and environmental conditions may increase output."

                : "The predicted yield is relatively low. Soil, weather and crop management conditions should be monitored closely.";


    /* =========================================================
       SEASON
       ========================================================= */

    const getSeason = () => {

        if (report.season) {

            return report.season;

        }


        if (report.month) {

            const month =
                Number(report.month);


            if ([12, 1, 2].includes(month)) {

                return "Winter";

            }


            if ([3, 4, 5].includes(month)) {

                return "Summer";

            }


            if ([6, 7, 8, 9].includes(month)) {

                return "Monsoon";

            }


            return "Post-Monsoon";

        }


        return "Annual";

    };


    const season =
        getSeason();


    const seasonalMessages = {

        Winter:
            "Cooler seasonal conditions may influence crop growth and water requirements.",

        Summer:
            "Higher temperatures may increase irrigation requirements and crop stress.",

        Monsoon:
            "Rainfall availability can support crop growth, while excessive rainfall may require drainage management.",

        "Post-Monsoon":
            "Moderate conditions can support crop development with appropriate irrigation and nutrient management.",

        Annual:
            "The analysis represents the overall agricultural conditions considered for the prediction."

    };


    const seasonalMessage =
        seasonalMessages[season] ||
        "Seasonal conditions should be monitored along with soil and weather parameters.";


    /* =========================================================
       RENDER
       ========================================================= */

    return (

        <Layout>

            <div className="report-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="report-header">

                    <div className="report-title">

                        <FaChartLine />

                        <div>

                            <h1>
                                Agricultural Analysis Report
                            </h1>

                            <p>
                                AI-powered crop, weather, soil,
                                yield and productivity analysis
                            </p>

                        </div>

                    </div>


                    <div className="report-actions">

                        <Link
                            to="/p-s-reports"
                            className="reports-btn"
                        >

                            <FaChartLine />

                            Productivity & Seasonal Reports

                        </Link>


                        <button
                            className="print-btn"
                            onClick={() =>
                                window.print()
                            }
                        >

                            <FaPrint />

                            Print Report

                        </button>

                    </div>

                </div>


                {/* =================================================
                    LOCATION / CROP OVERVIEW
                ================================================= */}

                <div className="report-overview">


                    <div className="overview-card">

                        <FaMapMarkerAlt />

                        <div>

                            <span>
                                Country
                            </span>

                            <strong>
                                {report.country || "N/A"}
                            </strong>

                            <p>
                                {report.state || "N/A"}
                            </p>

                        </div>

                    </div>


                    <div className="overview-card">

                        <FaSeedling />

                        <div>

                            <span>
                                Crop
                            </span>

                            <strong>
                                {report.crop ||
                                    report.item ||
                                    "N/A"}
                            </strong>

                            <p>
                                Agricultural Production
                            </p>

                        </div>

                    </div>


                    <div className="overview-card">

                        <FaChartLine />

                        <div>

                            <span>
                                Year
                            </span>

                            <strong>
                                {report.year || "N/A"}
                            </strong>

                            <p>
                                Prediction Year
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    YIELD REPORT
                ================================================= */}

                <div className="yield-report-card">


                    <div className="yield-report-icon">
                        🌾
                    </div>


                    <div>

                        <span>
                            Predicted Crop Yield
                        </span>

                        <h2>
                            {yieldTonnes.toFixed(2)}
                        </h2>

                        <p>
                            Tonnes / Hectare
                        </p>

                    </div>


                    <div className="yield-model">

                        <span>
                            Model
                        </span>

                        <strong>
                            {report.model ||
                                "Random Forest Regressor"}
                        </strong>

                        <small>
                            Machine Learning Prediction
                        </small>

                    </div>

                </div>


                {/* =================================================
                    MODEL OUTPUT
                ================================================= */}

                <div className="model-output-card">

                    <FaRobot />

                    <div>

                        <span>
                            Model Output
                        </span>

                        <strong>

                            {yieldHg.toLocaleString(
                                undefined,
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}

                            {" "}
                            hg/ha

                        </strong>

                    </div>

                </div>


                {/* =================================================
                    WEATHER
                ================================================= */}

                <div className="report-section">

                    <div className="section-heading">

                        <FaCloudSun />

                        <div>

                            <h2>
                                Weather & Agricultural Parameters
                            </h2>

                            <p>
                                Environmental and agricultural
                                conditions used for prediction.
                            </p>

                        </div>

                    </div>


                    <div className="metric-grid">


                        <div className="metric-card">

                            <FaThermometerHalf />

                            <span>
                                Temperature
                            </span>

                            <strong>
                                {report.temperature ?? "--"} °C
                            </strong>

                            <small>
                                Average temperature
                            </small>

                        </div>


                        <div className="metric-card">

                            <FaTint />

                            <span>
                                Rainfall
                            </span>

                            <strong>
                                {report.rainfall ?? "--"} mm
                            </strong>

                            <small>
                                Annual rainfall
                            </small>

                        </div>


                        <div className="metric-card">

                            <FaFlask />

                            <span>
                                Pesticides
                            </span>

                            <strong>
                                {report.pesticides ?? "--"}
                            </strong>

                            <small>
                                Agricultural usage
                            </small>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SOIL HEALTH
                ================================================= */}

                <div className="report-section">

                    <div className="section-heading">

                        <FaLeaf />

                        <div>

                            <h2>
                                Soil Health Analysis
                            </h2>

                            <p>
                                Nutrient composition and soil condition
                            </p>

                        </div>

                    </div>


                    {!soil ? (

                        <div className="soil-score">

                            <div>

                                <span>
                                    Soil analysis not available
                                </span>

                            </div>

                            <p>
                                Perform soil analysis to include
                                nutrient information in the
                                agricultural report.
                            </p>

                        </div>

                    ) : (

                        <>

                            <div className="soil-score">

                                <div>

                                    <span>
                                        Overall Soil Health
                                    </span>

                                    <strong>
                                        {soilScore ?? "--"}/100
                                    </strong>

                                </div>


                                <div className="score-bar">

                                    <div
                                        style={{
                                            width: `${Math.min(
                                                Math.max(
                                                    soilScore || 0,
                                                    0
                                                ),
                                                100
                                            )}%`
                                        }}
                                    ></div>

                                </div>


                                <p>

                                    {soilScore >= 80

                                        ? "Excellent soil condition"

                                        : soilScore >= 60

                                            ? "Good soil condition"

                                            : "Soil improvement may be required"

                                    }

                                </p>

                            </div>


                            <div className="nutrient-grid">

                                <Nutrient
                                    title="Nitrogen (N)"
                                    value={soil.nitrogen}
                                    status={
                                        soil.nitrogen_status
                                    }
                                />

                                <Nutrient
                                    title="Phosphorus (P)"
                                    value={soil.phosphorus}
                                    status={
                                        soil.phosphorus_status
                                    }
                                />

                                <Nutrient
                                    title="Potassium (K)"
                                    value={soil.potassium}
                                    status={
                                        soil.potassium_status
                                    }
                                />

                                <Nutrient
                                    title="pH"
                                    value={soil.ph}
                                    status={
                                        soil.ph_status
                                    }
                                />

                            </div>

                        </>

                    )}

                </div>


                {/* =================================================
                    RECOMMENDATIONS
                ================================================= */}

                {soil && (

                    <div className="report-section">

                        <div className="section-heading">

                            <FaLeaf />

                            <div>

                                <h2>
                                    AI Recommendations
                                </h2>

                                <p>
                                    Recommended actions based
                                    on the analysis
                                </p>

                            </div>

                        </div>


                        <div className="recommendation-grid">


                            <div className="recommendation-card">

                                <div className="recommendation-icon">
                                    🧪
                                </div>

                                <h3>
                                    Fertilizer Recommendation
                                </h3>

                                <strong>
                                    {soil.fertilizer ||
                                        "Organic Compost"}
                                </strong>

                                <p>
                                    Recommended based on the
                                    soil nutrient condition.
                                </p>

                            </div>


                            <div className="recommendation-card">

                                <div className="recommendation-icon">
                                    🌾
                                </div>

                                <h3>
                                    Recommended Crops
                                </h3>


                                <div className="crop-tags">

                                    {Array.isArray(
                                        soil.recommended_crops
                                    ) &&
                                    soil.recommended_crops.length > 0

                                        ? soil.recommended_crops.map(
                                            (
                                                crop,
                                                index
                                            ) => (

                                                <span
                                                    key={index}
                                                >
                                                    {crop}
                                                </span>

                                            )
                                        )

                                        : (

                                            <span>
                                                No recommendations
                                            </span>

                                        )}

                                </div>

                            </div>


                            <div className="recommendation-card ai-card">

                                <div className="recommendation-icon">
                                    🤖
                                </div>

                                <h3>
                                    Smart Agriculture Recommendation
                                </h3>

                                <p>
                                    {soil.recommendation ||
                                        "Maintain balanced irrigation, monitor soil nutrients and follow suitable crop management practices."
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    PRODUCTIVITY & SEASONAL SUMMARY
                ================================================= */}

                <div className="report-section productivity-section">

                    <div className="section-heading">

                        <FaChartLine />

                        <div>

                            <h2>
                                Productivity & Seasonal Analysis
                            </h2>

                            <p>
                                Agricultural productivity assessment
                                based on the predicted yield and
                                available seasonal information.
                            </p>

                        </div>

                    </div>


                    <div className="productivity-grid">


                        <div className="productivity-card">

                            <div className="productivity-card-icon">
                                <FaArrowUp />
                            </div>

                            <div>

                                <span>
                                    Productivity Level
                                </span>

                                <strong>
                                    {productivityLevel}
                                </strong>

                                <small>
                                    Based on predicted yield
                                </small>

                            </div>

                        </div>


                        <div className="productivity-card">

                            <div className="productivity-card-icon">
                                <FaSeedling />
                            </div>

                            <div>

                                <span>
                                    Expected Production
                                </span>

                                <strong>
                                    {yieldTonnes.toFixed(2)} t/ha
                                </strong>

                                <small>
                                    Predicted crop yield
                                </small>

                            </div>

                        </div>


                        <div className="productivity-card">

                            <div className="productivity-card-icon">
                                <FaCalendarAlt />
                            </div>

                            <div>

                                <span>
                                    Agricultural Season
                                </span>

                                <strong>
                                    {season}
                                </strong>

                                <small>
                                    Seasonal assessment
                                </small>

                            </div>

                        </div>

                    </div>


                    <div className="productivity-insight">

                        <div className="insight-icon">
                            📈
                        </div>

                        <div>

                            <h3>
                                Productivity Assessment
                            </h3>

                            <p>
                                {productivityMessage}
                            </p>

                        </div>

                    </div>


                    <div className="seasonal-analysis">

                        <div className="seasonal-header">

                            <FaCalendarAlt />

                            <div>

                                <h3>
                                    Seasonal Agricultural Outlook
                                </h3>

                                <p>
                                    Current seasonal interpretation
                                    for the selected crop.
                                </p>

                            </div>

                        </div>


                        <div className="seasonal-content">

                            <div className="season-badge">
                                {season}
                            </div>

                            <p>
                                {seasonalMessage}
                            </p>

                        </div>

                    </div>


                    <div className="factor-grid">


                        <div className="factor-card">

                            <FaCloudSun />

                            <span>
                                Weather Influence
                            </span>

                            <strong>

                                {report.temperature !== undefined ||
                                report.rainfall !== undefined

                                    ? "Included"

                                    : "Not Available"}

                            </strong>

                        </div>


                        <div className="factor-card">

                            <FaLeaf />

                            <span>
                                Soil Influence
                            </span>

                            <strong>
                                {soil
                                    ? "Included"
                                    : "Not Available"}
                            </strong>

                        </div>


                        <div className="factor-card">

                            <FaBalanceScale />

                            <span>
                                Overall Assessment
                            </span>

                            <strong>
                                {productivityLevel}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    FINAL SUMMARY
                ================================================= */}

                <div className="final-summary">

                    <FaRobot />

                    <div>

                        <h2>
                            AI Analysis Summary
                        </h2>

                        <p>

                            The{" "}

                            <strong>
                                {report.model ||
                                    "Random Forest Regressor"}
                            </strong>{" "}

                            predicted a yield of{" "}

                            <strong>
                                {yieldTonnes.toFixed(2)}
                                {" "}
                                tonnes/hectare
                            </strong>{" "}

                            for{" "}

                            <strong>
                                {report.crop ||
                                    report.item ||
                                    "the selected crop"}
                            </strong>{" "}

                            in{" "}

                            <strong>
                                {report.state ||
                                    report.country ||
                                    "the selected location"}
                            </strong>{" "}

                            based on the provided weather,
                            agricultural and soil parameters.

                        </p>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="report-footer">

                    <p>

                        Model:{" "}

                        <strong>
                            {report.model ||
                                "Random Forest Regressor"}
                        </strong>

                    </p>

                    <p>
                        Report generated: {generatedDate}
                    </p>

                </div>

            </div>

        </Layout>

    );

}


/* =========================================================
   NUTRIENT COMPONENT
========================================================= */

function Nutrient({
    title,
    value,
    status
}) {

    let statusClass = "";


    if (status) {

        statusClass =
            `status-${String(
                status
            ).toLowerCase()}`;

    }


    return (

        <div className="nutrient-card">

            <span>
                {title}
            </span>

            <strong>
                {value ?? "--"}
            </strong>

            {status && (

                <small
                    className={statusClass}
                >
                    {status}
                </small>

            )}

        </div>

    );

}