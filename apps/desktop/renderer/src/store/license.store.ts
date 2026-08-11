import { create } from 'zustand';
import type { LicenseInfo, SignedToken } from '@video-uniqueizer/shared-types';

interface LicenseState {
  license: LicenseInfo | null;
  signedToken: SignedToken | null;
  isActive: boolean;
  isLoading: boolean;
  offlineDaysRemaining: number;
  error: string | null;
  
  // Actions
  setLicense: (license: LicenseInfo | null) => void;
  setSignedToken: (token: SignedToken | null) => void;
  setIsActive: (active: boolean) => void;
  setLoading: (loading: boolean) => void;
  setOfflineDays: (days: number) => void;
  setError: (error: string | null) => void;
  clearLicense: () => void;
}

export const useLicenseStore = create<LicenseState>((set) => ({
  license: null,
  signedToken: null,
  isActive: false,
  isLoading: true,
  offlineDaysRemaining: 0,
  error: null,
  
  setLicense: (license) => set({ license }),
  setSignedToken: (token) => set({ signedToken: token }),
  setIsActive: (isActive) => set({ isActive }),
  setLoading: (isLoading) => set({ isLoading }),
  setOfflineDays: (offlineDaysRemaining) => set({ offlineDaysRemaining }),
  setError: (error) => set({ error }),
  
  clearLicense: () => set({
    license: null,
    signedToken: null,
    isActive: false,
    offlineDaysRemaining: 0,
    error: null,
  }),
}));

export default useLicenseStore;
