import mongoose, { Model } from "mongoose";
import { ResourceDocument } from "./resource.types";
import { RESOURCE_TYPES, RESOURCE_STATUS, MAX_TAGS_PER_RESOURCE } from "./resource.constants";

const resourceSchema = new mongoose.Schema<ResourceDocument>(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    type: {
      type: String,
      enum: RESOURCE_TYPES,
      required: true,
      default: "other",
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= MAX_TAGS_PER_RESOURCE;
        },
        message: `Resources can have at most ${MAX_TAGS_PER_RESOURCE} tags`,
      },
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      enum: RESOURCE_STATUS,
      default: "active",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Indexes
resourceSchema.index({ organizationId: 1, type: 1, status: 1 });
resourceSchema.index({ eventId: 1, type: 1, status: 1 });
resourceSchema.index({ userId: 1, status: 1 });
resourceSchema.index({ tags: 1, status: 1 });
resourceSchema.index({ createdAt: -1 });

// Text Search Index
resourceSchema.index({ title: "text", description: "text", tags: "text" });

// TTL Index for expired resources (also creates a regular index)
resourceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export const ResourceModel: Model<ResourceDocument> =
  mongoose.models.Resource ?? mongoose.model<ResourceDocument>("Resource", resourceSchema);
