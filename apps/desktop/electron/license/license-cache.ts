import { app, safeStorage } from 'electron';
import getDatabase from '../db';
import type { SignedToken } from '@video-uniqueizer/shared-types';
import logger from '../logger';

const LICENSE_CACHE_KEY = 'license_cache_v1';

export interface CachedLicense {
  licenseKey: string;
  signedToken?: SignedToken;
  hwid: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Cache license data in both SQLite and Electron safeStorage
 * safeStorage is encrypted and OS-managed
 */
export class LicenseCache {
  async save(data: CachedLicense): Promise<void> {
    try {
      // Save to safeStorage (encrypted)
      const encrypted = safeStorage.encryptString(JSON.stringify(data));
      await safeStorage.setSecureValue(LICENSE_CACHE_KEY, encrypted);
      
      // Also save to SQLite for quick access
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO license_cache 
        (license_key, signed_token, hwid, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        data.licenseKey,
        data.signedToken ? JSON.stringify(data.signedToken) : null,
        data.hwid,
        data.expiresAt,
        data.createdAt
      );
      
      logger.info('License cache saved');
    } catch (error) {
      logger.error(`Failed to save license cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async load(): Promise<CachedLicense | null> {
    try {
      // Try safeStorage first
      const encrypted = await safeStorage.getSecureValue(LICENSE_CACHE_KEY);
      
      if (encrypted && encrypted.length > 0) {
        const decrypted = safeStorage.decryptString(encrypted);
        const data = JSON.parse(decrypted) as CachedLicense;
        
        // Check if still valid
        if (data.expiresAt > Date.now()) {
          logger.info('License cache loaded from safeStorage');
          return data;
        } else {
          logger.info('License cache expired');
          await this.clear();
          return null;
        }
      }
      
      // Fallback to SQLite
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM license_cache ORDER BY created_at DESC LIMIT 1');
      const row = stmt.get() as any;
      
      if (!row) {
        return null;
      }
      
      const data: CachedLicense = {
        licenseKey: row.license_key,
        signedToken: row.signed_token ? JSON.parse(row.signed_token) : undefined,
        hwid: row.hwid,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      };
      
      if (data.expiresAt > Date.now()) {
        logger.info('License cache loaded from SQLite');
        return data;
      } else {
        logger.info('License cache expired');
        await this.clear();
        return null;
      }
    } catch (error) {
      logger.error(`Failed to load license cache: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      await safeStorage.setSecureValue(LICENSE_CACHE_KEY, Buffer.from(''));
      
      const db = getDatabase();
      db.exec('DELETE FROM license_cache');
      
      logger.info('License cache cleared');
    } catch (error) {
      logger.error(`Failed to clear license cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if we have a valid cached token for offline mode
   */
  async isValidOffline(): Promise<boolean> {
    const cached = await this.load();
    
    if (!cached || !cached.signedToken) {
      return false;
    }
    
    // Check if token is not expired
    const now = Math.floor(Date.now() / 1000);
    return cached.signedToken.exp > now;
  }

  /**
   * Get days remaining until offline mode expires
   */
  async getOfflineDaysRemaining(): Promise<number> {
    const cached = await this.load();
    
    if (!cached || !cached.signedToken) {
      return 0;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = cached.signedToken.exp - now;
    return Math.max(0, Math.floor(secondsRemaining / (24 * 60 * 60)));
  }
}

export default new LicenseCache();
