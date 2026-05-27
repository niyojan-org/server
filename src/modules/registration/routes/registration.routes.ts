import { Router } from 'express';
import { createRegistration, getRegistrationForm } from '../controllers/registration.controller';
import RegistrationManagementRoutes from './registration-management.routes';
import { RegistrationRateLimit } from '@core/rate_limit/registration-rate-limit';

const registrationRoutes = Router();

// Get registration form with default and dynamic fields
registrationRoutes.get('/:eventId/form', RegistrationRateLimit.getForm(), getRegistrationForm);

// Create new registration
registrationRoutes.post('/', RegistrationRateLimit.createRegistration(), createRegistration);

registrationRoutes.use('/managment', RegistrationManagementRoutes);

export default registrationRoutes;
