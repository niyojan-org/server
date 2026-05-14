import { Router } from 'express';
import { fakePaymentSuccess } from './controller/payment.fake-success.controller';
import {
  createWallet,
  getOrganizationWallet,
} from './controller/wallet.controller';

const FakeRoutes = Router();

FakeRoutes.post('/fake-payment-success', fakePaymentSuccess);
FakeRoutes.post('/wallets', createWallet);
FakeRoutes.get('/wallets/:organizationId', getOrganizationWallet);

export default FakeRoutes;
