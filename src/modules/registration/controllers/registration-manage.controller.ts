import { asyncHandler } from '@core/utils/asyncHandler';
import { OrganizationRequest } from '@core/middlewares/organization.middleware';
import { registrationListQuerySchema } from '../dto/registration-management.dto';
import { RegistrationManagementService } from '../services/management/registration-management.service';
import { EventRepository } from '@modules/events/persistence/event.repository';
import { string } from 'zod';
import ApiError from '@core/errors/api.error';

export const getRegistrations = asyncHandler(async (req: OrganizationRequest, res) => {
  const eventId = string({ message: 'Need a valid EventId' }).parse(req.params.eventId);
  const organizationId = req.organization._id;
  const event = await EventRepository.getEventForOrganization(eventId, organizationId);
  if (!event) throw new ApiError(404, 'Event not found', 'EVENT_NOT_FOUND', 'The requested event was not found');
  const options = registrationListQuerySchema.parse(req.query);
  const stats = await RegistrationManagementService.getRegistrationsByEvent(event._id, options);
  res.status(200).json({ success: true, message: 'Registrations retrieved successfully', ...stats });
});

/**
 * Get single registration details
 */
// export const getRegistration = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId, registrationId } = req.params as { eventId: string; registrationId: string };

//   const registration = await RegistrationManagementService.getRegistrationById(
//     new mongoose.Types.ObjectId(registrationId),
//     new mongoose.Types.ObjectId(eventId),
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Registration retrieved successfully',
//     data: registration,
//   });
// });

// /**
//  * Update registration information
//  */
// export const updateRegistration = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId, registrationId } = req.params as { eventId: string; registrationId: string };
//   const updateData = updateRegistrationSchema.parse(req.body);

//   const updated = await RegistrationManagementService.updateRegistration(
//     new mongoose.Types.ObjectId(registrationId),
//     new mongoose.Types.ObjectId(eventId),
//     updateData,
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Registration updated successfully',
//     data: updated,
//   });
// });

// /**
//  * Update registration status
//  */
// export const updateRegistrationStatus = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId, registrationId } = req.params as { eventId: string; registrationId: string };
//   const statusData = updateRegistrationStatusSchema.parse(req.body);

//   const updated = await RegistrationManagementService.updateRegistrationStatus(
//     new mongoose.Types.ObjectId(registrationId),
//     new mongoose.Types.ObjectId(eventId),
//     statusData,
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Registration status updated successfully',
//     data: updated,
//   });
// });

// /**
//  * Delete registration
//  */
// export const deleteRegistration = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId, registrationId } = req.params as { eventId: string; registrationId: string };

//   await RegistrationManagementService.deleteRegistration(
//     new mongoose.Types.ObjectId(registrationId),
//     new mongoose.Types.ObjectId(eventId),
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Registration deleted successfully',
//   });
// });

// /**
//  * Resend registration details to participants
//  */
// export const resendRegistrationDetails = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId, registrationId } = req.params as { eventId: string; registrationId: string };
//   const { channels } = resendDetailsSchema.parse(req.body);

//   const result = await RegistrationManagementService.resendRegistrationDetails(
//     new mongoose.Types.ObjectId(registrationId),
//     new mongoose.Types.ObjectId(eventId),
//     channels,
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Registration details resent successfully',
//     data: result,
//   });
// });

// /**
//  * Get registration statistics
//  */
// export const getRegistrationStats = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId } = req.params as { eventId: string };

//   const stats = await RegistrationManagementService.getRegistrationStats(new mongoose.Types.ObjectId(eventId));

//   res.status(200).json({
//     success: true,
//     message: 'Registration statistics retrieved successfully',
//     data: stats,
//   });
// });

// /**
//  * Export registrations list
//  */
// export const exportRegistrations = asyncHandler(async (req: OrganizationRequest, res) => {
//   const { eventId } = req.params as { eventId: string };
//   const { format = 'csv' } = req.query;

//   const exported = await RegistrationManagementService.exportRegistrations(
//     new mongoose.Types.ObjectId(eventId),
//     (format as 'csv' | 'json') || 'csv',
//   );

//   if (format === 'csv') {
//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', `attachment; filename="registrations-${Date.now()}.csv"`);
//   } else {
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Content-Disposition', `attachment; filename="registrations-${Date.now()}.json"`);
//   }

//   res.send(exported);
// });
