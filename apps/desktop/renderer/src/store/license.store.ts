import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LicenseStatus, LicenseType } from '@video-uniqueizer/shared-types';

interface LicenseState {
  licenseKey: string | null;
  status: LicenseStatus | null;
  type: LicenseType | null;
  expiresAt: string | null;
  activationsRemaining: number;
  isOfflineMode: boolean;
  offlineTokenExpiry: string | null;
  setLicense: (data: {
    key: string;
    status: LicenseStatus;
    type: LicenseType;
    expiresAt?: string;
    activationsRemaining: number;
  }) => void;
  setOfflineMode: (active: boolean, expiry?: string) => void;
  clearLicense: () => void;
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set) => ({
      licenseKey: null,
      status: null,
      type: null,
      expiresAt: null,
      activationsRemaining: 0,
      isOfflineMode: false,
      offlineTokenExpiry: null,

      setLicense: (data) =>
        set({
          licenseKey: data.key,
          status: data.status,
          type: data.type,
          expiresAt: data.expiresAt || null,
          activationsRemaining: data.activationsRemaining,
          isOfflineMode: false,
        }),

      setOfflineMode: (active, expiry) =>
        set({
          isOfflineMode: active,
          offlineTokenExpiry: expiry || null,
        }),

      clearLicense: () =>
        set({
          licenseKey: null,
          status: null,
          type: null,
          expiresAt: null,
          activationsRemaining: 0,
          isOfflineMode: false,
          offlineTokenExpiry: null,
        }),
    }),
    {
      name: 'license-storage',
    }
  )
);
