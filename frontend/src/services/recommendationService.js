const BASE_URL = "http://127.0.0.1:8000";

export async function generateRecommendation(data) {

    const response = await fetch(
        `${BASE_URL}/recommendation/generate`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.detail ||
            "Crop recommendation failed"
        );

    }

    return result;
}