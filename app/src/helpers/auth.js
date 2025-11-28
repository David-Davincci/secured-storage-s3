import axios from 'axios';
import { apiUrl } from '../config';

const API_URL = apiUrl || 'http://localhost:3001/api';

/**
 * Store JWT token in localStorage
 */
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
};

/**
 * Get JWT token from localStorage
 */
export const getAuthToken = () => {
    return localStorage.getItem('token');
};

/**
 * Get current user info from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set current user info in localStorage
 */
export const setCurrentUser = (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
};

/**
 * Logout user
 */
export const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    window.location.href = '/login';
};

/**
 * Register new user
 */
export const register = async (email, password, name) => {
    try {
        const response = await axios.post(`${API_URL}/users`, {
            email,
            password,
            name
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Registration failed' };
    }
};

/**
 * Login user
 */
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/users/login`, {
            email,
            password
        });

        const { token, user } = response.data;
        setAuthToken(token);
        setCurrentUser(user);

        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Login failed' };
    }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Email verification failed' };
    }
};

/**
 * Resend verification email
 */
export const resendVerification = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to resend verification email' };
    }
};

/**
 * Request password reset
 */
export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to send password reset email' };
    }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Password reset failed' };
    }
};

/**
 * Get current user from API
 */
export const fetchCurrentUser = async () => {
    try {
        const token = getAuthToken();
        if (!token) return null;

        const response = await axios.get(`${API_URL}/users/me`);
        setCurrentUser(response.data);
        return response.data;
    } catch (error) {
        // Token might be expired
        logout();
        throw error;
    }
};

// Initialize axios with token if it exists
const token = getAuthToken();
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
