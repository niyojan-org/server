import env from "@config/env";

export const REDIRECT_REGISTRY = {
  app: {
    base: env.NODE_ENV === "production" ? "https://orgatick.in" : "https://iamabhi.me",
    allowedPaths: ["/dashboard", "/events", "/events/", "/checkout", "/profile"],
  },
  admin: {
    base: "https://admin.orgatick.in",
    allowedPaths: ["/dashboard", "/login", "/org", "/org/setup"],
  },
} as const;
