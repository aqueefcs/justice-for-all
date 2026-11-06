import { describe, expect, it } from 'vitest';
import { buildPack, pickTranslation } from './pack-builder';

const published = (fields: Record<string, unknown>) => ({ ...fields, status: 'published' });

describe('pickTranslation', () => {
  it('uses the locale when published, else falls back to English', () => {
    const doc = { translations: { en: published({ title: 'EN' }), hi: { title: 'HI', status: 'draft' } } };
    expect(pickTranslation(doc, 'hi')?.title).toBe('EN');
    const doc2 = { translations: { en: published({ title: 'EN' }), hi: published({ title: 'HI' }) } };
    expect(pickTranslation(doc2, 'hi')?.title).toBe('HI');
  });
  it('skips items without any published translation', () => {
    expect(pickTranslation({ translations: { en: { title: 'x', status: 'draft' } } }, 'en')).toBeUndefined();
  });
});

describe('buildPack', () => {
  it('builds a valid pack and propagates the sample flag', () => {
    const pack = buildPack(
      {
        categories: [{ slug: 'police-fir', icon: 'shield', order: 0, isSample: true, translations: { en: published({ title: 'Police' }) } }],
        acts: [{ slug: 'bns-2023', shortName: 'BNS', year: 2023, translations: { en: published({ title: 'BNS' }) } }],
        sections: [
          { actSlug: 'bns-2023', number: '318', order: 1, oldLawRefs: [{ act: 'IPC', section: '420' }], translations: { en: published({ title: 'Cheating', text: '' }) } },
          { actSlug: 'bns-2023', number: '103', order: 0, oldLawRefs: [], translations: { en: published({ title: 'Murder', text: '' }) } },
        ],
        articles: [],
        guides: [
          { slug: 'how-to-file-fir', type: 'fir', categorySlug: 'police-fir', translations: { en: published({ title: 'FIR', summary: 's', steps: [{ title: 'a', body: 'b' }] }) } },
        ],
        templates: [],
      },
      'hi',
      3,
      new Date('2026-01-01T00:00:00Z'),
    );
    expect(pack.version).toBe(3);
    expect(pack.locale).toBe('hi');
    expect(pack.isSample).toBe(true);
    expect(pack.acts[0]?.sections.map((s) => s.number)).toEqual(['103', '318']);
    expect(pack.guides[0]?.title).toBe('FIR');
  });
});
