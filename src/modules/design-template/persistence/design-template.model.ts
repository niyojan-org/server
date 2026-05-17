import mongoose, { Model } from 'mongoose';
import { DesignTemplate } from '../types/design-template.types';
import * as configConstants from '@modules/renderers/constants/config.constants';

const templateTicketRefSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false },
);

const designTemplateSchema = new mongoose.Schema<DesignTemplate>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    renderType: {
      type: String,
      enum: Object.values(configConstants.RenderableAssetType),
      default: configConstants.RenderableAssetType.TICKET,
      index: true,
    },
    ownerType: {
      type: String,
      enum: Object.values(configConstants.TemplateOwnerType),
      default: configConstants.TemplateOwnerType.ORGANIZER,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    visibility: {
      type: String,
      enum: Object.values(configConstants.TemplateVisibility),
      default: configConstants.TemplateVisibility.PRIVATE,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(configConstants.TemplateStatus),
      default: configConstants.TemplateStatus.ACTIVE,
      index: true,
    },
    version: { type: Number, default: 1, min: 1 },
    isReusable: { type: Boolean, default: true },
    eventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    ticketRefs: { type: [templateTicketRefSchema], default: [] },
    tags: { type: [String], default: [] },
    config: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

designTemplateSchema.index({ organizationId: 1, renderType: 1, status: 1 });
designTemplateSchema.index({ eventIds: 1, status: 1 });
designTemplateSchema.index({ 'ticketRefs.eventId': 1, 'ticketRefs.ticketId': 1 });
designTemplateSchema.index({ ownerType: 1, visibility: 1, status: 1, createdAt: -1 });

export type DesignTemplateDocument = mongoose.HydratedDocument<DesignTemplateSchema>;
export type DesignTemplateSchema = mongoose.InferSchemaType<typeof designTemplateSchema>;

export const DesignTemplateModel: Model<DesignTemplate> =
  mongoose.models.DesignTemplate ??
  mongoose.model<DesignTemplate>('DesignTemplate', designTemplateSchema);
