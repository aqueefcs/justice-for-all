import { Injectable } from '@nestjs/common';
import type { IntegrationStatus, Locale } from '@jfa/shared';
import { AppConfig } from '../../config/app-config.service';
import { notConfigured, type Integration } from '../integration';

/**
 * PLACEHOLDER — Bhashini (Govt. of India) / IndicTrans2 machine translation.
 * Output is ALWAYS saved as a `draft` translation; a lawyer must review before publishing.
 * TODO: Bhashini ULCA pipeline: get pipeline config (userID + ulcaApiKey), then call the
 * translation endpoint with sourceLanguage=en, targetLanguage=<locale>.
 */
@Injectable()
export class TranslationService implements Integration {
  constructor(private readonly config: AppConfig) {}

  status(): IntegrationStatus {
    return {
      name: 'translation',
      provider: 'Bhashini',
      configured: Boolean(this.config.get('BHASHINI_USER_ID') && this.config.get('BHASHINI_API_KEY')),
      phase: 'phase2',
    };
  }

  async translateDraft(_texts: string[], _target: Locale): Promise<string[]> {
    notConfigured('translation');
  }
}
