import { Types } from 'mongoose';
import { z } from 'zod';
import { RenderableAssetType } from '@modules/renderers';
import * as configConstants from '@modules/renderers/constants/config.constants';

export const generatedAssetStatusSchema = z.enum(['pending', 'generated', 'failed']);

export const generatedAssetSchema = z
  .object({
    _id: z.instanceof(Types.ObjectId).optional(),
    registrationId: z.instanceof(Types.ObjectId),
    participantId: z.instanceof(Types.ObjectId),
    eventId: z.instanceof(Types.ObjectId),
    ticketId: z.instanceof(Types.ObjectId),
    templateId: z.instanceof(Types.ObjectId),
    renderType: RenderableAssetType.default(configConstants.RenderableAssetType.TICKET),
    format: z.string().default('png'),
    status: generatedAssetStatusSchema.default('pending'),
    url: z.string().optional(),
    publicId: z.string().optional(),
    mimeType: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    bytes: z.number().optional(),
    error: z.string().max(2000).optional(),
    traceId: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .strict();

export type GeneratedAsset = z.infer<typeof generatedAssetSchema>;
