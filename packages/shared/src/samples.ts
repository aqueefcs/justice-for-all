import { PACK_SCHEMA_VERSION, type ContentPack } from './content-pack';

/**
 * SAMPLE CONTENT — NOT REVIEWED BY A LAWYER.
 *
 * Placeholder data so the first APK has something to show partners, and so the DB seed
 * has the same data. Every item must be replaced or approved by the legal team before
 * public release. `isSample: true` makes the app show a "Sample content" banner.
 *
 * Section texts are intentionally NOT reproduced here; the real bare-act text will be
 * imported from India Code (indiacode.nic.in) by the admin import script.
 */
const PENDING = 'SAMPLE — full text to be imported from India Code and reviewed by the legal team.';

export const SAMPLE_PACK_EN: ContentPack = {
  schemaVersion: PACK_SCHEMA_VERSION,
  locale: 'en',
  version: 1,
  generatedAt: '2026-11-06T00:00:00.000Z',
  isSample: true,
  categories: [
    { slug: 'police-fir', icon: 'shield-checkmark', order: 0, title: 'Police & FIR', description: 'FIR, GD, complaints and your rights with the police.' },
    { slug: 'family', icon: 'people', order: 1, title: 'Family', description: 'Marriage, maintenance, custody and domestic violence.' },
    { slug: 'property', icon: 'home', order: 2, title: 'Land & Property', description: 'Rent, ownership, mutation and disputes.' },
    { slug: 'consumer', icon: 'cart', order: 3, title: 'Consumer', description: 'Defective goods, poor services and refunds.' },
    { slug: 'work', icon: 'briefcase', order: 4, title: 'Work & Wages', description: 'Unpaid wages, workplace rights.' },
    { slug: 'rights', icon: 'ribbon', order: 5, title: 'Your Rights', description: 'RTI, free legal aid and fundamental rights.' },
  ],
  acts: [
    {
      slug: 'bns-2023',
      shortName: 'BNS',
      year: 2023,
      title: 'Bharatiya Nyaya Sanhita, 2023',
      summary: 'Replaced the Indian Penal Code (IPC) from 1 July 2024. Defines offences and punishments.',
      sourceUrl: 'https://www.indiacode.nic.in/',
      sections: [
        { number: '103', order: 0, title: 'Punishment for murder', text: PENDING, oldLawRefs: [{ act: 'IPC', section: '302' }] },
        { number: '318', order: 1, title: 'Cheating', text: PENDING, oldLawRefs: [{ act: 'IPC', section: '420' }] },
      ],
    },
    {
      slug: 'bnss-2023',
      shortName: 'BNSS',
      year: 2023,
      title: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      summary: 'Replaced the Code of Criminal Procedure (CrPC) from 1 July 2024. Covers FIR, arrest, bail and trial procedure.',
      sourceUrl: 'https://www.indiacode.nic.in/',
      sections: [
        { number: '173', order: 0, title: 'Information in cognizable cases (FIR)', text: PENDING, oldLawRefs: [{ act: 'CrPC', section: '154' }] },
      ],
    },
  ],
  articles: [
    {
      slug: 'what-is-free-legal-aid',
      categorySlug: 'rights',
      title: 'SAMPLE: What is free legal aid?',
      summary: 'Placeholder article — to be written by the legal team.',
      body: '<p>SAMPLE article. The legal team will explain who can get free legal aid and how to apply through Legal Services Authorities.</p>',
      tags: ['legal-aid'],
    },
  ],
  guides: [
    {
      slug: 'how-to-file-fir',
      type: 'fir',
      categorySlug: 'police-fir',
      title: 'SAMPLE: How to file an FIR',
      summary: 'Placeholder guide showing the step-by-step format. Steps must be written and reviewed by the legal team.',
      steps: [
        { title: 'Step 1 (sample)', body: 'Placeholder: where to go and what to say.' },
        { title: 'Step 2 (sample)', body: 'Placeholder: what details to give and what to check before signing.' },
        { title: 'Step 3 (sample)', body: 'Placeholder: getting your copy and what to do if the police refuse.' },
      ],
      checklist: ['Sample item: identity proof', 'Sample item: written description of the incident'],
      templateSlugs: ['police-complaint'],
      externalLinks: [],
    },
    {
      slug: 'how-to-file-gd',
      type: 'gd',
      categorySlug: 'police-fir',
      title: 'SAMPLE: How to make a GD (General Diary) entry',
      summary: 'Placeholder guide — to be written by the legal team.',
      steps: [
        { title: 'Step 1 (sample)', body: 'Placeholder step.' },
        { title: 'Step 2 (sample)', body: 'Placeholder step.' },
      ],
      checklist: [],
      templateSlugs: [],
      externalLinks: [],
    },
  ],
  templates: [
    {
      slug: 'police-complaint',
      categorySlug: 'police-fir',
      title: 'SAMPLE: Written complaint to police',
      summary: 'Fill in the form to create a printable PDF. Format to be finalised by the legal team.',
      fields: [
        { key: 'policeStation', type: 'text', required: true, maxLength: 120 },
        { key: 'fullName', type: 'text', required: true, maxLength: 120 },
        { key: 'address', type: 'multiline', required: true, maxLength: 500 },
        { key: 'phone', type: 'phone', required: false, maxLength: 15 },
        { key: 'incidentDate', type: 'date', required: true },
        { key: 'details', type: 'multiline', required: true, maxLength: 4000 },
      ],
      fieldLabels: {
        policeStation: 'Police station name',
        fullName: 'Your full name',
        address: 'Your address',
        phone: 'Phone number (optional)',
        incidentDate: 'Date of incident',
        details: 'What happened',
      },
      bodyHtml: `
<div style="font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 1.6; padding: 32px;">
  <p style="color:#b00;font-size:11px;">SAMPLE FORMAT — NOT REVIEWED BY A LAWYER</p>
  <p>To,<br/>The Station House Officer,<br/>{{policeStation}}</p>
  <p><strong>Subject:</strong> Complaint regarding incident on {{incidentDate}}</p>
  <p>Respected Sir/Madam,</p>
  <p>I, {{fullName}}, residing at {{address}}, wish to report the following:</p>
  <p>{{details}}</p>
  <p>I request you to take necessary action.</p>
  <p>Yours faithfully,<br/>{{fullName}}<br/>Phone: {{phone}}</p>
</div>`.trim(),
    },
  ],
};
