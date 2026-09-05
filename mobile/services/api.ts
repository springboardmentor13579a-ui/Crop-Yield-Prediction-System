import axios from "axios";

/*
 * ============================================================
 * YIELDSENSEAI MOBILE API
 * ============================================================
 *
 * TESTING ON PHYSICAL PHONE
 *
 * Laptop + Phone are connected through phone hotspot.
 *
 * Laptop IPv4:
 * 10.239.201.244
 *
 * FastAPI:
 * http://10.239.201.244:8000
 *
 * IMPORTANT:
 * Do NOT use 10.0.2.2 when testing on a physical phone.
 */

// ============================================================
// API URL
// ============================================================

export const API_URL = "http://10.239.201.244:8000";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ============================================================
// AUTH TOKEN
// ============================================================

let authToken: string | null = null;

// ============================================================
// SET AUTH TOKEN
// ============================================================

export function setAuthToken(token: string | null) {
  authToken = token;

  if (token) {
    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  async (config) => {

    if (authToken) {
      config.headers.Authorization =
        `Bearer ${authToken}`;
    }

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      `${API_URL}${config.url}`
    );

    return config;
  },

  (error) => {
    console.log(
      "REQUEST CONFIG ERROR:",
      error
    );

    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(

  (response) => {

    console.log(
      "API RESPONSE:",
      response.status,
      response.config.url
    );

    return response;
  },

  (error) => {

    if (error.response) {

      console.log(
        "API ERROR:",
        error.response.status,
        error.response.data
      );

    } else if (error.request) {

      console.log(
        "NETWORK ERROR:",
        error.message
      );

      console.log(
        "REQUEST URL:",
        error.config?.baseURL,
        error.config?.url
      );

    } else {

      console.log(
        "AXIOS ERROR:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default api;