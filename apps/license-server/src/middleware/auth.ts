import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = request.server.jwtVerify(token);
    
    if (!payload) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    request.user = payload;
  } catch (error) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      username: string;
    };
  }
}
