import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_CODES } from '@jfa/shared';
import { isOriginVerified } from '../common/guards/origin-verify.guard';
import { toWebHeaders } from './auth.service';
import type { Auth } from './better-auth';

export const AUTH_BASE_PATH = '/v1/auth';

/**
 * Mounts Better Auth's web-standard handler on Fastify (Better Auth's Fastify integration
 * pattern; ADR 0007). These routes bypass Nest guards, so the Cloudflare origin lock is applied
 * here too. Better Auth handles its own validation, CSRF (trusted origins) and rate limiting.
 */
export function registerAuthRoutes(fastify: FastifyInstance, auth: Auth, originSecret: string | undefined) {
  fastify.route({
    method: ['GET', 'POST'],
    url: `${AUTH_BASE_PATH}/*`,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      if (!isOriginVerified(request.headers['x-origin-verify'], originSecret)) {
        return reply.status(403).send({ code: ERROR_CODES.FORBIDDEN, message: 'Forbidden' });
      }
      try {
        const url = new URL(request.url, `${request.protocol}://${request.headers.host ?? 'localhost'}`);
        const response = await auth.handler(
          new Request(url.toString(), {
            method: request.method,
            headers: toWebHeaders(request.headers),
            ...(request.body !== undefined && request.body !== null ? { body: JSON.stringify(request.body) } : {}),
          }),
        );

        reply.status(response.status);
        // Copy headers one by one, but Set-Cookie separately: Headers.forEach would merge
        // multiple cookies into one comma-joined value and break them.
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'set-cookie') reply.header(key, value);
        });
        const cookies = response.headers.getSetCookie();
        if (cookies.length > 0) reply.header('set-cookie', cookies);

        return reply.send(response.body ? await response.text() : null);
      } catch (err) {
        request.log.error({ err }, 'Better Auth handler failed');
        return reply.status(500).send({ code: ERROR_CODES.INTERNAL, message: 'Authentication error' });
      }
    },
  });
}
