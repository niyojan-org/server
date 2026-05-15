import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { v2 as cloudinary } from "cloudinary";
import ApiError from "@core/errors/api.error";
import logger from "@config/logger";
import env from "@config/env";
import {
  validateMimeType,
  validateFileSize,
  getFileCategory,
  generateUniqueFilename,
} from "../helpers/file-validation.helper";
import { CLOUDINARY_FOLDERS } from "../resource.constants";
import { Readable } from "stream";

type CloudinaryUploadResult = {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
  folder: string;
};

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: env.CLOUDINARY_API_KEY.trim(),
  api_secret: env.CLOUDINARY_API_SECRET.trim(),
};
cloudinary.config(cloudinaryConfig);

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  try {
    validateMimeType(file.mimetype);
    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024,
    fields: 20,
  },
  fileFilter,
});

export interface UploadedFileRequest extends Request {
  fileUpload?: {
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resourceType: string;
    folder: string;
  };
}

export const uploadToCloudinary = async (
  req: UploadedFileRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return next();
    }

    const category = getFileCategory(req.file.mimetype);
    try {
      validateFileSize(req.file.size, category);
    } catch (validationError) {
      if (validationError instanceof ApiError) {
        logger.warn(
          `File validation failed: ${validationError.message} (File: ${req.file.originalname}, Size: ${(req.file.size / (1024 * 1024)).toFixed(2)}MB, Category: ${category})`,
        );
      }
      throw validationError;
    }

    // Determine folder from request body or use default
    const resourceType = req.body.type || "other";
    const folder = CLOUDINARY_FOLDERS[resourceType as keyof typeof CLOUDINARY_FOLDERS] || "misc";

    // Generate unique public_id
    const publicId = generateUniqueFilename(
      req.file.originalname,
      req.body.title?.replace(/\s+/g, "_"),
    );

    // Determine Cloudinary resource type
    const cloudinaryResourceType =
      category === "image" ? "image" : category === "video" ? "video" : "raw";

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `orgatick/${folder}`,
          public_id: publicId,
          resource_type: cloudinaryResourceType,
          // Transformations applied at delivery time via URL (getThumbnailUrl), not at upload
        },
        (error, result) => {
          if (error) {
            logger.error("Cloudinary upload error:", error);
            reject(
              new ApiError(500, "Failed to upload file", "CLOUDINARY_UPLOAD_ERROR", error.message),
            );
            return;
          }
          if (!result) {
            reject(
              new ApiError(
                500,
                "Failed to upload file",
                "CLOUDINARY_UPLOAD_ERROR",
                "Cloudinary returned no result",
              ),
            );
            return;
          }
          resolve(result as CloudinaryUploadResult);
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = Readable.from(req.file!.buffer);
      bufferStream.pipe(uploadStream);
    });

    // Attach upload result to request
    req.fileUpload = {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
      folder: result.folder,
    };

    next();
  } catch (error) {
    // Only log as error if it's not an ApiError (which indicates expected validation failure)
    if (error instanceof ApiError) {
      // ApiErrors are expected validation/business logic errors, just pass them through
      return next(error);
    }
    // Log unexpected errors
    logger.error("Unexpected error in uploadToCloudinary middleware:", error);
    next(error);
  }
};

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: resourceType,
    });
    logger.info(`Deleted file from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error(`Error deleting file from Cloudinary: ${publicId}`, error);
    throw new ApiError(
      500,
      "Failed to delete file from storage",
      "CLOUDINARY_DELETE_ERROR",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(
  publicId: string,
  width: number = 300,
  height: number = 300,
): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: "fill", gravity: "auto" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
}
