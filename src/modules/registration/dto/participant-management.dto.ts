import { z } from 'zod';

export const updateParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  email: z.string().email('Invalid email format').toLowerCase().trim().optional(),
  phone: z.string().min(1, 'Phone is required').trim().optional(),
  dynamicFields: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateParticipantDto = z.infer<typeof updateParticipantSchema>;

export const updateParticipantStatusSchema = z.object({
  status: z.string(),
  reason: z.string().optional(),
});

export type UpdateParticipantStatusDto = z.infer<typeof updateParticipantStatusSchema>;

export const checkInParticipantSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required').optional(),
  checkedInBy: z.string().min(1, 'User ID is required'),
  notes: z.string().optional(),
});

export type CheckInParticipantDto = z.infer<typeof checkInParticipantSchema>;

export const bulkCheckInSchema = z.object({
  participantIds: z.array(z.string().min(1, 'Participant ID is required')).min(1, 'At least one participant ID is required'),
  sessionId: z.string().optional(),
  checkedInBy: z.string().min(1, 'User ID is required'),
  notes: z.string().optional(),
});

export type BulkCheckInDto = z.infer<typeof bulkCheckInSchema>;

export const bulkUpdateParticipantsSchema = z.object({
  participantIds: z.array(z.string().min(1, 'Participant ID is required')).min(1, 'At least one participant ID is required'),
  updateData: updateParticipantSchema,
});

export type BulkUpdateParticipantsDto = z.infer<typeof bulkUpdateParticipantsSchema>;
