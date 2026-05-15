import axios from 'axios';
import crypto from 'crypto';
import env from '@config/env';

const phonepeClient = axios.create({
  baseURL: env.PHONEPE_BASE_URL,
});

export interface PhonePePaymentRequest {
  amount: number;
  merchantTransactionId: string;
  merchantUserId: string;
  redirectUrl?: string;
  callbackUrl?: string;
  paymentInstrument?: Record<string, unknown>;
}

export interface PhonePePaymentResponse {
  success: boolean;
  code?: string;
  message?: string;
  data?: Record<string, unknown>;
}

const buildChecksum = (payload: string, endpoint: string) => {
  const hash = crypto
    .createHash('sha256')
    .update(payload + endpoint + env.PHONEPE_CLIENT_SECRET)
    .digest('hex');

  return `${hash}###${env.PHONEPE_SALT_INDEX}`;
};

class PhonePeClient {
  static async initiatePayment(payload: PhonePePaymentRequest) {
    const requestPayload = {
      merchantId: env.PHONEPE_CLIENT_ID,
      ...payload,
    };

    const base64Payload = Buffer.from(
      JSON.stringify(requestPayload),
      'utf8',
    ).toString('base64');

    const endpoint = '/pg/v1/pay';
    const checksum = buildChecksum(base64Payload, endpoint);

    const response = await phonepeClient.post<PhonePePaymentResponse>(endpoint, {
      request: base64Payload,
    }, {
      headers: {
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': env.PHONEPE_CLIENT_ID,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default PhonePeClient;
