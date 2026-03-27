import mongoose, { Model, Schema } from "mongoose";
import { UserSecurityDocument } from "./user-security.types";

const PasskeySchema = new Schema(
  {
    credentialId: { type: String, required: true },
    publicKey: { type: String, required: true },
    name: { type: String },
    counter: { type: Number, default: 0 },
    deviceName: String,
    transports: [String],
    deviceType: { type: String },
    backedUp: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date },
  },
  { _id: false },
);

const TotpSchema = new Schema(
  {
    secret: String,
    enabled: { type: Boolean, default: false },
    verifiedAt: Date,
  },
  { _id: false },
);

const BackupCodeSchema = new Schema(
  {
    codeHash: { type: String, required: true },
    usedAt: { type: Date, default: null },
  },
  { _id: true },
);

const UserSecuritySchema = new Schema<UserSecurityDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totp: TotpSchema,

    passkeys: {
      type: [PasskeySchema],
      default: [],
    },

    backupCodes: {
      type: [BackupCodeSchema],
      default: [],
    },

    lastMfaAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserSecurityModel: Model<UserSecurityDocument> =
  (mongoose.models.UserSecurity as Model<UserSecurityDocument> | undefined) ??
  mongoose.model<UserSecurityDocument>("UserSecurity", UserSecuritySchema);
