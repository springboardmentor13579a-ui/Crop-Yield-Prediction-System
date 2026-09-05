import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ScatterChart,
    Scatter,
    ZAxis,
} from "recharts";

import {
    FaArrowLeft,
    FaChartLine,
    FaUsers,
    FaSeedling,
    FaMapMarkerAlt,
    FaTint,
    FaExclamationTriangle,
    FaLeaf,
    FaCloudRain,
    FaUserShield,
    FaSyncAlt,
    FaTemperatureHigh,
    FaHistory,
} from "react-icons/fa";

import Layout from "../layout/Layout";
import { getLatestPrediction } from "../services/predictionService";

import "../styles/analytics.css";


const BASE_URL = "http://127.0.0.1:8000";


const COLORS = [
    "#198754",
    "#4caf50",
    "#8bc34a",
    "#f5a623",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",
];


// =========================================================
// GET USER
// =========================================================

function getUser() {

    try {

        return (
            JSON.parse(
                localStorage.getItem("user")
            ) || {}
        );

    } catch {

        return {};

    }

}


// =========================================================
// NUMBER HELPER
// =========================================================

function numberValue(value) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


// =========================================================
// CROP HELPER
// =========================================================

function getCrop(item) {

    if (!item) {
        return "Not Provided";
    }

    return (
        item.item ||
        item.crop ||
        item.crop_name ||
        item.cropName ||
        item.predicted_crop ||
        item.predictedCrop ||
        item.recommended_crop ||
        item.recommendedCrop ||
        "Not Provided"
    );

}


// =========================================================
// STATE HELPER
// =========================================================

function getState(item) {

    if (!item) {
        return "Not Provided";
    }

    return (
        item.state ||
        item.location ||
        item.district ||
        "Not Provided"
    );

}


// =========================================================
// YIELD HELPER
// =========================================================

function getYield(item) {

    if (!item) {
        return 0;
    }

    return numberValue(
        item.predicted_yield ??
        item.predictedYield ??
        item.predicted_yield_hg_ha ??
        item.yield ??
        item.yield_prediction ??
        item.production ??
        item.yield_value
    );

}


// =========================================================
// YIELD IN TONNES / HECTARE
// =========================================================

function getYieldTonnes(item) {

    if (!item) {
        return 0;
    }


    // Already converted by backend
    if (
        item.predicted_yield_tonnes !==
        undefined &&
        item.predicted_yield_tonnes !==
        null
    ) {

        return numberValue(
            item.predicted_yield_tonnes
        );

    }


    if (
        item.predicted_yield_tonnes_ha !==
        undefined &&
        item.predicted_yield_tonnes_ha !==
        null
    ) {

        return numberValue(
            item.predicted_yield_tonnes_ha
        );

    }


    // Otherwise model output is hg/ha
    return (
        getYield(item) / 10000
    );

}


// =========================================================
// RAINFALL
// =========================================================

function getRainfall(item) {

    if (!item) {
        return 0;
    }

    return numberValue(
        item.rainfall ??
        item.rainfall_mm ??
        item.precipitation
    );

}


// =========================================================
// TEMPERATURE
// =========================================================

function getTemperature(item) {

    if (!item) {
        return 0;
    }

    return numberValue(
        item.temperature ??
        item.temperature_c ??
        item.temperature_celsius ??
        item.avg_temperature
    );

}


// =========================================================
// SEASON
// =========================================================

function getSeason(item) {

    if (
        item?.season
    ) {

        return item.season;

    }


    const date = new Date(
        item?.created_at ||
        item?.createdAt ||
        `${item?.year || new Date().getFullYear()}-07-01`
    );


    const month =
        date.getMonth();


    // June - October
    if (
        month >= 5 &&
        month <= 9
    ) {

        return "Kharif";

    }


    // November - February
    if (
        month >= 10 ||
        month <= 1
    ) {

        return "Rabi";

    }


    // March - May
    return "Zaid";

}


// =========================================================
// CHART TOOLTIP
// =========================================================

