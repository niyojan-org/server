import { Router } from 'express';
import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';
// import {
//   getParticipants,
//   getParticipant,
//   updateParticipant,
//   updateParticipantStatus,
//   deleteParticipant,
//   checkInParticipant,
//   bulkCheckIn,
//   bulkUpdateParticipants,
//   exportParticipants,
//   getParticipantStats,
// } from '../controllers/participant-management.controller';
import { getRegistrations } from '../controllers/registration-manage.controller';

const RegistrationManagementRoutes = Router();

// Participant Management Routes
// All routes require authentication and owner/admin role
RegistrationManagementRoutes.use(authenticate);
RegistrationManagementRoutes.use(organizationRole('owner', 'admin'));

// // Participant routes
// managementRoutes.get('/events/:eventId/participants', getParticipants);
// managementRoutes.get('/events/:eventId/participants/stats', getParticipantStats);
// managementRoutes.get('/events/:eventId/participants/export', exportParticipants);
// managementRoutes.get('/events/:eventId/participants/:participantId', getParticipant);
// managementRoutes.put('/events/:eventId/participants/:participantId', updateParticipant);
// managementRoutes.patch('/events/:eventId/participants/:participantId/status', updateParticipantStatus);
// managementRoutes.delete('/events/:eventId/participants/:participantId', deleteParticipant);
// managementRoutes.post('/events/:eventId/participants/:participantId/check-in', checkInParticipant);
// managementRoutes.post('/events/:eventId/participants/bulk-check-in', bulkCheckIn);
// managementRoutes.post('/events/:eventId/participants/bulk-update', bulkUpdateParticipants);

// Registration routes
RegistrationManagementRoutes.get('/:eventId', getRegistrations);
// RegistrationManagementRoutes.get('/events/:eventId/registrations/stats', getRegistrationStats);
// RegistrationManagementRoutes.get('/events/:eventId/registrations/export', exportRegistrations);
// RegistrationManagementRoutes.get('/events/:eventId/registrations/:registrationId', getRegistration);
// RegistrationManagementRoutes.put('/events/:eventId/registrations/:registrationId', updateRegistration);
// RegistrationManagementRoutes.patch('/events/:eventId/registrations/:registrationId/status', updateRegistrationStatus);
// RegistrationManagementRoutes.post(
//   '/events/:eventId/registrations/:registrationId/resend-details',
//   resendRegistrationDetails,
// );
// RegistrationManagementRoutes.delete('/events/:eventId/registrations/:registrationId', deleteRegistration);

export default RegistrationManagementRoutes;
