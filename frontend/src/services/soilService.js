import BASE_URL from "./api";

export async function analyzeSoil(state) {
  const response = await fetch(`${BASE_URL}/soil/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Soil Analysis Failed");
  }

  return result;
}