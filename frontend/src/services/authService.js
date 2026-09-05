import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

// =========================================================
// ROLE NORMALIZER
// =========================================================

function normalizeRole(role) {
  if (role === "officer") {
    return "agricultural_officer";
  }

  if (
    role === "farmer" ||
    role === "admin" ||
    role === "agricultural_officer"
  ) {
    return role;
  }

  return role;
}


// =========================================================
// REGISTER
// =========================================================

export async function registerUser(data) {

  try {

    const requestData = {
      ...data,
      role: normalizeRole(data.role)
    };

    console.log("=================================");
    console.log("REGISTER REQUEST SENT TO BACKEND");
    console.log(requestData);
    console.log("ROLE:", requestData.role);
    console.log("=================================");

    const response = await axios.post(
      `${BASE_URL}/auth/register`,
      requestData
    );

    return response.data;

  } catch (error) {

    console.error(
      "REGISTER API ERROR:",
      error.response?.data || error
    );

    throw error;
  }
}


// =========================================================
// LOGIN
// =========================================================

export async function loginUser(data) {

  try {

    const requestData = {
      ...data,
      role: normalizeRole(data.role)
    };

    console.log("=================================");
    console.log("LOGIN REQUEST SENT TO BACKEND");
    console.log(requestData);
    console.log("ROLE:", requestData.role);
    console.log("=================================");

    const response = await axios.post(
      `${BASE_URL}/auth/login`,
      requestData
    );

    return response.data;

  } catch (error) {

    console.error(
      "LOGIN API ERROR:",
      error.response?.data || error
    );

    throw error;
  }
}


// =========================================================
// GOOGLE LOGIN
// =========================================================

export async function googleLogin(token) {

  try {

    const response = await axios.post(
      `${BASE_URL}/auth/google`,
      {
        token: token
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "GOOGLE LOGIN API ERROR:",
      error.response?.data || error
    );

    throw error;
  }
}