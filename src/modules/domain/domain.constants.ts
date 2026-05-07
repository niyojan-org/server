export const DOMAIN_ENVIRONMENTS = ["development", "staging", "production", "test"] as const;

export const DOMAIN_PURPOSES = ["cors", "passkey", "oauth", "api", "admin"] as const;

export type DomainEnvironment = (typeof DOMAIN_ENVIRONMENTS)[number];

export const DOMAIN_REGEX =
  /^(https?:\/\/)?((localhost)|([\w-]+(\.[\w-]+)+)|(\d{1,3}(\.\d{1,3}){3}))(:\d{1,5})?(\/.*)?$/i;
