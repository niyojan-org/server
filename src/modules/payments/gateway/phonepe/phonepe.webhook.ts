import crypto from 'crypto';
import env from '@config/env';

export const verifyPhonePeWebhook = (rawBody: string, signature: string) => {
  const expected = crypto
    .createHash('sha256')
    .update(rawBody + env.PHONEPE_CLIENT_SECRET)
    .digest('hex');

  return signature.startsWith(expected);
};
