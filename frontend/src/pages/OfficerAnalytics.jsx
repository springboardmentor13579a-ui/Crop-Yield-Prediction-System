import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../layout/Layout";

import {
    FaArrowLeft,
    FaUsers,
    FaSeedling,
    FaMapMarkerAlt,
    FaClipboardCheck,
    FaExclamationTriangle,
    FaTint,
    FaLeaf,
    FaChartLine,
    FaCloudRain,
    FaTemperatureHigh
} from "react-icons/fa";

import "../styles/officerAnalytics.css";

const BASE_URL = "http://127.0.0.1:8000";


export default function OfficerAnalytics() {

    const navigate = useNavigate();

    // =====================================================
    // USER
    // =====================================================

    const user =
        JSON.parse(
            localStorage.getItem("user")
        ) || {};

    const role =
        localStorage.getItem("role");


    // =====================================================
    // STATE
    // =====================================================

    const [farmers, setFarmers] =
        useState([]);

    const [soilData, setSoilData] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // SECURITY CHECK
    // =====================================================

    useEffect(() => {

        if (
            role !== "agricultural_officer"
        ) {

            navigate(
                "/login?role=agricultural_officer",
                { replace: true }
            );

        }

    }, [role, navigate]);


    // =====================================================
    // LOAD ANALYTICS DATA
    // =====================================================

    useEffect(() => {

        if (
            role === "agricultural_officer"
        ) {

            loadAnalytics();

        }

    }, [role]);


    async function loadAnalytics() {

        try {

            setLoading(true);
            setError("");


            // =================================================
            // FARMERS
            // =================================================

            const farmerResponse =
                await fetch(
                    `${BASE_URL}/users`
                );


            if (!farmerResponse.ok) {

                throw new Error(
                    "Unable to load farmer records."
                );

            }


            const farmerData =
                await farmerResponse.json();


            const farmerList =
                Array.isArray(farmerData)
                    ? farmerData.filter(
                        farmer =>
                            farmer.role === "farmer"
                    )
                    : [];


            setFarmers(
                farmerList
            );


            // =================================================
            // SOIL
            // =================================================

            try {

                const soilResponse =
                    await fetch(
                        `${BASE_URL}/soil/all`
                    );


                if (soilResponse.ok) {

                    const soilResult =
                        await soilResponse.json();


                    setSoilData(
                        Array.isArray(soilResult)
                            ? soilResult
                            : []
                    );

                }

                else {

                    setSoilData([]);

                }

            }

            catch (soilError) {

                console.error(
                    "Soil analytics error:",
                    soilError
                );

                setSoilData([]);

            }

        }

        catch (err) {

            console.error(
                "Officer analytics error:",
                err
            );

            setError(
                err.message ||
                "Unable to load analytics."
            );

        }

        finally {

            setLoading(false);

        }

    }


    // =====================================================
    // BASIC ANALYTICS
    // =====================================================

    const statesCovered =
        useMemo(() => {

            return new Set(
                farmers
                    .map(
                        farmer =>
                            farmer.state
                    )
                    .filter(Boolean)
            ).size;

        }, [farmers]);


    const averageSoilScore =
        useMemo(() => {

            if (
                soilData.length === 0
            ) {

                return 0;

            }


            const scores =
                soilData
                    .map(
                        item =>
                            Number(
                                item.soil_score
                            )
                    )
                    .filter(
                        score =>
                            !Number.isNaN(score)
                    );


            if (
                scores.length === 0
            ) {

                return 0;

            }


            return Math.round(
                scores.reduce(
                    (sum, score) =>
                        sum + score,
                    0
                ) / scores.length
            );

        }, [soilData]);


    // =====================================================
    // SOIL STATUS COUNTS
    // =====================================================

    const soilStatus =
        useMemo(() => {

            let healthy = 0;
            let moderate = 0;
            let review = 0;


            soilData.forEach(
                item => {

                    const score =
                        Number(
                            item.soil_score
                        ) || 0;


                    if (score >= 70) {

                        healthy++;

                    }

                    else if (score >= 40) {

                        moderate++;

                    }

                    else {

                        review++;

                    }

                }
            );


            return {
                healthy,
                moderate,
                review
            };

        }, [soilData]);


    // =====================================================
    // FARMERS NEEDING ATTENTION
    // =====================================================

    const farmersNeedingAttention =
        useMemo(() => {

            return farmers.filter(
                farmer => {

                    const missingCrop =
                        !farmer.crop;

                    const missingSoil =
                        !farmer.soil;

                    const missingIrrigation =
                        !farmer.irrigation;


                    return (
                        missingCrop ||
                        missingSoil ||
                        missingIrrigation
                    );

                }
            );

        }, [farmers]);


    // =====================================================
    // CROP DISTRIBUTION
    // =====================================================

    const cropDistribution =
        useMemo(() => {

            const cropMap = {};


            farmers.forEach(
                farmer => {

                    const crop =
                        farmer.crop ||
                        "Not Provided";


                    cropMap[crop] =
                        (cropMap[crop] || 0) + 1;

                }
            );


            return Object.entries(
                cropMap
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 8);

        }, [farmers]);


    // =====================================================
    // STATE DISTRIBUTION
    // =====================================================

    const stateDistribution =
        useMemo(() => {

            const stateMap = {};


            farmers.forEach(
                farmer => {

                    const state =
                        farmer.state ||
                        "Not Provided";


                    stateMap[state] =
                        (stateMap[state] || 0) + 1;

                }
            );


            return Object.entries(
                stateMap
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 8);

        }, [farmers]);


    // =====================================================
    // LOADING
    // =====================================================

    if (
        role !== "agricultural_officer"
    ) {

        return null;

    }


    if (loading) {

        return (

            <Layout>

                <div className="officer-analytics-page">

                    <div className="officer-analytics-loading">

                        <div className="officer-spinner"></div>

                        <h2>
                            Loading Analytics...
                        </h2>

                        <p>
                            Collecting farmer and soil information.
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <Layout>

            <div className="officer-analytics-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="analytics-header">

                    <div>

                        <Link
                            to="/agricultural-officer"
                            className="analytics-back"
                        >

                            <FaArrowLeft />

                            Back to Dashboard

                        </Link>


                        <span className="analytics-eyebrow">

                            AGRICULTURAL INTELLIGENCE

                        </span>


                        <h1>
                            Officer Analytics
                        </h1>


                        <p>

                            Welcome back,{" "}

                            <strong>
                                {user.full_name ||
                                    "Agricultural Officer"}
                            </strong>.

                            {" "}

                            Analyze farmer coverage,
                            soil health and agricultural
                            trends across the system.

                        </p>

                    </div>


                    <button
                        className="analytics-refresh"
                        onClick={loadAnalytics}
                    >

                        <FaChartLine />

                        Refresh Analytics

                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="analytics-error">

                        <FaExclamationTriangle />

                        <span>
                            {error}
                        </span>

                        <button
                            onClick={loadAnalytics}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    KPI CARDS
                ================================================= */}

                <div className="analytics-kpi-grid">


                    <div className="analytics-kpi">

                        <div className="analytics-kpi-icon green">

                            <FaUsers />

                        </div>

                        <div>

                            <span>
                                Total Farmers
                            </span>

                            <strong>
                                {farmers.length}
                            </strong>

                            <small>
                                Registered farmers
                            </small>

                        </div>

                    </div>


                    <div className="analytics-kpi">

                        <div className="analytics-kpi-icon blue">

                            <FaMapMarkerAlt />

                        </div>

                        <div>

                            <span>
                                States Covered
                            </span>

                            <strong>
                                {statesCovered}
                            </strong>

                            <small>
                                Farmer locations
                            </small>

                        </div>

                    </div>


                    <div className="analytics-kpi">

                        <div className="analytics-kpi-icon lime">

                            <FaSeedling />

                        </div>

                        <div>

                            <span>
                                Average Soil Score
                            </span>

                            <strong>
                                {averageSoilScore}
                            </strong>

                            <small>
                                Overall soil health
                            </small>

                        </div>

                    </div>


                    <div className="analytics-kpi">

                        <div className="analytics-kpi-icon orange">

                            <FaClipboardCheck />

                        </div>

                        <div>

                            <span>
                                Soil Analyses
                            </span>

                            <strong>
                                {soilData.length}
                            </strong>

                            <small>
                                Available records
                            </small>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SOIL HEALTH
                ================================================= */}

                <div className="analytics-section">

                    <div className="analytics-section-header">

                        <div>

                            <span>
                                SOIL INTELLIGENCE
                            </span>

                            <h2>
                                Soil Health Overview
                            </h2>

                            <p>
                                Distribution of available soil
                                analysis records by health status.
                            </p>

                        </div>

                        <FaLeaf />

                    </div>


                    <div className="soil-overview-grid">


                        <div className="soil-overview-card healthy">

                            <div className="soil-card-icon">
                                <FaSeedling />
                            </div>

                            <div>

                                <span>
                                    Healthy
                                </span>

                                <strong>
                                    {soilStatus.healthy}
                                </strong>

                                <small>
                                    Score 70+
                                </small>

                            </div>

                        </div>


                        <div className="soil-overview-card moderate">

                            <div className="soil-card-icon">
                                <FaTint />
                            </div>

                            <div>

                                <span>
                                    Moderate
                                </span>

                                <strong>
                                    {soilStatus.moderate}
                                </strong>

                                <small>
                                    Score 40–69
                                </small>

                            </div>

                        </div>


                        <div className="soil-overview-card review">

                            <div className="soil-card-icon">
                                <FaExclamationTriangle />
                            </div>

                            <div>

                                <span>
                                    Needs Review
                                </span>

                                <strong>
                                    {soilStatus.review}
                                </strong>

                                <small>
                                    Score below 40
                                </small>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    DISTRIBUTIONS
                ================================================= */}

                <div className="analytics-two-column">


                    {/* CROP DISTRIBUTION */}

                    <div className="analytics-panel">

                        <div className="analytics-panel-header">

                            <div>

                                <h2>
                                    Crop Distribution
                                </h2>

                                <p>
                                    Most common crops among
                                    registered farmers.
                                </p>

                            </div>

                            <FaSeedling />

                        </div>


                        {cropDistribution.length === 0 ? (

                            <div className="analytics-empty">
                                No crop information available.
                            </div>

                        ) : (

                            <div className="distribution-list">

                                {cropDistribution.map(
                                    ([crop, count]) => {

                                        const percentage =
                                            farmers.length
                                                ? Math.round(
                                                    (count /
                                                        farmers.length) *
                                                    100
                                                )
                                                : 0;


                                        return (

                                            <div
                                                className="distribution-row"
                                                key={crop}
                                            >

                                                <div>

                                                    <strong>
                                                        {crop}
                                                    </strong>

                                                    <span>
                                                        {count} farmers
                                                    </span>

                                                </div>


                                                <div className="distribution-bar">

                                                    <i
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* STATE DISTRIBUTION */}

                    <div className="analytics-panel">

                        <div className="analytics-panel-header">

                            <div>

                                <h2>
                                    Farmer Distribution
                                </h2>

                                <p>
                                    Farmer coverage by state.
                                </p>

                            </div>

                            <FaMapMarkerAlt />

                        </div>


                        {stateDistribution.length === 0 ? (

                            <div className="analytics-empty">
                                No location information available.
                            </div>

                        ) : (

                            <div className="distribution-list">

                                {stateDistribution.map(
                                    ([state, count]) => {

                                        const percentage =
                                            farmers.length
                                                ? Math.round(
                                                    (count /
                                                        farmers.length) *
                                                    100
                                                )
                                                : 0;


                                        return (

                                            <div
                                                className="distribution-row"
                                                key={state}
                                            >

                                                <div>

                                                    <strong>
                                                        {state}
                                                    </strong>

                                                    <span>
                                                        {count} farmers
                                                    </span>

                                                </div>


                                                <div className="distribution-bar blue-bar">

                                                    <i
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    ATTENTION
                ================================================= */}

                <div className="analytics-section attention-section">

                    <div className="analytics-section-header">

                        <div>

                            <span>
                                FARMER SUPPORT
                            </span>

                            <h2>
                                Farmers Needing Attention
                            </h2>

                            <p>
                                Farmers whose agricultural profiles
                                have missing information.
                            </p>

                        </div>

                        <div className="attention-count">

                            {farmersNeedingAttention.length}

                        </div>

                    </div>


                    {farmersNeedingAttention.length === 0 ? (

                        <div className="analytics-success">

                            <FaSeedling />

                            <div>

                                <strong>
                                    All farmer profiles look good.
                                </strong>

                                <p>
                                    No incomplete agricultural
                                    profiles were detected.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div className="attention-list">

                            {farmersNeedingAttention
                                .slice(0, 10)
                                .map(
                                    farmer => {

                                        const missing = [];


                                        if (!farmer.crop) {
                                            missing.push("Crop");
                                        }

                                        if (!farmer.soil) {
                                            missing.push("Soil");
                                        }

                                        if (!farmer.irrigation) {
                                            missing.push("Irrigation");
                                        }


                                        return (

                                            <div
                                                className="attention-row"
                                                key={
                                                    farmer._id ||
                                                    farmer.id ||
                                                    farmer.email
                                                }
                                            >

                                                <div className="attention-person">

                                                    <div className="attention-avatar">

                                                        {(farmer.full_name ||
                                                            "F")
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                farmer.full_name ||
                                                                "Unknown Farmer"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                farmer.email ||
                                                                "No email"
                                                            }
                                                        </small>

                                                    </div>

                                                </div>


                                                <div className="missing-tags">

                                                    {missing.map(
                                                        item => (

                                                            <span
                                                                key={item}
                                                            >
                                                                {item}
                                                            </span>

                                                        )
                                                    )}

                                                </div>


                                                <Link
                                                    to="/users"
                                                    className="analytics-advice-btn"
                                                >
                                                    Review

                                                </Link>

                                            </div>

                                        );

                                    }
                                )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    QUICK NAVIGATION
                ================================================= */}

                <div className="analytics-navigation">

                    <Link
                        to="/users"
                        className="analytics-nav-card"
                    >

                        <FaUsers />

                        <div>

                            <strong>
                                Farmer Management
                            </strong>

                            <span>
                                View and manage farmer records
                            </span>

                        </div>

                    </Link>


                    <Link
                        to="/soil"
                        className="analytics-nav-card"
                    >

                        <FaLeaf />

                        <div>

                            <strong>
                                Soil Monitoring
                            </strong>

                            <span>
                                Review soil analysis records
                            </span>

                        </div>

                    </Link>


                    <Link
                        to="/weather"
                        className="analytics-nav-card"
                    >

                        <FaCloudRain />

                        <div>

                            <strong>
                                Weather Monitoring
                            </strong>

                            <span>
                                Check current weather conditions
                            </span>

                        </div>

                    </Link>

                </div>

            </div>

        </Layout>

    );

}