const APP_PREFIX = "orgatick";

export const REDIS_KEYS = {
  //DOMAIN
  domainPrefix: () => `${APP_PREFIX}:domain:`,
  domainCaches: (env: string) => `${APP_PREFIX}:domain:${env}`,
  domainPurposeCache: (domain: string, environment: string) =>
    `${APP_PREFIX}:domain:${environment}:${domain}`,
};
