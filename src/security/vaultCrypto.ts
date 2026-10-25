import CryptoJS from 'crypto-js';

// High-entropy vault encryption key for RentoBit
export const VAULT_SECRET_KEY =
  (typeof process !== 'undefined' && process.env && process.env.VAULT_SECRET_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_VAULT_SECRET_KEY) ||
  'RENTOBIT_SECURE_VAULT_KEY_2026_X99_MILITARY_GRADE';

/**
 * Encrypt any JS object or value into AES-256 ciphertext
 */
export function encryptPayload(data: any): string {
  try {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(raw, VAULT_SECRET_KEY).toString();
  } catch (err) {
    console.error('[Vault] Encryption failure:', err);
    return '';
  }
}

/**
 * Decrypt AES-256 ciphertext back into original JS data
 */
export function decryptPayload(ciphertext: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, VAULT_SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (err) {
    console.error('[Vault] Decryption failure:', err);
    return null;
  }
}

/**
 * Generate HMAC-SHA256 signature from timestamp
 */
export function generateSignature(timestamp: number | string): string {
  return CryptoJS.HmacSHA256(`${timestamp}:rentobit-secure-v2`, VAULT_SECRET_KEY).toString();
}

/**
 * Verify HMAC-SHA256 signature and freshness window (prevents replay attacks)
 */
export function verifySignature(timestamp: number | string, signature: string, maxAgeMs: number = 300000): boolean {
  if (!timestamp || !signature) return false;
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(ts)) return false;

  // Verify timestamp is within +/- maxAgeMs (default 5 minutes)
  const now = Date.now();
  if (Math.abs(now - ts) > maxAgeMs) {
    return false;
  }

  const expected = generateSignature(ts);
  return expected === signature;
}
