export const RESOURCE_TYPES = [
  "logo",
  "carousel",
  "event-banner",
  "flyer",
  "poster",
  "profile-picture",
  "cover-image",
  "document",
  "video",
  "audio",
  "other",
] as const;

export const RESOURCE_STATUS = ["active", "inactive", "archived", "processing"] as const;

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
  document: 25 * 1024 * 1024, // 25MB
} as const;

export const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  audio: ["audio/mpeg", "audio/ogg", "audio/wav"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
} as const;

export const MAX_TAGS_PER_RESOURCE = 10;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;

export const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
} as const;

export const CLOUDINARY_FOLDERS = {
  logo: "logos",
  carousel: "carousels",
  "event-banner": "event-banners",
  flyer: "flyers",
  poster: "posters",
  "profile-picture": "profile-pictures",
  "cover-image": "cover-images",
  document: "documents",
  video: "videos",
  audio: "audio",
  other: "misc",
} as const;
