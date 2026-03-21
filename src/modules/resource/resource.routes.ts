import { Router } from "express";
import * as resourceController from "./resource.controller";
import { validate } from "@core/middlewares/validate.middleware";
import { authenticate } from "@core/middlewares/auth.middleware";
import { organizationRole } from "@core/middlewares/organization.middleware";
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  resourceIdParamSchema,
  deleteResourceQuerySchema,
  batchDeleteResourceSchema,
} from "./resource.schema";
import { upload, uploadToCloudinary } from "./middleware/upload.middleware";
import { isTaskMaster } from "@core/middlewares/taskmaster.middleware";
import { Request, Response, NextFunction } from "express";
import ApiError from "@core/errors/api.error";

const router = Router();

const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    if (err.message.includes("Unexpected end of form")) {
      return next(
        new ApiError(
          400,
          "Invalid file upload - request was interrupted or malformed",
          "INVALID_UPLOAD",
        ),
      );
    }
    if (err.message.includes("File too large")) {
      return next(new ApiError(413, "File size exceeds maximum limit", "FILE_TOO_LARGE"));
    }
    if (err.message.includes("Unexpected field")) {
      return next(
        new ApiError(
          400,
          "Unexpected form field - ensure you're uploading with field name 'file'",
          "INVALID_FIELD",
        ),
      );
    }
  }
  next(err);
};

// Public routes (no authentication required for listing public resources)
// SECURITY: These routes STRICTLY enforce isPublic: true to prevent unauthorized access
router.get("/public", validate({ query: resourceQuerySchema }), resourceController.listPublicResources);
router.get(
  "/public/:id",
  validate({ params: resourceIdParamSchema }),
  resourceController.getPublicResource,
);

// Protected routes (require authentication)
router.use(authenticate);

// Create resource (requires file upload)
router.post(
  "/",
  (req, res, next) =>
    upload.single("file")(req, res, (err) => handleMulterError(err, req, res, next)),
  uploadToCloudinary,
  validate({ body: createResourceSchema.partial({ url: true, metadata: true }) }),
  resourceController.createResource,
);

router.use(isTaskMaster());
// Batch delete resources (must come before /:id routes)
router.post(
  "/batch-delete",
  organizationRole("owner", "admin"),
  validate({ body: batchDeleteResourceSchema }),
  resourceController.batchDeleteResources,
);

// Organization-specific resources (must come before /:id)
router.get(
  "/organization/:organizationId",
  organizationRole("owner", "admin", "manager", "member"),
  validate({ query: resourceQuerySchema }),
  resourceController.getResourcesByOrganization,
);

// Event-specific resources (must come before /:id)
router.get(
  "/event/:eventId",
  validate({ query: resourceQuerySchema }),
  resourceController.getResourcesByEvent,
);

// List and search resources
router.get("/list", validate({ query: resourceQuerySchema }), resourceController.listResources);

// Download resource (tracks download count)
router.get(
  "/:id/download",
  validate({ params: resourceIdParamSchema }),
  resourceController.downloadResource,
);

// Get single resource
router.get("/:id", validate({ params: resourceIdParamSchema }), resourceController.getResource);

// Update resource metadata (no file upload)
router.patch(
  "/:id",
  organizationRole("owner", "admin", "manager"),
  validate({ params: resourceIdParamSchema, body: updateResourceSchema }),
  resourceController.updateResource,
);

// Replace resource file
router.put(
  "/:id/file",
  organizationRole("owner", "admin", "manager"),
  (req, res, next) =>
    upload.single("file")(req, res, (err) => handleMulterError(err, req, res, next)),
  uploadToCloudinary,
  validate({ params: resourceIdParamSchema }),
  resourceController.replaceResourceFile,
);

// Restore soft-deleted resource
router.patch(
  "/:id/restore",
  organizationRole("owner", "admin"),
  validate({ params: resourceIdParamSchema }),
  resourceController.restoreResource,
);

// Delete resource (soft or hard)
router.delete(
  "/:id",
  organizationRole("owner", "admin"),
  validate({ params: resourceIdParamSchema, query: deleteResourceQuerySchema }),
  resourceController.deleteResource,
);

export default router;
