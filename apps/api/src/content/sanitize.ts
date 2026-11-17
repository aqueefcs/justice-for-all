import sanitizeHtml from 'sanitize-html';
import type { Locale } from '@jfa/shared';

/** Rich text written in the CMS (article bodies): structure and links only. */
const ARTICLE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'a', 'br', 'blockquote'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['https', 'mailto', 'tel'],
  transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
};

/**
 * Letter templates are rendered to PDF on the phone, so they may keep simple layout styles.
 * `{{placeholders}}` are plain text and survive sanitising.
 */
const TEMPLATE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['div', 'p', 'span', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'br', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
  allowedAttributes: { '*': ['style'] },
  allowedStyles: {
    '*': {
      'font-family': [/^[\w\s"',-]+$/],
      'font-size': [/^\d+(?:px|pt|em|%)$/],
      'font-weight': [/^(?:normal|bold|\d00)$/],
      'line-height': [/^[\d.]+(?:px|em|%)?$/],
      'text-align': [/^(?:left|right|center|justify)$/],
      color: [/^#[0-9a-f]{3,6}$/i],
      padding: [/^[\d\s.]+(?:px|pt|em)?(?:\s[\d.]+(?:px|pt|em)?)*$/],
      margin: [/^[\d\s.]+(?:px|pt|em)?(?:\s[\d.]+(?:px|pt|em)?)*$/],
      'margin-top': [/^\d+(?:px|pt|em)$/],
    },
  },
  allowedSchemes: [],
};

type WithTranslations = { translations?: Partial<Record<Locale, Record<string, unknown> | undefined>> };

/** Returns a copy with `field` sanitised in every locale's translation. */
function sanitizeTranslationField<T extends WithTranslations>(input: T, field: string, options: sanitizeHtml.IOptions): T {
  if (!input.translations) return input;
  const translations: Record<string, unknown> = {};
  for (const [locale, t] of Object.entries(input.translations)) {
    translations[locale] = t && typeof t[field] === 'string' ? { ...t, [field]: sanitizeHtml(t[field] as string, options) } : t;
  }
  return { ...input, translations } as T;
}

export const sanitizeArticle = <T extends WithTranslations>(input: T) => sanitizeTranslationField(input, 'body', ARTICLE_OPTIONS);
export const sanitizeTemplate = <T extends WithTranslations>(input: T) => sanitizeTranslationField(input, 'bodyHtml', TEMPLATE_OPTIONS);
