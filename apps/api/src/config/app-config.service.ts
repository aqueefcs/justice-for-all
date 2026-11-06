import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env';

/** Typed access to validated config: `config.get('MONGODB_URI')`. */
@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get isLocal(): boolean {
    const stage = this.get('STAGE');
    return stage === 'local' || stage === 'test';
  }
}
