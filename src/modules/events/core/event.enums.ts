export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  BLOCKED = "blocked",
}

export enum EventMode {
  ONLINE = "online",
  OFFLINE = "offline",
  HYBRID = "hybrid",
}

export enum EventVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  UNLISTED = "unlisted",
}

export enum CustomField {
  TEXT = "text",
  TEXTAREA = "textarea",
  NUMBER = "number",
  EMAIL = "email",
  DATE = "date",
  DROPDOWN = "dropdown",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  TEL = "tel",
  URL = "url",
  TIME = "time",
}
