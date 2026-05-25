import { Router } from 'express';
import { createRegistration, getRegistrationForm } from '../controllers/registration.controller';
import RegistrationManagementRoutes from './registration-management.routes';

const registrationRoutes = Router();

// Get registration form with default and dynamic fields
registrationRoutes.get('/:eventId/form', getRegistrationForm);

// Create new registration
registrationRoutes.post('/', createRegistration);

registrationRoutes.use('/managment', RegistrationManagementRoutes);

export default registrationRoutes;
