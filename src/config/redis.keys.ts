const APP_PREFIX = "orgatick";

export const REDIS_KEYS = {
  //DOMAIN
  domainPrefix: () => `${APP_PREFIX}:domain:`,
  domainCaches: (env: string) => `${APP_PREFIX}:domain:${env}`,
  domainPurposeCache: (domain: string, environment: string) =>
    `${APP_PREFIX}:domain:${environment}:${domain}`,
  
  //RESOURCE
  RESOURCE: `${APP_PREFIX}:resource`,
  resourceById: (id: string) => `${APP_PREFIX}:resource:${id}`,
  resourceViews: (id: string) => `${APP_PREFIX}:resource:views:${id}`,
  resourcesByOrg: (orgId: string) => `${APP_PREFIX}:resource:org:${orgId}`,
  resourcesByEvent: (eventId: string) => `${APP_PREFIX}:resource:event:${eventId}`,
};
