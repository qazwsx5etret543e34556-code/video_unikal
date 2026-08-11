import { PrismaClient, LicenseType, LicenseStatus } from '@prisma/client';
import { createOfflineToken } from './token-signer.js';
import { generateLicenseKey, normalizeLicenseKey } from './key-generator.js';

interface ActivateLicenseInput {
  key: string;
  hwid: string;
  ipAddress?: string;
  userAgent?: string;
  osInfo?: string;
  appVersion?: string;
}

interface ActivationResult {
  success: boolean;
  token?: string;
  signedToken?: string;
  license?: any;
  error?: string;
}

export class LicenseService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async activateLicense(input: ActivateLicenseInput): Promise<ActivationResult> {
    const normalizedKey = normalizeLicenseKey(input.key);

    try {
      const license = await this.prisma.license.findUnique({
        where: { key: normalizedKey },
        include: {
          activations: true,
        },
      });

      if (!license) {
        return { success: false, error: 'Invalid license key' };
      }

      if (license.status !== LicenseStatus.ACTIVE) {
        return { success: false, error: 'License is not active' };
      }

      if (license.expiresAt && license.expiresAt < new Date()) {
        return { success: false, error: 'License has expired' };
      }

      // Check if already activated on this device
      let activation = license.activations.find(a => a.hwid === input.hwid);

      if (!activation) {
        // Check if max activations reached
        if (license.activations.length >= license.maxActivations) {
          return { 
            success: false, 
            error: `Maximum activations (${license.maxActivations}) reached` 
          };
        }

        // Create new activation
        activation = await this.prisma.activation.create({
          data: {
            licenseId: license.id,
            hwid: input.hwid,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            osInfo: input.osInfo,
            appVersion: input.appVersion,
          },
        });
      } else {
        // Update last seen
        await this.prisma.activation.update({
          where: { id: activation.id },
          data: {
            lastSeenAt: new Date(),
            ipAddress: input.ipAddress || undefined,
            userAgent: input.userAgent || undefined,
            appVersion: input.appVersion || undefined,
          },
        });
      }

      // Generate offline token
      const offlineDays = parseInt(process.env.OFFLINE_TOKEN_DAYS || '7');
      const signedToken = createOfflineToken(
        license.id,
        input.hwid,
        license.maxActivations,
        offlineDays
      );

      return {
        success: true,
        token: crypto.randomUUID(),
        signedToken,
        license: {
          id: license.id,
          key: license.key,
          type: license.type,
          maxActivations: license.maxActivations,
          expiresAt: license.expiresAt,
          activatedAt: new Date(),
        },
      };
    } catch (error) {
      console.error('License activation error:', error);
      return { success: false, error: 'Activation failed' };
    }
  }

  async validateLicense(key: string, hwid: string, signedToken?: string) {
    const normalizedKey = normalizeLicenseKey(key);

    try {
      const license = await this.prisma.license.findUnique({
        where: { key: normalizedKey },
        include: {
          activations: true,
        },
      });

      if (!license) {
        return { valid: false, error: 'Invalid license key' };
      }

      if (license.status !== LicenseStatus.ACTIVE) {
        return { valid: false, error: 'License is not active' };
      }

      if (license.expiresAt && license.expiresAt < new Date()) {
        return { valid: false, error: 'License has expired' };
      }

      const activation = license.activations.find(a => a.hwid === hwid);

      if (!activation) {
        return { valid: false, error: 'Device not activated' };
      }

      // Update last seen
      await this.prisma.activation.update({
        where: { id: activation.id },
        data: { lastSeenAt: new Date() },
      });

      // Generate new offline token
      const offlineDays = parseInt(process.env.OFFLINE_TOKEN_DAYS || '7');
      const newSignedToken = createOfflineToken(
        license.id,
        hwid,
        license.maxActivations,
        offlineDays
      );

      return {
        valid: true,
        license: {
          id: license.id,
          key: license.key,
          type: license.type,
          maxActivations: license.maxActivations,
          expiresAt: license.expiresAt,
        },
        signedToken: newSignedToken,
      };
    } catch (error) {
      console.error('License validation error:', error);
      return { valid: false, error: 'Validation failed' };
    }
  }

  async deactivateLicense(key: string, hwid: string) {
    const normalizedKey = normalizeLicenseKey(key);

    try {
      const license = await this.prisma.license.findUnique({
        where: { key: normalizedKey },
        include: {
          activations: true,
        },
      });

      if (!license) {
        return { success: false, error: 'Invalid license key' };
      }

      const activation = license.activations.find(a => a.hwid === hwid);

      if (!activation) {
        return { success: false, error: 'Activation not found' };
      }

      await this.prisma.activation.delete({
        where: { id: activation.id },
      });

      return { success: true };
    } catch (error) {
      console.error('Deactivation error:', error);
      return { success: false, error: 'Deactivation failed' };
    }
  }

  async getAllLicenses(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: LicenseStatus;
    type?: LicenseType;
  }) {
    const { page = 1, limit = 20, search, status, type } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.key = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [licenses, total] = await Promise.all([
      this.prisma.license.findMany({
        where,
        skip,
        take: limit,
        include: {
          activations: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.license.count({ where }),
    ]);

    return {
      licenses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createLicense(data: {
    type: LicenseType;
    maxActivations?: number;
    expiresAt?: Date;
    note?: string;
  }) {
    const key = generateLicenseKey();

    return this.prisma.license.create({
      data: {
        key,
        type: data.type,
        maxActivations: data.maxActivations || 2,
        expiresAt: data.expiresAt,
        note: data.note,
      },
    });
  }

  async revokeLicense(id: string) {
    return this.prisma.license.update({
      where: { id },
      data: { status: LicenseStatus.REVOKED },
    });
  }

  async deleteLicense(id: string) {
    return this.prisma.license.delete({
      where: { id },
    });
  }
}