function ChartTooltip({
    active,
    payload,
    label,
}) {

    if (
        !active ||
        !payload ||
        !payload.length
    ) {

        return null;

    }


    return (

        <div className="analytics-tooltip">

            <strong>
                {label}
            </strong>


            {payload.map(
                (item, index) => (

                    <div
                        key={index}
                        className="tooltip-row"
                    >

                        <span
                            className="tooltip-dot"
                            style={{
                                background:
                                    item.color ||
                                    "#198754",
                            }}
                        />


                        <span>
                            {item.name}
                        </span>


                        <b>
                            {typeof item.value ===
                            "number"
                                ? item.value.toLocaleString()
                                : item.value}
                        </b>

                    </div>

                )
            )}

        </div>

    );

}


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function Analytics() {

    const navigate = useNavigate();

    const user = getUser();


    const role =
        localStorage.getItem("role") ||
        user.role ||
        "farmer";


    const [
        farmers,
        setFarmers,
    ] = useState([]);


    const [
        soilData,
        setSoilData,
    ] = useState([]);


    const [
        prediction,
        setPrediction,
    ] = useState(null);


    const [
        predictionHistory,
        setPredictionHistory,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // =====================================================
    // LOAD ANALYTICS
    // =====================================================

    useEffect(() => {

        if (
            role !== "farmer" &&
            role !== "admin" &&
            role !== "agricultural_officer"
        ) {

            navigate(
                "/login",
                {
                    replace: true,
                }
            );

            return;

        }


        loadAnalytics();

    }, [role]);


    // =====================================================
    // LOAD DATA
    // =====================================================

    async function loadAnalytics() {

        try {

            setLoading(true);

            setError("");


            // =================================================
            // USERS
            // =================================================

            try {

                const response =
                    await fetch(
                        `${BASE_URL}/users`
                    );


                if (response.ok) {

                    const data =
                        await response.json();


                    setFarmers(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                }

            } catch (err) {

                console.error(
                    "Users analytics error:",
                    err
                );

            }


            // =================================================
            // SOIL
            // =================================================

            try {

                const response =
                    await fetch(
                        `${BASE_URL}/soil/all`
                    );


                if (response.ok) {

                    const data =
                        await response.json();


                    setSoilData(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                }

            } catch (err) {

                console.error(
                    "Soil analytics error:",
                    err
                );

            }


            // =================================================
            // FARMER ANALYTICS
            // =================================================

            if (
                role === "farmer"
            ) {


                // =============================================
                // LATEST PREDICTION FROM BACKEND
                // =============================================

                try {

                    if (!user.email) {

                        console.warn(
                            "Farmer email not found in localStorage"
                        );

                        setPrediction(null);

                    } else {

                        const latest =
                            await getLatestPrediction(
                                user.email
                            );


                        console.log(
                            "Analytics latest prediction:",
                            latest
                        );


                        setPrediction(
                            latest || null
                        );

                    }

                } catch (err) {

                    console.error(
                        "Latest prediction error:",
                        err
                    );

                    setPrediction(null);

                }


                // =============================================
                // PREDICTION HISTORY
                // =============================================

                try {

                    const storedHistory =
                        JSON.parse(
                            localStorage.getItem(
                                "predictionHistory"
                            )
                        ) || [];


                    console.log(
                        "Analytics prediction history:",
                        storedHistory
                    );


                    setPredictionHistory(
                        Array.isArray(
                            storedHistory
                        )
                            ? storedHistory
                            : []
                    );

                } catch (err) {

                    console.error(
                        "Prediction history error:",
                        err
                    );

                    setPredictionHistory([]);

                }

            }


        } catch (err) {

            console.error(
                "Analytics error:",
                err
            );


            setError(
                "Unable to load some analytics data."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // USER DATA
    // =====================================================

    const allFarmers = useMemo(
        () =>
            farmers.filter(
                item =>
                    item.role ===
                    "farmer"
            ),
        [farmers]
    );


    const officers = useMemo(
        () =>
            farmers.filter(
                item =>
                    item.role ===
                    "agricultural_officer"
            ),
        [farmers]
    );


    const admins = useMemo(
        () =>
            farmers.filter(
                item =>
                    item.role === "admin"
            ),
        [farmers]
    );


    // =====================================================
    // USER DISTRIBUTION
    // =====================================================

    const userDistribution =
        useMemo(
            () => [

                {
                    name: "Farmers",
                    value:
                        allFarmers.length,
                },

                {
                    name: "Officers",
                    value:
                        officers.length,
                },

                {
                    name: "Admins",
                    value:
                        admins.length,
                },

            ],
            [
                allFarmers,
                officers,
                admins,
            ]
        );


    // =====================================================
    // CROP DISTRIBUTION - SYSTEM
    // =====================================================

    const cropDistribution =
        useMemo(() => {

            const map = {};


            allFarmers.forEach(
                farmer => {

                    const crop =
                        getCrop(farmer);


                    if (
                        crop !==
                        "Not Provided"
                    ) {

                        map[crop] =
                            (map[crop] || 0) +
                            1;

                    }

                }
            );


            return Object.entries(map)
                .map(
                    ([name, value]) => ({
                        name,
                        value,
                    })
                )
                .sort(
                    (a, b) =>
                        b.value -
                        a.value
                )
                .slice(0, 8);

        }, [allFarmers]);


    // =====================================================
    // STATE DISTRIBUTION
    // =====================================================

    const stateDistribution =
        useMemo(() => {

            const map = {};


            allFarmers.forEach(
                farmer => {

                    const state =
                        getState(
                            farmer
                        );


                    map[state] =
                        (map[state] || 0) +
                        1;

                }
            );


            return Object.entries(map)
                .map(
                    ([name, value]) => ({
                        name,
                        value,
                    })
                )
                .sort(
                    (a, b) =>
                        b.value -
                        a.value
                )
                .slice(0, 8);

        }, [allFarmers]);


    // =====================================================
    // SOIL STATUS
    // =====================================================

    const soilStatus =
        useMemo(() => {

            let healthy = 0;
            let moderate = 0;
            let review = 0;


            soilData.forEach(
                item => {

                    const score =
                        numberValue(
                            item.soil_score ??
                            item.score
                        );


                    if (
                        score >= 70
                    ) {

                        healthy++;

                    } else if (
                        score >= 40
                    ) {

                        moderate++;

                    } else {

                        review++;

                    }

                }
            );


            return [

                {
                    name: "Healthy",
                    value: healthy,
                },

                {
                    name: "Moderate",
                    value: moderate,
                },

                {
                    name: "Needs Review",
                    value: review,
                },

            ];

        }, [soilData]);


    // =====================================================
    // SOIL TREND
    // =====================================================

    const soilTrend =
        useMemo(() => {

            return soilData
                .slice(-12)
                .map(
                    (item, index) => ({

                        name:
                            item.date ||
                            item.created_at ||
                            `Record ${
                                index + 1
                            }`,

                        score:
                            numberValue(
                                item.soil_score ??
                                item.score
                            ),

                    })
                );

        }, [soilData]);


    // =====================================================
    // FARMER HISTORY
    // =====================================================

    const farmerHistory =
        useMemo(() => {

            return predictionHistory
                .slice()
                .sort(
                    (a, b) =>
                        new Date(
                            a.created_at ||
                            a.createdAt ||
                            0
                        ) -
                        new Date(
                            b.created_at ||
                            b.createdAt ||
                            0
                        )
                )
                .map(
                    (item, index) => {

                        const date =
                            new Date(
                                item.created_at ||
                                item.createdAt ||
                                `${item.year || new Date().getFullYear()}-07-01`
                            );


                        return {

                            name:
                                item.year ||
                                date.getFullYear() ||
                                `P${
                                    index + 1
                                }`,

                            crop:
                                getCrop(
                                    item
                                ),

                            yield:
                                Number(
                                    getYieldTonnes(
                                        item
                                    ).toFixed(2)
                                ),

                            rainfall:
                                getRainfall(
                                    item
                                ),

                            temperature:
                                getTemperature(
                                    item
                                ),

                            month:
                                date.toLocaleString(
                                    "default",
                                    {
                                        month:
                                            "short",
                                    }
                                ),

                            created_at:
                                date.toISOString(),

                        };

                    }
                );

        }, [predictionHistory]);


    // =====================================================
    // FARMER CROP DISTRIBUTION
    // =====================================================

    const farmerCropDistribution =
        useMemo(() => {

            const map = {};


            predictionHistory.forEach(
                item => {

                    const crop =
                        getCrop(item);


                    if (
                        crop &&
                        crop !==
                        "Not Provided"
                    ) {

                        map[crop] =
                            (map[crop] || 0) +
                            1;

                    }

                }
            );


            return Object.entries(map)
                .map(
                    ([name, value]) => ({
                        name,
                        value,
                    })
                )
                .sort(
                    (a, b) =>
                        b.value -
                        a.value
                );

        }, [predictionHistory]);


    // =====================================================
    // YIELD TREND
    // =====================================================

    const yieldTrend =
        useMemo(() => {

            return farmerHistory.map(
                (item, index) => ({

                    name:
                        `${item.crop} ${
                            index + 1
                        }`,

                    yield:
                        item.yield,

                })
            );

        }, [farmerHistory]);


    // =====================================================
    // SEASONAL PERFORMANCE
    // =====================================================

    const seasonalPerformance =
        useMemo(() => {

            const seasons = {

                Kharif: [],

                Rabi: [],

                Zaid: [],

            };


            predictionHistory.forEach(
                item => {

                    const season =
                        getSeason(
                            item
                        );


                    const yieldValue =
                        getYieldTonnes(
                            item
                        );


                    if (
                        seasons[season] &&
                        yieldValue > 0
                    ) {

                        seasons[
                            season
                        ].push(
                            yieldValue
                        );

                    }

                }
            );


            return Object.entries(
                seasons
            ).map(
                ([name, values]) => ({

                    name,

                    yield:
                        values.length
                            ? Number(
                                (
                                    values.reduce(
                                        (
                                            total,
                                            value
                                        ) =>
                                            total +
                                            value,
                                        0
                                    ) /
                                    values.length
                                ).toFixed(2)
                            )
                            : 0,

                })
            );

        }, [predictionHistory]);


    // =====================================================
    // RAINFALL VS YIELD
    // =====================================================

    const rainfallYieldData =
        useMemo(() => {

            return farmerHistory

                .filter(
                    item =>
                        item.rainfall >
                        0 &&
                        item.yield >
                        0
                )

                .map(item => ({

                    rainfall:
                        item.rainfall,

                    yield:
                        item.yield,

                    crop:
                        item.crop,

                }));

        }, [farmerHistory]);


    // =====================================================
    // TEMPERATURE VS YIELD
    // =====================================================

    const temperatureYieldData =
        useMemo(() => {

            return farmerHistory

                .filter(
                    item =>
                        item.temperature !==
                        0 &&
                        item.yield >
                        0
                )

                .map(item => ({

                    temperature:
                        item.temperature,

                    yield:
                        item.yield,

                    crop:
                        item.crop,

                }));

        }, [farmerHistory]);


    // =====================================================
    // AVERAGE YIELD
    // =====================================================

    const averageYield =
        useMemo(() => {

            if (
                !farmerHistory.length
            ) {

                return "0.00";

            }


            const total =
                farmerHistory.reduce(
                    (sum, item) =>
                        sum +
                        item.yield,
                    0
                );


            return (
                total /
                farmerHistory.length
            ).toFixed(2);

        }, [farmerHistory]);


    // =====================================================
    // HIGHEST YIELD
    // =====================================================

    const highestYield =
        useMemo(() => {

            if (
                !farmerHistory.length
            ) {

                return "0.00";

            }


            return Math.max(
                ...farmerHistory.map(
                    item =>
                        item.yield
                )
            ).toFixed(2);

        }, [farmerHistory]);


    // =====================================================
    // ATTENTION FARMERS
    // =====================================================

    const attentionFarmers =
        useMemo(() => {

            return allFarmers.filter(
                farmer =>
                    !farmer.crop ||
                    !farmer.soil ||
                    !farmer.irrigation
            );

        }, [allFarmers]);


    // =====================================================
    // AVERAGE SOIL
    // =====================================================

    const averageSoilScore =
        useMemo(() => {

            if (
                !soilData.length
            ) {

                return 0;

            }


            const scores =
                soilData
                    .map(
                        item =>
                            numberValue(
                                item.soil_score ??
                                item.score
                            )
                    )
                    .filter(
                        score =>
                            score > 0
                    );


            if (
                !scores.length
            ) {

                return 0;

            }


            return Math.round(
                scores.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                ) /
                scores.length
            );

        }, [soilData]);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <Layout>

                <div className="analytics-loading-page">

                    <div className="analytics-loader" />

                    <h2>
                        Building Analytics
                    </h2>

                    <p>
                        Processing agricultural data...
                    </p>

                </div>

            </Layout>

        );

    }


    // =====================================================
    // =====================================================
    // FARMER ANALYTICS
    // =====================================================
    // =====================================================

    if (
        role === "farmer"
    ) {

        return (

            <Layout>

                <div className="analytics-page">

                    <AnalyticsHeader
                        title="Farmer Analytics"
                        subtitle="Understand your crop predictions, yield performance, weather patterns and seasonal trends."
                        back="/dashboard"
                        onRefresh={
                            loadAnalytics
                        }
                    />


                    {error && (

                        <div className="analytics-error">

                            <FaExclamationTriangle />

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        FARMER KPI
                    ================================================= */}

                    <div className="analytics-kpis">

                        <KpiCard
                            icon={
                                <FaSeedling />
                            }
                            label="Predicted Crop"
                            value={
                                prediction
                                    ? getCrop(
                                        prediction
                                    )
                                    : "Not Provided"
                            }
                            type="green"
                        />


                        <KpiCard
                            icon={
                                <FaChartLine />
                            }
                            label="Average Yield"
                            value={`${averageYield} t/ha`}
                            type="blue"
                        />


                        <KpiCard
                            icon={
                                <FaHistory />
                            }
                            label="Predictions"
                            value={
                                predictionHistory.length
                            }
                            type="lime"
                        />


                        <KpiCard
                            icon={
                                <FaLeaf />
                            }
                            label="Highest Yield"
                            value={`${highestYield} t/ha`}
                            type="orange"
                        />

                    </div>


                    {/* =================================================
                        FIRST ROW
                    ================================================= */}

                    <div className="analytics-grid">


                        {/* CROP DISTRIBUTION */}

                        <ChartCard
                            title="Crop Distribution"
                            subtitle="Your prediction history by crop"
                            icon={
                                <FaSeedling />
                            }
                        >

                            {farmerCropDistribution.length >
                            0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                farmerCropDistribution
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="48%"
                                            innerRadius={65}
                                            outerRadius={105}
                                            paddingAngle={4}
                                        >

                                            {farmerCropDistribution.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (

                                                    <Cell
                                                        key={
                                                            entry.name
                                                        }
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                COLORS.length
                                                            ]
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>


                                        <Tooltip
                                            content={
                                                <ChartTooltip />
                                            }
                                        />


                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>

                            ) : (

                                <EmptyChart
                                    text="Make a prediction to see your crop distribution."
                                />

                            )}

                        </ChartCard>


                        {/* YIELD TREND */}

                        <ChartCard
                            title="Yield Trend"
                            subtitle="How your predicted yield changes across predictions"
                            icon={
                                <FaChartLine />
                            }
                        >

                            {yieldTrend.length >
                            0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <LineChart
                                        data={
                                            yieldTrend
                                        }
                                        margin={{
                                            top: 15,
                                            right: 20,
                                            left: 5,
                                            bottom: 10,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />


                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 11,
                                            }}
                                        />


                                        <YAxis
                                            label={{
                                                value:
                                                    "Tonnes / Hectare",
                                                angle:
                                                    -90,
                                                position:
                                                    "insideLeft",
                                            }}
                                        />


                                        <Tooltip
                                            content={
                                                <ChartTooltip />
                                            }
                                        />


                                        <Line
                                            type="monotone"
                                            dataKey="yield"
                                            name="Yield"
                                            stroke="#198754"
                                            strokeWidth={4}
                                            dot={{
                                                r: 5,
                                            }}
                                            activeDot={{
                                                r: 8,
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            ) : (

                                <EmptyChart
                                    text="Your yield trend will appear after making predictions."
                                />

                            )}

                        </ChartCard>


                        {/* SEASONAL */}

                        <ChartCard
                            title="Seasonal Performance"
                            subtitle="Average predicted yield by season"
                            icon={
                                <FaLeaf />
                            }
                        >

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <BarChart
                                    data={
                                        seasonalPerformance
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />


                                    <XAxis
                                        dataKey="name"
                                    />


                                    <YAxis />


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Bar
                                        dataKey="yield"
                                        name="Average Yield"
                                        fill="#198754"
                                        radius={[
                                            8,
                                            8,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* RAINFALL */}

                        <ChartCard
                            title="Rainfall vs Yield"
                            subtitle="Relationship between rainfall and predicted yield"
                            icon={
                                <FaCloudRain />
                            }
                        >

                            {rainfallYieldData.length >
                            0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <ScatterChart>

                                        <CartesianGrid />


                                        <XAxis
                                            type="number"
                                            dataKey="rainfall"
                                            name="Rainfall"
                                            unit=" mm"
                                        />


                                        <YAxis
                                            type="number"
                                            dataKey="yield"
                                            name="Yield"
                                            unit=" t/ha"
                                        />


                                        <ZAxis
                                            range={[
                                                70,
                                                70,
                                            ]}
                                        />


                                        <Tooltip />


                                        <Scatter
                                            name="Predictions"
                                            data={
                                                rainfallYieldData
                                            }
                                            fill="#3b82f6"
                                        />

                                    </ScatterChart>

                                </ResponsiveContainer>

                            ) : (

                                <EmptyChart
                                    text="Rainfall relationship will appear after prediction weather data is available."
                                />

                            )}

                        </ChartCard>

                    </div>


                    {/* =================================================
                        SECOND ROW
                    ================================================= */}

                    <div className="analytics-grid">


                        {/* TEMPERATURE */}

                        <ChartCard
                            title="Temperature vs Yield"
                            subtitle="Temperature relationship with predicted yield"
                            icon={
                                <FaTemperatureHigh />
                            }
                        >

                            {temperatureYieldData.length >
                            0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <ScatterChart>

                                        <CartesianGrid />


                                        <XAxis
                                            type="number"
                                            dataKey="temperature"
                                            name="Temperature"
                                            unit=" °C"
                                        />


                                        <YAxis
                                            type="number"
                                            dataKey="yield"
                                            name="Yield"
                                            unit=" t/ha"
                                        />


                                        <ZAxis
                                            range={[
                                                70,
                                                70,
                                            ]}
                                        />


                                        <Tooltip />


                                        <Scatter
                                            name="Predictions"
                                            data={
                                                temperatureYieldData
                                            }
                                            fill="#f5a623"
                                        />

                                    </ScatterChart>

                                </ResponsiveContainer>

                            ) : (

                                <EmptyChart
                                    text="Temperature relationship will appear after prediction temperature data is available."
                                />

                            )}

                        </ChartCard>


                        {/* HISTORY */}

                        <ChartCard
                            title="Prediction History"
                            subtitle="Recent crop predictions"
                            icon={
                                <FaHistory />
                            }
                        >

                            {predictionHistory.length >
                            0 ? (

                                <div className="prediction-history">

                                    {predictionHistory
                                        .slice()
                                        .reverse()
                                        .slice(
                                            0,
                                            8
                                        )
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    className="history-row"
                                                    key={
                                                        item.prediction_id ||
                                                        index
                                                    }
                                                >

                                                    <div className="history-crop">

                                                        <div className="history-icon">
                                                            <FaSeedling />
                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    getCrop(
                                                                        item
                                                                    )
                                                                }
                                                            </strong>


                                                            <span>
                                                                {
                                                                    item.year ||
                                                                    new Date(
                                                                        item.created_at ||
                                                                        Date.now()
                                                                    ).getFullYear()
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <div className="history-yield">

                                                        <strong>
                                                            {getYieldTonnes(
                                                                item
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </strong>

                                                        <span>
                                                            t/ha
                                                        </span>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                </div>

                            ) : (

                                <EmptyChart
                                    text="Prediction history will appear here after making a prediction."
                                />

                            )}

                        </ChartCard>

                    </div>


                    {/* =================================================
                        LATEST INSIGHT
                    ================================================= */}

                    <div className="analytics-wide">

                        <ChartCard
                            title="Latest Prediction Insight"
                            subtitle="Summary of your most recent agricultural analysis"
                            icon={
                                <FaSeedling />
                            }
                        >

                            <div className="prediction-insight">


                                <div className="insight-main">

                                    <div className="insight-icon">
                                        <FaSeedling />
                                    </div>


                                    <div>

                                        <span>
                                            Recommended Crop
                                        </span>


                                        <strong>
                                            {prediction
                                                ? getCrop(
                                                    prediction
                                                )
                                                : "Not Provided"}
                                        </strong>

                                    </div>

                                </div>


                                <div className="insight-value">

                                    <span>
                                        Expected Yield
                                    </span>


                                    <strong>
                                        {prediction
                                            ? getYieldTonnes(
                                                prediction
                                            ).toFixed(
                                                2
                                            )
                                            : "0.00"}{" "}
                                        t/ha
                                    </strong>

                                </div>


                                <div className="insight-value">

                                    <span>
                                        Rainfall
                                    </span>


                                    <strong>
                                        {prediction
                                            ? getRainfall(
                                                prediction
                                            )
                                            : 0}{" "}
                                        mm
                                    </strong>

                                </div>


                                <div className="insight-value">

                                    <span>
                                        Temperature
                                    </span>


                                    <strong>
                                        {prediction
                                            ? getTemperature(
                                                prediction
                                            )
                                            : 0}{" "}
                                        °C
                                    </strong>

                                </div>

                            </div>

                        </ChartCard>

                    </div>

                </div>

            </Layout>

        );

    }


    // =====================================================
    // =====================================================
    // ADMIN ANALYTICS
    // =====================================================
    // =====================================================

    if (
        role === "admin"
    ) {

        return (

            <Layout>

                <div className="analytics-page">

                    <AnalyticsHeader
                        title="System Analytics"
                        subtitle="Monitor agricultural activity, users, crops and system-wide performance."
                        back="/dashboard"
                        onRefresh={
                            loadAnalytics
                        }
                    />


                    <div className="analytics-kpis">

                        <KpiCard
                            icon={
                                <FaUsers />
                            }
                            label="Total Users"
                            value={
                                farmers.length
                            }
                            type="green"
                        />


                        <KpiCard
                            icon={
                                <FaSeedling />
                            }
                            label="Farmers"
                            value={
                                allFarmers.length
                            }
                            type="lime"
                        />


                        <KpiCard
                            icon={
                                <FaUserShield />
                            }
                            label="Agricultural Officers"
                            value={
                                officers.length
                            }
                            type="blue"
                        />


                        <KpiCard
                            icon={
                                <FaTint />
                            }
                            label="Soil Analyses"
                            value={
                                soilData.length
                            }
                            type="orange"
                        />

                    </div>


                    <div className="analytics-grid">


                        {/* USER DISTRIBUTION */}

                        <ChartCard
                            title="User Distribution"
                            subtitle="Registered accounts by role"
                            icon={
                                <FaUsers />
                            }
                        >

                            <ResponsiveContainer
                                width="100%"
                                height={310}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            userDistribution
                                        }
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={4}
                                    >

                                        {userDistribution.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        entry.name
                                                    }
                                                    fill={
                                                        COLORS[
                                                            index %
                                                            COLORS.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* SOIL */}

                        <ChartCard
                            title="Soil Health Distribution"
                            subtitle="Current soil analysis status"
                            icon={
                                <FaLeaf />
                            }
                        >

                            <ResponsiveContainer
                                width="100%"
                                height={310}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            soilStatus
                                        }
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={4}
                                    >

                                        {soilStatus.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        entry.name
                                                    }
                                                    fill={
                                                        [
                                                            "#198754",
                                                            "#f5a623",
                                                            "#ef4444",
                                                        ][index]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* CROP */}

                        <ChartCard
                            title="Crop Distribution"
                            subtitle="Most common crops among farmers"
                            icon={
                                <FaSeedling />
                            }
                        >

                            <ResponsiveContainer
                                width="100%"
                                height={310}
                            >

                                <BarChart
                                    data={
                                        cropDistribution
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />


                                    <XAxis
                                        dataKey="name"
                                    />


                                    <YAxis />


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Bar
                                        dataKey="value"
                                        name="Farmers"
                                        fill="#198754"
                                        radius={[
                                            8,
                                            8,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </ChartCard>


                        {/* STATE */}

                        <ChartCard
                            title="Farmers by State"
                            subtitle="Geographic distribution"
                            icon={
                                <FaMapMarkerAlt />
                            }
                        >

                            <ResponsiveContainer
                                width="100%"
                                height={310}
                            >

                                <BarChart
                                    data={
                                        stateDistribution
                                    }
                                    layout="vertical"
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />


                                    <XAxis
                                        type="number"
                                    />


                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                    />


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Bar
                                        dataKey="value"
                                        name="Farmers"
                                        fill="#3b82f6"
                                        radius={[
                                            0,
                                            8,
                                            8,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </ChartCard>

                    </div>


                    <div className="analytics-wide">

                        <ChartCard
                            title="System Activity"
                            subtitle="Current user activity snapshot"
                            icon={
                                <FaChartLine />
                            }
                        >

                            <ResponsiveContainer
                                width="100%"
                                height={280}
                            >

                                <AreaChart
                                    data={[
                                        {
                                            name: "Farmers",
                                            value:
                                                allFarmers.length,
                                        },
                                        {
                                            name: "Officers",
                                            value:
                                                officers.length,
                                        },
                                        {
                                            name: "Admins",
                                            value:
                                                admins.length,
                                        },
                                    ]}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />


                                    <XAxis
                                        dataKey="name"
                                    />


                                    <YAxis />


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        name="Users"
                                        stroke="#198754"
                                        strokeWidth={3}
                                        fill="#198754"
                                        fillOpacity={0.15}
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        </ChartCard>

                    </div>

                </div>

            </Layout>

        );

    }


    // =====================================================
    // =====================================================
    // AGRICULTURAL OFFICER
    // =====================================================
    // =====================================================

    return (

        <Layout>

            <div className="analytics-page">

                <AnalyticsHeader
                    title="Officer Analytics"
                    subtitle="Monitor farmers, soil health, crop patterns and agricultural risk."
                    back="/agricultural-officer"
                    onRefresh={
                        loadAnalytics
                    }
                />


                <div className="analytics-kpis">

                    <KpiCard
                        icon={
                            <FaUsers />
                        }
                        label="Farmers Monitored"
                        value={
                            allFarmers.length
                        }
                        type="green"
                    />


                    <KpiCard
                        icon={
                            <FaMapMarkerAlt />
                        }
                        label="Locations"
                        value={
                            stateDistribution.length
                        }
                        type="blue"
                    />


                    <KpiCard
                        icon={
                            <FaLeaf />
                        }
                        label="Average Soil Score"
                        value={
                            averageSoilScore
                        }
                        type="lime"
                    />


                    <KpiCard
                        icon={
                            <FaExclamationTriangle />
                        }
                        label="Need Attention"
                        value={
                            attentionFarmers.length
                        }
                        type="orange"
                    />

                </div>


                <div className="analytics-grid">


                    {/* SOIL HEALTH */}

                    <ChartCard
                        title="Soil Health Analytics"
                        subtitle="Distribution of soil health records"
                        icon={
                            <FaLeaf />
                        }
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        soilStatus
                                    }
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={115}
                                    paddingAngle={4}
                                >

                                    {soilStatus.map(
                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell
                                                key={
                                                    entry.name
                                                }
                                                fill={
                                                    [
                                                        "#198754",
                                                        "#f5a623",
                                                        "#ef4444",
                                                    ][index]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    content={
                                        <ChartTooltip />
                                    }
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </ChartCard>


                    {/* SOIL TREND */}

                    <ChartCard
                        title="Soil Score Trend"
                        subtitle="Available soil analysis records"
                        icon={
                            <FaChartLine />
                        }
                    >

                        {soilTrend.length ? (

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <LineChart
                                    data={
                                        soilTrend
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />


                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fontSize: 10,
                                        }}
                                    />


                                    <YAxis
                                        domain={[
                                            0,
                                            100,
                                        ]}
                                    />


                                    <Tooltip
                                        content={
                                            <ChartTooltip />
                                        }
                                    />


                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Soil Score"
                                        stroke="#198754"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <EmptyChart
                                text="Soil score trend will appear when records are available."
                            />

                        )}

                    </ChartCard>


                    {/* CROPS */}

                    <ChartCard
                        title="Farmer Crop Distribution"
                        subtitle="Crops currently monitored"
                        icon={
                            <FaSeedling />
                        }
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={
                                    cropDistribution
                                }
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />


                                <XAxis
                                    dataKey="name"
                                />


                                <YAxis />


                                <Tooltip
                                    content={
                                        <ChartTooltip />
                                    }
                                />


                                <Bar
                                    dataKey="value"
                                    name="Farmers"
                                    fill="#198754"
                                    radius={[
                                        8,
                                        8,
                                        0,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </ChartCard>


                    {/* LOCATIONS */}

                    <ChartCard
                        title="Location-wise Monitoring"
                        subtitle="Farmers across locations"
                        icon={
                            <FaMapMarkerAlt />
                        }
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={
                                    stateDistribution
                                }
                                layout="vertical"
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />


                                <XAxis
                                    type="number"
                                />


                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                />


                                <Tooltip
                                    content={
                                        <ChartTooltip />
                                    }
                                />


                                <Bar
                                    dataKey="value"
                                    name="Farmers"
                                    fill="#3b82f6"
                                    radius={[
                                        0,
                                        8,
                                        8,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </ChartCard>

                </div>


                <div className="analytics-wide">

                    <ChartCard
                        title="Farmers Needing Attention"
                        subtitle="Profiles with incomplete agricultural information"
                        icon={
                            <FaExclamationTriangle />
                        }
                    >

                        {attentionFarmers.length ===
                        0 ? (

                            <div className="attention-success">

                                <FaSeedling />

                                <div>

                                    <strong>
                                        All farmer profiles look good
                                    </strong>

                                    <span>
                                        No incomplete agricultural
                                        profiles were detected.
                                    </span>

                                </div>

                            </div>

                        ) : (

                            <div className="attention-table">

                                {attentionFarmers
                                    .slice(
                                        0,
                                        10
                                    )
                                    .map(
                                        farmer => {

                                            const missing =
                                                [];


                                            if (
                                                !farmer.crop
                                            ) {

                                                missing.push(
                                                    "Crop"
                                                );

                                            }


                                            if (
                                                !farmer.soil
                                            ) {

                                                missing.push(
                                                    "Soil"
                                                );

                                            }


                                            if (
                                                !farmer.irrigation
                                            ) {

                                                missing.push(
                                                    "Irrigation"
                                                );

                                            }


                                            return (

                                                <div
                                                    className="attention-item"
                                                    key={
                                                        farmer._id ||
                                                        farmer.id ||
                                                        farmer.email
                                                    }
                                                >

                                                    <div className="farmer-avatar">

                                                        {(
                                                            farmer.full_name ||
                                                            "F"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>


                                                    <div className="farmer-details">

                                                        <strong>
                                                            {
                                                                farmer.full_name ||
                                                                "Unknown Farmer"
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                farmer.email ||
                                                                "No email"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="missing-list">

                                                        {missing.map(
                                                            item => (

                                                                <span
                                                                    key={
                                                                        item
                                                                    }
                                                                >
                                                                    {
                                                                        item
                                                                    }
                                                                </span>

                                                            )
                                                        )}

                                                    </div>


                                                    <Link
                                                        to="/users"
                                                        className="review-button"
                                                    >
                                                        Review
                                                    </Link>

                                                </div>

                                            );

                                        }
                                    )}

                            </div>

                        )}

                    </ChartCard>

                </div>

            </div>

        </Layout>

    );

}


// =========================================================
// HEADER
// =========================================================

function AnalyticsHeader({
    title,
    subtitle,
    back,
    onRefresh,
}) {

    return (

        <div className="analytics-header">

            <div>

                <Link
                    to={back}
                    className="analytics-back"
                >

                    <FaArrowLeft />

                    Back

                </Link>


                <span className="analytics-eyebrow">
                    AGRICULTURAL INTELLIGENCE
                </span>


                <h1>
                    {title}
                </h1>


                <p>
                    {subtitle}
                </p>

            </div>


            <button
                className="refresh-button"
                onClick={onRefresh}
            >

                <FaSyncAlt />

                Refresh Data

            </button>

        </div>

    );

}


// =========================================================
// KPI CARD
// =========================================================

function KpiCard({
    icon,
    label,
    value,
    type,
}) {

    return (

        <div className="analytics-kpi">

            <div
                className={`kpi-icon ${type}`}
            >
                {icon}
            </div>


            <div>

                <span>
                    {label}
                </span>


                <strong>
                    {value}
                </strong>


                <small>
                    Live analytics
                </small>

            </div>

        </div>

    );

}


// =========================================================
// CHART CARD
// =========================================================

function ChartCard({
    title,
    subtitle,
    icon,
    children,
}) {

    return (

        <section className="chart-card">

            <div className="chart-header">

                <div>

                    <span>
                        ANALYTICS
                    </span>


                    <h2>
                        {title}
                    </h2>


                    <p>
                        {subtitle}
                    </p>

                </div>


                <div className="chart-icon">
                    {icon}
                </div>

            </div>


            <div className="chart-body">
                {children}
            </div>

        </section>

    );

}


// =========================================================
// EMPTY CHART
// =========================================================

function EmptyChart({
    text,
}) {

    return (

        <div className="empty-chart">

            <div className="empty-chart-icon">

                <FaChartLine />

            </div>


            <strong>
                No chart data yet
            </strong>


            <span>
                {text}
            </span>

        </div>

    );

}