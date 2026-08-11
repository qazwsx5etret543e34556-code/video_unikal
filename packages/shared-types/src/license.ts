/**
 * License System Types
 * Online licensing with offline grace period support
 */

export type LicenseType = 'ONE_TIME' | 'SUBSCRIPTION';
export type LicenseStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface LicenseKey {
  key: string; // XXXX-XXXX-XXXX-XXXX-XXXX format
  type: LicenseType;
  status: LicenseStatus;
  maxActivations: number;
  createdAt: string; // ISO date
  expiresAt?: string; // ISO date, undefined for one-time
  note?: string;
}

export interface LicenseActivation {
  id: string;
  licenseId: string;
  hwid: string; // Hardware ID hash
  ipAddress?: string;
  userAgent?: string;
  osInfo?: string;
  appVersion?: string;
  activatedAt: string; // ISO date
  lastSeenAt: string; // ISO date
}

export interface TokenPayload {
  licenseId: string;
  hwid: string;
  iat: number; // issued at (unix timestamp)
  exp: number; // expires at (unix timestamp)
  maxActivations: number;
  type: LicenseType;
}

export interface SignedToken {
  payload: TokenPayload;
  signature: string; // HMAC-SHA256 signature
}

export interface ValidateRequest {
  licenseKey: string;
  hwid: string;
  appVersion: string;
  osInfo: string;
  signedToken?: string; // For offline validation
}

export interface ValidateResponse {
  valid: boolean;
  license?: LicenseKey;
  signedToken?: string; // New token if server responded
  offlineGracePeriod?: boolean; // True if using cached token
  offlineExpiresAt?: string; // When offline token expires
  error?: string;
}

export interface ActivateRequest {
  key: string;
  hwid: string;
  appVersion: string;
  osInfo: string;
}

export interface ActivateResponse {
  success: boolean;
  token?: string;
  signedToken?: string;
  license?: LicenseKey;
  activation?: LicenseActivation;
  error?: string;
  errorCode?: 'ALREADY_ACTIVATED' | 'INVALID_KEY' | 'REVOKED' | 'EXPIRED' | 'MAX_ACTIVATIONS_REACHED';
}

export interface DeactivateRequest {
  key: string;
  hwid: string;
  token: string;
}

export interface DeactivateResponse {
  success: boolean;
  error?: string;
}

export interface LicenseCache {
  signedToken: string;
  tokenPayload: TokenPayload;
  cachedAt: number; // unix timestamp
  offlineExpiresAt: number; // unix timestamp
}

export const OFFLINE_TOKEN_DAYS = 7;
export const HEARTBEAT_INTERVAL_HOURS = 24;
export const MAX_OFFLINE_DAYS = 7;
