import BASE_URL from "./api";


// ==========================================
// CREATE PREDICTION
// ==========================================
export async function predictYield(data) {

    console.log("SENDING TO BACKEND:", data);

    const response = await fetch(
        `${BASE_URL}/prediction/predict`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    const result = await response.json();

    console.log("BACKEND STATUS:", response.status);
    console.log("BACKEND RESPONSE:", result);

    if (!response.ok) {

        let message = "Prediction Failed";

        if (typeof result.detail === "string") {
            message = result.detail;
        }

        if (Array.isArray(result.detail)) {

            message = result.detail
                .map(error => {
                    return `${error.loc?.join(".")}: ${error.msg}`;
                })
                .join("\n");

        }

        throw new Error(message);
    }

    return result;
}


// ==========================================
// GET LATEST PREDICTION
// ==========================================
export async function getLatestPrediction(userEmail) {

    if (!userEmail) {
        throw new Error("User email is required");
    }

    const response = await fetch(
        `${BASE_URL}/prediction/latest?user_email=${encodeURIComponent(userEmail)}`
    );

    const result = await response.json();

    console.log(
        "LATEST PREDICTION STATUS:",
        response.status
    );

    console.log(
        "LATEST PREDICTION:",
        result
    );

    if (!response.ok) {

        let message =
            "Failed to load latest prediction";

        if (typeof result.detail === "string") {
            message = result.detail;
        }

        throw new Error(message);
    }

    return result;
}