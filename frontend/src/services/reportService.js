import BASE_URL from "./api";


export async function getLatestReport() {

    const response = await fetch(
        `${BASE_URL}/report/latest`,
        {
            method: "GET",

            headers: {
                "Accept": "application/json",
            },
        }
    );


    const result = await response.json();


    console.log("REPORT API RESPONSE:", result);


    if (!response.ok) {

        if (typeof result.detail === "string") {
            throw new Error(result.detail);
        }

        throw new Error(
            "Failed to load agricultural report"
        );

    }


    return result;
}