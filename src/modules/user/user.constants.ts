export const USER_ROLES = ["user", "admin", "moderator", "taskmaster"] as const;
export const ORGANIZATION_ROLES = [
  "admin",
  "member",
  "system",
  "owner",
  "volunteer",
  "taskmaster",
  "manager",
  "undefine",
] as const;
export const AUTH_PROVIDERS = ["local", "google"] as const;
export const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
