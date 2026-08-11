import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LicenseService } from '../services/license.service.js';
import { ActivationService } from '../services/activation.service.js';
import argon2 from 'argon2';

interface LoginBody {
  username: string;
  password: string;
}

interface JWTPayload {
  id: string;
  username: string;
}

export async function adminRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;
  const licenseService = new LicenseService(prisma);
  const activationService = new ActivationService(prisma);

  // POST /api/admin/auth/login
  fastify.post('/auth/login', async (
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) => {
    try {
      const { username, password } = request.body;

      if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password required' });
      }

      const admin = await prisma.admin.findUnique({ where: { username } });

      if (!admin) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const valid = await argon2.verify(admin.passwordHash, password);

      if (!valid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT using the decorated method
      const jwtResult = await fastify.jwtSign({
        id: admin.id,
        username: admin.username,
      } as JWTPayload);

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'ADMIN_LOGIN',
          details: { username, ip: request.ip },
          ip: request.ip,
        },
      });

      return reply.send({ token: jwtResult.token, username: admin.username });
    } catch (error) {
      fastify.log.error({ error }, 'Login failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Apply auth middleware to protected routes
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    try {
      const payload = await fastify.jwtVerify(token);
      if (!payload) {
        return reply.status(401).send({ error: 'Invalid token' });
      }
      (request as any).user = payload;
    } catch (error) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // GET /api/admin/licenses
  fastify.get('/licenses', async (
    request: FastifyRequest<{ Querystring: Record<string, string> }>,
    reply: FastifyReply
  ) => {
    try {
      const { page, limit, search, status, type } = request.query;

      const result = await licenseService.getAllLicenses({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        search,
        status: status as any,
        type: type as any,
      });

      return reply.send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Get licenses failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/admin/licenses
  fastify.post('/licenses', async (
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
  ) => {
    try {
      const { type, maxActivations, expiresAt, note } = request.body;

      if (!type) {
        return reply.status(400).send({ error: 'License type required' });
      }

      const license = await licenseService.createLicense({
        type,
        maxActivations,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        note,
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'LICENSE_CREATE',
          details: { licenseId: license.id, key: license.key },
          ip: request.ip,
        },
      });

      return reply.send(license);
    } catch (error) {
      fastify.log.error({ error }, 'Create license failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // PATCH /api/admin/licenses/:id
  fastify.patch('/licenses/:id', async (
    request: FastifyRequest<{ Params: { id: string }; Body: any }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const { status, note, maxActivations, expiresAt } = request.body;

      const license = await prisma.license.update({
        where: { id },
        data: {
          status,
          note,
          maxActivations,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'LICENSE_UPDATE',
          details: { licenseId: id, ...request.body },
          ip: request.ip,
        },
      });

      return reply.send(license);
    } catch (error) {
      fastify.log.error({ error }, 'Update license failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // DELETE /api/admin/licenses/:id
  fastify.delete('/licenses/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;

      await licenseService.deleteLicense(id);

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'LICENSE_DELETE',
          details: { licenseId: id },
          ip: request.ip,
        },
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error({ error }, 'Delete license failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/admin/licenses/:id/revoke
  fastify.post('/licenses/:id/revoke', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;

      const license = await licenseService.revokeLicense(id);

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'LICENSE_REVOKE',
          details: { licenseId: id },
          ip: request.ip,
        },
      });

      return reply.send(license);
    } catch (error) {
      fastify.log.error({ error }, 'Revoke license failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/admin/licenses/:id/regenerate
  fastify.post('/licenses/:id/regenerate', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;

      const license = await licenseService.regenerateKey(id);

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'LICENSE_REGENERATE',
          details: { licenseId: id },
          ip: request.ip,
        },
      });

      return reply.send(license);
    } catch (error) {
      fastify.log.error({ error }, 'Regenerate license key failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/admin/activations
  fastify.get('/activations', async (
    request: FastifyRequest<{ Querystring: Record<string, string> }>,
    reply: FastifyReply
  ) => {
    try {
      const { page, limit, licenseId } = request.query;

      const result = await activationService.getAllActivations({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        licenseId,
      });

      return reply.send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Get activations failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // DELETE /api/admin/activations/:id
  fastify.delete('/activations/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;

      const activation = await activationService.deleteActivation(id);

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'ACTIVATION_DELETE',
          details: { activationId: id, licenseId: activation.licenseId },
          ip: request.ip,
        },
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error({ error }, 'Delete activation failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/admin/stats
  fastify.get('/stats', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const [
        totalLicenses,
        activeLicenses,
        totalActivations,
      ] = await Promise.all([
        prisma.license.count(),
        prisma.license.count({ where: { status: 'ACTIVE' } }),
        prisma.activation.count(),
      ]);

      return reply.send({
        totalLicenses,
        activeLicenses,
        totalActivations,
        totalRevenue: 0, // Calculate based on your pricing
      });
    } catch (error) {
      fastify.log.error({ error }, 'Get stats failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/admin/audit-log
  fastify.get('/audit-log', async (
    request: FastifyRequest<{ Querystring: Record<string, string> }>,
    reply: FastifyReply
  ) => {
    try {
      const { page, limit, action } = request.query;

      const where: any = {};
      if (action) {
        where.action = action;
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip: (page ? parseInt(page) - 1 : 0) * (limit ? parseInt(limit) : 50),
          take: limit ? parseInt(limit) : 50,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return reply.send({ logs, total, page: page ? parseInt(page) : 1 });
    } catch (error) {
      fastify.log.error({ error }, 'Get audit log failed');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
