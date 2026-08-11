/**
 * API Types
 * HTTP request/response types for license server and admin panel
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number; // seconds
  timestamp: string; // ISO date
  database?: 'connected' | 'disconnected';
}

// Admin Auth
export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  admin?: {
    id: string;
    username: string;
    lastLoginAt?: string;
  };
  error?: string;
}

export interface AdminAuthMiddleware {
  adminId: string;
  username: string;
}

// License Management
export interface ListLicensesRequest {
  page: number;
  limit: number;
  search?: string;
  status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  type?: 'ONE_TIME' | 'SUBSCRIPTION';
  sortBy?: 'createdAt' | 'updatedAt' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListLicensesResponse {
  licenses: LicenseSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LicenseSummary {
  id: string;
  key: string;
  type: 'ONE_TIME' | 'SUBSCRIPTION';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  maxActivations: number;
  activeActivations: number;
  createdAt: string;
  expiresAt?: string;
  note?: string;
}

export interface CreateLicenseRequest {
  type: 'ONE_TIME' | 'SUBSCRIPTION';
  maxActivations?: number;
  expiresInDays?: number; // For subscription
  note?: string;
}

export interface CreateLicenseResponse {
  success: boolean;
  license?: LicenseSummary;
  error?: string;
}

export interface UpdateLicenseRequest {
  status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  maxActivations?: number;
  note?: string;
  expiresInDays?: number;
}

export interface RegenerateKeyResponse {
  success: boolean;
  newKey?: string;
  error?: string;
}

// Activation Management
export interface ListActivationsRequest {
  page: number;
  limit: number;
  licenseId?: string;
  hwid?: string;
}

export interface ListActivationsResponse {
  activations: ActivationDetails[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ActivationDetails {
  id: string;
  licenseId: string;
  licenseKey: string;
  hwid: string;
  ipAddress?: string;
  userAgent?: string;
  osInfo?: string;
  appVersion?: string;
  activatedAt: string;
  lastSeenAt: string;
}

export interface ForceDeactivateResponse {
  success: boolean;
  error?: string;
}

// Stats
export interface DashboardStats {
  totalLicenses: number;
  activeLicenses: number;
  revokedLicenses: number;
  expiredLicenses: number;
  totalActivations: number;
  activeActivations: number;
  licensesToday: number;
  licensesThisWeek: number;
  licensesThisMonth: number;
  revenue?: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  ip?: string;
  adminUsername?: string;
  createdAt: string;
}

export interface ListAuditLogRequest {
  page: number;
  limit: number;
  action?: string;
  adminId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListAuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  totalPages: number;
}

// API Routes
export const API_ROUTES = {
  // Public
  health: '/api/v1/health',
  licenseActivate: '/api/v1/license/activate',
  licenseValidate: '/api/v1/license/validate',
  licenseDeactivate: '/api/v1/license/deactivate',
  
  // Admin
  adminLogin: '/api/admin/auth/login',
  adminLicenses: '/api/admin/licenses',
  adminLicense: (id: string) => `/api/admin/licenses/${id}`,
  adminLicenseRegenerate: (id: string) => `/api/admin/licenses/${id}/regenerate`,
  adminActivations: '/api/admin/activations',
  adminActivation: (id: string) => `/api/admin/activations/${id}`,
  adminStats: '/api/admin/stats',
  adminAuditLog: '/api/admin/audit-log',
} as const;
