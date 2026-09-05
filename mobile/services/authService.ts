import * as SecureStore from "expo-secure-store";

import api from "./api";

// ============================================================
// TOKEN KEY
// ============================================================

const TOKEN_KEY =
  "yieldsense_access_token";

// ============================================================
// API URL
// ============================================================

export const API_URL =
  "http://10.239.201.244:8000";

// ============================================================
// SAVE TOKEN
// ============================================================

export async function saveToken(
  token: string
): Promise<void> {

  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  );
}

// ============================================================
// GET TOKEN
// ============================================================

export async function getToken():
  Promise<string | null> {

  return await SecureStore.getItemAsync(
    TOKEN_KEY
  );
}

// ============================================================
// REMOVE TOKEN
// ============================================================

export async function removeToken():
  Promise<void> {

  await SecureStore.deleteItemAsync(
    TOKEN_KEY
  );
}

// ============================================================
// LOGIN
// ============================================================

export async function loginUser(
  email: string,
  password: string
) {

  try {

    const response =
      await api.post(
        "/users/login",
        {
          email: email.trim(),
          password,
        }
      );

    return response.data;

  } catch (error: any) {

    console.log(
      "LOGIN ERROR:",
      error?.response?.data ||
      error?.message
    );

    throw error;
  }
}

// ============================================================
// REGISTER
// ============================================================

export async function registerUser(
  fullName: string,
  email: string,
  password: string
) {

  try {

    const response =
      await api.post(
        "/users/register",
        {
          full_name:
            fullName.trim(),

          email:
            email.trim(),

          password,
        }
      );

    return response.data;

  } catch (error: any) {

    console.log(
      "REGISTER ERROR:",
      error?.response?.data ||
      error?.message
    );

    throw error;
  }
}

// ============================================================
// GOOGLE LOGIN
// ============================================================

export async function googleLogin(
  code: string
) {

  try {

    const response =
      await api.post(
        "/users/google-login",
        {
          code,
        }
      );

    return response.data;

  } catch (error: any) {

    console.log(
      "GOOGLE LOGIN ERROR:",
      error?.response?.data ||
      error?.message
    );

    throw error;
  }
}

// ============================================================
// GOOGLE REGISTER
// ============================================================

export async function googleRegister(
  code: string
) {

  try {

    const response =
      await api.post(
        "/users/google-register",
        {
          code,
        }
      );

    return response.data;

  } catch (error: any) {

    console.log(
      "GOOGLE REGISTER ERROR:",
      error?.response?.data ||
      error?.message
    );

    throw error;
  }
}

// ============================================================
// CURRENT USER
// ============================================================

export async function getCurrentUser() {

  try {

    const token =
      await getToken();

    if (!token) {
      return null;
    }

    const response =
      await api.get(
        "/users/me",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;

  } catch (error: any) {

    console.log(
      "CURRENT USER ERROR:",
      error?.response?.data ||
      error?.message
    );

    throw error;
  }
}

// ============================================================
// AUTHENTICATED REQUEST
// ============================================================

export async function authenticatedRequest() {

  const token =
    await getToken();

  return {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;