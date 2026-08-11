import crypto from 'crypto';

const OFFLINE_TOKEN_SECRET = process.env.OFFLINE_TOKEN_SECRET || 'change-this-to-a-secure-random-string-at-least-64-characters-long-in-production';

export interface OfflineTokenPayload {
  licenseId: string;
  hwid: string;
  iat: number;
  exp: number;
  maxActivations: number;
}

export function signOfflineToken(payload: OfflineTokenPayload): string {
  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', OFFLINE_TOKEN_SECRET)
    .update(data)
    .digest('hex');
  
  return `${data}.${signature}`;
}

export function verifyOfflineToken(token: string): OfflineTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [dataStr, signature] = parts;
    const payload = JSON.parse(dataStr) as OfflineTokenPayload;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', OFFLINE_TOKEN_SECRET)
      .update(dataStr)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export function createOfflineToken(
  licenseId: string,
  hwid: string,
  maxActivations: number,
  days: number = 7
): string {
  const now = Math.floor(Date.now() / 1000);
  
  const payload: OfflineTokenPayload = {
    licenseId,
    hwid,
    iat: now,
    exp: now + (days * 24 * 60 * 60),
    maxActivations,
  };
  
  return signOfflineToken(payload);
}
