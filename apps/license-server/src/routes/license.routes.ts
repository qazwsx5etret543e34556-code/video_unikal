import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LicenseService } from '../services/license.service.js';
import { PrismaClient } from '@prisma/client';

interface ActivateBody {
  key: string;
  hwid: string;
  ipAddress?: string;
  userAgent?: string;
  osInfo?: string;
  appVersion?: string;
}

interface ValidateBody {
  key: string;
  hwid: string;
  signedToken?: string;
}

interface DeactivateBody {
  key: string;
  hwid: string;
  token?: string;
}

export async function licenseRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;
  const licenseService = new LicenseService(prisma);

  // POST /api/v1/license/activate
  fastify.post('/activate', async (
    request: FastifyRequest<{ Body: ActivateBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { key, hwid, ...rest } = request.body;

      if (!key || !hwid) {
        return reply.status(400).send({ error: 'Key and HWID are required' });
      }

      const result = await licenseService.activateLicense({
        key,
        hwid,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        ...rest,
      });

      if (!result.success) {
        return reply.status(400).send({ error: result.error });
      }

      return reply.send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Activation failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/v1/license/validate
  fastify.post('/validate', async (
    request: FastifyRequest<{ Body: ValidateBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { key, hwid, signedToken } = request.body;

      if (!key || !hwid) {
        return reply.status(400).send({ error: 'Key and HWID are required' });
      }

      const result = await licenseService.validateLicense(key, hwid, signedToken);

      if (!result.valid) {
        return reply.status(400).send({ error: result.error });
      }

      return reply.send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Validation failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/v1/license/deactivate
  fastify.post('/deactivate', async (
    request: FastifyRequest<{ Body: DeactivateBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { key, hwid } = request.body;

      if (!key || !hwid) {
        return reply.status(400).send({ error: 'Key and HWID are required' });
      }

      const result = await licenseService.deactivateLicense(key, hwid);

      if (!result.success) {
        return reply.status(400).send({ error: result.error });
      }

      return reply.send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Deactivation failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
