import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../layout/Layout";

import {
    FaUsers,
    FaSeedling,
    FaClipboardCheck,
    FaExclamationTriangle,
    FaComments,
    FaCloudSun,
    FaTint,
    FaLeaf,
    FaPaperPlane,
    FaCheckCircle
} from "react-icons/fa";

import "../styles/dashboard.css";

const BASE_URL = "http://127.0.0.1:8000";


export default function AgricultureOfficerDashboard() {

    const navigate = useNavigate();

    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    const role =
        localStorage.getItem("role");


    /* =====================================================
       MAIN DASHBOARD STATE
    ===================================================== */

    const [farmers, setFarmers] = useState([]);

    const [soilData, setSoilData] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =====================================================
       ADVICE STATE
    ===================================================== */

    const [adviceRequests, setAdviceRequests] =
        useState([]);

    const [adviceLoading, setAdviceLoading] =
        useState(false);

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [adviceText, setAdviceText] =
        useState("");

    const [adviceMessage, setAdviceMessage] =
        useState("");

    const [adviceError, setAdviceError] =
        useState("");


    /* =====================================================
       SECURITY
    ===================================================== */

    useEffect(() => {

        if (role !== "agricultural_officer") {

            navigate(
                "/login?role=agricultural_officer",
                {
                    replace: true
                }
            );

        }

    }, [role, navigate]);


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    useEffect(() => {

        if (
            role === "agricultural_officer"
        ) {

            loadDashboard();

        }

    }, [role]);


    /* =====================================================
       LOAD DASHBOARD DATA
    ===================================================== */

    async function loadDashboard() {

        try {

            setLoading(true);

            setError("");


            /* =================================================
               LOAD FARMERS
            ================================================= */

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
                        item =>
                            item.role === "farmer"
                    )

                    : [];


            setFarmers(
                farmerList
            );


            /* =================================================
               LOAD SOIL DATA
            ================================================= */

            try {

                const soilResponse =
                    await fetch(
                        `${BASE_URL}/soil/all`
                    );


                if (soilResponse.ok) {

                    const soilResult =
                        await soilResponse.json();


                    setSoilData(

                        Array.isArray(
                            soilResult
                        )

                            ? soilResult

                            : []

                    );

                } else {

                    setSoilData([]);

                }

            } catch (soilError) {

                console.error(
                    "Soil loading error:",
                    soilError
                );

                setSoilData([]);

            }


            /* =================================================
               LOAD ADVICE REQUESTS
            ================================================= */

            await loadAdviceRequests();


        } catch (err) {

            console.error(
                "Officer dashboard error:",
                err
            );


            setError(
                err.message ||
                "Unable to load officer dashboard."
            );


        } finally {

            setLoading(false);

        }

    }


    /* =====================================================
       LOAD ADVICE REQUESTS
       
       BACKEND:
       GET /advice/officer/{email}
    ===================================================== */

    const loadAdviceRequests = async () => {

        if (!user.email) {

            console.warn(
                "Officer email missing from localStorage user."
            );

            return;

        }


        try {

            setAdviceLoading(true);


            const response =
                await fetch(
                    `${BASE_URL}/advice/officer/${encodeURIComponent(
                        user.email
                    )}`
                );


            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    "Advice request API error:",
                    response.status,
                    errorText
                );


                throw new Error(
                    "Unable to load advice requests."
                );

            }


            const data =
                await response.json();


            const requests =

                Array.isArray(data)

                    ? data

                    : Array.isArray(
                        data.requests
                    )

                        ? data.requests

                        : [];


            setAdviceRequests(
                requests
            );


            console.log(
                "Officer advice requests:",
                requests
            );


        } catch (error) {

            console.error(
                "Advice request loading error:",
                error
            );


        } finally {

            setAdviceLoading(false);

        }

    };


    /* =====================================================
       STATISTICS
    ===================================================== */

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


            const validScores =
                soilData

                    .map(
                        item =>
                            Number(
                                item.soil_score
                            )
                    )

                    .filter(
                        score =>
                            !Number.isNaN(
                                score
                            )
                    );


            if (
                validScores.length === 0
            ) {

                return 0;

            }


            return Math.round(

                validScores.reduce(
                    (
                        sum,
                        score
                    ) =>
                        sum + score,
                    0
                )

                /

                validScores.length

            );

        }, [soilData]);


    /* =====================================================
       FARMERS NEEDING ATTENTION
    ===================================================== */

    const farmersNeedingAttention =
        useMemo(() => {

            return farmers.filter(
                farmer => {

                    const hasNoCrop =
                        !farmer.crop;

                    const hasNoSoil =
                        !farmer.soil;

                    const hasNoIrrigation =
                        !farmer.irrigation;


                    return (

                        hasNoCrop ||
                        hasNoSoil ||
                        hasNoIrrigation

                    );

                }
            );

        }, [farmers]);


    /* =====================================================
       ADVICE STATUS HELPERS
       
       Backend uses:
       pending
       replied

       Older frontend records may use:
       answered
    ===================================================== */

    const isAnswered = (request) => {

        return (

            request.status === "replied" ||

            request.status === "answered"

        );

    };


    /* =====================================================
       ADVICE COUNTS
    ===================================================== */

    const pendingAdviceCount =
        adviceRequests.filter(
            request =>
                !isAnswered(request)
        ).length;


    const answeredAdviceCount =
        adviceRequests.filter(
            request =>
                isAnswered(request)
        ).length;


    /* =====================================================
       OPEN ADVICE
    ===================================================== */

    const openAdvice = (request) => {

        setSelectedRequest(
            request
        );


        /*
         * Backend stores the reply as:
         *
         * response
         *
         * NOT advice
         */
        setAdviceText(
            request.response ||
            ""
        );


        setAdviceMessage("");

        setAdviceError("");


        /* =================================================
           SCROLL TO RESPONSE PANEL
        ================================================= */

        setTimeout(() => {

            const element =
                document.getElementById(
                    "response-panel"
                );


            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }, 100);

    };


    /* =====================================================
       SEND OFFICER ADVICE

       BACKEND EXPECTS:

       PUT /advice/reply/{request_id}

       BODY:

       {
           "response": "..."
       }

       IMPORTANT:
       Do NOT send:
       advice
       status
       officer_email
       officer_name

       because AdviceReply schema does not expect them.
    ===================================================== */

    const sendAdvice = async () => {

        setAdviceMessage("");

        setAdviceError("");


        /* =================================================
           CHECK REQUEST
        ================================================= */

        if (!selectedRequest) {

            setAdviceError(
                "Please select an advice request."
            );

            return;

        }


        /* =================================================
           CHECK ADVICE TEXT
        ================================================= */

        if (!adviceText.trim()) {

            setAdviceError(
                "Please enter advice before sending."
            );

            return;

        }


        /* =================================================
           GET REQUEST ID
        ================================================= */

        const requestId =
            selectedRequest._id ||
            selectedRequest.id;


        if (!requestId) {

            console.error(
                "Selected advice request:",
                selectedRequest
            );


            setAdviceError(
                "Advice request ID is missing."
            );

            return;

        }


        try {

            setAdviceLoading(true);


            console.log(
                "================================="
            );

            console.log(
                "SENDING OFFICER ADVICE"
            );

            console.log(
                "REQUEST ID:",
                requestId
            );

            console.log(
                "ENDPOINT:",
                `${BASE_URL}/advice/reply/${requestId}`
            );

            console.log(
                "OFFICER:",
                user.email
            );

            console.log(
                "BODY:",
                {
                    response:
                        adviceText.trim()
                }
            );

            console.log(
                "================================="
            );


            /* =================================================
               CORRECT BACKEND REQUEST
            ================================================= */

            const response =
                await fetch(
                    `${BASE_URL}/advice/reply/${encodeURIComponent(
                        requestId
                    )}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        /*
                         * VERY IMPORTANT
                         *
                         * FastAPI AdviceReply expects
                         * "response".
                         */
                        body: JSON.stringify({

                            response:
                                adviceText.trim()

                        })

                    }
                );


            /* =================================================
               READ SERVER RESPONSE
            ================================================= */

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            let data;


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                const text =
                    await response.text();


                data = {
                    detail: text
                };

            }


            console.log(
                "Advice response:",
                response.status,
                data
            );


            /* =================================================
               HANDLE ERROR
            ================================================= */

            if (!response.ok) {

                let errorMessage =
                    `Unable to send advice. Server returned ${response.status}.`;


                /*
                 * FastAPI validation errors usually look like:
                 *
                 * {
                 *   "detail": [
                 *      {
                 *        "loc": [...],
                 *        "msg": "...",
                 *        "type": "..."
                 *      }
                 *   ]
                 * }
                 */

                if (
                    Array.isArray(
                        data?.detail
                    )
                ) {

                    errorMessage =
                        data.detail
                            .map(
                                item =>
                                    item.msg ||
                                    JSON.stringify(item)
                            )
                            .join(", ");

                } else if (
                    typeof data?.detail ===
                    "string"
                ) {

                    errorMessage =
                        data.detail;

                } else if (
                    typeof data?.message ===
                    "string"
                ) {

                    errorMessage =
                        data.message;

                }


                throw new Error(
                    errorMessage
                );

            }


            /* =================================================
               SUCCESS
            ================================================= */

            console.log(
                "Advice sent successfully."
            );


            setAdviceMessage(
                "Advice sent successfully to the farmer."
            );


            setAdviceError("");


            setAdviceText("");


            setSelectedRequest(
                null
            );


            /* =================================================
               REFRESH REQUESTS
            ================================================= */

            await loadAdviceRequests();


        } catch (error) {

            console.error(
                "Send advice error:",
                error
            );


            setAdviceError(
                error.message ||
                "Unable to send advice."
            );


        } finally {

            setAdviceLoading(false);

        }

    };


    /* =====================================================
       CANCEL ADVICE
    ===================================================== */

    const cancelAdvice = () => {

        setSelectedRequest(null);

        setAdviceText("");

        setAdviceError("");

    };


    /* =====================================================
       SECURITY RENDER
    ===================================================== */

    if (
        role !== "agricultural_officer"
    ) {

        return null;

    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <Layout>

                <div
                    className="dashboard-page"
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading Agricultural Officer Dashboard...
                    </h2>

                </div>

            </Layout>

        );

    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    return (

        <Layout>

            <div className="dashboard-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="dashboard-banner">

                    <div>

                        <h1>
                            Agricultural Officer Dashboard 👨‍🌾
                        </h1>


                        <p>

                            Welcome back,{" "}

                            <strong>
                                {user.full_name ||
                                    "Agricultural Officer"}
                            </strong>.

                            {" "}

                            Monitor farmers, assess soil
                            health and provide agricultural
                            guidance.

                        </p>

                    </div>


                    <div className="dashboard-actions">

                        <Link
                            to="/analytics"
                            className="primary-btn"
                        >
                            📊 Analytics
                        </Link>


                        <Link
                            to="/users"
                            className="secondary-btn"
                        >
                            👨‍🌾 View Farmers
                        </Link>

                    </div>

                </div>


                {/* =================================================
                    GENERAL ERROR
                ================================================= */}

                {error && (

                    <div className="dashboard-error">

                        <FaExclamationTriangle />

                        <span>
                            {error}
                        </span>


                        <button
                            onClick={
                                loadDashboard
                            }
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {adviceMessage && (

                    <div
                        style={{
                            marginTop: "15px",
                            marginBottom: "15px",
                            padding: "14px 18px",
                            borderRadius: "8px",
                            background: "#dcfce7",
                            color: "#166534",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >

                        <FaCheckCircle />

                        <span>
                            {adviceMessage}
                        </span>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="dashboard-grid">


                    {/* TOTAL FARMERS */}

                    <div className="dashboard-card">

                        <FaUsers
                            className="dash-icon"
                        />


                        <h3>
                            Total Farmers
                        </h3>


                        <h2>
                            {farmers.length}
                        </h2>


                        <p>
                            Farmers registered in the system
                        </p>

                    </div>


                    {/* SOIL */}

                    <div className="dashboard-card">

                        <FaClipboardCheck
                            className="dash-icon"
                        />


                        <h3>
                            Soil Analyses
                        </h3>


                        <h2>
                            {soilData.length}
                        </h2>


                        <p>
                            Soil records available for monitoring
                        </p>

                    </div>


                    {/* SOIL SCORE */}

                    <div className="dashboard-card">

                        <FaSeedling
                            className="dash-icon"
                        />


                        <h3>
                            Average Soil Score
                        </h3>


                        <h2>
                            {averageSoilScore}
                        </h2>


                        <p>
                            Based on available soil analyses
                        </p>

                    </div>


                    {/* ADVICE */}

                    <div className="dashboard-card">

                        <FaComments
                            className="dash-icon"
                        />


                        <h3>
                            Pending Advice
                        </h3>


                        <h2>
                            {pendingAdviceCount}
                        </h2>


                        <p>
                            Farmer requests awaiting response
                        </p>

                    </div>

                </div>


                {/* =================================================
                    OFFICER ACTIVITIES
                ================================================= */}

                <div className="section-card">


                    <div className="section-heading-row">

                        <div>

                            <h2>
                                Officer Activities
                            </h2>


                            <p>
                                Agricultural support and
                                farmer monitoring tools.
                            </p>

                        </div>

                    </div>


                    <div
                        className="dashboard-grid"
                        style={{
                            marginTop: "20px"
                        }}
                    >


                        {/* FARMER MONITORING */}

                        <div className="dashboard-card">

                            <FaUsers
                                className="dash-icon"
                            />


                            <h3>
                                Farmer Monitoring
                            </h3>


                            <p>
                                Review registered farmers,
                                locations, crops, land area
                                and agricultural information.
                            </p>


                            <Link
                                to="/users"
                                className="secondary-btn"
                            >
                                View Farmers
                            </Link>

                        </div>


                        {/* SOIL HEALTH */}

                        <div className="dashboard-card">

                            <FaLeaf
                                className="dash-icon"
                            />


                            <h3>
                                Soil Health
                            </h3>


                            <p>
                                Monitor available soil analysis
                                records and identify farmers
                                who may require attention.
                            </p>


                            <Link
                                to="/soil"
                                className="secondary-btn"
                            >
                                View Soil
                            </Link>

                        </div>


                        {/* ADVICE */}

                        <div className="dashboard-card">

                            <FaComments
                                className="dash-icon"
                            />


                            <h3>
                                Farmer Advice
                            </h3>


                            <p>

                                {pendingAdviceCount > 0

                                    ? `${pendingAdviceCount} farmer request${
                                        pendingAdviceCount === 1
                                            ? ""
                                            : "s"
                                    } waiting for your response.`

                                    : "No pending farmer advice requests."}

                            </p>


                            <a
                                href="#advice-requests"
                                className="secondary-btn"
                            >

                                {pendingAdviceCount > 0
                                    ? "View Requests"
                                    : "Open Advice"}

                            </a>

                        </div>


                        {/* WEATHER */}

                        <div className="dashboard-card">

                            <FaCloudSun
                                className="dash-icon"
                            />


                            <h3>
                                Weather Monitoring
                            </h3>


                            <p>
                                Review weather conditions
                                before advising farmers about
                                irrigation and crop activities.
                            </p>


                            <Link
                                to="/weather"
                                className="secondary-btn"
                            >
                                View Weather
                            </Link>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ADVICE REQUESTS
                ================================================= */}

                <div
                    className="section-card"
                    id="advice-requests"
                >


                    <div className="section-heading-row">

                        <div>

                            <h2>
                                <FaComments />
                                {" "}
                                Farmer Advice Requests
                            </h2>


                            <p>
                                Respond to questions submitted
                                by farmers.
                            </p>

                        </div>


                        <div>

                            <strong>
                                {pendingAdviceCount}
                            </strong>

                            {" "}Pending

                        </div>

                    </div>


                    {/* ADVICE ERROR */}

                    {adviceError &&
                        !selectedRequest && (

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


                    {/* LOADING */}

                    {adviceLoading &&
                        adviceRequests.length === 0 ? (

                        <div
                            className="chart-empty"
                        >

                            <p>
                                Loading advice requests...
                            </p>

                        </div>

                    )


                    /* NO REQUESTS */

                    : adviceRequests.length === 0 ? (

                        <div
                            className="chart-empty"
                        >

                            <FaComments />


                            <p>
                                No farmer advice requests
                                available.
                            </p>

                        </div>

                    )


                    /* REQUEST TABLE */

                    : (

                        <div className="table-container">

                            <table className="dashboard-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Farmer
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
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {adviceRequests.map(
                                        (
                                            request,
                                            index
                                        ) => (

                                        <tr
                                            key={
                                                request._id ||
                                                request.id ||
                                                index
                                            }
                                        >


                                            {/* FARMER */}

                                            <td>

                                                <strong>
                                                    {
                                                        request.farmer_name ||
                                                        "Farmer"
                                                    }
                                                </strong>


                                                <br />


                                                <small>
                                                    {
                                                        request.farmer_email ||
                                                        ""
                                                    }
                                                </small>

                                            </td>


                                            {/* QUESTION */}

                                            <td>

                                                {
                                                    request.query ||
                                                    "--"
                                                }

                                            </td>


                                            {/* CROP */}

                                            <td>

                                                {
                                                    request.crop ||
                                                    "--"
                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    style={{
                                                        padding:
                                                            "5px 10px",
                                                        borderRadius:
                                                            "20px",

                                                        background:
                                                            isAnswered(
                                                                request
                                                            )

                                                                ? "#dcfce7"

                                                                : "#fef3c7",

                                                        color:
                                                            isAnswered(
                                                                request
                                                            )

                                                                ? "#166534"

                                                                : "#92400e"
                                                    }}
                                                >

                                                    {isAnswered(
                                                        request
                                                    )

                                                        ? "Replied"

                                                        : "Pending"}

                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                {isAnswered(
                                                    request
                                                )

                                                    ? (

                                                    <button
                                                        className="secondary-btn"
                                                        onClick={() =>
                                                            openAdvice(
                                                                request
                                                            )
                                                        }
                                                    >
                                                        View Advice
                                                    </button>

                                                )

                                                    : (

                                                    <button
                                                        className="primary-btn"
                                                        onClick={() =>
                                                            openAdvice(
                                                                request
                                                            )
                                                        }
                                                    >
                                                        Advise
                                                    </button>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =================================================
                    RESPONSE PANEL
                ================================================= */}

                {selectedRequest && (

                    <div
                        className="section-card"
                        id="response-panel"
                    >


                        <div className="section-heading-row">

                            <div>

                                <h2>
                                    💬 Respond to Farmer
                                </h2>


                                <p>
                                    Provide practical agricultural
                                    guidance.
                                </p>

                            </div>

                        </div>


                        <div
                            style={{
                                padding: "18px",
                                background: "#f8fafc",
                                borderRadius: "10px",
                                marginTop: "15px"
                            }}
                        >


                            {/* FARMER */}

                            <p>

                                <strong>
                                    Farmer:
                                </strong>

                                {" "}

                                {
                                    selectedRequest.farmer_name ||
                                    "Farmer"
                                }

                            </p>


                            {/* EMAIL */}

                            <p>

                                <strong>
                                    Email:
                                </strong>

                                {" "}

                                {
                                    selectedRequest.farmer_email ||
                                    "--"
                                }

                            </p>


                            {/* CROP */}

                            <p>

                                <strong>
                                    Crop:
                                </strong>

                                {" "}

                                {
                                    selectedRequest.crop ||
                                    "--"
                                }

                            </p>


                            {/* QUESTION */}

                            <p>

                                <strong>
                                    Question:
                                </strong>

                            </p>


                            <div
                                style={{
                                    padding: "15px",
                                    background: "white",
                                    borderRadius: "8px",
                                    border:
                                        "1px solid #e5e7eb",
                                    marginBottom: "18px"
                                }}
                            >

                                {
                                    selectedRequest.query ||
                                    "--"
                                }

                            </div>


                            {/* EXISTING RESPONSE */}

                            {selectedRequest.response && (

                                <>

                                    <p>

                                        <strong>
                                            Previous Advice:
                                        </strong>

                                    </p>


                                    <div
                                        style={{
                                            padding: "15px",
                                            background: "#ecfdf5",
                                            borderRadius: "8px",
                                            border:
                                                "1px solid #bbf7d0",
                                            marginBottom: "18px",
                                            color: "#166534"
                                        }}
                                    >

                                        {
                                            selectedRequest.response
                                        }

                                    </div>

                                </>

                            )}


                            {/* ADVICE INPUT */}

                            <label>

                                <strong>
                                    {isAnswered(
                                        selectedRequest
                                    )
                                        ? "Update Advice"
                                        : "Your Advice"}
                                </strong>

                            </label>


                            <textarea
                                value={
                                    adviceText
                                }

                                onChange={
                                    (e) =>
                                        setAdviceText(
                                            e.target.value
                                        )
                                }

                                placeholder="Provide guidance about crop management, irrigation, soil, fertilizer, weather or other agricultural practices..."

                                rows={6}

                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    marginTop: "8px",
                                    borderRadius: "8px",
                                    border:
                                        "1px solid #d1d5db",
                                    resize: "vertical",
                                    boxSizing: "border-box"
                                }}

                            />


                            {/* ERROR */}

                            {adviceError && (

                                <div
                                    style={{
                                        marginTop: "12px",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        background: "#fee2e2",
                                        color: "#991b1b"
                                    }}
                                >

                                    <FaExclamationTriangle />

                                    {" "}

                                    {adviceError}

                                </div>

                            )}


                            {/* BUTTONS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "15px"
                                }}
                            >


                                <button
                                    className="primary-btn"
                                    onClick={
                                        sendAdvice
                                    }
                                    disabled={
                                        adviceLoading
                                    }
                                >

                                    <FaPaperPlane />

                                    {adviceLoading

                                        ? " Sending..."

                                        : isAnswered(
                                            selectedRequest
                                        )

                                            ? " Update Advice"

                                            : " Send Advice"}

                                </button>


                                <button
                                    className="secondary-btn"
                                    onClick={
                                        cancelAdvice
                                    }
                                    disabled={
                                        adviceLoading
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    FARMERS NEEDING ATTENTION
                ================================================= */}

                <div className="section-card">


                    <div className="section-heading-row">

                        <div>

                            <h2>
                                Farmers Needing Attention
                            </h2>


                            <p>
                                Farmers with incomplete
                                agricultural information.
                            </p>

                        </div>

                    </div>


                    {farmersNeedingAttention.length === 0 ? (

                        <div
                            style={{
                                padding: "25px",
                                textAlign: "center"
                            }}
                        >

                            <FaSeedling
                                className="dash-icon"
                            />


                            <p>
                                All available farmer profiles
                                contain basic agricultural
                                information.
                            </p>

                        </div>

                    ) : (

                        <div className="table-container">

                            <table className="dashboard-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Farmer
                                        </th>


                                        <th>
                                            Location
                                        </th>


                                        <th>
                                            Crop
                                        </th>


                                        <th>
                                            Soil
                                        </th>


                                        <th>
                                            Irrigation
                                        </th>


                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {farmersNeedingAttention
                                        .slice(0, 10)
                                        .map(
                                            farmer => (

                                            <tr
                                                key={
                                                    farmer._id ||
                                                    farmer.email
                                                }
                                            >


                                                {/* FARMER */}

                                                <td>

                                                    <strong>
                                                        {
                                                            farmer.full_name ||
                                                            "Unknown"
                                                        }
                                                    </strong>


                                                    <br />


                                                    <small>
                                                        {
                                                            farmer.email
                                                        }
                                                    </small>

                                                </td>


                                                {/* LOCATION */}

                                                <td>

                                                    {[
                                                        farmer.village,
                                                        farmer.mandal,
                                                        farmer.district,
                                                        farmer.state
                                                    ]
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .join(
                                                            ", "
                                                        )

                                                        ||

                                                        "Not provided"}

                                                </td>


                                                {/* CROP */}

                                                <td>

                                                    {
                                                        farmer.crop ||
                                                        "Not provided"
                                                    }

                                                </td>


                                                {/* SOIL */}

                                                <td>

                                                    {
                                                        farmer.soil ||
                                                        "Not provided"
                                                    }

                                                </td>


                                                {/* IRRIGATION */}

                                                <td>

                                                    {
                                                        farmer.irrigation ||
                                                        "Not provided"
                                                    }

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        className="secondary-btn"
                                                        onClick={() => {

                                                            const matchingRequest =
                                                                adviceRequests.find(
                                                                    request =>

                                                                        request.farmer_email ===
                                                                        farmer.email

                                                                        &&

                                                                        !isAnswered(
                                                                            request
                                                                        )
                                                                );


                                                            if (
                                                                matchingRequest
                                                            ) {

                                                                openAdvice(
                                                                    matchingRequest
                                                                );

                                                            } else {

                                                                document
                                                                    .getElementById(
                                                                        "advice-requests"
                                                                    )
                                                                    ?.scrollIntoView(
                                                                        {
                                                                            behavior:
                                                                                "smooth"
                                                                        }
                                                                    );

                                                            }

                                                        }}
                                                    >

                                                        Advise

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =================================================
                    SOIL SUMMARY
                ================================================= */}

                <div className="section-card">


                    <div className="section-heading-row">

                        <div>

                            <h2>
                                Recent Soil Monitoring
                            </h2>


                            <p>
                                Soil analysis information
                                available to the officer.
                            </p>

                        </div>


                        <FaTint
                            className="chart-icon"
                        />

                    </div>


                    {soilData.length === 0 ? (

                        <div className="chart-empty">

                            <FaLeaf />


                            <p>
                                No soil analysis records
                                available yet.
                            </p>

                        </div>

                    ) : (

                        <div className="table-container">

                            <table className="dashboard-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Farmer
                                        </th>


                                        <th>
                                            Soil Score
                                        </th>


                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {soilData
                                        .slice(0, 10)
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => {

                                            const score =
                                                Number(
                                                    item.soil_score
                                                ) || 0;


                                            let status =
                                                "Needs Review";


                                            if (
                                                score >= 70
                                            ) {

                                                status =
                                                    "Healthy";

                                            } else if (
                                                score >= 40
                                            ) {

                                                status =
                                                    "Moderate";

                                            }


                                            return (

                                                <tr
                                                    key={
                                                        item._id ||
                                                        item.id ||
                                                        index
                                                    }
                                                >

                                                    <td>

                                                        {
                                                            item.email ||
                                                            item.farmer_email ||
                                                            item.farmer ||
                                                            "Farmer"
                                                        }

                                                    </td>


                                                    <td>
                                                        {score}
                                                    </td>


                                                    <td>
                                                        {status}
                                                    </td>

                                                </tr>

                                            );

                                        })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =================================================
                    ADVICE SUMMARY
                ================================================= */}

                <div className="section-card">


                    <div className="section-heading-row">

                        <div>

                            <h2>
                                Advice Activity
                            </h2>


                            <p>
                                Summary of farmer communication.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-grid">


                        {/* TOTAL */}

                        <div className="dashboard-card">

                            <FaComments
                                className="dash-icon"
                            />


                            <h3>
                                Total Requests
                            </h3>


                            <h2>
                                {adviceRequests.length}
                            </h2>


                            <p>
                                Farmer questions received
                            </p>

                        </div>


                        {/* PENDING */}

                        <div className="dashboard-card">

                            <FaExclamationTriangle
                                className="dash-icon"
                            />


                            <h3>
                                Pending
                            </h3>


                            <h2>
                                {pendingAdviceCount}
                            </h2>


                            <p>
                                Requests requiring response
                            </p>

                        </div>


                        {/* ANSWERED */}

                        <div className="dashboard-card">

                            <FaCheckCircle
                                className="dash-icon"
                            />


                            <h3>
                                Answered
                            </h3>


                            <h2>
                                {answeredAdviceCount}
                            </h2>


                            <p>
                                Farmer requests answered
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </Layout>

    );

}