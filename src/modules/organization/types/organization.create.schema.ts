import z from "zod";
import * as OrganizationEnums from "./organization.enums";
import { OrganizationBankSchema } from "./organization.bank.schema";
import { objectIdSchema } from "@helpers/zod";

/* ---------- sub-schemas ---------- */

export const AddressSchema = z.object({
  locality: z.string({ message: "Locality is required" }).min(3),
  city: z.string({ message: "City is required" }).min(2),
  state: z.string({ message: "State is required" }).min(2),
  country: z.string({ message: "Country is required" }).min(2),
  zipCode: z.string({ message: "Zip code is required" }).min(4),
});

export const SupportContactSchema = z.object({
  name: z.string({ message: "Support contact name is required" }).min(2),
  email: z.email("Please provide a valid support contact email address"),
  phone: z
    .string({ message: "Support contact phone number is required" })
    .min(10, { message: "Support contact phone number must be at least 10 characters long" })
    .max(15, { message: "Support contact phone number must be at most 15 characters long" }),
});

export const SocialLinksSchema = z
  .object({
    facebook: z.url("Please provide a valid Facebook URL").optional(),
    instagram: z.url("Please provide a valid Instagram URL").optional(),
    linkedin: z.url("Please provide a valid LinkedIn URL").optional(),
    twitter: z.url("Please provide a valid Twitter URL").optional(),
    youtube: z.url("Please provide a valid YouTube URL").optional(),
    blog: z.url("Please provide a valid Blog URL").optional(),
    website: z.url("Please provide a valid Website URL").optional(),
  })
  .refine(
    (data) => {
      const hasAtLeastOne = Object.values(data).some(
        (value) => value !== undefined && value !== "",
      );
      return hasAtLeastOne;
    },
    {
      message: "At least one social link is required",
    },
  );

export const DocumentSchema = z.object({
  _id: objectIdSchema.optional(),
  type: z
    .string({ message: "Document type is required" })
    .min(3, { message: "Document type must be at least 3 characters long" })
    .max(100, { message: "Document type must be at most 100 characters long" }),
  url: z.url("Please provide a valid document URL"),
  uploadedAt: z.date().default(new Date()).optional(),
  verified: z.boolean().default(false).optional(),
  verifiedAt: z.date().nullable().optional(),
  verifiedBy: objectIdSchema.nullable().optional(),
  rejected: z.boolean().default(false).optional(),
  rejectionReason: z
    .string({ message: "Rejection reason must be a string" })
    .min(10, { message: "Rejection reason must be at least 10 characters long" })
    .max(500, { message: "Rejection reason must be at most 500 characters long" })
    .nullable()
    .optional(),
  checkedBy: z.string().optional(),
});

export const OrganizationCreateSchema = z.object({
  name: z
    .string({ message: "Organization name is required" })
    .min(3, { message: "Organization name must be at least 3 characters long" })
    .max(100, { message: "Organization name must be at most 100 characters long" }),
  email: z.email("Please provide a valid email address").toLowerCase().trim(),
  phone: z
    .string({ message: "Organization phone number is required" })
    .min(10, { message: "Organization phone number must be at least 10 characters long" })
    .max(15, { message: "Organization phone number must be at most 15 characters long" }),

  category: z.enum(Object.values(OrganizationEnums.OrganizationCategory)),
  subCategory: z.string().optional(),
  description: z
    .string({ message: "Description must be a string" })
    .max(1000, { message: "Description must be at most 1000 characters long" })
    .optional(),
  logo: z
    .url({ message: "Please provide a valid logo URL" })
    .default("https://res.cloudinary.com/ddk9qhmit/image/upload/v1764871002/logo.png"),
  address: AddressSchema,
  supportContact: SupportContactSchema,
  socialLinks: SocialLinksSchema,
  bankDetails: OrganizationBankSchema.optional(),
  documents: z
    .array(
      z.object({
        type: z
          .string({ message: "Document type is required" })
          .min(3, { message: "Document type must be at least 3 characters long" })
          .max(100, { message: "Document type must be at most 100 characters long" }),
        url: z.url("Please provide a valid document URL"),
      }),
      { message: "Please provide valid documents" },
    )
    .min(1, { message: "At least one document is required" }),
  active: z.boolean().default(true),
});
