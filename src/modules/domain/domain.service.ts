import ApiError from "@core/errors/api.error";
import {
  clearAllDomainCaches,
  getCachedDomains,
  getDomainPurpose,
  getPurposeAndEnvCachedDomains,
  setCachedDomain,
  setDomainPurpose,
  setPurposeAndEnvCachedDomains,
} from "./domain.cache";
import { DomainModel } from "./domain.model";
import { CreateDomain, DomainPurpose } from "./domain.schema";

//CREATE DOMAIN
export async function createDomain(input: CreateDomain) {
  const exists = await DomainModel.findOne({
    domain: input.domain,
    environment: input.environment,
  });
  if (exists) {
    throw new ApiError(
      400,
      "Domain already exists",
      "DOMAIN_EXISTS",
      "Domain already exists in this environment"
    );
  }
  const domain = await DomainModel.create(input);
  await clearAllDomainCaches();
  return domain;
}

//READ DOMAINS
export async function getDomains() {
  const domains = await DomainModel.find();
  return domains;
}

export async function getDomainById(id: string) {
  const domain = await DomainModel.findById(id);
  return domain;
}

export async function getDomainByEnv(env: string) {
  const cached = await getCachedDomains(env);
  if (cached) {
    return cached;
  }
  const domains = await DomainModel.find({ environment: env, isActive: true });
  await setCachedDomain(env, domains);
  return domains;
}

export async function getDomainByPurposeAndEnv(
  purpose: DomainPurpose,
  env: string
) {
  const cached = await getPurposeAndEnvCachedDomains(purpose, env);
  if (cached) {
    return cached;
  }
  const domains = await DomainModel.find({
    environment: env,
    isActive: true,
    [`purposes.${purpose}`]: true,
  });
  await setPurposeAndEnvCachedDomains(purpose, env, domains);
  return domains;
}

export async function validateDomainPurpose(
  domain: string,
  env: string,
  purpose: DomainPurpose
) {
  const cached = await getDomainPurpose(domain, env, purpose);
  if (cached !== null) {
    return cached;
  }
  const domains = await DomainModel.findOne({ environment: env, domain: domain });
  if (!domains) {
    throw new ApiError(
      404,
      "Domain not found",
      "DOMAIN_NOT_FOUND",
      "The specified domain does not exist in this environment"
    );
  }
  if (!domains.purposes?.[purpose]) {
    await setDomainPurpose(domain, env, purpose, false);
    throw new ApiError(
      400,
      `Domain not allowed for ${purpose}`,
      "INVALID_DOMAIN_PURPOSE",
      `The domain is not registered for the purpose: ${purpose}`
    );
  }
  await setDomainPurpose(domain, env, purpose, true);
  return true;
}

//UPDATE DOMAIN
export async function updateDomain(id: string, input: Partial<CreateDomain>) {
  const domain = await DomainModel.findByIdAndUpdate(id, input, { returnDocument: 'after' });
  await clearAllDomainCaches();
  return domain;
}

//DELETE DOMAIN
export async function deleteDomain(id: string) {
  await DomainModel.findByIdAndDelete(id);
  await clearAllDomainCaches();
}
