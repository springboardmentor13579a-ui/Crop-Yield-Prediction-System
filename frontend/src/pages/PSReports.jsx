import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import { Link } from "react-router-dom";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import {
    FaArrowLeft,
    FaChartLine,
    FaSeedling,
    FaLeaf,
    FaCalendarAlt,
    FaTrophy,
    FaHistory,
    FaCloudRain,
    FaTemperatureHigh,
    FaFileAlt,
    FaRobot,
} from "react-icons/fa";
import Layout from "../layout/Layout";
import BASE_URL from "../services/api";
import "../styles/p&s-reports.css";
/* =========================================================
   HELPERS
========================================================= */
function numberValue(value) {
    const n = Number(value);
    return Number.isFinite(n)
        ? n
        : 0;

}
/* =========================================================
   GET CROP
========================================================= */
function getCrop(item) {
    return (
        item?.item ||
        item?.crop ||
        item?.crop_name ||
        item?.cropName ||
        item?.predicted_crop ||
        item?.predictedCrop ||
        item?.recommended_crop ||
        item?.recommendedCrop ||
        "Not Provided"
    );

}


/* =========================================================
   GET YIELD
========================================================= */

function getYield(item) {

    return numberValue(

        item?.predicted_yield ??

        item?.predictedYield ??

        item?.predicted_yield_hg_ha ??

        item?.yield ??

        item?.yield_prediction ??

        item?.production ??

        item?.yield_value

    );

}


/* =========================================================
   GET YIELD IN TONNES / HECTARE
========================================================= */

function getYieldTonnes(item) {

    if (

        item?.predicted_yield_tonnes !==
            undefined &&

        item?.predicted_yield_tonnes !==
            null

    ) {

        return numberValue(
            item.predicted_yield_tonnes
        );

    }


    if (

        item?.predicted_yield_tonnes_ha !==
            undefined &&

        item?.predicted_yield_tonnes_ha !==
            null

    ) {

        return numberValue(
            item.predicted_yield_tonnes_ha
        );

    }


    /*
     * Existing model output:
     *
     * hg/ha
     *
     * 10,000 hg = 1 tonne
     */

    return getYield(item) / 10000;

}


/* =========================================================
   GET RAINFALL
========================================================= */

function getRainfall(item) {

    return numberValue(

        item?.rainfall ??

        item?.rainfall_mm ??

        item?.precipitation

    );

}


/* =========================================================
   GET TEMPERATURE
========================================================= */

function getTemperature(item) {

    return numberValue(

        item?.temperature ??

        item?.temperature_c ??

        item?.temperature_celsius ??

        item?.avg_temperature

    );

}


/* =========================================================
   GET DATE
========================================================= */

function getDate(item) {

    const raw =
        item?.created_at ||

        item?.createdAt ||

        item?.date;


    const date = raw

        ? new Date(raw)

        : new Date(
            `${item?.year ||
                new Date().getFullYear()}-07-01`
        );


    return Number.isNaN(
        date.getTime()
    )

        ? new Date()

        : date;

}


/* =========================================================
   GET SEASON
========================================================= */

function getSeason(item) {

    const value =
        String(
            item?.season || ""
        ).trim().toLowerCase();

    if (value.includes("kharif")) {
        return "Kharif";
    }

    if (value.includes("rabi")) {
        return "Rabi";
    }

    if (value.includes("zaid")) {
        return "Zaid";
    }

    return "Unknown";
}

/* =========================================================
   SYNC LATEST REPORT INTO HISTORY
========================================================= */

function addLatestReportToHistory(report) {

    if (!report) {
        return [];
    }


    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "predictionHistory"
                )
            ) || [];


        const history =
            Array.isArray(existing)
                ? existing
                : [];


        const reportId =
            report._id ||
            report.id ||
            report.prediction_id ||
            report.predictionId ||
            report.created_at ||
            report.createdAt ||
            `${report.year || ""}-${report.crop || report.item || ""}-${report.predicted_yield_hg_ha || report.predicted_yield || ""}`;


        const exists =
            history.some(
                item => {

                    const itemId =
                        item?._id ||
                        item?.id ||
                        item?.prediction_id ||
                        item?.predictionId ||
                        item?.created_at ||
                        item?.createdAt ||
                        `${item?.year || ""}-${item?.crop || item?.item || ""}-${item?.predicted_yield_hg_ha || item?.predicted_yield || ""}`;

                    return (
                        String(itemId) ===
                        String(reportId)
                    );

                }
            );


        if (exists) {

            return history;

        }


        const historyItem = {

            ...report,

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

            created_at:
                report.created_at ||
                report.createdAt ||
                new Date().toISOString(),

        };


        const updatedHistory = [
            ...history,
            historyItem
        ];


        localStorage.setItem(
            "predictionHistory",
            JSON.stringify(
                updatedHistory
            )
        );


        return updatedHistory;


    } catch (error) {

        console.error(
            "History synchronization error:",
            error
        );

        return [];

    }

}


