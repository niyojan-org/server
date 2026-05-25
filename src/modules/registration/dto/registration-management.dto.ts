import { z } from 'zod';

export const updateRegistrationSchema = z.object({
  groupInfo: z
    .object({
      groupName: z.string().min(1, 'Group name is required').optional(),
    })
    .optional(),
  coupon: z
    .object({
      code: z.string().optional(),
      discountAmount: z.number().nonnegative().optional(),
    })
    .optional(),
});

export type UpdateRegistrationDto = z.infer<typeof updateRegistrationSchema>;

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], {
    message: 'Invalid registration status',
  }),
  reason: z.string().optional(),
});

export type UpdateRegistrationStatusDto = z.infer<typeof updateRegistrationStatusSchema>;

export const registrationListQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().default(1).catch(1),
  limit: z.coerce.number().default(10).catch(10),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt').catch('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').catch('desc'),
  needParticipants: z.coerce.boolean().default(false).catch(false),
});

export type RegistrationListQueryDto = z.infer<typeof registrationListQuerySchema>;

export const resendDetailsSchema = z.object({
  channels: z.array(z.enum(['email', 'whatsapp', 'sms'])).min(1, 'At least one channel is required'),
  message: z.string().optional(),
});

export type ResendDetailsDto = z.infer<typeof resendDetailsSchema>;
