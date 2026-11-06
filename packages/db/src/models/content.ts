import { Schema } from 'mongoose';
import { GUIDE_TYPES, TEMPLATE_FIELD_TYPES } from '@jfa/shared';
import { baseOptions, publishingFields, translationsField } from '../helpers';

export const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
    translations: translationsField({
      title: { type: String, required: true },
      description: String,
    }),
    ...publishingFields,
  },
  { ...baseOptions, collection: 'categories' },
);
CategorySchema.index({ status: 1, order: 1 });

export const ActSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    year: { type: Number, required: true },
    categorySlugs: { type: [String], default: [] },
    sourceUrl: String,
    translations: translationsField({ title: { type: String, required: true }, summary: String }),
    ...publishingFields,
  },
  { ...baseOptions, collection: 'acts' },
);

export const ActSectionSchema = new Schema(
  {
    actSlug: { type: String, required: true },
    number: { type: String, required: true },
    order: { type: Number, required: true },
    oldLawRefs: {
      type: [new Schema({ act: String, section: String }, { _id: false })],
      default: [],
    },
    translations: translationsField({
      title: { type: String, required: true },
      text: { type: String, default: '' },
      plainExplanation: String,
    }),
    ...publishingFields,
  },
  { ...baseOptions, collection: 'actSections' },
);
ActSectionSchema.index({ actSlug: 1, number: 1 }, { unique: true });
ActSectionSchema.index({ actSlug: 1, order: 1 });
ActSectionSchema.index({ 'oldLawRefs.act': 1, 'oldLawRefs.section': 1 });

export const ArticleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    categorySlug: { type: String, required: true },
    tags: { type: [String], default: [] },
    translations: translationsField({
      title: { type: String, required: true },
      summary: { type: String, default: '' },
      body: { type: String, default: '' },
    }),
    ...publishingFields,
  },
  { ...baseOptions, collection: 'articles' },
);
ArticleSchema.index({ categorySlug: 1, status: 1 });

const GuideStep = new Schema({ title: String, body: String }, { _id: false });

export const GuideSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: GUIDE_TYPES, required: true },
    categorySlug: { type: String, required: true },
    templateSlugs: { type: [String], default: [] },
    externalLinks: {
      type: [new Schema({ label: String, url: String, state: String }, { _id: false })],
      default: [],
    },
    translations: translationsField({
      title: { type: String, required: true },
      summary: { type: String, default: '' },
      steps: { type: [GuideStep], default: [] },
      checklist: { type: [String], default: [] },
    }),
    ...publishingFields,
  },
  { ...baseOptions, collection: 'guides' },
);
GuideSchema.index({ categorySlug: 1, status: 1 });
GuideSchema.index({ status: 1, updatedAt: -1 });

export const TemplateSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    categorySlug: { type: String, required: true },
    fields: {
      type: [
        new Schema(
          {
            key: { type: String, required: true },
            type: { type: String, enum: TEMPLATE_FIELD_TYPES, required: true },
            required: { type: Boolean, default: true },
            maxLength: Number,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    translations: translationsField({
      title: { type: String, required: true },
      summary: { type: String, default: '' },
      fieldLabels: { type: Schema.Types.Mixed, default: {} },
      bodyHtml: { type: String, default: '' },
    }),
    ...publishingFields,
  },
  { ...baseOptions, collection: 'templates' },
);

/** A record of every content pack uploaded to R2. */
export const ContentPackSchema = new Schema(
  {
    locale: { type: String, required: true },
    version: { type: Number, required: true },
    r2Key: { type: String, required: true },
    sha256: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    builtBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { ...baseOptions, collection: 'contentPacks' },
);
ContentPackSchema.index({ locale: 1, version: -1 }, { unique: true });