/* =========================================================
   TOOLTIP
========================================================= */

function ReportTooltip({
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

        <div className="ps-tooltip">

            {label && (

                <strong>
                    {label}
                </strong>

            )}


            {payload.map(
                (item, index) => (

                    <div
                        className="ps-tooltip-row"
                        key={index}
                    >

                        <span>
                            {item.name}
                        </span>

                        <b>

                            {typeof item.value ===
                                "number"

                                ? item.value.toLocaleString(
                                    undefined,
                                    {
                                        maximumFractionDigits: 2,
                                    }
                                )

                                : item.value}

                        </b>

                    </div>

                )
            )}

        </div>

    );

}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function PSReports() {

    const [
        activeSection,
        setActiveSection
    ] = useState(
        "productivity"
    );


    const [
        predictionHistory,
        setPredictionHistory
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    /* =====================================================
       LOAD CONNECTED REPORT DATA
    ===================================================== */

    useEffect(() => {

        async function loadReportData() {

            try {

                setLoading(true);
                setError("");


                /*
                 * STEP 1
                 *
                 * Read the existing prediction history.
                 */

                let history = [];

                try {

                    const stored =
                        JSON.parse(
                            localStorage.getItem(
                                "predictionHistory"
                            )
                        ) || [];


                    history =
                        Array.isArray(stored)
                            ? stored
                            : [];

                } catch {

                    history = [];

                }


                /*
                 * STEP 2
                 *
                 * If there is no history, fetch the
                 * SAME latest report endpoint used
                 * by Report.jsx.
                 */

                if (!history.length) {

                    const response =
                        await fetch(
                            `${BASE_URL}/report/latest`
                        );


                    const data =
                        await response.json();


                    if (
                        response.ok &&
                        data
                    ) {

                        history =
                            addLatestReportToHistory(
                                data
                            );

                    }

                }


                /*
                 * STEP 3
                 *
                 * Set the history used by the page.
                 */

                setPredictionHistory(
                    history
                );


            } catch (err) {

                console.error(
                    "Productivity & Seasonal Reports Error:",
                    err
                );


                setError(
                    err.message ||
                    "Unable to load report data."
                );


            } finally {

                setLoading(false);

            }

        }


        loadReportData();

    }, []);


    /* =====================================================
       NORMALIZED RECORDS
    ===================================================== */

    const records =
        useMemo(() => {

            return predictionHistory

                .map((item) => {

                    const date =
                        getDate(item);


                    return {

                        original:
                            item,

                        crop:
                            getCrop(item),

                        yield:
                            getYieldTonnes(
                                item
                            ),

                        rainfall:
                            getRainfall(item),

                        temperature:
                            getTemperature(item),

                        season:
                            getSeason(item),

                        date,

                        year:
                            date.getFullYear(),

                        month:
                            date.toLocaleString(
                                "default",
                                {
                                    month: "short",
                                }
                            ),

                    };

                })

                .filter(
                    item =>
                        item.crop !==
                        "Not Provided"
                );

        }, [
            predictionHistory
        ]);


    /* =====================================================
       PRODUCTIVITY SUMMARY
    ===================================================== */

    const productivity =
        useMemo(() => {

            if (!records.length) {

                return {

                    average: 0,

                    highest: 0,

                    lowest: 0,

                    total: 0,

                    bestCrop: "—",

                };

            }


            const yields =
                records

                    .map(
                        item =>
                            item.yield
                    )

                    .filter(
                        value =>
                            value > 0
                    );


            const average =
                yields.length

                    ? yields.reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum + value,
                        0
                    ) /
                    yields.length

                    : 0;


            const highest =
                yields.length

                    ? Math.max(
                        ...yields
                    )

                    : 0;


            const lowest =
                yields.length

                    ? Math.min(
                        ...yields
                    )

                    : 0;


            const cropMap = {};


            records.forEach(item => {

                if (
                    item.yield <= 0
                ) {

                    return;

                }


                if (
                    !cropMap[item.crop]
                ) {

                    cropMap[item.crop] = {

                        total: 0,

                        count: 0,

                    };

                }


                cropMap[item.crop].total +=
                    item.yield;


                cropMap[item.crop].count +=
                    1;

            });


            const cropRows =

                Object.entries(
                    cropMap
                )

                    .map(
                        ([name, data]) => ({

                            name,

                            average:
                                data.total /
                                data.count,

                            predictions:
                                data.count,

                        })
                    )

                    .sort(
                        (a, b) =>
                            b.average -
                            a.average
                    );


            return {

                average,

                highest,

                lowest,

                total:
                    records.length,

                bestCrop:
                    cropRows.length
                        ? cropRows[0].name
                        : "—",

            };

        }, [
            records
        ]);


    /* =====================================================
       CROP PRODUCTIVITY
    ===================================================== */

    const cropProductivity =
        useMemo(() => {

            const map = {};


            records.forEach(item => {

                if (
                    item.yield <= 0
                ) {

                    return;

                }


                if (
                    !map[item.crop]
                ) {

                    map[item.crop] = {

                        total: 0,

                        count: 0,

                    };

                }


                map[item.crop].total +=
                    item.yield;


                map[item.crop].count +=
                    1;

            });


            return Object.entries(map)

                .map(
                    ([name, data]) => ({

                        name,

                        yield:
                            Number(
                                (
                                    data.total /
                                    data.count
                                ).toFixed(2)
                            ),

                        predictions:
                            data.count,

                    })
                )

                .sort(
                    (a, b) =>
                        b.yield -
                        a.yield
                )

                .slice(
                    0,
                    8
                );

        }, [
            records
        ]);


    /* =====================================================
       RECENT PRODUCTIVITY
    ===================================================== */

    const recentProductivity =
        useMemo(() => {

            return records

                .slice()

                .sort(
                    (a, b) =>
                        a.date -
                        b.date
                )

                .slice(-8)

                .map(
                    (item, index) => ({

                        name:
                            `${item.month} ${index + 1}`,

                        yield:
                            Number(
                                item.yield.toFixed(2)
                            ),

                        crop:
                            item.crop,

                    })
                );

        }, [
            records
        ]);


    /* =====================================================
       SEASONAL SUMMARY
    ===================================================== */

    const seasonal =
        useMemo(() => {

            const seasons = {

                Kharif: [],

                Rabi: [],

                Zaid: [],

            };


            records.forEach(item => {

                if (
                    item.yield > 0 &&
                    seasons[item.season]
                ) {

                    seasons[
                        item.season
                    ].push(item);

                }

            });


            return Object.entries(
                seasons
            ).map(
                ([name, values]) => {

                    const yields =
                        values.map(
                            item =>
                                item.yield
                        );


                    const average =
                        yields.length

                            ? yields.reduce(
                                (
                                    sum,
                                    value
                                ) =>
                                    sum +
                                    value,
                                0
                            ) /
                            yields.length

                            : 0;


                    const rainfall =
                        values.filter(
                            item =>
                                item.rainfall >
                                0
                        );


                    const temperature =
                        values.filter(
                            item =>
                                item.temperature !==
                                0
                        );


                    return {

                        name,

                        average:
                            Number(
                                average.toFixed(
                                    2
                                )
                            ),

                        predictions:
                            values.length,

                        rainfall:
                            rainfall.length

                                ? Number(
                                    (
                                        rainfall.reduce(
                                            (
                                                sum,
                                                item
                                            ) =>
                                                sum +
                                                item.rainfall,
                                            0
                                        ) /
                                        rainfall.length
                                    ).toFixed(1)
                                )

                                : 0,

                        temperature:
                            temperature.length

                                ? Number(
                                    (
                                        temperature.reduce(
                                            (
                                                sum,
                                                item
                                            ) =>
                                                sum +
                                                item.temperature,
                                            0
                                        ) /
                                        temperature.length
                                    ).toFixed(1)
                                )

                                : 0,

                    };

                }
            );

        }, [
            records
        ]);


    /* =====================================================
       BEST SEASON
    ===================================================== */

    const bestSeason =
        useMemo(() => {

            const available =
                seasonal.filter(
                    item =>
                        item.average >
                        0
                );


            if (!available.length) {

                return null;

            }


            return available.reduce(
                (best, current) =>
                    current.average >
                    best.average
                        ? current
                        : best
            );

        }, [
            seasonal
        ]);


    /* =====================================================
       SEASONAL CROP PERFORMANCE
    ===================================================== */

    const seasonalCropData =
        useMemo(() => {

            const map = {};


            records.forEach(item => {

                if (
                    item.yield <= 0
                ) {

                    return;

                }


                const key =
                    `${item.season}-${item.crop}`;


                if (!map[key]) {

                    map[key] = {

                        season:
                            item.season,

                        crop:
                            item.crop,

                        total: 0,

                        count: 0,

                    };

                }


                map[key].total +=
                    item.yield;


                map[key].count +=
                    1;

            });


            return Object.values(map)

                .map(item => ({

                    season:
                        item.season,

                    crop:
                        item.crop,

                    yield:
                        Number(
                            (
                                item.total /
                                item.count
                            ).toFixed(2)
                        ),

                    predictions:
                        item.count,

                }))

                .sort(
                    (a, b) =>
                        b.yield -
                        a.yield
                )

                .slice(
                    0,
                    8
                );

        }, [
            records
        ]);


    /* =====================================================
       INSIGHTS
    ===================================================== */

    const productivityInsight =
        useMemo(() => {

            if (!records.length) {

                return "Make predictions to generate productivity insights.";

            }


            if (
                !productivity.bestCrop ||
                productivity.bestCrop === "—"
            ) {

                return "Yield information is not available yet.";

            }


            return `${productivity.bestCrop} currently shows the highest average predicted productivity among your recorded crops.`;

        }, [
            records,
            productivity,
        ]);


    const seasonalInsight =
        useMemo(() => {

            if (!bestSeason) {

                return "Make predictions across different seasons to generate a seasonal comparison.";

            }


            return `${bestSeason.name} currently has the highest average predicted yield at ${bestSeason.average.toFixed(2)} t/ha based on your available prediction records.`;

        }, [
            bestSeason
        ]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <Layout>

                <div className="ps-page">

                    <div className="ps-empty-page">

                        <div className="ps-empty-icon">

                            <FaRobot />

                        </div>

                        <h2>
                            Loading Agricultural Reports
                        </h2>

                        <p>
                            Connecting your prediction
                            report with productivity
                            and seasonal analysis...
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <Layout>

                <div className="ps-page">

                    <div className="ps-empty-page">

                        <div className="ps-empty-icon">

                            <FaFileAlt />

                        </div>

                        <h2>
                            Unable to load reports
                        </h2>

                        <p>
                            {error}
                        </p>

                        <Link
                            to="/reports"
                            className="ps-primary-button"
                        >

                            <FaArrowLeft />

                            Back to Report

                        </Link>

                    </div>

                </div>

            </Layout>

        );

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!records.length) {

        return (

            <Layout>

                <div className="ps-page">


                    <div className="ps-header">

                        <div>

                            <Link
                                to="/reports"
                                className="ps-back"
                            >

                                <FaArrowLeft />

                                Back to Reports

                            </Link>


                            <span className="ps-eyebrow">
                                AGRICULTURAL REPORTING
                            </span>


                            <h1>
                                Productivity & Seasonal Reports
                            </h1>


                            <p>
                                Review productivity performance
                                and seasonal patterns from your
                                prediction history.
                            </p>

                        </div>

                    </div>


                    <div className="ps-empty-page">

                        <div className="ps-empty-icon">

                            <FaFileAlt />

                        </div>


                        <h2>
                            No prediction data available
                        </h2>


                        <p>
                            Make a crop prediction first.
                            Once predictions are recorded,
                            productivity and seasonal reports
                            will appear here.
                        </p>


                        <Link
                            to="/prediction"
                            className="ps-primary-button"
                        >

                            <FaSeedling />

                            Make a Prediction

                        </Link>

                    </div>

                </div>

            </Layout>

        );

    }


    /* =====================================================
       MAIN RENDER
    ===================================================== */

    return (

        <Layout>

            <div className="ps-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="ps-header">

                    <div>

                        <Link
                            to="/reports"
                            className="ps-back"
                        >

                            <FaArrowLeft />

                            Back to Reports

                        </Link>


                        <span className="ps-eyebrow">
                            AGRICULTURAL REPORTING
                        </span>


                        <h1>
                            Productivity & Seasonal Reports
                        </h1>


                        <p>
                            A concise view of your predicted
                            yield performance and seasonal
                            patterns.
                        </p>

                    </div>


                    <div className="ps-header-meta">

                        <div className="ps-meta-icon">

                            <FaHistory />

                        </div>


                        <div>

                            <span>
                                RECORDS ANALYZED
                            </span>


                            <strong>
                                {records.length}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SECTION SWITCH
                ================================================= */}

                <div className="ps-switch">

                    <button
                        className={
                            activeSection ===
                            "productivity"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveSection(
                                "productivity"
                            )
                        }
                    >

                        <FaChartLine />

                        Productivity

                    </button>


                    <button
                        className={
                            activeSection ===
                            "seasonal"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveSection(
                                "seasonal"
                            )
                        }
                    >

                        <FaCalendarAlt />

                        Seasonal

                    </button>

                </div>


                {/* =================================================
                    PRODUCTIVITY
                ================================================= */}

                {activeSection ===
                    "productivity" && (

                    <>


                        <div className="ps-kpis">


                            <ReportKpi
                                icon={
                                    <FaChartLine />
                                }
                                label="Average Yield"
                                value={
                                    `${productivity.average.toFixed(
                                        2
                                    )} t/ha`
                                }
                            />


                            <ReportKpi
                                icon={
                                    <FaTrophy />
                                }
                                label="Highest Yield"
                                value={
                                    `${productivity.highest.toFixed(
                                        2
                                    )} t/ha`
                                }
                            />


                            <ReportKpi
                                icon={
                                    <FaSeedling />
                                }
                                label="Most Productive Crop"
                                value={
                                    productivity.bestCrop
                                }
                            />


                            <ReportKpi
                                icon={
                                    <FaHistory />
                                }
                                label="Predictions Analyzed"
                                value={
                                    productivity.total
                                }
                            />

                        </div>


                        <div className="ps-grid">


                            <ReportCard
                                title="Crop Productivity"
                                subtitle="Average predicted yield by crop"
                                icon={
                                    <FaSeedling />
                                }
                            >

                                {cropProductivity.length ? (

                                    <ResponsiveContainer
                                        width="100%"
                                        height={260}
                                    >

                                        <BarChart
                                            data={
                                                cropProductivity
                                            }
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -15,
                                                bottom: 5,
                                            }}
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
                                                interval={0}
                                                angle={
                                                    cropProductivity.length >
                                                    5
                                                        ? -20
                                                        : 0
                                                }
                                                textAnchor={
                                                    cropProductivity.length >
                                                    5
                                                        ? "end"
                                                        : "middle"
                                                }
                                            />


                                            <YAxis
                                                tick={{
                                                    fontSize: 10,
                                                }}
                                            />


                                            <Tooltip
                                                content={
                                                    <ReportTooltip />
                                                }
                                            />


                                            <Bar
                                                dataKey="yield"
                                                name="Average Yield"
                                                fill="#198754"
                                                radius={[
                                                    5,
                                                    5,
                                                    0,
                                                    0,
                                                ]}
                                                maxBarSize={32}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                ) : (

                                    <MiniEmpty />

                                )}

                            </ReportCard>


                            <ReportCard
                                title="Recent Productivity"
                                subtitle="Latest prediction yield trend"
                                icon={
                                    <FaHistory />
                                }
                            >

                                {recentProductivity.length ? (

                                    <ResponsiveContainer
                                        width="100%"
                                        height={260}
                                    >

                                        <LineChart
                                            data={
                                                recentProductivity
                                            }
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -15,
                                                bottom: 5,
                                            }}
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
                                                tick={{
                                                    fontSize: 10,
                                                }}
                                            />


                                            <Tooltip
                                                content={
                                                    <ReportTooltip />
                                                }
                                            />


                                            <Line
                                                type="monotone"
                                                dataKey="yield"
                                                name="Yield (t/ha)"
                                                stroke="#198754"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 3,
                                                }}
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                ) : (

                                    <MiniEmpty />

                                )}

                            </ReportCard>

                        </div>


                        <ReportCard
                            title="Crop-wise Productivity Summary"
                            subtitle="Compact comparison based on recorded predictions"
                            icon={
                                <FaLeaf />
                            }
                            wide
                        >

                            <div className="ps-table-wrap">

                                <table className="ps-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Crop
                                            </th>

                                            <th>
                                                Predictions
                                            </th>

                                            <th>
                                                Average Yield
                                            </th>

                                            <th>
                                                Performance
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {cropProductivity.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        item.name
                                                    }
                                                >

                                                    <td>

                                                        <div className="table-crop">

                                                            <span className="table-number">
                                                                {index + 1}
                                                            </span>

                                                            <strong>
                                                                {
                                                                    item.name
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {
                                                            item.predictions
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong className="yield-value">

                                                            {item.yield.toFixed(
                                                                2
                                                            )}

                                                        </strong>

                                                        <span className="unit">
                                                            {" "}
                                                            t/ha
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                index ===
                                                                0

                                                                    ? "performance-badge top"

                                                                    : "performance-badge"
                                                            }
                                                        >

                                                            {index ===
                                                            0

                                                                ? "Top"

                                                                : "Recorded"}

                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </ReportCard>


                        <div className="ps-insight">

                            <div className="ps-insight-icon">

                                <FaChartLine />

                            </div>


                            <div>

                                <span>
                                    PRODUCTIVITY OBSERVATION
                                </span>


                                <strong>
                                    {productivityInsight}
                                </strong>

                            </div>

                        </div>

                    </>

                )}


                {/* =================================================
                    SEASONAL
                ================================================= */}

                {activeSection ===
                    "seasonal" && (

                    <>


                        <div className="ps-kpis">


                            <ReportKpi
                                icon={
                                    <FaCalendarAlt />
                                }
                                label="Best Season"
                                value={
                                    bestSeason
                                        ? bestSeason.name
                                        : "—"
                                }
                            />


                            <ReportKpi
                                icon={
                                    <FaChartLine />
                                }
                                label="Best Seasonal Yield"
                                value={
                                    bestSeason
                                        ? `${bestSeason.average.toFixed(
                                            2
                                        )} t/ha`
                                        : "0.00 t/ha"
                                }
                            />


                            <ReportKpi
                                icon={
                                    <FaHistory />
                                }
                                label="Seasonal Records"
                                value={
                                    seasonal.reduce(
                                        (
                                            sum,
                                            item
                                        ) =>
                                            sum +
                                            item.predictions,
                                        0
                                    )
                                }
                            />


                            <ReportKpi
                                icon={
                                    <FaLeaf />
                                }
                                label="Seasons Tracked"
                                value={
                                    seasonal.filter(
                                        item =>
                                            item.predictions >
                                            0
                                    ).length
                                }
                            />

                        </div>


                        <div className="ps-grid">


                            <ReportCard
                                title="Seasonal Yield Comparison"
                                subtitle="Average predicted yield across seasons"
                                icon={
                                    <FaCalendarAlt />
                                }
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height={260}
                                >

                                    <BarChart
                                        data={
                                            seasonal
                                        }
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -15,
                                            bottom: 5,
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
                                            tick={{
                                                fontSize: 10,
                                            }}
                                        />


                                        <Tooltip
                                            content={
                                                <ReportTooltip />
                                            }
                                        />


                                        <Bar
                                            dataKey="average"
                                            name="Average Yield"
                                            radius={[
                                                5,
                                                5,
                                                0,
                                                0,
                                            ]}
                                            maxBarSize={42}
                                        >

                                            {seasonal.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <Cell
                                                        key={
                                                            item.name
                                                        }
                                                        fill={
                                                            index ===
                                                            0
                                                                ? "#198754"
                                                                : index ===
                                                                  1
                                                                    ? "#6fae4a"
                                                                    : "#9bbb73"
                                                        }
                                                    />

                                                )
                                            )}

                                        </Bar>

                                    </BarChart>

                                </ResponsiveContainer>

                            </ReportCard>


                            <ReportCard
                                title="Season Overview"
                                subtitle="Yield, prediction count and weather context"
                                icon={
                                    <FaLeaf />
                                }
                            >

                                <div className="season-list">

                                    {seasonal.map(
                                        item => (

                                            <div
                                                className="season-row"
                                                key={
                                                    item.name
                                                }
                                            >

                                                <div className="season-name">

                                                    <div className="season-dot">

                                                        <FaLeaf />

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                item.name
                                                            }
                                                        </strong>

                                                        <span>

                                                            {
                                                                item.predictions
                                                            }{" "}

                                                            prediction
                                                            {
                                                                item.predictions !==
                                                                1
                                                                    ? "s"
                                                                    : ""
                                                            }

                                                        </span>

                                                    </div>

                                                </div>


                                                <div className="season-metrics">


                                                    <div>

                                                        <span>
                                                            Yield
                                                        </span>

                                                        <strong>

                                                            {item.average.toFixed(
                                                                2
                                                            )}{" "}

                                                            t/ha

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Rain
                                                        </span>

                                                        <strong>

                                                            {item.rainfall ||
                                                                "—"}{" "}

                                                            {
                                                                item.rainfall
                                                                    ? "mm"
                                                                    : ""
                                                            }

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Temp
                                                        </span>

                                                        <strong>

                                                            {item.temperature ||
                                                                "—"}{" "}

                                                            {
                                                                item.temperature
                                                                    ? "°C"
                                                                    : ""
                                                            }

                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </ReportCard>

                        </div>


                        <ReportCard
                            title="Season & Crop Performance"
                            subtitle="Highest recorded crop-season combinations"
                            icon={
                                <FaSeedling />
                            }
                            wide
                        >

                            {seasonalCropData.length ? (

                                <div className="ps-table-wrap">

                                    <table className="ps-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Season
                                                </th>

                                                <th>
                                                    Crop
                                                </th>

                                                <th>
                                                    Predictions
                                                </th>

                                                <th>
                                                    Average Yield
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {seasonalCropData.map(
                                                item => (

                                                    <tr
                                                        key={`${item.season}-${item.crop}`}
                                                    >

                                                        <td>

                                                            <span className="season-badge">
                                                                {
                                                                    item.season
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    item.crop
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>
                                                            {
                                                                item.predictions
                                                            }
                                                        </td>


                                                        <td>

                                                            <strong className="yield-value">

                                                                {item.yield.toFixed(
                                                                    2
                                                                )}

                                                            </strong>

                                                            <span className="unit">
                                                                {" "}
                                                                t/ha
                                                            </span>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            ) : (

                                <MiniEmpty />

                            )}

                        </ReportCard>


                        <div className="weather-context">


                            <div className="weather-context-item">

                                <div className="weather-icon rain">

                                    <FaCloudRain />

                                </div>


                                <div>

                                    <span>
                                        WEATHER CONTEXT
                                    </span>

                                    <strong>
                                        Rainfall is calculated from
                                        available prediction records.
                                    </strong>

                                </div>

                            </div>


                            <div className="weather-context-item">

                                <div className="weather-icon temp">

                                    <FaTemperatureHigh />

                                </div>


                                <div>

                                    <span>
                                        TEMPERATURE CONTEXT
                                    </span>

                                    <strong>
                                        Temperature averages are shown
                                        only where prediction data contains
                                        temperature values.
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="ps-insight">

                            <div className="ps-insight-icon">

                                <FaCalendarAlt />

                            </div>


                            <div>

                                <span>
                                    SEASONAL OBSERVATION
                                </span>


                                <strong>
                                    {seasonalInsight}
                                </strong>

                            </div>

                        </div>

                    </>

                )}

            </div>

        </Layout>

    );

}


/* =========================================================
   KPI
========================================================= */

function ReportKpi({
    icon,
    label,
    value,
}) {

    return (

        <div className="ps-kpi">

            <div className="ps-kpi-icon">

                {icon}

            </div>


            <div>

                <span>
                    {label}
                </span>


                <strong
                    title={String(value)}
                >
                    {value}
                </strong>

            </div>

        </div>

    );

}


/* =========================================================
   REPORT CARD
========================================================= */

function ReportCard({
    title,
    subtitle,
    icon,
    children,
    wide = false,
}) {

    return (

        <section
            className={
                wide
                    ? "ps-card ps-card-wide"
                    : "ps-card"
            }
        >

            <div className="ps-card-header">

                <div>

                    <span>
                        REPORT
                    </span>


                    <h2>
                        {title}
                    </h2>


                    <p>
                        {subtitle}
                    </p>

                </div>


                <div className="ps-card-icon">

                    {icon}

                </div>

            </div>


            <div className="ps-card-body">

                {children}

            </div>

        </section>

    );

}


/* =========================================================
   EMPTY MINI
========================================================= */

function MiniEmpty() {

    return (

        <div className="ps-mini-empty">

            <FaChartLine />

            <span>
                Not enough data available.
            </span>

        </div>

    );

}