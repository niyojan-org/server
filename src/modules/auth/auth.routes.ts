import { Router } from 'express';
import * as AuthController from './auth.controller';
import { validate } from '@core/middlewares/validate.middleware';
import { loginSchema } from './schemas/login.schema';
import { registerSchema } from './schemas/register.schema';
import { verifyEmailSchema } from './schemas/verify-email.schema';
import { authenticate } from '@core/middlewares/auth.middleware';
import { changePasswordSchema, forgetPasswordSchema, resetPasswordSchema } from './schemas/password.schema';
import totpRoutes from './totp/totp.routes';
import mfaRoutes from './mfa/mfa.routes';
import passkeyRoutes from './passkey/passkey.routes';
import z from 'zod';

const router = Router();

router.get('/email-check', validate({ query: z.object({ email: z.email() }) }), AuthController.emailCheck);
router.post('/login', validate({ body: loginSchema }), AuthController.login);
router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/verify-email', validate({ body: verifyEmailSchema }), AuthController.verifyEmail);
router.post('/refresh', AuthController.refreshAccessToken);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', validate({ body: forgetPasswordSchema }), AuthController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), AuthController.resetPassword);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), AuthController.changePassword);

router.get('/google', AuthController.googleRedirect);
router.get('/google/redirect', AuthController.googleRedirect);
router.get('/google/callback', AuthController.googleCallback);

router.use('/totp', totpRoutes);
router.use('/mfa', mfaRoutes);
router.use('/passkeys', passkeyRoutes);

export default router;
