import crypto from 'crypto';
import type { SignedToken } from '@video-uniqueizer/shared-types';
import logger from '../logger';

// This secret should match the server's OFFLINE_TOKEN_SECRET
// In production, this would be obfuscated
const OFFLINE_TOKEN_SECRET = process.env.OFFLINE_TOKEN_SECRET || 
  'your_64_character_secret_key_here_change_in_production_for_real_security';

/**
 * Validate HMAC-signed offline token
 * Used when license server is unreachable
 */
export function validateSignedToken(token: SignedToken): { valid: boolean; reason?: string } {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Check expiration
    if (token.exp < now) {
      return { valid: false, reason: 'Token expired' };
    }
    
    // Check issued at (not older than 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    if (token.iat < thirtyDaysAgo) {
      return { valid: false, reason: 'Token too old' };
    }
    
    // Verify signature
    const payload = {
      licenseId: token.licenseId,
      hwid: token.hwid,
      iat: token.iat,
      exp: token.exp,
      maxActivations: token.maxActivations,
    };
    
    const expectedSignature = signPayload(payload);
    
    if (token.signature !== expectedSignature) {
      return { valid: false, reason: 'Invalid signature' };
    }
    
    return { valid: true };
  } catch (error) {
    logger.error(`Token validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Sign a payload with HMAC-SHA256
 */
export function signPayload(payload: Omit<SignedToken, 'signature'>): string {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', OFFLINE_TOKEN_SECRET)
    .update(payloadString)
    .digest('hex');
}

/**
 * Create a signed token (server-side function, included for reference)
 */
export function createSignedToken(
  licenseId: string,
  hwid: string,
  maxActivations: number,
  expireDays: number = 7
): SignedToken {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    licenseId,
    hwid,
    iat: now,
    exp: now + (expireDays * 24 * 60 * 60),
    maxActivations,
  };
  
  const signature = signPayload(payload);
  
  return {
    ...payload,
    signature,
  };
}

/**
 * Get days remaining until token expires
 */
export function getTokenDaysRemaining(token: SignedToken): number {
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = token.exp - now;
  return Math.max(0, Math.floor(secondsRemaining / (24 * 60 * 60)));
}

export default validateSignedToken;
