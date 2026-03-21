import ApiError from "@core/errors/api.error";
import { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS } from "../resource.constants";

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimetype: string): "image" | "video" | "audio" | "document" {
  if (ALLOWED_MIME_TYPES.image.includes(mimetype as any)) return "image";
  if (ALLOWED_MIME_TYPES.video.includes(mimetype as any)) return "video";
  if (ALLOWED_MIME_TYPES.audio.includes(mimetype as any)) return "audio";
  if (ALLOWED_MIME_TYPES.document.includes(mimetype as any)) return "document";
  throw new ApiError(400, "Unsupported file type", "UNSUPPORTED_FILE_TYPE", `File type ${mimetype} is not supported`);
}

/**
 * Validate file size based on category
 */
export function validateFileSize(size: number, category: keyof typeof FILE_SIZE_LIMITS): void {
  const maxSize = FILE_SIZE_LIMITS[category];
  if (size > maxSize) {
    throw new ApiError(
      400,
      "File size exceeds limit",
      "FILE_TOO_LARGE",
      `File size must be less than ${maxSize / (1024 * 1024)}MB for ${category} files`
    );
  }
}

/**
 * Validate file MIME type
 */
export function validateMimeType(mimetype: string): void {
  const allAllowedTypes = [
    ...ALLOWED_MIME_TYPES.image,
    ...ALLOWED_MIME_TYPES.video,
    ...ALLOWED_MIME_TYPES.audio,
    ...ALLOWED_MIME_TYPES.document,
  ];

  if (!allAllowedTypes.includes(mimetype as any)) {
    throw new ApiError(
      400,
      "Unsupported file type",
      "UNSUPPORTED_FILE_TYPE",
      `File type ${mimetype} is not allowed`
    );
  }
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return prefix ? `${prefix}_${timestamp}_${random}_${sanitized}` : `${timestamp}_${random}_${sanitized}`;
}

/**
 * Extract file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts[parts.length - 1] || "").toLowerCase() : "";
}
