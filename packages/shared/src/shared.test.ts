import { describe, expect, it } from 'vitest';
import {
  ContentPackSchema,
  GuideSchema,
  SAMPLE_PACK_EN,
  fillTemplate,
  hasUnsafeMongoKeys,
} from './index';

describe('hasUnsafeMongoKeys', () => {
  it('rejects $-operators at any depth', () => {
    expect(hasUnsafeMongoKeys({ slug: { $ne: null } })).toBe(true);
    expect(hasUnsafeMongoKeys({ a: [{ b: { $where: '1' } }] })).toBe(true);
    expect(hasUnsafeMongoKeys({ 'a.b': 1 })).toBe(true);
  });
  it('accepts plain data', () => {
    expect(hasUnsafeMongoKeys({ slug: 'fir', tags: ['a'], n: { x: 1 } })).toBe(false);
  });
});

describe('fillTemplate', () => {
  it('fills placeholders and escapes HTML', () => {
    expect(fillTemplate('<p>{{name}}</p>', { name: '<b>Ravi</b>' })).toBe(
      '<p>&lt;b&gt;Ravi&lt;/b&gt;</p>',
    );
  });
  it('blanks unknown keys', () => {
    expect(fillTemplate('{{missing}}!', {})).toBe('!');
  });
});

describe('schemas', () => {
  it('sample pack is valid and marked as sample', () => {
    const pack = ContentPackSchema.parse(SAMPLE_PACK_EN);
    expect(pack.isSample).toBe(true);
  });
  it('guide requires an English translation', () => {
    const result = GuideSchema.safeParse({
      slug: 'x-guide',
      type: 'fir',
      categorySlug: 'police-fir',
      translations: { hi: { title: 'x', summary: 'y', steps: [{ title: 'a', body: 'b' }] } },
    });
    expect(result.success).toBe(false);
  });
});
