import axios from 'axios';
import env from '@config/env';

const razorpayClient = axios.create({
  baseURL: 'https://api.razorpay.com/v1',
  auth: {
    username: env.RAZORPAY_KEY_ID,
    password: env.RAZORPAY_KEY_SECRET,
  },
});

export interface RazorpayOrderPayload {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  notes?: Record<string, string>;
}

class RazorpayClient {
  static async createOrder(payload: RazorpayOrderPayload) {
    const response = await razorpayClient.post<RazorpayOrderResponse>('/orders', payload);
    return response.data;
  }
}

export default RazorpayClient;
