import { Types } from "mongoose";
import ApiError from "@core/errors/api.error";
import logger from "@config/logger";
import { ResourceModel } from "../resource.model";
import { Resource, ResourceQueryFilters, ResourceListResponse } from "../resource.types";

/**
 * Build MongoDB query from filters
 */
function buildQuery(filters: ResourceQueryFilters): Record<string, unknown> {
  const {
    type,
    status,
    organizationId,
    eventId,
    userId,
    tags,
    search,
    minPriority,
    maxPriority,
    createdFrom,
    createdTo,
    isPublic,
  } = filters;

  const query: Record<string, unknown> = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (organizationId) query.organizationId = new Types.ObjectId(organizationId);
  if (eventId) query.eventId = new Types.ObjectId(eventId);
  if (userId) query.userId = new Types.ObjectId(userId);
  if (isPublic !== undefined) query.isPublic = isPublic;

  // Tags filter (match all provided tags)
  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim());
    query.tags = { $all: tagArray };
  }

  // Priority range filter
  if (minPriority !== undefined || maxPriority !== undefined) {
    const priority: Record<string, number> = {};
    if (minPriority !== undefined) priority.$gte = minPriority;
    if (maxPriority !== undefined) priority.$lte = maxPriority;
    query.priority = priority;
  }

  // Date range filter
  if (createdFrom || createdTo) {
    const createdAt: Record<string, Date> = {};
    if (createdFrom) createdAt.$gte = new Date(createdFrom);
    if (createdTo) createdAt.$lte = new Date(createdTo);
    query.createdAt = createdAt;
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  return query;
}

/**
 * Build sort object from sort string
 */
function buildSort(sort: string): Record<string, 1 | -1> {
  const sortObj: Record<string, 1 | -1> = {};
  const sortFields = sort.split(",");

  sortFields.forEach((field) => {
    if (field.startsWith("-")) {
      sortObj[field.slice(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
}

/**
 * List resources with filtering, pagination, and sorting
 */
export async function listResources(filters: ResourceQueryFilters): Promise<ResourceListResponse> {
  try {
    const { page = 1, limit = 20, sort = "-priority" } = filters;

    // Build filter query
    const query = buildQuery(filters);

    // Build sort object
    const sortObj = buildSort(sort);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [resources, total] = await Promise.all([
      ResourceModel.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      ResourceModel.countDocuments(query),
    ]);

    return {
      resources: resources as Resource[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Error listing resources:", error);
    throw new ApiError(
      500,
      "Failed to list resources",
      "RESOURCE_LIST_ERROR",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

/**
 * Get resources by organization
 */
export async function getResourcesByOrganization(
  organizationId: string,
  filters?: Partial<ResourceQueryFilters>,
): Promise<ResourceListResponse> {
  return listResources({ ...filters, organizationId });
}

/**
 * Get resources by event
 */
export async function getResourcesByEvent(
  eventId: string,
  filters?: Partial<ResourceQueryFilters>,
): Promise<ResourceListResponse> {
  return listResources({ ...filters, eventId });
}

/**
 * Get resources by user
 */
export async function getResourcesByUser(
  userId: string,
  filters?: Partial<ResourceQueryFilters>,
): Promise<ResourceListResponse> {
  return listResources({ ...filters, userId });
}
/**
 * List PUBLIC resources ONLY - strictly enforces isPublic: true
 * This function is used for public endpoints to prevent unauthorized access
 * Ignores any isPublic param from user input to prevent bypass attempts
 */
export async function listPublicResources(filters: ResourceQueryFilters): Promise<ResourceListResponse> {
  try {
    const { page = 1, limit = 20, sort = "-priority" } = filters;

    // Build query but FORCE isPublic: true and status: active
    // Ignore user-provided isPublic value to prevent security bypass
    const query = buildQuery(filters);
    
    // STRICTLY enforce public and active status - cannot be overridden
    query.isPublic = true;
    query.status = "active";

    // Build sort object
    const sortObj = buildSort(sort);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [resources, total] = await Promise.all([
      ResourceModel.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      ResourceModel.countDocuments(query),
    ]);

    return {
      resources: resources as Resource[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Error listing public resources:", error);
    throw new ApiError(
      500,
      "Failed to list public resources",
      "RESOURCE_LIST_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}