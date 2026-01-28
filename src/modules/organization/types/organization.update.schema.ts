import z from "zod";
import {
  AddressSchema,
  SocialLinksSchema,
  SupportContactSchema,
} from "./organization.create.schema";

export const OrganizationUpdateSchema = z.object({
  description: z
    .string({ message: "Description must be a string" })
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(1000, { message: "Description must be at most 1000 characters long" })
    .optional(),
  logo: z.url({ message: "Please provide a valid logo URL" }).optional(),
  address: AddressSchema.optional(),

  supportContact: SupportContactSchema.optional(),

  socialLinks: SocialLinksSchema.optional(),
});
