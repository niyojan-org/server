import { Router } from 'express';
import {
  createPaymentOrder,
  getPayment,
  refundPayment,
} from '../controllers/payment.controller';

const paymentRoutes = Router();

paymentRoutes.post('/orders', createPaymentOrder);
paymentRoutes.get('/:paymentId', getPayment);
paymentRoutes.post('/:paymentId/refund', refundPayment);

export default paymentRoutes;
