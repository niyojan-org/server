import { Router } from 'express';
import {
  createWallet,
  getOrganizationWallet,
} from '../controller/wallet.controller';

const walletRoutes = Router();

walletRoutes.post('/', createWallet);
walletRoutes.get('/:organizationId', getOrganizationWallet);

export default walletRoutes;
