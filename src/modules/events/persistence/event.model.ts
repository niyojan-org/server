import mongoose, { Schema, Types, Model } from "mongoose";
import * as EventEnums from "../core/event.enums";
import { EventDocument } from "../core/event.types";

/* -------------------- Sub Schemas -------------------- */

const SessionSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: String,

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    venue: {
      name: String,
      locality: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    isActive: { type: Boolean, default: true },

    allowCheckIn: { type: Boolean, default: false },
    checkInStartTime: Date,
    checkInEndTime: Date,

    speakers: [String],
  },
  { _id: true, timestamps: true },
);

const GroupSettingsSchema = new Schema(
  {
    minParticipants: { type: Number, required: true },
    maxParticipants: { type: Number, required: true },
    groupLeaderRequired: { type: Boolean, default: true },
  },
  { _id: false },
);

const TicketSchema = new Schema(
  {
    type: { type: String, required: true, maxlength: 100 },

    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    sold: { type: Number, default: 0 },

    salesStartTime: Date,
    salesEndTime: Date,

    isActive: { type: Boolean, default: true },
    template: { type: Types.ObjectId },

    isGroupTicket: { type: Boolean, default: false },
    groupSettings: GroupSettingsSchema,
  },
  { _id: true },
);

const CustomFieldSchema = new Schema(
  {
    label: { type: String, required: true, maxlength: 100 },
    name: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    placeholder: String,
    options: [{ label: String, value: Schema.Types.Mixed }],
    minLength: Number,
    maxLength: Number,
  },
  { _id: true },
);

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, uppercase: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },

    maxUsage: Number,
    usedCount: { type: Number, default: 0 },

    validTicketTypes: [{ type: Types.ObjectId }],

    startsAt: Date,
    endsAt: Date,
    expiresAt: Date,

    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const GovernanceSchema = new Schema(
  {
    flagged: { type: Boolean, default: false },
    flaggedReason: String,
    reviewedBy: { type: Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    trustScore: Number,
  },
  { _id: false },
);

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String },

    bannerImage: String,
    banner: String,

    tags: [String],
    category: String,

    organizationId: {
      type: Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: Object.values(EventEnums.EventMode),
      required: true,
    },

    visibility: {
      type: String,
      enum: Object.values(EventEnums.EventVisibility),
      required: true,
    },

    registrationStart: Date,
    registrationEnd: Date,

    allowMultipleSessions: { type: Boolean, default: false },
    allowCoupons: { type: Boolean, default: false },
    allowReferrals: { type: Boolean, default: false },

    autoApproveParticipants: { type: Boolean, default: true },

    enableEmailNotifications: { type: Boolean, default: true },
    enableWhatsappNotifications: { type: Boolean, default: false },

    slug: { type: String, unique: true, index: true },

    status: {
      type: String,
      enum: Object.values(EventEnums.EventStatus),
      default: EventEnums.EventStatus.DRAFT,
      index: true,
    },

    isPublished: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    joinCode: String,
    isRegistrationOpen: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    sessions: { type: [SessionSchema], default: [] },
    tickets: { type: [TicketSchema], default: [] },
    customFields: { type: [CustomFieldSchema], default: [] },
    coupons: { type: [CouponSchema], default: [] },

    metrics: {
      view: { type: Number, default: 0 },
      paidRegistrations: { type: Number, default: 0 },
      freeRegistrations: { type: Number, default: 0 },
    },

    publishedAt: Date,
    unpublishedAt: Date,
    unpublishedReason: String,

    governance: { type: GovernanceSchema, default: { flagged: false } },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

/* -------------------- Indexes -------------------- */

EventSchema.index({ organizationId: 1, status: 1 });
EventSchema.index({ createdAt: -1 });

export const EventModel: Model<EventDocument> =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);
