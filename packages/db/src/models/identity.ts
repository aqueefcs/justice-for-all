import { Schema } from 'mongoose';
import { LOCALES, ROLES } from '@jfa/shared';
import { baseOptions } from '../helpers';

/**
 * App user profile. Better Auth (Phase 1/2) manages its own `user`, `session`, `account`
 * and `verification` collections through its MongoDB adapter; this collection holds our
 * app-specific fields keyed by the Better Auth user id.
 */
export const UserSchema = new Schema(
  {
    authUserId: { type: String, required: true, unique: true },
    role: { type: String, enum: ROLES, default: 'citizen', index: true },
    preferredLocale: { type: String, enum: LOCALES, default: 'en' },
    status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
    /** DPDP: set when the user asks for deletion; a purge job removes data after the retention window. */
    deletionRequestedAt: Date,
  },
  { ...baseOptions, collection: 'users' },
);

/** PHASE 2 — lawyer onboarding & verification. */
export const LawyerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    barEnrolmentNo: { type: String, required: true },
    stateBarCouncil: { type: String, required: true },
    practiceAreas: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    /** Lawyer's own fee in paise. No ratings/rankings — Bar Council Rule 36. */
    consultationFeePaise: { type: Number, min: 0 },
    verificationDocKeys: { type: [String], default: [] },
  },
  { ...baseOptions, collection: 'lawyerProfiles' },
);
LawyerProfileSchema.index({ verificationStatus: 1, practiceAreas: 1 });

/** DPDP Act: consent per purpose + notice version. */
export const ConsentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, required: true },
    noticeVersion: { type: String, required: true },
    grantedAt: { type: Date, required: true },
    withdrawnAt: Date,
  },
  { ...baseOptions, collection: 'consents' },
);
ConsentSchema.index({ userId: 1, purpose: 1 });
