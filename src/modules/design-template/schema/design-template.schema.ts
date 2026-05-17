import { objectIdSchema } from '@helpers/zod';
import { z } from 'zod';
import {
  RenderableAssetType,
  templateConfigSchema,
  TemplateOwnerType,
  TemplateStatus,
  TemplateVisibility,
} from '@modules/renderers';
import * as configConstants from '@modules/renderers/constants/config.constants';

const ticketReferenceSchema = z
  .object({
    eventId: objectIdSchema,
    ticketId: objectIdSchema,
  })
  .strict();

export const createDesignTemplateSchema = z
  .object({
    name: z
      .string({ message: 'Template name is required' })
      .min(3, 'Name must be at least 3 characters long')
      .max(20, 'Name must be at most 20 characters long'),
    description: z
      .string({ message: 'Description must be a valid string' })
      .max(500, 'Description mush be at most 500 characters long')
      .optional(),
    renderType: RenderableAssetType.default(configConstants.RenderableAssetType.TICKET),
    ownerType: TemplateOwnerType.default(configConstants.TemplateOwnerType.ORGANIZER),
    ownerId: objectIdSchema.optional(),
    organizationId: objectIdSchema.optional(),
    visibility: TemplateVisibility.default(configConstants.TemplateVisibility.PRIVATE),
    status: TemplateStatus.default(configConstants.TemplateStatus.ACTIVE),
    isReusable: z.boolean().default(true),
    eventIds: z.array(objectIdSchema).max(100).default([]),
    ticketRefs: z.array(ticketReferenceSchema).max(500).default([]),
    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
    config: templateConfigSchema,
  })
  .strict();

export const updateDesignTemplateSchema = createDesignTemplateSchema.partial().strict();

export const designTemplateParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const designTemplateQuerySchema = z
  .object({
    renderType: RenderableAssetType.optional(),
    visibility: TemplateVisibility.optional(),
    status: TemplateStatus.optional(),
    ownerType: TemplateOwnerType.optional(),
    organizationId: objectIdSchema.optional(),
    eventId: objectIdSchema.optional(),
    ticketId: objectIdSchema.optional(),
    includeArchived: z.coerce.boolean().default(false),
  })
  .strict()
  .partial();

export type CreateDesignTemplateInput = z.infer<typeof createDesignTemplateSchema>;
export type UpdateDesignTemplateInput = z.infer<typeof updateDesignTemplateSchema>;
export type DesignTemplateQueryInput = z.infer<typeof designTemplateQuerySchema>;
