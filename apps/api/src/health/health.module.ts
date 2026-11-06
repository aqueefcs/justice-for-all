import { Controller, Get, Module } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { HealthSchema, type Health } from '@jfa/shared';
import { AppConfig } from '../config/app-config.service';
import { Public } from '../common/decorators';

class HealthDto extends createZodDto(HealthSchema) {}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly config: AppConfig) {}

  /** Liveness only — deliberately does not touch the database (used by smoke tests). */
  @Get()
  @Public()
  @ApiOkResponse({ type: HealthDto })
  get(): Health {
    return {
      status: 'ok',
      version: this.config.get('APP_VERSION'),
      stage: this.config.get('STAGE'),
      time: new Date().toISOString(),
    };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
