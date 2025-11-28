import crypto from 'crypto';
import NodeRSA from 'node-rsa';

/**
 * Generate RSA key pair for a user
 * @returns {Object} { publicKey, privateKey } in PEM format
 */
export const generateRSAKeyPair = () => {
    const key = new NodeRSA({ b: 2048 });
    return {
        publicKey: key.exportKey('public'),
        privateKey: key.exportKey('private')
    };
};

/**
 * Generate random AES-256 key
 * @returns {Buffer} 32-byte AES key
 */
export const generateAESKey = () => {
    return crypto.randomBytes(32); // 256 bits
};

/**
 * Generate random initialization vector
 * @returns {Buffer} 16-byte IV
 */
export const generateIV = () => {
    return crypto.randomBytes(16);
};

/**
 * Encrypt data using AES-256-CBC
 * @param {Buffer} data - Data to encrypt
 * @param {Buffer} key - AES key
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} Encrypted data
 */
export const encryptWithAES = (data, key, iv) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return encrypted;
};

/**
 * Decrypt data using AES-256-CBC
 * @param {Buffer} encryptedData - Encrypted data
 * @param {Buffer} key - AES key
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} Decrypted data
 */
export const decryptWithAES = (encryptedData, key, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted;
};

/**
 * Encrypt AES key using RSA public key
 * @param {Buffer} aesKey - AES key to encrypt
 * @param {string} publicKey - RSA public key in PEM format
 * @returns {string} Base64-encoded encrypted AES key
 */
export const encryptAESKeyWithRSA = (aesKey, publicKey) => {
    const key = new NodeRSA();
    key.importKey(publicKey, 'public');
    const encrypted = key.encrypt(aesKey, 'base64');
    return encrypted;
};

/**
 * Decrypt AES key using RSA private key
 * @param {string} encryptedAESKey - Base64-encoded encrypted AES key
 * @param {string} privateKey - RSA private key in PEM format
 * @returns {Buffer} Decrypted AES key
 */
export const decryptAESKeyWithRSA = (encryptedAESKey, privateKey) => {
    const key = new NodeRSA();
    key.importKey(privateKey, 'private');
    const decrypted = key.decrypt(encryptedAESKey, 'buffer');
    return decrypted;
};

/**
 * Encrypt file buffer
 * @param {Buffer} fileBuffer - File data to encrypt
 * @param {string} rsaPublicKey - User's RSA public key
 * @returns {Object} { encryptedData, encryptedAESKey, iv }
 */
export const encryptFile = (fileBuffer, rsaPublicKey) => {
    const aesKey = generateAESKey();
    const iv = generateIV();

    const encryptedData = encryptWithAES(fileBuffer, aesKey, iv);
    const encryptedAESKey = encryptAESKeyWithRSA(aesKey, rsaPublicKey);

    return {
        encryptedData,
        encryptedAESKey,
        iv: iv.toString('base64')
    };
};

/**
 * Decrypt file buffer
 * @param {Buffer} encryptedFileBuffer - Encrypted file data
 * @param {string} encryptedAESKey - Base64-encoded encrypted AES key
 * @param {string} ivBase64 - Base64-encoded IV
 * @param {string} rsaPrivateKey - User's RSA private key
 * @returns {Buffer} Decrypted file data
 */
export const decryptFile = (encryptedFileBuffer, encryptedAESKey, ivBase64, rsaPrivateKey) => {
    const aesKey = decryptAESKeyWithRSA(encryptedAESKey, rsaPrivateKey);
    const iv = Buffer.from(ivBase64, 'base64');

    const decryptedData = decryptWithAES(encryptedFileBuffer, aesKey, iv);

    return decryptedData;
};
