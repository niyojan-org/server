import ApiError from "@core/errors/api.error";
import logger from "@config/logger";
import { ResourceModel } from "../resource.model";
import { invalidateResourceCache, clearResourceCaches } from "../resource.cache";
import { deleteFromCloudinary } from "../middleware/upload.middleware";

/**
 * Delete resource (soft or hard)
 */
export async function deleteResource(id: string, hard: boolean = false): Promise<void> {
  try {
    const resource = await ResourceModel.findById(id);
    if (!resource) {
      throw new ApiError(404, "Resource not found", "RESOURCE_NOT_FOUND", `Resource with ID ${id} not found`);
    }

    if (hard) {
      // Hard delete: remove file from Cloudinary and database
      if (resource.metadata?.publicId) {
        const resourceType = resource.metadata.resourceType || "image";
        await deleteFromCloudinary(resource.metadata.publicId, resourceType);
      }
      await ResourceModel.findByIdAndDelete(id);
    } else {
      // Soft delete: set status to inactive
      resource.status = "inactive";
      await resource.save();
    }

    // Invalidate cache
    await invalidateResourceCache(id);
    if (resource.organizationId) {
      await clearResourceCaches(`org:${resource.organizationId}`);
    }
    if (resource.eventId) {
      await clearResourceCaches(`event:${resource.eventId}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error deleting resource:", error);
    throw new ApiError(
      500,
      "Failed to delete resource",
      "RESOURCE_DELETE_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Batch delete resources
 */
export async function batchDeleteResources(ids: string[], hard: boolean = false): Promise<number> {
  try {
    let deletedCount = 0;

    for (const id of ids) {
      try {
        await deleteResource(id, hard);
        deletedCount++;
      } catch (error) {
        logger.error(`Error deleting resource ${id}:`, error);
        // Continue with other resources
      }
    }
    
    return deletedCount;
  } catch (error) {
    logger.error("Error in batch delete:", error);
    throw new ApiError(
      500,
      "Failed to batch delete resources",
      "BATCH_DELETE_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
