import mongoose, { Model } from "mongoose";
import { DOMAIN_ENVIRONMENTS } from "./domain.constants";
import { Domain } from "./domain.types";

export type DomainDocument = Domain & mongoose.Document;

const domainSchema = new mongoose.Schema<DomainDocument>(
  {
    domain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    purposes: {
      cors: { type: Boolean, default: false },
      passkey: { type: Boolean, default: false },
      oauth: { type: Boolean, default: false },
      api: { type: Boolean, default: false },
      admin: { type: Boolean, default: false },
      auth: { type: Boolean, default: false },
    },
    environment: {
      type: String,
      enum: DOMAIN_ENVIRONMENTS,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DomainModel: Model<DomainDocument> =
  mongoose.models.Domain ?? mongoose.model<DomainDocument>("Domain", domainSchema);
