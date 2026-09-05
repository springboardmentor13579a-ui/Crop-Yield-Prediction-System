import BASE_URL from "./api";


export async function getAdminStats() {

    const response = await fetch(
        `${BASE_URL}/admin/stats`
    );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Failed to load admin statistics"
        );
    }

    return data;
}