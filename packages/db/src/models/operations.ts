import { Schema } from 'mongoose';
import { baseOptions } from '../helpers';

/** Audit trail for sensitive writes. Never store personal data in `meta`. */
export const AuditLogSchema = new Schema(
  {
    actorId: { type: String },
    actorRole: { type: String },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    meta: { type: Schema.Types.Mixed },
    requestId: String,
  },
  { ...baseOptions, collection: 'auditLogs', strict: true },
);
AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
// Retention: 2 years (tune with the legal team's retention policy).
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 730 });

/** Webhook / payment idempotency (unique key, auto-expires after 7 days). */
export const IdempotencyKeySchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    scope: { type: String, required: true },
    response: { type: Schema.Types.Mixed },
  },
  { ...baseOptions, collection: 'idempotencyKeys', strict: true },
);
IdempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

/** PHASE 2 — documents exchanged between citizen and lawyer (files live in private R2). */
export const DocumentSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    kind: { type: String, enum: ['user_upload', 'lawyer_draft'], required: true },
    r2Key: { type: String, required: true },
    fileName: { type: String, required: true },
    mime: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    scanStatus: { type: String, enum: ['pending', 'clean', 'infected', 'error'], default: 'pending' },
    deletedAt: Date,
  },
  { ...baseOptions, collection: 'documents' },
);
DocumentSchema.index({ ownerId: 1, createdAt: -1 });
DocumentSchema.index({ consultationId: 1 });

/** PHASE 3 — consultations, slots, payments, calls. */
export const AvailabilitySlotSchema = new Schema(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: 'LawyerProfile', required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ['open', 'held', 'booked', 'cancelled'], default: 'open' },
  },
  { ...baseOptions, collection: 'availabilitySlots' },
);
AvailabilitySlotSchema.index({ lawyerId: 1, startsAt: 1 }, { unique: true });
AvailabilitySlotSchema.index({ status: 1, startsAt: 1 });

export const ConsultationSchema = new Schema(
  {
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'LawyerProfile', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'AvailabilitySlot', required: true, unique: true },
    mode: { type: String, enum: ['video', 'voice'], required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'completed', 'cancelled', 'refunded', 'disputed'],
      default: 'pending_payment',
    },
    lawyerFeePaise: { type: Number, required: true, min: 0 },
    platformFeePaise: { type: Number, required: true, min: 0 },
  },
  { ...baseOptions, collection: 'consultations' },
);
ConsultationSchema.index({ citizenId: 1, createdAt: -1 });
ConsultationSchema.index({ lawyerId: 1, status: 1 });

export const PaymentSchema = new Schema(
  {
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation', required: true },
    provider: { type: String, enum: ['razorpay'], default: 'razorpay' },
    providerOrderId: { type: String, required: true, unique: true },
    providerPaymentId: { type: String, sparse: true, unique: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed', 'refunded'], default: 'created' },
  },
  { ...baseOptions, collection: 'payments' },
);

export const CallSessionSchema = new Schema(
  {
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation', required: true },
    provider: { type: String, enum: ['100ms'], default: '100ms' },
    roomId: { type: String, required: true },
    startedAt: Date,
    endedAt: Date,
  },
  { ...baseOptions, collection: 'callSessions' },
);
