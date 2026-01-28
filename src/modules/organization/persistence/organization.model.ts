import mongoose, { Schema, Types, Model, PaginateModel } from "mongoose";
import * as OrganizationEnums from "../types/organization.enums";
import * as OrgTypes from "../types";
import mongoosePaginate from "mongoose-paginate-v2";

const AddressSchema = new Schema<OrgTypes.OrganizationAddress>(
  {
    locality: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  { _id: false },
);

const SupportContactSchema = new Schema<OrgTypes.OrganizationSupportContact>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
  },
  { _id: false },
);

const SocialLinksSchema = new Schema<OrgTypes.OrganizationSocialLinks>(
  {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String,
    blog: String,
    website: String,
  },
  { _id: false },
);

const DocumentSchema = new Schema<OrgTypes.OrganizationDocument>({
  type: { type: String, required: true },
  url: { type: String, required: true },

  uploadedAt: { type: Date, default: Date.now },

  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  rejected: { type: Boolean, default: false },
  verifiedBy: { type: Types.ObjectId, ref: "User" },
  rejectionReason: String,

  checkedBy: { type: Types.ObjectId, ref: "User" },
});

const BankDetailsSchema = new Schema<OrgTypes.OrganizationBank>(
  {
    accountHolderName: String,
    bankName: String,
    branchName: String,
    accountNumber: String, // encrypt later
    ifscCode: String,
    upiId: String,
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: Types.ObjectId, ref: "User" },
  },
  { _id: false },
);

const PaymentGatewaysSchema = new Schema<OrgTypes.PaymentGateways>(
  {
    razorpay: { type: Boolean, default: false },
    cashfree: { type: Boolean, default: false },
    phonePe: { type: Boolean, default: false },
  },
  { _id: false },
);

const FraudFlagSchema = new Schema<OrgTypes.FraudFlag>({
  reason: String,
  severity: {
    type: String,
    enum: Object.values(OrganizationEnums.Severity),
    default: OrganizationEnums.Severity.MINOR,
  },
  flaggedBy: { type: Types.ObjectId, ref: "User" },
  flaggedAt: { type: Date, default: Date.now },
  resolvedFeedback: String,
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: Types.ObjectId, ref: "User" },
  resolvedAt: Date,
});

const WarningSchema = new Schema<OrgTypes.Warning>(
  {
    message: String,
    issuedBy: { type: Types.ObjectId, ref: "User" },
    issuedAt: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
  },
  { _id: false },
);

const StatsSchema = new Schema<OrgTypes.Stats>(
  {
    totalEventsHosted: { type: Number, default: 0 },
  },
  { _id: false },
);
export type OrganizationDocument = OrgTypes.Organization & mongoose.Document;

const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    category: {
      type: String,
      enum: Object.values(OrganizationEnums.OrganizationCategory),
      required: true,
    },
    subCategory: String,

    description: String,
    logo: String,

    /* ---------- Contact ---------- */
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    phone: { type: String, required: true },

    address: { type: AddressSchema, required: true },
    supportContact: { type: SupportContactSchema, required: true },

    socialLinks: SocialLinksSchema,

    /* ---------- Ownership ---------- */
    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------- Verification (SYSTEM) ---------- */
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: Types.ObjectId, ref: "User" },
    reqForVerification: { type: Boolean, default: false },
    rejectionReason: String,

    /* ---------- Trust & Risk (SYSTEM) ---------- */
    trustScore: { type: Number, default: 100, min: 0, max: 100 },

    fraudFlags: {
      type: [FraudFlagSchema],
      default: [],
      validate: [(v: any[]) => v.length <= 20, "Max 20 fraud flags"],
    },

    warnings: {
      type: [WarningSchema],
      default: [],
      validate: [(v: any[]) => v.length <= 50, "Max 50 warnings"],
    },

    /* ---------- Platform Controls ---------- */
    isBlocked: { type: Boolean, default: false },
    blockReason: String,
    blockType: {
      type: String,
      enum: Object.values(OrganizationEnums.BlockType),
    },
    blockedBy: { type: Types.ObjectId, ref: "User" },
    blockedAt: Date,

    /* ---------- Paid Events (SYSTEM ONLY) ---------- */
    allowsPaidEvents: { type: Boolean, default: false },

    /* ---------- Payments ---------- */
    bankDetails: BankDetailsSchema,
    paymentGateways: PaymentGatewaysSchema,

    /* ---------- Documents ---------- */
    documents: {
      type: [DocumentSchema],
      default: [],
      validate: [(v: any[]) => v.length <= 20, "Max 20 documents"],
    },

    /* ---------- Analytics ---------- */
    stats: { type: StatsSchema, default: () => ({}) },

    /* ---------- System ---------- */
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

OrganizationSchema.index({ name: "text", description: "text" });
OrganizationSchema.index({ verified: 1, active: 1 });
OrganizationSchema.index({ category: 1, verified: 1 });
OrganizationSchema.plugin(mongoosePaginate);

OrganizationSchema.pre("validate", async function () {
  if (!this.slug || this.isModified("name")) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let slug = baseSlug;
    let count = 1;
    const Organization =
      mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
    while (await Organization.findOne({ slug } as any)) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
});

const OrganizationModel: PaginateModel<OrganizationDocument> =
  (mongoose.models.Organization as PaginateModel<OrganizationDocument>) ||
  mongoose.model<OrganizationDocument, PaginateModel<OrganizationDocument>>(
    "Organization",
    OrganizationSchema,
  );

export default OrganizationModel;
