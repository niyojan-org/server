import { Types } from 'mongoose';
import { z } from 'zod';
import {
  RenderableAssetType,
  TemplateConfig,
  TemplateOwnerType,
  TemplateStatus,
  TemplateVisibility,
} from '@modules/renderers';
import * as configConstants from '@modules/renderers/constants/config.constants';

export const templateTicketRefSchema = z
  .object({
    eventId: z.instanceof(Types.ObjectId),
    ticketId: z.instanceof(Types.ObjectId),
  })
  .strict();

export const designTemplateSchema = z
  .object({
    _id: z.instanceof(Types.ObjectId).optional(),
    name: z.string().min(3).max(120),
    description: z.string().max(500).optional(),
    renderType: RenderableAssetType.default(configConstants.RenderableAssetType.TICKET),
    ownerType: TemplateOwnerType.default(configConstants.TemplateOwnerType.ORGANIZER),
    ownerId: z.instanceof(Types.ObjectId).optional(),
    organizationId: z.instanceof(Types.ObjectId).optional(),
    visibility: TemplateVisibility.default(configConstants.TemplateVisibility.PRIVATE),
    status: TemplateStatus.default(configConstants.TemplateStatus.ACTIVE),
    version: z.number().int().min(1).default(1),
    isReusable: z.boolean().default(true),
    eventIds: z.array(z.instanceof(Types.ObjectId)).default([]),
    ticketRefs: z.array(templateTicketRefSchema).default([]),
    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
    config: z.custom<TemplateConfig>(),
    createdBy: z.instanceof(Types.ObjectId).optional(),
    updatedBy: z.instanceof(Types.ObjectId).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .strict();

export type DesignTemplate = z.infer<typeof designTemplateSchema>;
