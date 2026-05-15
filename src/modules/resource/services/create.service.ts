import { Types } from "mongoose";
import ApiError from "@core/errors/api.error";
import logger from "@config/logger";
import { ResourceModel } from "../resource.model";
import { Resource, ResourceMetadata } from "../resource.types";
import { CreateResourceInput } from "../resource.schema";
import { cacheResource, clearResourceCaches } from "../resource.cache";

/**
 * Create a new resource
 */
export async function createResource(
  input: CreateResourceInput & { url: string; metadata: ResourceMetadata },
  userId: Types.ObjectId
): Promise<Resource> {
  try {
    const resourceData = {
      ...input,
      userId,
    };

    const resource = await ResourceModel.create(resourceData);

    // Cache the newly created resource
    await cacheResource(resource._id.toString(), resource.toObject());

    // Clear relevant caches
    if (resource.organizationId) {
      await clearResourceCaches(`org:${resource.organizationId}`);
    }
    if (resource.eventId) {
      await clearResourceCaches(`event:${resource.eventId}`);
    }

    return resource.toObject();
  } catch (error) {
    logger.error("Error creating resource:", error);
    throw new ApiError(
      500,
      "Failed to create resource",
      "RESOURCE_CREATE_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
