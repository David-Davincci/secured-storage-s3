import jwt from 'jsonwebtoken';
import { User } from '../db/models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.get('authorization') || req.get('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                error: { message: 'No authorization token provided' }
            });
        }

        // Extract token (handle both "Bearer token" and plain token)
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                error: { message: 'Invalid or expired token' }
            });
        }

        // Fetch user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                error: { message: 'User not found' }
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                error: { message: 'Please verify your email before accessing this resource' }
            });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: { message: 'Authentication error' }
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.get('authorization') || req.get('Authorization');

        if (!authHeader) {
            return next();
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        const decoded = verifyToken(token);

        if (decoded) {
            const user = await User.findByPk(decoded.id);
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
