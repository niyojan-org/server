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
import { AuthRateLimit } from '@core/rate_limit/auth-rate-limit';

const router = Router();

router.get('/email-check', validate({ query: z.object({ email: z.email() }) }), AuthController.emailCheck);
router.post('/login', AuthRateLimit.login(), validate({ body: loginSchema }), AuthController.login);
router.post('/register', AuthRateLimit.register(), validate({ body: registerSchema }), AuthController.register);
router.post('/verify-email', AuthRateLimit.register(), validate({ body: verifyEmailSchema }), AuthController.verifyEmail);
router.post('/refresh', AuthController.refreshAccessToken);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', AuthRateLimit.forgotPassword(), validate({ body: forgetPasswordSchema }), AuthController.forgotPassword);
router.post('/reset-password', AuthRateLimit.forgotPassword(), validate({ body: resetPasswordSchema }), AuthController.resetPassword);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), AuthController.changePassword);

router.get('/google', AuthController.googleRedirect);
router.get('/google/redirect', AuthController.googleRedirect);
router.get('/google/callback', AuthController.googleCallback);

router.use('/totp', totpRoutes);
router.use('/mfa', mfaRoutes);
router.use('/passkeys', passkeyRoutes);

export default router;
