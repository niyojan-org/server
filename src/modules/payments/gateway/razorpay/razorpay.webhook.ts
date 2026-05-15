import crypto from 'crypto';
import env from '@config/env';

export const verifyRazorpayWebhook = (rawBody: string, signature: string) => {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return expected === signature;
};
