import { REDIS_KEYS } from "@config/redis.keys";
import { Domain } from "./domain.types";
import redis from "@config/redis";

export async function getCachedDomains(env: string): Promise<Domain[] | null> {
  const key = REDIS_KEYS.domainCaches(env);
  const domains = await redis.get(key);
  return domains ? JSON.parse(domains) : null;
}

export async function setCachedDomain(env: string, domains: Domain[]) {
  const key = REDIS_KEYS.domainCaches(env);
  await redis.set(key, JSON.stringify(domains), "EX", 60 * 10);
}

export async function clearCachedDomains(env: string) {
  const key = REDIS_KEYS.domainCaches(env);
  await redis.del(key);
}

export async function setPurposeAndEnvCachedDomains(
  purpose: string,
  env: string,
  domains: Domain[]
) {
  const key = `${REDIS_KEYS.domainCaches(env)}:purpose:${purpose}`;
  await redis.set(key, JSON.stringify(domains), "EX", 60 * 10);
}

export async function getPurposeAndEnvCachedDomains(
  purpose: string,
  env: string
): Promise<Domain[] | null> {
  const key = `${REDIS_KEYS.domainCaches(env)}:purpose:${purpose}`;
  const domains = await redis.get(key);
  return domains ? JSON.parse(domains) : null;
}

export async function setDomainPurpose(
  domain: string,
  environment: string,
  purpose: string,
  isAllowed: boolean
) {
  const key = `${REDIS_KEYS.domainPurposeCache(domain, environment)}:purpose:${purpose}`;
  await redis.set(key, JSON.stringify(isAllowed), "EX", 60 * 10);
}

export async function getDomainPurpose(
  domain: string,
  environment: string,
  purpose: string
): Promise<boolean | null> {
  const key = `${REDIS_KEYS.domainPurposeCache(domain, environment)}:purpose:${purpose}`;
  const isAllowed = await redis.get(key);
  return isAllowed ? JSON.parse(isAllowed) : null;
}

export async function clearAllDomainCaches() {
  // Use wildcard pattern to match all domain-related keys
  const pattern = `${REDIS_KEYS.domainPrefix()}*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
