import { REDIRECT_REGISTRY } from "./redirect-registry";

export function resolveRedirect(intent?: string): string | null {
  if (!intent) return null;

  const [app, path = "/dashboard"] = intent.split(":");

  const config = REDIRECT_REGISTRY[app as keyof typeof REDIRECT_REGISTRY];
  if (!config) return null;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const allowed = config.allowedPaths.some(
    (p) => normalizedPath === p || normalizedPath.startsWith(p)
  );

  if (!allowed) return null;

  return `${config.base}${normalizedPath}`;
}

export const extractIntent = (state?: string): string | null => {
  if (!state) return null;
  try {
    return JSON.parse(Buffer.from(state, "base64").toString()).redirect;
  } catch {
    return null;
  }
};
