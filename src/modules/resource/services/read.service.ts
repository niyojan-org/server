import ApiError from "@core/errors/api.error";
import logger from "@config/logger";
import { ResourceModel } from "../resource.model";
import { Resource } from "../resource.types";
import { getCachedResource, cacheResource, incrementViewCount } from "../resource.cache";

/**
 * Get resource by ID
 */
export async function getResourceById(id: string, incrementView: boolean = false): Promise<Resource> {
  try {
    // Check cache first
    const cached = await getCachedResource(id);
    if (cached) {
      if (incrementView) {
        await incrementViewCount(id);
      }
      return cached;
    }

    const resource = await ResourceModel.findById(id);
    if (!resource) {
      throw new ApiError(404, "Resource not found", "RESOURCE_NOT_FOUND", `Resource with ID ${id} not found`);
    }

    // Cache the resource
    await cacheResource(id, resource.toObject());

    // Increment view count if requested
    if (incrementView) {
      await ResourceModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      await incrementViewCount(id);
    }

    return resource.toObject();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error fetching resource:", error);
    throw new ApiError(
      500,
      "Failed to fetch resource",
      "RESOURCE_FETCH_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Get PUBLIC resource by ID - strictly enforces isPublic: true
 * This function is used for public endpoints to prevent unauthorized access
 */
export async function getPublicResourceById(id: string, incrementView: boolean = false): Promise<Resource> {
  try {
    const resource = await ResourceModel.findOne({ _id: id, isPublic: true, status: "active" });
    
    if (!resource) {
      throw new ApiError(
        404,
        "Public resource not found",
        "RESOURCE_NOT_FOUND",
        "The requested resource is not available publicly"
      );
    }

    // Increment view count if requested
    if (incrementView) {
      await ResourceModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    }

    return resource.toObject();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error("Error fetching public resource:", error);
    throw new ApiError(
      500,
      "Failed to fetch public resource",
      "RESOURCE_FETCH_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(id: string): Promise<void> {
  try {
    await ResourceModel.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
  } catch (error) {
    logger.error("Error incrementing download count:", error);
  }
}
