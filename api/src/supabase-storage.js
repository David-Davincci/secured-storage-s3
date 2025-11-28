import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'encrypted-files';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} fileName - Name for the file in storage
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} Upload result
 */
export const uploadFile = async (fileBuffer, fileName, mimeType) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            throw error;
        }

        return {
            success: true,
            key: data.path,
            bucket: bucketName
        };
    } catch (error) {
        console.error('Supabase upload error:', error);
        throw error;
    }
};

/**
 * Download file from Supabase Storage
 * @param {string} filePath - Path to file in storage
 * @returns {Promise<Buffer>} File content as buffer
 */
export const downloadFile = async (filePath) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .download(filePath);

        if (error) {
            throw error;
        }

        // Convert Blob to Buffer
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Supabase download error:', error);
        throw error;
    }
};

/**
 * Delete file from Supabase Storage
 * @param {string} filePath - Path to file in storage
 * @returns {Promise<Object>} Delete result
 */
export const deleteFile = async (filePath) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            throw error;
        }

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Supabase delete error:', error);
        throw error;
    }
};

/**
 * Get public URL for a file (won't work if bucket is private, use signed URLs instead)
 * @param {string} filePath - Path to file in storage
 * @returns {string} Public URL
 */
export const getPublicUrl = (filePath) => {
    const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
    
    return data.publicUrl;
};

/**
 * Create signed URL for private file access
 * @param {string} filePath - Path to file in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 60)
 * @returns {Promise<string>} Signed URL
 */
export const createSignedUrl = async (filePath, expiresIn = 60) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            throw error;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Supabase signed URL error:', error);
        throw error;
    }
};

export default {
    uploadFile,
    downloadFile,
    deleteFile,
    getPublicUrl,
    createSignedUrl,
    supabase,
    bucketName
};
