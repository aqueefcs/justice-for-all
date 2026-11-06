import { ServiceUnavailableException } from '@nestjs/common';
import { ERROR_CODES, type IntegrationName, type IntegrationStatus } from '@jfa/shared';

/** Every integration service implements this so the admin can see what is wired up. */
export interface Integration {
  status(): IntegrationStatus;
}

export function notConfigured(name: IntegrationName): never {
  throw new ServiceUnavailableException({
    code: ERROR_CODES.INTEGRATION_NOT_CONFIGURED,
    message: `Integration "${name}" is not configured yet`,
  });
}
