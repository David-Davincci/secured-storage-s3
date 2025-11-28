import dotenv from 'dotenv';
dotenv.config();

export const smtp = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};

export const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

export const s3Region = process.env.AWS_REGION;
export const s3Bucket = process.env.AWS_BUCKET;

export const url = process.env.APP_URL || 'http://localhost:3000';

export const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

export const dbConfig = {
    database: process.env.DB_NAME || 'secured_storage',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432
};
