export const ROUTES_TO_SKIP = {
  '/health': true,
  '/metrics': true,
  // Auth routes with specific rate limiters
  '/auth/login': true,
  '/auth/register': true,
  '/auth/forgot-password': true,
  '/auth/verify-email': true,
  '/auth/reset-password': true,
  '/auth/totp/verify-login': true,
  '/auth/passkeys/authenticate/options': true,
  '/auth/passkeys/authenticate/verify': true,
  // Registration routes with specific rate limiters
  '/registrations': true,
  // Webhook routes with specific rate limiters
  '/webhooks/razorpay': true,
  '/webhooks/phonepe': true,
  // Public API routes with specific rate limiters
  '/events/public': true,
  '/resources/public': true,
};
