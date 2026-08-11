import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prismaPlugin } from './plugins/prisma.js';
import { jwtPlugin } from './plugins/jwt.js';
import { licenseRoutes } from './routes/license.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { healthRoutes } from './routes/health.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disable for API
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await fastify.register(prismaPlugin);
  await fastify.register(jwtPlugin);

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api/v1/health' });
  await fastify.register(licenseRoutes, { prefix: '/api/v1/license' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({ error: 'Validation failed', details: error.validation });
    }

    return reply.status(500).send({ error: 'Internal server error' });
  });

  return fastify;
}
