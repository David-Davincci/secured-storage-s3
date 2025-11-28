import axios from 'axios';
import { apiUrl } from '../config';

const API_URL = apiUrl || 'http://localhost:3001/api';

/**
 * Get all files for current user
 */
export const getFiles = async () => {
    try {
        const response = await axios.get(`${API_URL}/files`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to fetch files' };
    }
};

/**
 * Get file details
 */
export const getFile = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/files/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to fetch file' };
    }
};

/**
 * Get file preview URL
 */
export const getFilePreviewUrl = (id) => {
    return `${API_URL}/files/${id}/preview`;
};

/**
 * Get file download URL
 */
export const getFileDownloadUrl = (id) => {
    return `${API_URL}/files/${id}/download`;
};

/**
 * Delete file
 */
export const deleteFile = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/files/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to delete file' };
    }
};

/**
 * Upload files
 */
export const uploadFiles = async (files, toEmail, message, onProgress) => {
    try {
        const formData = new FormData();

        // Add files to form data
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        // Add optional metadata
        if (toEmail) {
            formData.append('to', toEmail);
        }
        if (message) {
            formData.append('message', message);
        }

        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to upload files' };
    }
};

/**
 * Download file
 */
export const downloadFile = async (id, filename) => {
    try {
        const response = await axios.get(`${API_URL}/files/${id}/download`, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        throw error.response?.data?.error || { message: 'Failed to download file' };
    }
};
