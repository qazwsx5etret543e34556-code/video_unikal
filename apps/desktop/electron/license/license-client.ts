import axios, { AxiosInstance } from 'axios';
import type { 
  LicenseActivationRequest, 
  LicenseActivationResponse,
  LicenseValidationRequest,
  LicenseValidationResponse,
  LicenseDeactivationRequest,
} from '@video-uniqueizer/shared-types';
import logger from '../logger';

const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'https://license.videouniqueizer.com';

export class LicenseClient {
  private client: AxiosInstance;
  private timeout: number = 10000; // 10 seconds

  constructor() {
    this.client = axios.create({
      baseURL: LICENSE_SERVER_URL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.warn(`License server request failed: ${error.message}`);
        throw error;
      }
    );
  }

  /**
   * Activate a license key on this device
   */
  async activate(request: LicenseActivationRequest): Promise<LicenseActivationResponse> {
    try {
      const response = await this.client.post<LicenseActivationResponse>(
        '/api/v1/license/activate',
        request
      );
      
      logger.info(`License activated successfully: ${response.data.license?.id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`License activation failed: ${error.response?.status} ${error.response?.data}`);
        throw new Error(
          error.response?.data?.message || error.message || 'Activation failed'
        );
      }
      throw error;
    }
  }

  /**
   * Validate a license (with optional cached token for offline mode)
   */
  async validate(request: LicenseValidationRequest): Promise<LicenseValidationResponse> {
    try {
      const response = await this.client.post<LicenseValidationResponse>(
        '/api/v1/license/validate',
        request
      );
      
      logger.info(`License validated: ${response.data.valid}`);
      return response.data;
    } catch (error) {
      // For network errors, we'll handle offline mode in the validator
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || !error.response) {
          logger.warn('License server unreachable, will try offline mode');
          throw new Error('NETWORK_ERROR');
        }
        
        logger.error(`License validation failed: ${error.response?.status}`);
        throw new Error(
          error.response?.data?.message || error.message || 'Validation failed'
        );
      }
      throw error;
    }
  }

  /**
   * Deactivate a license on this device
   */
  async deactivate(request: LicenseDeactivationRequest): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post<{ success: boolean }>(
        '/api/v1/license/deactivate',
        request
      );
      
      logger.info(`License deactivated successfully`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`License deactivation failed: ${error.response?.status}`);
        throw new Error(
          error.response?.data?.message || error.message || 'Deactivation failed'
        );
      }
      throw error;
    }
  }

  /**
   * Check if license server is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/v1/health', {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default LicenseClient;
