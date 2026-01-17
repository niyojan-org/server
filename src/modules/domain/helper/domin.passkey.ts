import env from "@config/env";
import { DomainModel } from "../domain.model";

export const getPasskeyDomain = async () => {
  const docs = await DomainModel.find({
    "purposes.passkey": true,
    isActive: true,
    environment: env.NODE_ENV,
  }).select("domain");

  const domains = docs.map((d) => d.domain);
  return domains;
};
