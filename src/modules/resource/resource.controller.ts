import { asyncHandler } from "@core/utils/asyncHandler";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import * as resourceService from "./resource.service";
import { UploadedFileRequest } from "./middleware/upload.middleware";
import ApiError from "@core/errors/api.error";
import { Response } from "express";
import { CreateResourceInput } from "./resource.schema";

/**
 * Create a new resource
 */
export const createResource = asyncHandler(
  async (req: AuthenticatedRequest & UploadedFileRequest, res) => {
    // console.log(req.body);
    if (!req.file || !req.fileUpload) {
      throw new ApiError(
        400,
        "File upload is required",
        "FILE_REQUIRED",
        "You must upload a file for the resource",
      );
    }

    const input: CreateResourceInput & { url: string; metadata: any } = {
      ...req.body,
      url: req.fileUpload.secureUrl,
      metadata: {
        publicId: req.fileUpload.publicId,
        folder: req.fileUpload.folder,
        format: req.fileUpload.format,
        width: req.fileUpload.width,
        height: req.fileUpload.height,
        bytes: req.fileUpload.bytes,
        resourceType: req.fileUpload.resourceType,
      },
    };

    // Handle tags if provided as comma-separated string
    if (typeof req.body.tags === "string") {
      input.tags = req.body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const resource = await resourceService.createResource(input, req.user!._id);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  },
);

/**
 * List resources with filters
 */
export const listResources = asyncHandler(async (req, res) => {
  const result = await resourceService.listResources(req.query);

  res.status(200).json({
    success: true,
    message: "Resources fetched successfully",
    data: result.resources,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

/**
 * Get resource by ID
 */
export const getResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(req.params.id, true);

  res.status(200).json({
    success: true,
    message: "Resource fetched successfully",
    data: resource,
  });
});

/**
 * Update resource
 */
export const updateResource = asyncHandler(async (req, res) => {
  // Handle tags if provided as comma-separated string
  if (typeof req.body.tags === "string") {
    req.body.tags = req.body.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
  }

  const resource = await resourceService.updateResource(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Resource updated successfully",
    data: resource,
  });
});

/**
 * Replace resource file
 */
export const replaceResourceFile = asyncHandler(async (req: UploadedFileRequest, res) => {
  if (!req.file || !req.fileUpload) {
    throw new ApiError(
      400,
      "File upload is required",
      "FILE_REQUIRED",
      "You must upload a file to replace",
    );
  }

  const metadata = {
    publicId: req.fileUpload.publicId,
    folder: req.fileUpload.folder,
    format: req.fileUpload.format,
    width: req.fileUpload.width,
    height: req.fileUpload.height,
    bytes: req.fileUpload.bytes,
    resourceType: req.fileUpload.resourceType,
  };

  const resource = await resourceService.replaceResourceFile(
    req.params.id as string,
    req.fileUpload.secureUrl,
    metadata,
  );

  res.status(200).json({
    success: true,
    message: "Resource file replaced successfully",
    data: resource,
  });
});

/**
 * Delete resource
 */
export const deleteResource = asyncHandler(async (req, res) => {
  const hard = req.query.hard === "true";
  await resourceService.deleteResource(req.params.id, hard);

  res.status(200).json({
    success: true,
    message: hard ? "Resource permanently deleted" : "Resource deactivated",
  });
});

/**
 * Restore resource
 */
export const restoreResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.restoreResource(req.params.id);

  res.status(200).json({
    success: true,
    message: "Resource restored successfully",
    data: resource,
  });
});

/**
 * Batch delete resources
 */
export const batchDeleteResources = asyncHandler(async (req, res) => {
  const { ids, hard } = req.body;
  const deletedCount = await resourceService.batchDeleteResources(ids, hard);

  res.status(200).json({
    success: true,
    message: `${deletedCount} resource${deletedCount !== 1 ? "s" : ""} deleted`,
    data: { deletedCount },
  });
});

/**
 * Get resources by organization
 */
export const getResourcesByOrganization = asyncHandler(async (req, res) => {
  const result = await resourceService.getResourcesByOrganization(
    req.params.organizationId,
    req.query,
  );

  res.status(200).json({
    success: true,
    message: "Organization resources fetched successfully",
    data: result.resources,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

/**
 * Get resources by event
 */
export const getResourcesByEvent = asyncHandler(async (req, res) => {
  const result = await resourceService.getResourcesByEvent(req.params.eventId, req.query);

  res.status(200).json({
    success: true,
    message: "Event resources fetched successfully",
    data: result.resources,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

/**
 * Download resource (increment download count)
 */
export const downloadResource = asyncHandler(async (req, res: Response) => {
  const resource = await resourceService.getResourceById(req.params.id);
  await resourceService.incrementDownloadCount(req.params.id);

  // Redirect to the resource URL
  res.redirect(resource.url);
});

/**
 * List PUBLIC resources ONLY - strictly enforces isPublic: true
 * Used for /public endpoint - prevents access to non-public resources
 */
export const listPublicResources = asyncHandler(async (req, res) => {
  // Strictly enforce public resources only, ignoring any user-provided isPublic param
  const result = await resourceService.listPublicResources(req.query);

  res.status(200).json({
    success: true,
    message: "Public resources fetched successfully",
    data: result.resources,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
});

/**
 * Get PUBLIC resource by ID ONLY - strictly enforces isPublic: true
 * Used for /public/:id endpoint - prevents access to non-public resources
 */
export const getPublicResource = asyncHandler(async (req, res) => {
  // Strictly enforce public resource only
  const resource = await resourceService.getPublicResourceById(req.params.id, true);

  res.status(200).json({
    success: true,
    message: "Public resource fetched successfully",
    data: resource,
  });
});

