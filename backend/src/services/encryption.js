import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.MASTER_ENCRYPTION_KEY, 'hex');

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('MASTER_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)');
}

/**
 * Encrypts a private key using AES-256-GCM
 * @param {string} privateKey - The private key to encrypt
 * @returns {Object} - Object containing encrypted data, IV, and auth tag
 */
export function encryptPrivateKey(privateKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts an encrypted private key
 * @param {Object} encryptedData - Object containing encrypted, iv, and authTag
 * @returns {string} - The decrypted private key
 */
export function decryptPrivateKey(encryptedData) {
  // Handle if encryptedData is a JSON string
  const data = typeof encryptedData === 'string' 
    ? JSON.parse(encryptedData) 
    : encryptedData;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(data.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generates a secure random encryption key
 * @returns {string} - 64 character hex string (32 bytes)
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates a Solana private key format
 * @param {string} privateKey - The private key to validate
 * @returns {boolean} - True if valid
 */
export function isValidPrivateKey(privateKey) {
  try {
    // Check if it's a valid base58 string and proper length
    // Solana private keys are typically 64 bytes in base58 or array format
    if (privateKey.startsWith('[') && privateKey.endsWith(']')) {
      // Array format
      const arr = JSON.parse(privateKey);
      return Array.isArray(arr) && arr.length === 64;
    } else {
      // Base58 format (should be around 88 characters)
      return typeof privateKey === 'string' && privateKey.length >= 80 && privateKey.length <= 90;
    }
  } catch {
    return false;
  }
}
