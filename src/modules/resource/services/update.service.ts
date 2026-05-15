import ApiError from "@core/errors/api.error";
import logger from "@config/logger";
import { ResourceModel } from "../resource.model";
import { Resource, ResourceMetadata } from "../resource.types";
import { UpdateResourceInput } from "../resource.schema";
import { invalidateResourceCache, clearResourceCaches } from "../resource.cache";
import { deleteFromCloudinary } from "../middleware/upload.middleware";

/**
 * Update resource
 */
export async function updateResource(id: string, input: UpdateResourceInput): Promise<Resource> {
  try {
    const resource = await ResourceModel.findById(id);
    if (!resource) {
      throw new ApiError(404, "Resource not found", "RESOURCE_NOT_FOUND", `Resource with ID ${id} not found`);
    }

    // Update fields
    Object.keys(input).forEach((key) => {
      if (input[key as keyof UpdateResourceInput] !== undefined) {
        (resource as unknown as Record<string, unknown>)[key] = input[key as keyof UpdateResourceInput];
      }
    });

    await resource.save();

    // Invalidate cache
    await invalidateResourceCache(id);
    if (resource.organizationId) {
      await clearResourceCaches(`org:${resource.organizationId}`);
    }
    if (resource.eventId) {
      await clearResourceCaches(`event:${resource.eventId}`);
    }
    
    return resource.toObject();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error updating resource:", error);
    throw new ApiError(
      500,
      "Failed to update resource",
      "RESOURCE_UPDATE_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Replace resource file (upload new file and delete old)
 */
export async function replaceResourceFile(
  id: string,
  newUrl: string,
  newMetadata: ResourceMetadata
): Promise<Resource> {
  try {
    const resource = await ResourceModel.findById(id);
    if (!resource) {
      throw new ApiError(404, "Resource not found", "RESOURCE_NOT_FOUND", `Resource with ID ${id} not found`);
    }

    // Delete old file from Cloudinary if it exists
    if (resource.metadata?.publicId) {
      const resourceType = resource.metadata.resourceType || "image";
      await deleteFromCloudinary(resource.metadata.publicId, resourceType);
    }

    // Update with new file
    resource.url = newUrl;
    resource.metadata = newMetadata;
    resource.status = "active"; // Reactivate if it was inactive

    await resource.save();

    // Invalidate cache
    await invalidateResourceCache(id);
    return resource.toObject();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error replacing resource file:", error);
    throw new ApiError(
      500,
      "Failed to replace resource file",
      "RESOURCE_REPLACE_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Restore a soft-deleted resource
 */
export async function restoreResource(id: string): Promise<Resource> {
  try {
    const resource = await ResourceModel.findById(id);
    if (!resource) {
      throw new ApiError(404, "Resource not found", "RESOURCE_NOT_FOUND", `Resource with ID ${id} not found`);
    }

    resource.status = "active";
    await resource.save();

    // Invalidate cache
    await invalidateResourceCache(id);
    return resource.toObject();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error restoring resource:", error);
    throw new ApiError(
      500,
      "Failed to restore resource",
      "RESOURCE_RESTORE_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
