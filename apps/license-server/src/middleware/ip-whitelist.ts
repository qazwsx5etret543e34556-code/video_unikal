import { FastifyRequest, FastifyReply } from 'fastify';

const ADMIN_IP_WHITELIST = (process.env.ADMIN_IP_WHITELIST || '127.0.0.1').split(',');

export async function ipWhitelistMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const clientIp = request.ip || request.socket.remoteAddress || '';
  
  // Normalize IP (handle IPv6 localhost)
  const normalizedIp = clientIp.replace(/^::ffff:/, '');
  
  if (!ADMIN_IP_WHITELIST.includes(normalizedIp) && !ADMIN_IP_WHITELIST.includes(clientIp)) {
    return reply.status(403).send({ 
      error: 'Forbidden',
      message: 'IP address not whitelisted' 
    });
  }
}
