import { Router } from 'express';
import { phonepeWebhook, razorpayWebhook } from '../controllers/webhook.controller';

const webhookRoutes = Router();

webhookRoutes.post('/razorpay', razorpayWebhook);
webhookRoutes.post('/phonepe', phonepeWebhook);

export default webhookRoutes;
