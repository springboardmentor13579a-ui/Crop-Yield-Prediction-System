import * as SecureStore from "expo-secure-store";

import api, {
  setAuthToken,
} from "./api";

// ============================================================
// TOKEN KEY
// ============================================================

const TOKEN_KEY = "yieldsenseai_access_token";

// ============================================================
// SAVE TOKEN
// ============================================================

export async function saveToken(
  token: string
) {

  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  );

  setAuthToken(token);
}

// ============================================================
// GET TOKEN
// ============================================================

export async function getToken() {

  const token =
    await SecureStore.getItemAsync(
      TOKEN_KEY
    );

  if (token) {
    setAuthToken(token);
  }

  return token;
}

// ============================================================
// REMOVE TOKEN
// ============================================================

export async function removeToken() {

  await SecureStore.deleteItemAsync(
    TOKEN_KEY
  );

  setAuthToken(null);
}

// ============================================================
// LOGIN
// ============================================================

export async function login(
  email: string,
  password: string
) {

  console.log(
    "LOGIN REQUEST:",
    email
  );

  const response = await api.post(
    "/users/login",
    {
      email,
      password,
    }
  );

  console.log(
    "LOGIN RESPONSE:",
    response.data
  );

  return response.data;
}

// ============================================================
// REGISTER
// ============================================================

export async function register(
  name: string,
  email: string,
  password: string
) {

  const response = await api.post(
    "/users/register",
    {
      name,
      email,
      password,
    }
  );

  return response.data;
}

// ============================================================
// GET CURRENT USER
// ============================================================

export async function getCurrentUser() {

  const response = await api.get(
    "/users/me"
  );

  return response.data;
}

// ============================================================
// GOOGLE LOGIN
// ============================================================

export async function googleLogin(
  code: string
) {

  const response = await api.post(
    "/users/google-login",
    {
      code,
    }
  );

  return response.data;
}

// ============================================================
// GOOGLE REGISTER
// ============================================================

export async function googleRegister(
  code: string
) {

  const response = await api.post(
    "/users/google-register",
    {
      code,
    }
  );

  return response.data;
}