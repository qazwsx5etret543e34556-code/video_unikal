import { PrismaClient } from '@prisma/client';

export class ActivationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllActivations(options?: {
    page?: number;
    limit?: number;
    licenseId?: string;
  }) {
    const { page = 1, limit = 50, licenseId } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (licenseId) {
      where.licenseId = licenseId;
    }

    const [activations, total] = await Promise.all([
      this.prisma.activation.findMany({
        where,
        skip,
        take: limit,
        include: {
          license: true,
        },
        orderBy: { activatedAt: 'desc' },
      }),
      this.prisma.activation.count({ where }),
    ]);

    return {
      activations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteActivation(id: string) {
    return this.prisma.activation.delete({
      where: { id },
      include: {
        license: true,
      },
    });
  }

  async getActivationsByHwid(hwid: string) {
    return this.prisma.activation.findMany({
      where: { hwid },
      include: {
        license: true,
      },
    });
  }
}
