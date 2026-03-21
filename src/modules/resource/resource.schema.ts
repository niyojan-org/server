import { Types } from "mongoose";
import z from "zod";
import {
  RESOURCE_TYPES,
  RESOURCE_STATUS,
  MAX_TAGS_PER_RESOURCE,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "./resource.constants";

// Base Resource Schema
export const resourceSchema = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  organizationId: z.instanceof(Types.ObjectId).optional(),
  eventId: z.instanceof(Types.ObjectId).optional(),
  userId: z.instanceof(Types.ObjectId),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(MAX_TITLE_LENGTH, `Title cannot exceed ${MAX_TITLE_LENGTH} characters`)
    .trim(),
  type: z.enum(RESOURCE_TYPES),
  url: z.string().url("Invalid URL format").trim(),
  link: z.string().url("Invalid link format").trim().optional(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`)
    .trim()
    .optional(),
  tags: z
    .array(z.string().trim())
    .max(MAX_TAGS_PER_RESOURCE, `Cannot have more than ${MAX_TAGS_PER_RESOURCE} tags`)
    .default([]),
  priority: z.number().int().min(0, "Priority must be non-negative").default(0),
  status: z.enum(RESOURCE_STATUS).default("active"),
  metadata: z.record(z.string(), z.any()).default({}),
  viewCount: z.number().int().min(0).default(0).optional(),
  downloadCount: z.number().int().min(0).default(0).optional(),
  isPublic: z.coerce.boolean().default(false),
  expiresAt: z.coerce.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create Resource Schema (without auto-generated fields)
export const createResourceSchema = resourceSchema.omit({
  _id: true,
  userId: true,
  viewCount: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
});

// Update Resource Schema (partial, without protected fields)
export const updateResourceSchema = resourceSchema
  .omit({
    _id: true,
    userId: true,
    url: true, // URL cannot be updated directly
    metadata: true, // Metadata managed by file upload
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// Query Filters Schema
export const resourceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(RESOURCE_TYPES).optional(),
  status: z.enum(RESOURCE_STATUS).optional(),
  organizationId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid organization ID",
    })
    .optional(),
  eventId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid event ID",
    })
    .optional(),
  userId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid user ID",
    })
    .optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(),
  sort: z.string().default("-priority"),
  minPriority: z.coerce.number().optional(),
  maxPriority: z.coerce.number().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  isPublic: z.coerce.boolean().optional(),
});

// Param Schemas
export const resourceIdParamSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid resource ID format",
  }),
});

// Delete Query Schema
export const deleteResourceQuerySchema = z.object({
  hard: z.enum(["true", "false"]).default("false"),
});

// Batch Delete Schema
export const batchDeleteResourceSchema = z.object({
  ids: z
    .array(z.string().refine((val) => Types.ObjectId.isValid(val)))
    .min(1, "At least one ID required"),
  hard: z.boolean().default(false),
});

// Type Inference
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
export type BatchDeleteInput = z.infer<typeof batchDeleteResourceSchema>;
