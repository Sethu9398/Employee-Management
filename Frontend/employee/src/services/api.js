
import axios from "axios";

import { clearStoredUser } from "../utils/authStorage";

export const API_BASE_URL = "http://localhost:5000";

export const AUTH_ENDPOINTS = Object.freeze({
    LOGIN: "/user/login",
    LOGOUT: "/user/logout",
    REFRESH: "/user/refresh",
    ME: "/user/me",
});

const LOGIN_PATH = "/login";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });

    failedQueue = [];
};

const isAuthRequest = (url = "") =>
    url.includes(AUTH_ENDPOINTS.REFRESH) ||
    url.includes(AUTH_ENDPOINTS.LOGIN) ||
    url.includes(AUTH_ENDPOINTS.LOGOUT);

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isAuthRequest(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => api(originalRequest));
        }

        isRefreshing = true;

        try {
            
            await axios.post(
                `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
                {},
                { withCredentials: true }
            );

            processQueue(null);

            
            return api(originalRequest);

        } catch (refreshError) {

            processQueue(refreshError);

            
            clearStoredUser();

            
            if (window.location.pathname !== LOGIN_PATH) {
                window.location.replace(LOGIN_PATH);
            }

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
