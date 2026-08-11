import { FastifyInstance } from 'fastify';
import crypto from 'crypto';

export interface JWTPayload {
  id: string;
  username: string;
}

export async function jwtPlugin(fastify: FastifyInstance) {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

  fastify.decorate('jwtSign', (payload: JWTPayload) => {
    const token = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return {
      token,
      payload,
    };
  });

  fastify.decorate('jwtVerify', (token: string): JWTPayload | null => {
    try {
      // Simple JWT verification - in production use @fastify/jwt
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${parts[0]}.${parts[1]}`)
        .digest('hex');
      
      if (signature !== parts[2]) return null;
      
      return payload as JWTPayload;
    } catch {
      return null;
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    jwtSign: (payload: JWTPayload) => { token: string; payload: JWTPayload };
    jwtVerify: (token: string) => JWTPayload | null;
  }
}
