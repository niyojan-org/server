import { Router } from 'express';
import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';
import RegistrationManagementController from '../controllers/registration-manage.controller';

const RegistrationManagementRoutes = Router();

// All routes require authentication and owner/admin role
RegistrationManagementRoutes.use(authenticate);
RegistrationManagementRoutes.use(organizationRole('owner', 'admin'));

// Registration routes
RegistrationManagementRoutes.get('/:eventId', RegistrationManagementController.getRegistrations);
RegistrationManagementRoutes.get('/:eventId/:registrationId', RegistrationManagementController.getRegistration);

export default RegistrationManagementRoutes;
