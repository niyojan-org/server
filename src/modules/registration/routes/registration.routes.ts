import { Router } from 'express';
import { createRegistration } from '../controllers/registration.controller';

const registrationRoutes = Router();

registrationRoutes.post('/', createRegistration);
export default registrationRoutes;
