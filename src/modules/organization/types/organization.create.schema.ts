import * as OrganizationEnums from './organization.enums';
import { OrganizationBankSchema } from './organization.bank.schema';
import { objectIdSchema } from '@helpers/zod';
import { array, boolean, date, email, literal, object, string, url } from 'zod';

/* ---------- sub-schemas ---------- */

export const AddressSchema = object({
  locality: string({ message: 'Locality is required' }).min(3),
  city: string({ message: 'City is required' }).min(2),
  state: string({ message: 'State is required' }).min(2),
  country: string({ message: 'Country is required' }).min(2),
  zipCode: string({ message: 'Zip code is required' }).min(4),
});

export const SupportContactSchema = object({
  name: string({ message: 'Support contact name is required' }).min(2),
  email: email('Please provide a valid support contact email address'),
  phone: string({ message: 'Support contact phone number is required' })
    .min(10, {
      message:
        'Support contact phone number must be at least 10 characters long',
    })
    .max(15, {
      message:
        'Support contact phone number must be at most 15 characters long',
    }),
});

export const SocialLinksSchema = object({
  facebook: url('Please provide a valid Facebook URL').optional(),
  instagram: url('Please provide a valid Instagram URL').optional(),
  linkedin: url('Please provide a valid LinkedIn URL').optional(),
  twitter: url('Please provide a valid Twitter URL').optional(),
  youtube: url('Please provide a valid YouTube URL').optional(),
  blog: url('Please provide a valid Blog URL').optional(),
  website: url('Please provide a valid Website URL').optional(),
}).refine(
  (data) => {
    const hasAtLeastOne = Object.values(data).some(
      (value) => value !== undefined && value !== '',
    );
    return hasAtLeastOne;
  },
  {
    message: 'At least one social link is required',
  },
);

export const DocumentSchema = object({
  _id: objectIdSchema.optional(),
  type: string({ message: 'Document type is required' })
    .min(3, { message: 'Document type must be at least 3 characters long' })
    .max(100, { message: 'Document type must be at most 100 characters long' }),
  url: url('Please provide a valid document URL'),
  uploadedAt: date().default(new Date()).optional(),
  verified: boolean().default(false).optional(),
  verifiedAt: date().nullable().optional(),
  verifiedBy: objectIdSchema.nullable().optional(),
  rejected: boolean().default(false).optional(),
  rejectionReason: string({ message: 'Rejection reason must be a string' })
    .min(10, {
      message: 'Rejection reason must be at least 10 characters long',
    })
    .max(500, {
      message: 'Rejection reason must be at most 500 characters long',
    })
    .nullable()
    .optional(),
  checkedBy: objectIdSchema.optional(),
});

export const OrganizationCreateSchema = object({
  name: string({ message: 'Organization name is required' })
    .min(3, { message: 'Organization name must be at least 3 characters long' })
    .max(100, {
      message: 'Organization name must be at most 100 characters long',
    }),
  email: email('Please provide a valid email address').toLowerCase().trim(),
  phone: string({ message: 'Organization phone number is required' })
    .min(10, {
      message: 'Organization phone number must be at least 10 characters long',
    })
    .max(15, {
      message: 'Organization phone number must be at most 15 characters long',
    }),

  category: literal(Object.values(OrganizationEnums.OrganizationCategory)),
  subCategory: string().optional(),
  description: string({ message: 'Description must be a string' })
    .max(1000, { message: 'Description must be at most 1000 characters long' })
    .optional(),
  logo: url({ message: 'Please provide a valid logo URL' }).default(
    'https://res.cloudinary.com/ddk9qhmit/image/upload/v1764871002/logo.png',
  ),
  address: AddressSchema,
  supportContact: SupportContactSchema,
  socialLinks: SocialLinksSchema,
  bankDetails: OrganizationBankSchema.optional(),
  documents: array(
    object({
      type: string({ message: 'Document type is required' })
        .min(3, {
          message: 'Document type must be at least 3 characters long',
        })
        .max(100, {
          message: 'Document type must be at most 100 characters long',
        }),
      url: url('Please provide a valid document URL'),
    }),
    { message: 'Please provide valid documents' },
  ).min(1, { message: 'At least one document is required' }),
  active: boolean().default(true),
});
