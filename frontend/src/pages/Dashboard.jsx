import React, { useEffect, useMemo, useState } from "react";
import Layout from "../layout/Layout";
import { Link } from "react-router-dom";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

import {
    FaSeedling,
    FaCloudSun,
    FaChartLine,
    FaUsers,
    FaRobot,
    FaDatabase,
    FaLeaf,
    FaTint,
    FaMapMarkerAlt,
    FaRulerCombined,
    FaTractor,
    FaExclamationTriangle,
    FaFlask,
    FaLightbulb,
    FaComments,
    FaPaperPlane,
    FaUserTie
} from "react-icons/fa";

import { getLatestPrediction } from "../services/predictionService";
import "../styles/dashboard.css";

const BASE_URL = "http://127.0.0.1:8000";


/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {

    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    const role =
        localStorage.getItem("role") ||
        user.role ||
        "farmer";

    return (
        <Layout>

            {role === "admin" ? (
                <AdminDashboard user={user} />
            ) : (
                <FarmerDashboard user={user} />
            )}

        </Layout>
    );
}


/* =========================================================
   FARMER DASHBOARD
========================================================= */

function FarmerDashboard({ user }) {

    const [latestPrediction, setLatestPrediction] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [analytics, setAnalytics] =
        useState(null);

    const [analyticsLoading, setAnalyticsLoading] =
        useState(true);


    /* =====================================================
       ADVICE STATES
    ===================================================== */

    const [officers, setOfficers] =
        useState([]);

    const [selectedOfficer, setSelectedOfficer] =
        useState("");

    const [adviceQuery, setAdviceQuery] =
        useState("");

    const [adviceRequests, setAdviceRequests] =
        useState([]);

    const [adviceLoading, setAdviceLoading] =
        useState(false);

    const [adviceMessage, setAdviceMessage] =
        useState("");

    const [adviceError, setAdviceError] =
        useState("");


    /* =====================================================
       LOAD ANALYTICS
    ===================================================== */

    useEffect(() => {

        async function loadAnalytics() {

            try {

                setAnalyticsLoading(true);

                const response =
                    await fetch(
                        `${BASE_URL}/analytics/dashboard`
                    );

                if (!response.ok) {

                    throw new Error(
                        `Analytics request failed: ${response.status}`
                    );

                }

                const data =
                    await response.json();

                setAnalytics(data);

            } catch (error) {

                console.error(
                    "Analytics error:",
                    error
                );

                setAnalytics(null);

            } finally {

                setAnalyticsLoading(false);

            }
        }

        loadAnalytics();

    }, []);


    /* =====================================================
       LOAD LATEST PREDICTION
    ===================================================== */

    useEffect(() => {

        let mounted = true;

        async function loadPrediction() {

            if (!user.email) {

                setLoading(false);
                return;

            }

            try {

                const data =
                    await getLatestPrediction(
                        user.email
                    );

                if (mounted) {

                    setLatestPrediction(
                        data?.prediction || null
                    );

                }

            } catch (error) {

                console.error(
                    "Latest prediction error:",
                    error
                );

                if (mounted) {

                    setLatestPrediction(null);

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                }

            }
        }

        loadPrediction();

        return () => {

            mounted = false;

        };

    }, [user.email]);


    /* =====================================================
       LOAD AGRICULTURAL OFFICERS
    ===================================================== */

    useEffect(() => {

        async function loadOfficers() {

            try {

                const response =
                    await fetch(
                        `${BASE_URL}/advice/officers`
                    );

                if (!response.ok) {

                    throw new Error(
                        "Unable to load agricultural officers."
                    );

                }

                const data =
                    await response.json();

                setOfficers(
                    Array.isArray(data)
                        ? data
                        : data.officers || []
                );

            } catch (error) {

                console.error(
                    "Officer loading error:",
                    error
                );

                setOfficers([]);

            }

        }

        loadOfficers();

    }, []);


    /* =====================================================
       GET OFFICER ADVICE TEXT
       
       IMPORTANT:
       Backend versions may use different field names
       for the officer's response.

       We check all common possibilities.
    ===================================================== */

    const getOfficerAdvice = (request) => {

        if (!request) {
            return "";
        }

        return (
            request.advice ??
            request.response ??
            request.reply ??
            request.advice_text ??
            request.response_text ??
            request.officer_advice ??
            request.officer_response ??
            request.message ??
            ""
        );
    };


    /* =====================================================
       GET NORMALIZED STATUS
    ===================================================== */

    const getAdviceStatus = (request) => {

        if (!request) {
            return "pending";
        }

        return (
            request.status ||
            request.request_status ||
            "pending"
        ).toString().toLowerCase();

    };


    /* =====================================================
       LOAD FARMER ADVICE REQUESTS
    ===================================================== */

    const loadAdviceRequests = async () => {

        if (!user.email) return;

        try {

            const response =
                await fetch(
                    `${BASE_URL}/advice/farmer/${encodeURIComponent(
                        user.email
                    )}`
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load advice requests."
                );

            }

            const data =
                await response.json();


            /*
             * Backend may return:
             *
             * [
             *   {...}
             * ]
             *
             * OR
             *
             * {
             *   requests: [...]
             * }
             */

            const requests =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.requests)
                        ? data.requests
                        : [];


            /*
             * DEBUG:
             * This lets us see exactly what backend
             * is returning.
             */

            console.log(
                "Farmer advice requests:",
                requests
            );


            /*
             * Normalize the response before displaying.
             *
             * This is the main fix.
             */

            const normalizedRequests =
                requests.map((request) => ({

                    ...request,

                    displayStatus:
                        getAdviceStatus(request),

                    displayAdvice:
                        getOfficerAdvice(request)

                }));


            setAdviceRequests(
                normalizedRequests
            );

        } catch (error) {

            console.error(
                "Advice requests error:",
                error
            );

        }

    };


    useEffect(() => {

        loadAdviceRequests();

        /*
         * Refresh advice requests every 5 seconds.
         * This allows the farmer dashboard to show
         * an officer reply without manually refreshing.
         */

        const interval =
            setInterval(
                loadAdviceRequests,
                5000
            );

        return () => {
            clearInterval(interval);
        };

    }, [user.email]);


    /* =====================================================
       SEND ADVICE REQUEST
    ===================================================== */

    const submitAdviceRequest = async () => {

        setAdviceMessage("");
        setAdviceError("");


        if (!selectedOfficer) {

            setAdviceError(
                "Please select an agricultural officer."
            );

            return;

        }


        if (!adviceQuery.trim()) {

            setAdviceError(
                "Please enter your agricultural question."
            );

            return;

        }


        setAdviceLoading(true);


        try {

            const officer =
                officers.find(
                    item =>
                        item.email === selectedOfficer
                );


            const response =
                await fetch(
                    `${BASE_URL}/advice/request`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            farmer_email:
                                user.email,

                            farmer_name:
                                user.full_name ||
                                "Farmer",

                            officer_email:
                                selectedOfficer,

                            officer_name:
                                officer?.full_name ||
                                officer?.name ||
                                "Agricultural Officer",

                            query:
                                adviceQuery.trim(),

                            crop:
                                latestPrediction?.item ||
                                latestPrediction?.crop ||
                                user.crop ||
                                "",

                            status:
                                "pending"

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to send advice request."
                );

            }


            setAdviceQuery("");
            setSelectedOfficer("");

            setAdviceMessage(
                "Advice request sent successfully."
            );

            await loadAdviceRequests();

        } catch (error) {

            console.error(
                "Advice request error:",
                error
            );

            setAdviceError(
                error.message ||
                "Unable to send advice request."
            );

        } finally {

            setAdviceLoading(false);

        }

    };


    /* =====================================================
       ENVIRONMENT CHART
    ===================================================== */

    const environmentData = useMemo(() => {

        if (!latestPrediction) return [];

        return [

            {
                parameter: "Rainfall",
                value:
                    Number(
                        latestPrediction.rainfall
                    ) || 0
            },

            {
                parameter: "Temperature",
                value:
                    Number(
                        latestPrediction.temperature
                    ) || 0
            },

            {
                parameter: "Pesticides",
                value:
                    Number(
                        latestPrediction.pesticides
                    ) || 0
            }

        ];

    }, [latestPrediction]);


    /* =====================================================
       YIELD CHART
    ===================================================== */

    const yieldData = useMemo(() => {

        if (!latestPrediction) return [];

        return [

            {

                crop:
                    latestPrediction.item ||
                    latestPrediction.crop ||
                    "Prediction",

                yield:
                    Number(
                        latestPrediction.predicted_yield_tonnes_ha
                        ??
                        (
                            Number(
                                latestPrediction.predicted_yield
                            ) / 10000
                        )
                    ) || 0

            }

        ];

    }, [latestPrediction]);


    /* =====================================================
       SAFE ANALYTICS
    ===================================================== */

    const totalPredictions =
        Number(
            analytics?.total_predictions
        ) || 0;

    const totalSoilAnalyses =
        Number(
            analytics?.total_soil_analyses
        ) || 0;

    const averageYield =
        Number(
            analytics?.average_yield_tonnes_ha
        ) || 0;

    const maximumYieldHg =
        Number(
            analytics?.maximum_yield_hg_ha
        ) || 0;


    /* =====================================================
       FARMER UI
    ===================================================== */

    return (

        <div className="dashboard-page">


            {/* =================================================
               HEADER
            ================================================= */}

            <div className="dashboard-banner">

                <div>

                    <h1>
                        Welcome,{" "}
                        {user.full_name || "Farmer"} 👋
                    </h1>

                    <p>
                        Monitor crop conditions and
                        AI-powered yield predictions
                        from one place.
                    </p>

                </div>


                <div className="dashboard-actions">

                    <Link
                        to="/analytics"
                        className="secondary-btn"
                    >
                        📊 Full Analytics
                    </Link>

                    <Link
                        to="/prediction"
                        className="primary-btn"
                    >
                        🌾 New Prediction
                    </Link>


                    {latestPrediction && (

                        <Link
                            to="/report"
                            className="secondary-btn"
                        >
                            📊 Open Report
                        </Link>

                    )}

                </div>

            </div>


            {/* =================================================
               SUMMARY CARDS
            ================================================= */}

            <div className="dashboard-grid">

                <div className="dashboard-card">

                    <FaCloudSun className="dash-icon" />

                    <h3>
                        Temperature
                    </h3>

                    <h2>

                        {loading
                            ? "..."
                            : latestPrediction
                                ? `${latestPrediction.temperature}°C`
                                : "--"}

                    </h2>

                    <p>
                        Latest prediction data
                    </p>

                </div>


                <div className="dashboard-card">

                    <FaTint className="dash-icon" />

                    <h3>
                        Rainfall
                    </h3>

                    <h2>

                        {loading
                            ? "..."
                            : latestPrediction
                                ? `${latestPrediction.rainfall} mm`
                                : "--"}

                    </h2>

                    <p>
                        Latest prediction data
                    </p>

                </div>


                <div className="dashboard-card">

                    <FaChartLine className="dash-icon" />

                    <h3>
                        Predicted Yield
                    </h3>

                    <h2>

                        {loading
                            ? "..."
                            : latestPrediction
                                ? `${Number(
                                    latestPrediction
                                        .predicted_yield_tonnes_ha
                                    ??
                                    (
                                        Number(
                                            latestPrediction
                                                .predicted_yield
                                        ) / 10000
                                    )
                                ).toFixed(2)} t/ha`
                                : "--"}

                    </h2>

                    <p>
                        Random Forest prediction
                    </p>

                </div>


                <div className="dashboard-card">

                    <FaLeaf className="dash-icon" />

                    <h3>
                        Selected Crop
                    </h3>

                    <h2>

                        {loading
                            ? "..."
                            : latestPrediction
                                ? (
                                    latestPrediction.item ||
                                    latestPrediction.crop ||
                                    "--"
                                )
                                : "--"}

                    </h2>

                    <p>
                        Latest prediction
                    </p>

                </div>

            </div>


            {/* =================================================
               ANALYTICS
            ================================================= */}

            <div className="section-card">

                <div className="section-heading-row">

                    <div>

                        <h2>
                            📊 Agricultural Analytics
                        </h2>

                        <p>
                            Live analytics generated from
                            YieldSense AI prediction and
                            soil analysis data.
                        </p>

                    </div>

                    <FaChartLine className="chart-icon" />

                </div>


                {analyticsLoading ? (

                    <div className="chart-empty">

                        <FaChartLine />

                        <p>
                            Loading analytics...
                        </p>

                    </div>

                ) : analytics ? (

                    <div className="analytics-grid">

                        <div className="analytics-card">

                            <FaChartLine />

                            <h3>
                                Total Predictions
                            </h3>

                            <h1>
                                {totalPredictions}
                            </h1>

                            <span>
                                AI yield predictions
                            </span>

                        </div>


                        <div className="analytics-card">

                            <FaFlask />

                            <h3>
                                Soil Analyses
                            </h3>

                            <h1>
                                {totalSoilAnalyses}
                            </h1>

                            <span>
                                Soil health analyses
                            </span>

                        </div>


                        <div className="analytics-card">

                            <FaSeedling />

                            <h3>
                                Average Yield
                            </h3>

                            <h1>
                                {averageYield.toFixed(2)}
                            </h1>

                            <span>
                                tonnes/ha
                            </span>

                        </div>


                        <div className="analytics-card">

                            <FaLeaf />

                            <h3>
                                Highest Predicted Yield
                            </h3>

                            <h1>
                                {(maximumYieldHg / 10000).toFixed(2)}
                            </h1>

                            <span>
                                tonnes/ha
                            </span>

                        </div>

                    </div>

                ) : (

                    <div className="chart-empty">

                        <FaChartLine />

                        <p>
                            Analytics are currently unavailable.
                        </p>

                    </div>

                )}

            </div>


            {/* =================================================
               QUICK TOOLS
            ================================================= */}

            <div className="dashboard-grid">

                <div className="dashboard-card">

                    <FaRobot className="dash-icon" />

                    <h3>
                        AI Yield Prediction
                    </h3>

                    <p>
                        Use environmental and crop
                        information to generate an
                        AI-powered yield forecast.
                    </p>

                    <Link
                        to="/prediction"
                        className="secondary-btn"
                    >
                        Open Prediction
                    </Link>

                </div>


                <div className="dashboard-card">

                    <FaCloudSun className="dash-icon" />

                    <h3>
                        Weather Intelligence
                    </h3>

                    <p>
                        Monitor temperature, rainfall,
                        humidity and receive weather-based
                        farming advice.
                    </p>

                    <Link
                        to="/weather"
                        className="secondary-btn"
                    >
                        Open Weather
                    </Link>

                </div>


                <div className="dashboard-card">

                    <FaFlask className="dash-icon" />

                    <h3>
                        Soil Health
                    </h3>

                    <p>
                        Analyze soil nutrients, soil health
                        score and fertilizer recommendations.
                    </p>

                    <Link
                        to="/recommendation"
                        className="secondary-btn"
                    >
                        Get Recommendations
                    </Link>

                </div>


                <div className="dashboard-card">

                    <FaDatabase className="dash-icon" />

                    <h3>
                        Agricultural Report
                    </h3>

                    <p>
                        View your latest prediction and
                        agricultural analysis report.
                    </p>

                    {latestPrediction ? (

                        <Link
                            to="/report"
                            className="secondary-btn"
                        >
                            📊 View Report
                        </Link>

                    ) : (

                        <span>
                            Generate a prediction first.
                        </span>

                    )}

                </div>

            </div>


            {/* =================================================
               CHARTS
            ================================================= */}

            <div className="charts-section">

                <div className="section-card chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Prediction Inputs
                            </h2>

                            <p>
                                Values used by the latest prediction.
                            </p>

                        </div>

                        <FaCloudSun className="chart-icon" />

                    </div>


                    {environmentData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <BarChart data={environmentData}>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="parameter"
                                />

                                <YAxis />

                                <Tooltip />

                                <Bar
                                    dataKey="value"
                                    fill="#16a34a"
                                    radius={[
                                        6,
                                        6,
                                        0,
                                        0
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="chart-empty">

                            <FaChartLine />

                            <p>
                                No prediction data available yet.
                            </p>

                        </div>

                    )}

                </div>


                <div className="section-card chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Yield Forecast
                            </h2>

                            <p>
                                Latest AI-predicted crop yield.
                            </p>

                        </div>

                        <FaSeedling className="chart-icon" />

                    </div>


                    {yieldData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <LineChart data={yieldData}>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="crop"
                                />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="yield"
                                    name="Yield (t/ha)"
                                    stroke="#15803d"
                                    strokeWidth={3}
                                    dot={{ r: 6 }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="chart-empty">

                            <FaSeedling />

                            <p>
                                No yield prediction available yet.
                            </p>

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
               LATEST PREDICTION
            ================================================= */}

            {latestPrediction && (

                <div className="section-card latest-result-card">

                    <h2>
                        🌾 Latest AI Prediction
                    </h2>

                    <div className="latest-result-grid">

                        <div>

                            <span>
                                Crop
                            </span>

                            <strong>
                                {latestPrediction.item ||
                                    latestPrediction.crop ||
                                    "--"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Area
                            </span>

                            <strong>
                                {latestPrediction.area ?? "--"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Yield
                            </span>

                            <strong>

                                {Number(
                                    latestPrediction
                                        .predicted_yield_tonnes_ha
                                    ??
                                    (
                                        Number(
                                            latestPrediction
                                                .predicted_yield
                                        ) / 10000
                                    )
                                ).toFixed(2)}

                                {" "}t/ha

                            </strong>

                        </div>


                        <div>

                            <span>
                                Model
                            </span>

                            <strong>
                                {latestPrediction.model ||
                                    "Random Forest Regressor"}
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
               AGRICULTURAL INTELLIGENCE
            ================================================= */}

            <div className="section-card">

                <div className="section-heading-row">

                    <div>

                        <h2>
                            💡 Agricultural Intelligence
                        </h2>

                        <p>
                            Decision-support tools available
                            through YieldSense AI.
                        </p>

                    </div>

                    <FaLightbulb className="chart-icon" />

                </div>


                <div className="dashboard-grid">


                    {/* CROP RECOMMENDATION */}

                    <div className="dashboard-card">

                        <FaSeedling className="dash-icon" />

                        <h3>
                            Crop Recommendation
                        </h3>

                        <p>
                            Use soil and environmental
                            conditions to identify suitable crops.
                        </p>

                        <Link
                            to="/recommendations"
                            className="secondary-btn"
                        >
                            Get recommendations
                        </Link>

                    </div>


                    {/* WEATHER */}

                    <div className="dashboard-card">

                        <FaCloudSun className="dash-icon" />

                        <h3>
                            Weather Advice
                        </h3>

                        <p>
                            Monitor weather conditions and
                            receive farming recommendations.
                        </p>

                        <Link
                            to="/weather"
                            className="secondary-btn"
                        >
                            Check Weather
                        </Link>

                    </div>


                    {/* RISK */}

                    <div className="dashboard-card">

                        <FaExclamationTriangle
                            className="dash-icon"
                        />

                        <h3>
                            Risk Monitoring
                        </h3>

                        <p>
                            Monitor environmental conditions
                            that may affect crop productivity.
                        </p>

                        <Link
                            to="/risk"
                            className="secondary-btn"
                        >
                            Monitor Conditions
                        </Link>

                    </div>


                    {/* OFFICER ADVICE */}

                    <div className="dashboard-card">

                        <FaUserTie className="dash-icon" />

                        <h3>
                            Agricultural Officer
                        </h3>

                        <p>
                            Select an agricultural officer and
                            request guidance for your farming
                            questions.
                        </p>

                        <a
                            href="#officer-advice"
                            className="secondary-btn"
                        >
                            Ask Officer
                        </a>

                    </div>

                </div>

            </div>


            {/* =================================================
               OFFICER ADVICE
            ================================================= */}

            <div
                className="section-card"
                id="officer-advice"
            >

                <div className="section-heading-row">

                    <div>

                        <h2>
                            <FaComments /> Ask an Agricultural Officer
                        </h2>

                        <p>
                            Get practical guidance from a
                            registered agricultural officer.
                        </p>

                    </div>

                    <FaUserTie className="chart-icon" />

                </div>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                        marginTop: "20px"
                    }}
                >

                    <div>

                        <label>
                            Select Agricultural Officer
                        </label>

                        <select
                            value={selectedOfficer}
                            onChange={(e) =>
                                setSelectedOfficer(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "8px",
                                borderRadius: "8px",
                                border:
                                    "1px solid #d1d5db"
                            }}
                        >

                            <option value="">
                                -- Select Officer --
                            </option>

                            {officers.map(
                                (officer) => (

                                    <option
                                        key={
                                            officer._id ||
                                            officer.email
                                        }
                                        value={
                                            officer.email
                                        }
                                    >
                                        {officer.full_name ||
                                            officer.name ||
                                            "Agricultural Officer"}
                                        {" - "}
                                        {officer.email}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div>

                        <label>
                            Your Agricultural Question
                        </label>

                        <textarea
                            value={adviceQuery}
                            onChange={(e) =>
                                setAdviceQuery(
                                    e.target.value
                                )
                            }
                            placeholder="Describe your crop, soil, irrigation or farming issue..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "8px",
                                borderRadius: "8px",
                                border:
                                    "1px solid #d1d5db",
                                resize: "vertical"
                            }}
                        />

                    </div>

                </div>


                {adviceError && (

                    <div
                        className="dashboard-error"
                        style={{
                            marginTop: "15px"
                        }}
                    >

                        <FaExclamationTriangle />

                        <span>
                            {adviceError}
                        </span>

                    </div>

                )}


                {adviceMessage && (

                    <div
                        style={{
                            marginTop: "15px",
                            padding: "12px",
                            borderRadius: "8px",
                            background:
                                "#dcfce7",
                            color:
                                "#166534"
                        }}
                    >
                        ✓ {adviceMessage}
                    </div>

                )}


                <button
                    className="primary-btn"
                    onClick={submitAdviceRequest}
                    disabled={adviceLoading}
                    style={{
                        marginTop: "18px"
                    }}
                >

                    <FaPaperPlane />

                    {adviceLoading
                        ? " Sending..."
                        : " Send Advice Request"}

                </button>

            </div>


            {/* =================================================
               MY ADVICE REQUESTS
            ================================================= */}

            <div className="section-card">

                <div className="section-heading-row">

                    <div>

                        <h2>
                            📩 My Advice Requests
                        </h2>

                        <p>
                            Track questions submitted to
                            agricultural officers.
                        </p>

                    </div>

                </div>


                {adviceRequests.length === 0 ? (

                    <div className="chart-empty">

                        <FaComments />

                        <p>
                            You have not submitted any
                            advice requests yet.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table className="dashboard-table">

                            <thead>

                                <tr>

                                    <th>
                                        Officer
                                    </th>

                                    <th>
                                        Question
                                    </th>

                                    <th>
                                        Crop
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Advice
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {adviceRequests.map(
                                    (request, index) => {

                                        /*
                                         * Use normalized values.
                                         */

                                        const status =
                                            (
                                                request.displayStatus ||
                                                getAdviceStatus(request)
                                            ).toLowerCase();


                                        const advice =
                                            request.displayAdvice ||
                                            getOfficerAdvice(request);
                                        const isReplied =
                                            status === "replied" ||
                                            status === "answered" ||
                                            status === "responded" ||
                                            status === "completed";


                                        return (

                                            <tr
                                                key={
                                                    request._id ||
                                                    request.id ||
                                                    index
                                                }
                                            >

                                                {/* OFFICER */}

                                                <td>

                                                    <strong>
                                                        {request.officer_name ||
                                                            request.officer_email ||
                                                            "Officer"}
                                                    </strong>

                                                    <br />

                                                    <small>
                                                        {request.officer_email ||
                                                            ""}
                                                    </small>

                                                </td>


                                                {/* QUESTION */}

                                                <td>
                                                    {request.query ||
                                                        request.question ||
                                                        "--"}
                                                </td>


                                                {/* CROP */}

                                                <td>
                                                    {request.crop ||
                                                        request.item ||
                                                        "--"}
                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "20px",
                                                            background:
                                                                isReplied
                                                                    ? "#dcfce7"
                                                                    : "#fef3c7",
                                                            color:
                                                                isReplied
                                                                    ? "#166534"
                                                                    : "#92400e",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >

                                                        {status}

                                                    </span>

                                                </td>


                                                {/* ADVICE */}

                                                <td>

                                                    {isReplied && advice ? (

                                                        <div
                                                            style={{
                                                                color:
                                                                    "#166534",
                                                                fontWeight:
                                                                    "500",
                                                                lineHeight:
                                                                    "1.5"
                                                            }}
                                                        >

                                                            💡 {advice}

                                                        </div>

                                                    ) : (

                                                        <span
                                                            style={{
                                                                color:
                                                                    "#6b7280"
                                                            }}
                                                        >
                                                            Waiting for officer response.
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ user }) {

    const [stats, setStats] = useState({

        total_users: 0,
        total_farmers: 0,
        total_farms: 0,
        total_land: 0,
        total_predictions: 0,
        crop_distribution: [],
        farmers_by_location: [],
        recent_farmers: []

    });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchStats = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await fetch(
                    `${BASE_URL}/admin/stats`
                );

            if (!response.ok) {

                throw new Error(
                    `Failed to load admin statistics (${response.status})`
                );

            }

            const data =
                await response.json();

            setStats({

                total_users:
                    Number(data.total_users) || 0,

                total_farmers:
                    Number(data.total_farmers) || 0,

                total_farms:
                    Number(data.total_farms) || 0,

                total_land:
                    Number(data.total_land) || 0,

                total_predictions:
                    Number(data.total_predictions) || 0,

                crop_distribution:
                    Array.isArray(data.crop_distribution)
                        ? data.crop_distribution
                        : [],

                farmers_by_location:
                    Array.isArray(data.farmers_by_location)
                        ? data.farmers_by_location
                        : [],

                recent_farmers:
                    Array.isArray(data.recent_farmers)
                        ? data.recent_farmers
                        : []

            });

        } catch (err) {

            console.error(
                "Admin dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchStats();

    }, []);


    const cropChartData =
        useMemo(

            () =>

                stats.crop_distribution
                    .map((item) => ({

                        crop:
                            item?.crop ||
                            item?.item ||
                            item?.name ||
                            "Unknown",

                        count:
                            Number(item?.count) || 0

                    }))
                    .filter(
                        item =>
                            item.count >= 0
                    ),

            [stats.crop_distribution]
        );


    const locationChartData =
        useMemo(

            () =>

                stats.farmers_by_location
                    .map((item) => ({

                        location:
                            [
                                item?.village,
                                item?.mandal,
                                item?.district,
                                item?.state,
                                item?.country
                            ]
                                .filter(Boolean)
                                .join(", ") ||
                            "Unknown",

                        count:
                            Number(item?.count) || 0

                    }))
                    .filter(
                        item =>
                            item.count >= 0
                    ),

            [stats.farmers_by_location]
        );


    return (

        <div className="dashboard-page">


            <div className="dashboard-banner admin">

                <div>

                    <h1>
                        Administrator Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        {user.full_name ||
                            "Administrator"}.
                    </p>

                </div>


                <Link
                    to="/users"
                    className="primary-btn"
                >
                    Manage Users
                </Link>


                <Link
                    to="/analytics"
                    className="secondary-btn"
                >
                    📊 Analytics
                </Link>

            </div>


            {error && (

                <div className="dashboard-error">

                    <FaExclamationTriangle />

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={fetchStats}
                    >
                        Retry
                    </button>

                </div>

            )}


            <div className="dashboard-grid">

                <AdminStatCard
                    icon={<FaUsers />}
                    title="Total Users"
                    value={
                        loading
                            ? "..."
                            : stats.total_users
                    }
                    text="Registered users"
                    link="/users"
                    linkText="Manage Users"
                />


                <AdminStatCard
                    icon={<FaTractor />}
                    title="Total Farmers"
                    value={
                        loading
                            ? "..."
                            : stats.total_farmers
                    }
                    text="Registered farmers"
                    link="/users"
                    linkText="View Users"
                />


                <AdminStatCard
                    icon={<FaSeedling />}
                    title="Total Farms"
                    value={
                        loading
                            ? "..."
                            : stats.total_farms
                    }
                    text="Agricultural farm records"
                />


                <AdminStatCard
                    icon={<FaChartLine />}
                    title="Predictions"
                    value={
                        loading
                            ? "..."
                            : stats.total_predictions
                    }
                    text="AI predictions stored"
                />


                <AdminStatCard
                    icon={<FaRulerCombined />}
                    title="Cultivated Land"
                    value={
                        loading
                            ? "..."
                            : stats.total_land
                    }
                    text="Registered agricultural land"
                />


                <AdminStatCard
                    icon={<FaLeaf />}
                    title="Crop Types"
                    value={
                        loading
                            ? "..."
                            : cropChartData.length
                    }
                    text="Crops represented"
                />


                <AdminStatCard
                    icon={<FaMapMarkerAlt />}
                    title="Locations"
                    value={
                        loading
                            ? "..."
                            : locationChartData.length
                    }
                    text="Farmer locations"
                />


                <AdminStatCard
                    icon={<FaDatabase />}
                    title="Data Records"
                    value={
                        loading
                            ? "..."
                            :
                            stats.total_users +
                            stats.total_predictions
                    }
                    text="User + prediction records"
                />

            </div>


            <div className="charts-section">

                <div className="section-card chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Crop Distribution
                            </h2>

                            <p>
                                Live crop counts returned by MongoDB.
                            </p>

                        </div>

                        <FaLeaf className="chart-icon" />

                    </div>


                    {cropChartData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <BarChart
                                data={cropChartData}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="crop"
                                />

                                <YAxis
                                    allowDecimals={false}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="count"
                                    name="Predictions"
                                    fill="#16a34a"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="chart-empty">

                            <FaLeaf />

                            <p>
                                No crop records available.
                            </p>

                        </div>

                    )}

                </div>


                <div className="section-card chart-card">

                    <div className="chart-header">

                        <div>

                            <h2>
                                Farmers by Location
                            </h2>

                            <p>
                                Live farmer distribution.
                            </p>

                        </div>

                        <FaMapMarkerAlt className="chart-icon" />

                    </div>


                    {locationChartData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <BarChart
                                data={locationChartData}
                                layout="vertical"
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    type="number"
                                />

                                <YAxis
                                    type="category"
                                    dataKey="location"
                                    width={120}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="count"
                                    name="Farmers"
                                    fill="#15803d"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="chart-empty">

                            <FaMapMarkerAlt />

                            <p>
                                No location records available.
                            </p>

                        </div>

                    )}

                </div>

            </div>


            <div className="section-card">

                <div className="section-heading-row">

                    <div>

                        <h2>
                            Recent Farmers
                        </h2>

                        <p>
                            Latest farmer records returned
                            by the backend.
                        </p>

                    </div>

                    <Link
                        to="/users"
                        className="secondary-btn"
                    >
                        View All Users
                    </Link>

                </div>


                <div className="table-container">

                    <table className="dashboard-table">

                        <thead>

                            <tr>

                                <th>Name</th>
                                <th>Email</th>
                                <th>Location</th>
                                <th>Land</th>
                                <th>Crop</th>
                                <th>Registered</th>

                            </tr>

                        </thead>


                        <tbody>

                            {stats.recent_farmers.length > 0 ? (

                                stats.recent_farmers.map(
                                    (farmer, index) => {

                                        const location =
                                            [
                                                farmer?.village,
                                                farmer?.mandal,
                                                farmer?.district,
                                                farmer?.state,
                                                farmer?.country
                                            ]
                                                .filter(Boolean)
                                                .join(", ");

                                        return (

                                            <tr
                                                key={
                                                    farmer?._id ||
                                                    farmer?.email ||
                                                    index
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {farmer?.full_name ||
                                                            "--"}
                                                    </strong>

                                                </td>

                                                <td>
                                                    {farmer?.email ||
                                                        "--"}
                                                </td>

                                                <td>
                                                    {location || "--"}
                                                </td>

                                                <td>

                                                    {farmer?.land_area ??
                                                        "--"}{" "}

                                                    {farmer?.land_area
                                                        ? farmer?.land_unit ||
                                                          "acres"
                                                        : ""}

                                                </td>

                                                <td>
                                                    {farmer?.crop ||
                                                        "--"}
                                                </td>

                                                <td>

                                                    {farmer?.created_at
                                                        ? new Date(
                                                            farmer.created_at
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "--"}

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign:
                                                "center"
                                        }}
                                    >
                                        No farmer records available.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            <div className="section-card">

                <h2>
                    Platform Status
                </h2>

                <ul className="status-list">

                    <li>

                        <FaRobot />

                        <span>
                            Prediction model:
                            Random Forest Regressor
                        </span>

                    </li>

                    <li>

                        <FaUsers />

                        <span>
                            Farmer records loaded:
                            {" "}
                            {stats.total_farmers}
                        </span>

                    </li>

                    <li>

                        <FaChartLine />

                        <span>
                            Prediction records loaded:
                            {" "}
                            {stats.total_predictions}
                        </span>

                    </li>

                </ul>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN STAT CARD
========================================================= */

function AdminStatCard({
    icon,
    title,
    value,
    text,
    link,
    linkText
}) {

    return (

        <div className="dashboard-card admin-stat">

            <div className="dash-icon">
                {icon}
            </div>

            <h3>
                {title}
            </h3>

            <h2>
                {value}
            </h2>

            <p>
                {text}
            </p>


            {link && (

                <Link to={link}>
                    {linkText}
                </Link>

            )}

        </div>

    );

}