import { useEffect, useState } from 'react';
import { useLicenseStore } from '../store/license.store';

interface IpcListener {
  removeListener: () => void;
}

export function useLicense() {
  const license = useLicenseStore((state) => state.license);
  const isActive = useLicenseStore((state) => state.isActive);
  const isLoading = useLicenseStore((state) => state.isLoading);
  const offlineDays = useLicenseStore((state) => state.offlineDaysRemaining);
  const error = useLicenseStore((state) => state.error);
  
  const setLicense = useLicenseStore((state) => state.setLicense);
  const setIsActive = useLicenseStore((state) => state.setIsActive);
  const setLoading = useLicenseStore((state) => state.setLoading);
  const setOfflineDays = useLicenseStore((state) => state.setOfflineDays);
  const setError = useLicenseStore((state) => state.setError);

  const activate = async (licenseKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      // IPC call to activate license
      const result = await (window as any).electron.activateLicense(licenseKey);
      
      if (result.success) {
        setLicense(result.license);
        setIsActive(true);
        return { success: true };
      } else {
        setError(result.error || 'Activation failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Activation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const result = await (window as any).electron.deactivateLicense();
      
      if (result.success) {
        setLicense(null);
        setIsActive(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deactivation failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      setLoading(true);
      const result = await (window as any).electron.checkLicenseStatus();
      
      if (result.valid) {
        setLicense(result.license);
        setIsActive(true);
        setOfflineDays(result.offlineDays || 0);
        setError(null);
      } else {
        setIsActive(false);
        setError(result.error || 'License invalid');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status check failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    license,
    isActive,
    isLoading,
    offlineDays,
    error,
    activate,
    deactivate,
    checkStatus,
  };
}

export default useLicense;
