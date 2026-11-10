import { PACK_SCHEMA_VERSION, type ContentPack } from './content-pack';

/**
 * STARTER CONTENT — prepared from official sources, AWAITING REVIEW BY THE LEGAL PANEL.
 *
 * Written in plain language from the Bharatiya Nyaya Sanhita 2023 (BNS), the Bharatiya Nagarik
 * Suraksha Sanhita 2023 (BNSS), the Right to Information Act 2005, the Legal Services Authorities
 * Act 1987, the Consumer Protection Act 2019 and the Protection of Women from Domestic Violence
 * Act 2005. Section `text` fields are SUMMARIES, not the official wording — the official text is
 * on India Code (indiacode.nic.in) and will be imported by the admin import script.
 *
 * `isSample: true` keeps the "awaiting lawyer review" banner visible until a panel lawyer approves
 * each item in the admin review workflow (CLAUDE.md rule 2). Used by the mobile app's bundled pack
 * and by the DB seed.
 */
const SUMMARY = 'Summary (not the official wording): ';
const INDIA_CODE = 'https://www.indiacode.nic.in/';

export const SAMPLE_PACK_EN: ContentPack = {
  schemaVersion: PACK_SCHEMA_VERSION,
  locale: 'en',
  version: 2,
  generatedAt: '2026-11-10T00:00:00.000Z',
  isSample: true,

  // -------------------------------------------------------------------------
  categories: [
    { slug: 'police-fir', icon: 'shield-checkmark', order: 0, title: 'Police & FIR', description: 'FIR, GD entries, complaints and your rights with the police.' },
    { slug: 'family', icon: 'people', order: 1, title: 'Family & Women', description: 'Domestic violence, protection and help for women and children.' },
    { slug: 'property', icon: 'home', order: 2, title: 'Home & Rent', description: 'Renting, deposits, eviction and problems with a landlord.' },
    { slug: 'consumer', icon: 'cart', order: 3, title: 'Consumer', description: 'Faulty products, poor service and getting your money back.' },
    { slug: 'work', icon: 'briefcase', order: 4, title: 'Work & Wages', description: 'Unpaid wages and help from the labour department.' },
    { slug: 'rights', icon: 'ribbon', order: 5, title: 'Your Rights', description: 'Free legal aid, rights on arrest and the Right to Information.' },
  ],

  // -------------------------------------------------------------------------
  acts: [
    {
      slug: 'bns-2023',
      shortName: 'BNS',
      year: 2023,
      title: 'Bharatiya Nyaya Sanhita, 2023',
      summary: 'India’s main criminal law. It replaced the Indian Penal Code (IPC) from 1 July 2024 and lists offences and their punishments.',
      sourceUrl: INDIA_CODE,
      sections: [
        {
          number: '103',
          order: 0,
          title: 'Punishment for murder',
          text: `${SUMMARY}Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. When a group of five or more people acting together commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any similar ground, each member of the group faces the same punishment.`,
          plainExplanation: 'Murder carries the heaviest punishments in the law. The BNS also names murder by a mob, targeted because of who the victim is, as a separate serious crime.',
          oldLawRefs: [{ act: 'IPC', section: '302' }],
        },
        {
          number: '115',
          order: 1,
          title: 'Voluntarily causing hurt',
          text: `${SUMMARY}Causing bodily pain, disease or infirmity to another person on purpose is “voluntarily causing hurt”. Punishment: imprisonment up to one year, or fine up to ten thousand rupees, or both (unless a more specific section applies).`,
          plainExplanation: 'If someone hits or injures you on purpose, it is an offence. Get medical treatment first and keep the medical papers — they are important proof.',
          oldLawRefs: [{ act: 'IPC', section: '321' }, { act: 'IPC', section: '323' }],
        },
        {
          number: '303',
          order: 2,
          title: 'Theft',
          text: `${SUMMARY}Dishonestly taking movable property out of someone’s possession without their consent is theft. Punishment: imprisonment up to three years, or fine, or both. A second or later conviction attracts rigorous imprisonment of at least one year and up to five years, with fine. For a first theft of property worth less than five thousand rupees, where the property is returned or its value restored, the court may order community service.`,
          plainExplanation: 'Taking something that belongs to someone else without permission is theft. Report it to the police — theft is a crime for which an FIR is registered.',
          oldLawRefs: [{ act: 'IPC', section: '378' }, { act: 'IPC', section: '379' }],
        },
        {
          number: '318',
          order: 3,
          title: 'Cheating',
          text: `${SUMMARY}Deceiving a person to dishonestly make them hand over property, or do something they would not otherwise do that harms them, is cheating. Punishment: imprisonment up to three years, or fine, or both. Cheating that dishonestly makes a person hand over property or valuable security can be punished with imprisonment up to seven years and fine.`,
          plainExplanation: 'If someone tricks you into giving money or property — for example a fake job offer or a fake sale — it may be cheating. Keep all messages, receipts and payment records.',
          oldLawRefs: [{ act: 'IPC', section: '415' }, { act: 'IPC', section: '420' }],
        },
      ],
    },
    {
      slug: 'bnss-2023',
      shortName: 'BNSS',
      year: 2023,
      title: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      summary: 'The law on criminal procedure. It replaced the Code of Criminal Procedure (CrPC) from 1 July 2024 and covers FIRs, arrest, bail and trials.',
      sourceUrl: INDIA_CODE,
      sections: [
        {
          number: '38',
          order: 0,
          title: 'Right to meet an advocate during interrogation',
          text: `${SUMMARY}A person who is arrested and interrogated by the police is entitled to meet an advocate of their choice during interrogation, though not throughout the entire interrogation.`,
          plainExplanation: 'If you are arrested, you can ask to meet your lawyer while the police are questioning you.',
          oldLawRefs: [{ act: 'CrPC', section: '41D' }],
        },
        {
          number: '47',
          order: 1,
          title: 'Grounds of arrest and right to bail to be told',
          text: `${SUMMARY}A police officer arresting a person without a warrant must immediately tell them the full particulars of the offence or the other grounds for the arrest. If the offence is bailable, the officer must also tell the person that they are entitled to be released on bail and may arrange sureties.`,
          plainExplanation: 'Police must tell you why you are being arrested. If the offence is bailable, they must tell you that you can get bail.',
          oldLawRefs: [{ act: 'CrPC', section: '50' }],
        },
        {
          number: '48',
          order: 2,
          title: 'Family or friend to be informed of arrest',
          text: `${SUMMARY}The police must inform a relative, friend or other person named by the arrested person about the arrest and the place where they are held, and must record this in a register at the police station.`,
          plainExplanation: 'Your family or a person you choose must be told that you were arrested and where you are being kept.',
          oldLawRefs: [{ act: 'CrPC', section: '50A' }],
        },
        {
          number: '58',
          order: 3,
          title: 'Not to be held more than 24 hours without a Magistrate',
          text: `${SUMMARY}A person arrested without a warrant must not be kept in police custody for more than twenty-four hours (excluding travel time to the court) unless a Magistrate orders further custody.`,
          plainExplanation: 'After arrest, the police must take you before a Magistrate within 24 hours. They cannot keep you longer without the court’s order.',
          oldLawRefs: [{ act: 'CrPC', section: '57' }],
        },
        {
          number: '173',
          order: 4,
          title: 'Information in cognizable cases (FIR)',
          text: `${SUMMARY}Information about a cognizable offence may be given to a police station orally or by electronic means, irrespective of the area where the offence was committed (Zero FIR). Oral information is written down and read over to the informant, who signs it; information given electronically must be signed by the informant within three days. A copy of the information as recorded is given to the informant or victim free of cost. For offences punishable with three to seven years, the officer may, with permission of a senior officer, hold a preliminary enquiry within fourteen days. If the station refuses to record the information, the person may send it in writing by post to the Superintendent of Police.`,
          plainExplanation: 'You can file an FIR at any police station, even if the crime happened elsewhere. It is free, and you get a free copy. If police refuse, write to the Superintendent of Police.',
          oldLawRefs: [{ act: 'CrPC', section: '154' }],
        },
        {
          number: '174',
          order: 5,
          title: 'Information in non-cognizable cases',
          text: `${SUMMARY}When information is given about a non-cognizable offence, the officer enters its substance in the station’s register and refers the informant to the Magistrate. Police cannot investigate a non-cognizable case without a Magistrate’s order.`,
          plainExplanation: 'For less serious matters, the police record your report in a register (often called an NCR or diary entry). To get them to investigate, the Magistrate’s order is needed.',
          oldLawRefs: [{ act: 'CrPC', section: '155' }],
        },
        {
          number: '175',
          order: 6,
          title: 'Magistrate may order investigation',
          text: `${SUMMARY}A Magistrate empowered to take cognizance may order the police to investigate a cognizable case. Such an application must be supported by an affidavit, and the applicant should first have approached the Superintendent of Police.`,
          plainExplanation: 'If both the police station and the Superintendent of Police do not act on your complaint, you can ask the Magistrate to order an investigation.',
          oldLawRefs: [{ act: 'CrPC', section: '156(3)' }],
        },
      ],
    },
    {
      slug: 'rti-act-2005',
      shortName: 'RTI',
      year: 2005,
      title: 'Right to Information Act, 2005',
      summary: 'Gives every citizen the right to ask government offices for information and get a reply within a fixed time.',
      sourceUrl: INDIA_CODE,
      sections: [
        {
          number: '6',
          order: 0,
          title: 'Request for information',
          text: `${SUMMARY}A citizen who wants information makes a written or electronic request, with the prescribed fee, to the Public Information Officer of the public authority. The applicant does not have to give any reason for asking, or any personal details except those needed to contact them.`,
          plainExplanation: 'Write to the office’s Public Information Officer saying what information you want. You do not have to explain why you want it.',
          oldLawRefs: [],
        },
        {
          number: '7',
          order: 1,
          title: 'Time limit for reply',
          text: `${SUMMARY}The Public Information Officer must provide the information or reject the request with reasons within thirty days. Where the information concerns the life or liberty of a person, it must be provided within forty-eight hours. Applicants below the poverty line are not charged a fee. If the time limit is not met, the information must be provided free of charge.`,
          plainExplanation: 'You should get a reply within 30 days — or 48 hours if someone’s life or liberty is at risk. People below the poverty line do not pay the fee.',
          oldLawRefs: [],
        },
        {
          number: '19',
          order: 2,
          title: 'Appeals',
          text: `${SUMMARY}If no decision is received in time, or the applicant is unhappy with it, a first appeal can be made within thirty days to an officer senior to the Public Information Officer in the same authority. A second appeal lies to the Central or State Information Commission within ninety days of the first appeal decision.`,
          plainExplanation: 'No reply or a poor reply? Appeal to the senior officer within 30 days. If that fails, go to the Information Commission within 90 days.',
          oldLawRefs: [],
        },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  articles: [
    {
      slug: 'what-is-free-legal-aid',
      categorySlug: 'rights',
      title: 'Free legal aid: who can get it and how',
      summary: 'Many people can get a lawyer and legal help for free from the Legal Services Authorities.',
      body: [
        '<p>The Constitution (Article 39A) asks the State to make sure no one is denied justice because they are poor. Under the Legal Services Authorities Act, 1987, Legal Services Authorities in every district give free legal help.</p>',
        '<p>You can get free legal aid if you are:</p>',
        '<ul>',
        '<li>A woman or a child, whatever your income</li>',
        '<li>A member of a Scheduled Caste or Scheduled Tribe</li>',
        '<li>A victim of human trafficking or forced labour (begar)</li>',
        '<li>A person with a disability</li>',
        '<li>A victim of a disaster, ethnic or caste violence, flood, drought, earthquake or industrial disaster</li>',
        '<li>An industrial worker</li>',
        '<li>In custody, including a protective home, juvenile home or psychiatric hospital</li>',
        '<li>Earning less than the yearly income limit set by your state</li>',
        '</ul>',
        '<p>Free legal aid can include a lawyer to represent you, court fees, and help drafting papers. It covers both civil and criminal cases.</p>',
        '<p>How to apply: visit the District Legal Services Authority (DLSA) office, usually at the district court, or the Taluk Legal Services Committee. You can also apply on the NALSA website or call the national legal aid helpline 15100.</p>',
      ].join(''),
      tags: ['legal-aid', 'nalsa', 'free-lawyer'],
    },
    {
      slug: 'rights-if-arrested',
      categorySlug: 'rights',
      title: 'Your rights if you are arrested',
      summary: 'What the police must do when they arrest you, under the BNSS and the Constitution.',
      body: [
        '<p>Being arrested is frightening. Remember that the law gives you these rights:</p>',
        '<ul>',
        '<li>To be told why you are being arrested (BNSS Section 47, Article 22 of the Constitution).</li>',
        '<li>If the offence is bailable, to be told that you can get bail.</li>',
        '<li>To have a relative or friend informed of your arrest and where you are kept (BNSS Section 48).</li>',
        '<li>To meet your lawyer during police questioning (BNSS Section 38).</li>',
        '<li>To be taken before a Magistrate within 24 hours (BNSS Section 58).</li>',
        '<li>To free legal aid if you cannot afford a lawyer.</li>',
        '</ul>',
        '<p>Women: as a rule, a woman should not be arrested after sunset or before sunrise, except in exceptional circumstances with a Magistrate’s prior permission, and a woman police officer should be involved.</p>',
        '<p>Stay calm, do not sign papers you do not understand, and ask for a lawyer. Call the legal aid helpline 15100 for free help.</p>',
      ].join(''),
      tags: ['arrest', 'bail', 'police'],
    },
    {
      slug: 'fir-gd-ncr-difference',
      categorySlug: 'police-fir',
      title: 'FIR, GD or NCR — which one do I need?',
      summary: 'Serious crimes need an FIR. Lost items and minor matters are recorded differently.',
      body: [
        '<p><strong>FIR (First Information Report)</strong> is for cognizable offences — serious crimes like theft, assault, cheating, sexual offences or murder. The police can investigate and arrest without a court’s order. You can file it at any police station (Zero FIR).</p>',
        '<p><strong>NCR (Non-Cognizable Report)</strong> is for less serious offences like minor insults or threats. The police record it in a register, but need a Magistrate’s order to investigate (BNSS Section 174).</p>',
        '<p><strong>GD (General Diary) entry</strong> is the police station’s daily record. People use it to report lost documents or items, a missing person, or to put an incident on record. Many state police websites let you file a lost-article report online.</p>',
        '<p>Not sure? Go to the police station and explain what happened. If it is a serious crime, ask for an FIR — the police must register it.</p>',
      ].join(''),
      tags: ['fir', 'gd', 'ncr', 'police'],
    },
    {
      slug: 'domestic-violence-help',
      categorySlug: 'family',
      title: 'Domestic violence: protection and help',
      summary: 'The Protection of Women from Domestic Violence Act, 2005 gives women quick legal protection.',
      body: [
        '<p>Domestic violence is not only physical. Under the 2005 Act it includes physical, sexual, verbal, emotional and economic abuse by a husband, partner or relatives living in the same household.</p>',
        '<p>A woman can ask the Magistrate for:</p>',
        '<ul>',
        '<li>A protection order, to stop the abuse and contact</li>',
        '<li>A residence order, so she is not thrown out of the shared home</li>',
        '<li>Monetary relief, for expenses and losses</li>',
        '<li>Custody of children, and compensation</li>',
        '</ul>',
        '<p>Help is available through the Protection Officer of your district, a service provider (NGO), the police, or directly from the Magistrate. Women get free legal aid regardless of income.</p>',
        '<p>In danger now? Call 112 (emergency) or 181 (women helpline).</p>',
      ].join(''),
      tags: ['domestic-violence', 'women', 'protection'],
    },
    {
      slug: 'landlord-problems',
      categorySlug: 'property',
      title: 'Problems with your landlord: first steps',
      summary: 'Keep records, put things in writing, and know that eviction must follow the legal process.',
      body: [
        '<p>Rent rules are made by each state, so details differ. But some steps help everywhere:</p>',
        '<ul>',
        '<li>Have a written rent agreement and keep a copy.</li>',
        '<li>Pay rent in a way that leaves a record — bank transfer, UPI, or a signed receipt.</li>',
        '<li>Keep proof of the security deposit you paid.</li>',
        '<li>Put complaints and requests in writing (a letter, email or WhatsApp message) and keep copies.</li>',
        '</ul>',
        '<p>A landlord must follow the legal process to evict a tenant. Using force, threats, or locking you out can be an offence — you can complain to the police.</p>',
        '<p>If your deposit is not returned, send a written demand first. A lawyer can send a legal notice, and you may approach the rent authority or civil court of your area. Free legal aid may be available.</p>',
      ].join(''),
      tags: ['rent', 'tenant', 'deposit', 'eviction'],
    },
    {
      slug: 'unpaid-wages',
      categorySlug: 'work',
      title: 'Not paid your wages? What you can do',
      summary: 'Collect proof, ask in writing, then approach the labour department.',
      body: [
        '<p>Every worker has a right to be paid the wages agreed, on time, and not less than the minimum wage.</p>',
        '<ul>',
        '<li>Collect proof of your work: ID card, attendance, messages, salary slips, bank statements, or names of co-workers who can confirm.</li>',
        '<li>Ask your employer for payment in writing and keep a copy.</li>',
        '<li>If you are not paid, complain to the Labour Department office of your district (Labour Officer or Labour Commissioner). Many states accept complaints online; for central-sphere establishments you can use the Samadhan portal of the Ministry of Labour.</li>',
        '</ul>',
        '<p>Industrial workers are entitled to free legal aid from the Legal Services Authority. Call 15100 for help.</p>',
      ].join(''),
      tags: ['wages', 'salary', 'labour'],
    },
  ],

  // -------------------------------------------------------------------------
  guides: [
    {
      slug: 'how-to-file-fir',
      type: 'fir',
      categorySlug: 'police-fir',
      title: 'How to file an FIR',
      summary: 'Report a serious crime to the police. It is free, and you can go to any police station.',
      steps: [
        { title: 'Write down what happened', body: 'Note the date, time and place, what happened, who did it (names or description), any witnesses, and anything taken or damaged. This helps you explain clearly.' },
        { title: 'Go to any police station', body: 'Go to the nearest station — it does not need to be the area where the crime happened. This is called a Zero FIR, and the police must transfer it to the right station (BNSS Section 173).' },
        { title: 'Tell the officer, or give it in writing', body: 'You can speak or hand over a written complaint. If you speak, the officer must write it down and read it back to you. For certain offences against women, a woman officer records the statement.' },
        { title: 'Check before you sign', body: 'Read the FIR carefully, or ask for it to be read out. Make sure it matches what you said. Correct mistakes before signing. Never sign a blank or unclear paper.' },
        { title: 'Take your free copy', body: 'You have a right to a free copy of the FIR. Note the FIR number, date and police station name — you will need them later.' },
        { title: 'If the police refuse', body: 'Send your complaint in writing by post to the Superintendent of Police (BNSS Section 173(4)). If nothing happens, you can apply to the Magistrate to order an investigation (Section 175). For some offences, the police may first do a short preliminary enquiry (up to 14 days).' },
      ],
      checklist: [
        'An identity proof (Aadhaar, voter ID or any photo ID)',
        'Your written account of what happened',
        'Any evidence: photos, videos, messages, bills, medical reports',
        'Names and phone numbers of witnesses',
      ],
      templateSlugs: ['police-complaint'],
      externalLinks: [{ label: 'Cyber crime? Report at cybercrime.gov.in or call 1930', url: 'https://cybercrime.gov.in/' }],
    },
    {
      slug: 'how-to-file-gd',
      type: 'gd',
      categorySlug: 'police-fir',
      title: 'Lost documents? Make a GD / lost report',
      summary: 'Record lost documents or items with the police so you can get duplicates.',
      steps: [
        { title: 'Act quickly', body: 'If a bank card, phone or SIM is lost, block it immediately through your bank or mobile company. This protects you from misuse.' },
        { title: 'Collect the details', body: 'Note what was lost, document numbers if you have them (Aadhaar, PAN, passport, licence), and where and when you last had them.' },
        { title: 'Report to the police', body: 'Go to the nearest police station and ask to record a GD (General Diary) entry or lost report. Many state police websites and apps let you file a lost-article report online.' },
        { title: 'Get the report number', body: 'Take an acknowledgement, a copy, or the report number. Keep it safe — offices ask for it when you apply for duplicates.' },
        { title: 'Apply for duplicates', body: 'Use the report to apply for duplicate documents at the issuing office or its website (for example the bank, UIDAI for Aadhaar, the RTO for a licence).' },
        { title: 'Was it stolen?', body: 'If the item was stolen, not lost, it is theft — ask the police to register an FIR instead.' },
      ],
      checklist: ['Any ID proof you still have', 'Photocopies or numbers of the lost documents, if available', 'Details of where and when they were lost'],
      templateSlugs: ['lost-document-report'],
      externalLinks: [],
    },
    {
      slug: 'how-to-file-rti',
      type: 'rti',
      categorySlug: 'rights',
      title: 'How to file an RTI application',
      summary: 'Ask any government office for information. You get a reply within 30 days.',
      steps: [
        { title: 'Find the right office', body: 'Decide which government office holds the information — for example the municipality, a ration office, or a ministry.' },
        { title: 'Write your questions clearly', body: 'Address the Public Information Officer (PIO) of that office. Ask short, clear questions. You do not have to give a reason (RTI Act Section 6).' },
        { title: 'Pay the fee', body: 'The fee is ₹10 for central government offices; states set their own fees. If you are below the poverty line, attach a copy of your BPL card — you do not pay.' },
        { title: 'Send the application', body: 'Submit by hand or by post and keep the receipt. For central government offices you can apply online at rtionline.gov.in.' },
        { title: 'Wait for the reply', body: 'The PIO must reply within 30 days, or within 48 hours if a person’s life or liberty is involved (Section 7).' },
        { title: 'Appeal if needed', body: 'No reply or not satisfied? File a first appeal with the senior officer within 30 days. Then a second appeal to the Information Commission within 90 days (Section 19).' },
      ],
      checklist: ['The office name and address', 'Your questions, written clearly', 'Fee (₹10 for central government) or a copy of your BPL card'],
      templateSlugs: ['rti-application'],
      externalLinks: [{ label: 'RTI Online (central government offices)', url: 'https://rtionline.gov.in/' }],
    },
    {
      slug: 'consumer-complaint',
      type: 'complaint',
      categorySlug: 'consumer',
      title: 'Faulty product or bad service? File a consumer complaint',
      summary: 'Complain to the company, get help from the National Consumer Helpline, then the Consumer Commission.',
      steps: [
        { title: 'Keep your proof', body: 'Keep the bill, warranty card, order details, photos of the defect, and all messages with the seller.' },
        { title: 'Complain to the seller in writing', body: 'Write to the seller or company, explain the problem and what you want (repair, replacement or refund). Keep a copy of your complaint and any reply.' },
        { title: 'Call the National Consumer Helpline', body: 'Call 1915 or use consumerhelpline.gov.in. They can take up your complaint with the company before you go to court.' },
        { title: 'File at the Consumer Commission', body: 'If it is still not solved, file a complaint at the District Consumer Commission (for claims up to ₹50 lakh). You can file where you live, and online through e-Daakhil.' },
        { title: 'Mind the time limit', body: 'File within two years of the problem. You do not need a lawyer — you can present your own case.' },
      ],
      checklist: ['Bill or invoice', 'Warranty or guarantee card', 'Photos of the defect', 'Copies of your complaint and replies'],
      templateSlugs: [],
      externalLinks: [
        { label: 'National Consumer Helpline (1915)', url: 'https://consumerhelpline.gov.in/' },
        { label: 'e-Daakhil — file a consumer complaint online', url: 'https://edaakhil.nic.in/' },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  templates: [
    {
      slug: 'police-complaint',
      categorySlug: 'police-fir',
      title: 'Written complaint to the police',
      summary: 'A clear written complaint to hand in at the police station, or to post to the Superintendent of Police.',
      fields: [
        { key: 'policeStation', type: 'text', required: true, maxLength: 120 },
        { key: 'fullName', type: 'text', required: true, maxLength: 120 },
        { key: 'address', type: 'multiline', required: true, maxLength: 500 },
        { key: 'phone', type: 'phone', required: false, maxLength: 15 },
        { key: 'incidentDate', type: 'date', required: true },
        { key: 'incidentPlace', type: 'text', required: true, maxLength: 200 },
        { key: 'details', type: 'multiline', required: true, maxLength: 4000 },
        { key: 'accused', type: 'multiline', required: false, maxLength: 1000 },
        { key: 'witnesses', type: 'multiline', required: false, maxLength: 1000 },
      ],
      fieldLabels: {
        policeStation: 'Police station name and town',
        fullName: 'Your full name',
        address: 'Your address',
        phone: 'Phone number (optional)',
        incidentDate: 'Date of incident',
        incidentPlace: 'Place of incident',
        details: 'What happened (in your own words)',
        accused: 'Who did it — names or description (optional)',
        witnesses: 'Witnesses — names and phone (optional)',
      },
      bodyHtml: `
<div style="font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 1.7; padding: 36px;">
  <p>To,<br/>The Station House Officer,<br/>{{policeStation}}</p>
  <p><strong>Subject:</strong> Complaint regarding an incident on {{incidentDate}} at {{incidentPlace}} — request to register an FIR</p>
  <p>Respected Sir/Madam,</p>
  <p>I, {{fullName}}, residing at {{address}}, wish to report the following incident:</p>
  <p>{{details}}</p>
  <p><strong>Person(s) responsible:</strong> {{accused}}</p>
  <p><strong>Witnesses:</strong> {{witnesses}}</p>
  <p>I request you to register an FIR under Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023, take necessary action, and give me a free copy of the FIR.</p>
  <p>Yours faithfully,<br/><br/>{{fullName}}<br/>Phone: {{phone}}<br/>Date: ____________</p>
  <p style="color:#666;font-size:11px;margin-top:28px;">Prepared with Justice For All. General format — check all details before submitting.</p>
</div>`.trim(),
    },
    {
      slug: 'rti-application',
      categorySlug: 'rights',
      title: 'RTI application',
      summary: 'Ask a government office for information under Section 6(1) of the RTI Act, 2005.',
      fields: [
        { key: 'publicAuthority', type: 'text', required: true, maxLength: 200 },
        { key: 'officeAddress', type: 'multiline', required: true, maxLength: 500 },
        { key: 'fullName', type: 'text', required: true, maxLength: 120 },
        { key: 'address', type: 'multiline', required: true, maxLength: 500 },
        { key: 'phone', type: 'phone', required: false, maxLength: 15 },
        { key: 'information', type: 'multiline', required: true, maxLength: 4000 },
        { key: 'period', type: 'text', required: false, maxLength: 120 },
        { key: 'feeDetails', type: 'text', required: true, maxLength: 200 },
      ],
      fieldLabels: {
        publicAuthority: 'Office / department name',
        officeAddress: 'Office address',
        fullName: 'Your full name',
        address: 'Your address',
        phone: 'Phone number (optional)',
        information: 'Information you want (one question per line)',
        period: 'Time period the information is about (optional)',
        feeDetails: 'Fee paid (e.g. ₹10 postal order no.) or “BPL — card attached”',
      },
      bodyHtml: `
<div style="font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 1.7; padding: 36px;">
  <p>To,<br/>The Public Information Officer,<br/>{{publicAuthority}}<br/>{{officeAddress}}</p>
  <p><strong>Subject:</strong> Application for information under Section 6(1) of the Right to Information Act, 2005</p>
  <p>Respected Sir/Madam,</p>
  <p>I, {{fullName}}, a citizen of India, request the following information:</p>
  <p>{{information}}</p>
  <p><strong>Period:</strong> {{period}}</p>
  <p><strong>Fee:</strong> {{feeDetails}}</p>
  <p>Please provide the information within the time limit under Section 7 of the Act. If any part of this request belongs to another public authority, kindly transfer it under Section 6(3) and inform me.</p>
  <p>Yours faithfully,<br/><br/>{{fullName}}<br/>{{address}}<br/>Phone: {{phone}}<br/>Date: ____________</p>
  <p style="color:#666;font-size:11px;margin-top:28px;">Prepared with Justice For All. General format — check all details before submitting.</p>
</div>`.trim(),
    },
    {
      slug: 'lost-document-report',
      categorySlug: 'police-fir',
      title: 'Lost documents report (letter to police)',
      summary: 'A letter asking the police to record a GD entry / lost report for your missing documents.',
      fields: [
        { key: 'policeStation', type: 'text', required: true, maxLength: 120 },
        { key: 'fullName', type: 'text', required: true, maxLength: 120 },
        { key: 'address', type: 'multiline', required: true, maxLength: 500 },
        { key: 'phone', type: 'phone', required: false, maxLength: 15 },
        { key: 'lostItems', type: 'multiline', required: true, maxLength: 2000 },
        { key: 'lostDate', type: 'date', required: true },
        { key: 'lostPlace', type: 'text', required: true, maxLength: 200 },
      ],
      fieldLabels: {
        policeStation: 'Police station name and town',
        fullName: 'Your full name',
        address: 'Your address',
        phone: 'Phone number (optional)',
        lostItems: 'Documents / items lost (with numbers if known)',
        lostDate: 'Date when lost',
        lostPlace: 'Where they were lost (approximate)',
      },
      bodyHtml: `
<div style="font-family: 'Noto Sans', sans-serif; font-size: 14px; line-height: 1.7; padding: 36px;">
  <p>To,<br/>The Station House Officer,<br/>{{policeStation}}</p>
  <p><strong>Subject:</strong> Report of lost documents — request for General Diary entry</p>
  <p>Respected Sir/Madam,</p>
  <p>I, {{fullName}}, residing at {{address}}, wish to report that on {{lostDate}}, near {{lostPlace}}, I lost the following:</p>
  <p>{{lostItems}}</p>
  <p>I have searched for them but could not find them. I request you to record this in the General Diary and give me a copy or the entry number, so that I can apply for duplicate documents. If they are found, kindly inform me.</p>
  <p>Yours faithfully,<br/><br/>{{fullName}}<br/>Phone: {{phone}}<br/>Date: ____________</p>
  <p style="color:#666;font-size:11px;margin-top:28px;">Prepared with Justice For All. General format — check all details before submitting.</p>
</div>`.trim(),
    },
  ],
};
