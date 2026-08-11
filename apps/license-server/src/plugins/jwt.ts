import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';

export interface JWTPayload {
  id: string;
  username: string;
}

async function jwtPlugin(fastify: FastifyInstance) {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production-min-32-chars';

  await fastify.register(fastifyJwt, {
    secret,
    sign: {
      expiresIn: '24h',
    },
  });

  fastify.decorate('jwtSign', async (payload: JWTPayload) => {
    const token = await fastify.jwt.sign(payload);
    return { token, payload };
  });

  fastify.decorate('jwtVerify', async (token: string): Promise<JWTPayload | null> => {
    try {
      const decoded = await fastify.jwt.verify(token);
      return decoded as JWTPayload;
    } catch {
      return null;
    }
  });
}

export default fp(jwtPlugin);

declare module 'fastify' {
  interface FastifyInstance {
    jwtSign: (payload: JWTPayload) => Promise<{ token: string; payload: JWTPayload }>;
    jwtVerify: (token: string) => Promise<JWTPayload | null>;
    jwt: typeof import('@fastify/jwt').default;
  }
}
