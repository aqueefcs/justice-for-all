import mongoose, { type Schema } from 'mongoose';
import {
  ActSchema,
  ActSectionSchema,
  ArticleSchema,
  CategorySchema,
  ContentPackSchema,
  GuideSchema,
  TemplateSchema,
} from './models/content';
import { ConsentSchema, LawyerProfileSchema, UserSchema } from './models/identity';
import {
  AuditLogSchema,
  AvailabilitySlotSchema,
  CallSessionSchema,
  ConsultationSchema,
  DocumentSchema,
  IdempotencyKeySchema,
  PaymentSchema,
} from './models/operations';

export * from './models/content';
export * from './models/identity';
export * from './models/operations';
export * from './helpers';

/** Model names → schemas. Used by NestJS `MongooseModule.forFeature(...)` and scripts. */
export const MODEL_DEFINITIONS = {
  Category: CategorySchema,
  Act: ActSchema,
  ActSection: ActSectionSchema,
  Article: ArticleSchema,
  Guide: GuideSchema,
  Template: TemplateSchema,
  ContentPack: ContentPackSchema,
  User: UserSchema,
  LawyerProfile: LawyerProfileSchema,
  Consent: ConsentSchema,
  AuditLog: AuditLogSchema,
  IdempotencyKey: IdempotencyKeySchema,
  Document: DocumentSchema,
  AvailabilitySlot: AvailabilitySlotSchema,
  Consultation: ConsultationSchema,
  Payment: PaymentSchema,
  CallSession: CallSessionSchema,
} as const satisfies Record<string, Schema>;

export type ModelName = keyof typeof MODEL_DEFINITIONS;

export function modelDefinitions(names: ModelName[]) {
  return names.map((name) => ({ name, schema: MODEL_DEFINITIONS[name] }));
}

/** Global safety settings — call once before connecting. */
export function applyMongooseSafety(m: typeof mongoose = mongoose) {
  m.set('sanitizeFilter', true); // neutralises $-operators in query filters
  m.set('strictQuery', true);
}

/** For scripts (seed, migrations). The API uses @nestjs/mongoose instead. */
export async function connectForScript(uri: string) {
  applyMongooseSafety();
  await mongoose.connect(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10_000 });
  for (const [name, schema] of Object.entries(MODEL_DEFINITIONS)) {
    if (!mongoose.models[name]) mongoose.model(name, schema);
  }
  return mongoose;
}
