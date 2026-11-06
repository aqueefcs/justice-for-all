import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ZodValidationException } from 'nestjs-zod';
import { ERROR_CODES } from '@jfa/shared';
import { ErrorTrackingService } from '../integrations/error-tracking/error-tracking.service';

/**
 * Uniform error shape: `{ code, message, details? }`.
 * Never leaks stack traces or DB errors; unexpected errors are reported to error tracking.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  constructor(private readonly errorTracking: ErrorTrackingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as { issues?: Array<{ path: PropertyKey[]; message: string }> };
      return reply.status(HttpStatus.BAD_REQUEST).send({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Validation failed',
        details: (zodError.issues ?? []).map((i) => ({ path: i.path.map(String).join('.'), message: i.message })),
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'object' && body !== null && 'code' in body
          ? body
          : { code: defaultCode(status), message: typeof body === 'string' ? body : exception.message };
      return reply.status(status).send(payload);
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    this.errorTracking.captureException(exception);
    return reply
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send({ code: ERROR_CODES.INTERNAL, message: 'Internal server error' });
  }
}

function defaultCode(status: number) {
  switch (status) {
    case 400: return ERROR_CODES.VALIDATION_FAILED;
    case 401: return ERROR_CODES.UNAUTHENTICATED;
    case 403: return ERROR_CODES.FORBIDDEN;
    case 404: return ERROR_CODES.NOT_FOUND;
    case 409: return ERROR_CODES.CONFLICT;
    default: return status >= 500 ? ERROR_CODES.INTERNAL : `HTTP_${status}`;
  }
}
