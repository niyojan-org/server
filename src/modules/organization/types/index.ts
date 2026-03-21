import z from "zod";
import {
  AddressSchema,
  DocumentSchema,
  OrganizationCreateSchema,
  SocialLinksSchema,
  SupportContactSchema,
} from "./organization.create.schema";
import { OrganizationBankSchema, OrganizationBankInputSchema, PaymentGatewaysSchema } from "./organization.bank.schema";
import { OrganizationUpdateSchema } from "./organization.update.schema";
import { OrganizationSystemSchema } from "./organization.system.schema";
import organizationSchema, {
  FraudFlagSchema,
  StatsSchema,
  WarningSchema,
} from "./organization.schema";

// Schemas
export {
  AddressSchema,
  SupportContactSchema,
  SocialLinksSchema,
  DocumentSchema,
  OrganizationCreateSchema,
} from "./organization.create.schema";

export { OrganizationBankSchema, OrganizationBankInputSchema, PaymentGatewaysSchema } from "./organization.bank.schema";

export { OrganizationUpdateSchema } from "./organization.update.schema";

export { OrganizationSystemSchema } from "./organization.system.schema";

export {
  FraudFlagSchema,
  WarningSchema,
  StatsSchema,
  default as organizationSchema,
} from "./organization.schema";

export * from "./verification.schemas";

// Enums
export { OrganizationCategory, BlockType, RiskLevel, Severity } from "./organization.enums";

// Types derived from schemas
export type OrganizationAddress = z.infer<typeof AddressSchema>;
export type OrganizationSupportContact = z.infer<typeof SupportContactSchema>;
export type OrganizationSocialLinks = z.infer<typeof SocialLinksSchema>;
export type OrganizationDocument = z.infer<typeof DocumentSchema>;
export type OrganizationCreate = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationBank = z.infer<typeof OrganizationBankSchema>;
export type OrganizationBankInput = z.infer<typeof OrganizationBankInputSchema>;
export type PaymentGateways = z.infer<typeof PaymentGatewaysSchema>;
export type OrganizationUpdate = z.infer<typeof OrganizationUpdateSchema>;
export type OrganizationSystem = z.infer<typeof OrganizationSystemSchema>;
export type FraudFlag = z.infer<typeof FraudFlagSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type Organization = z.infer<typeof organizationSchema>;
