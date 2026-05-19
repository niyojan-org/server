import { Router } from 'express';
import { createRegistration, getRegistrationForm } from '../controllers/registration.controller';

const registrationRoutes = Router();

// Get registration form with default and dynamic fields
registrationRoutes.get('/:eventId/form', getRegistrationForm);

// Create new registration
registrationRoutes.post('/', createRegistration);

export default registrationRoutes;
