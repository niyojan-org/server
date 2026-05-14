import WalletCreateService from '../services/wallet.create.service';

import WalletRepository from '../repositories/wallet.repository';
import { asyncHandler } from '@core/utils/asyncHandler';
import { object } from 'zod';
import { objectIdSchema } from '@helpers/zod';

export const createWallet = asyncHandler(async (req, res) => {
  const { organizationId } = object({
    organizationId: objectIdSchema,
  }).parse(req.body);
  const wallet = await WalletCreateService.create(organizationId);
  res.status(201).json({
    success: true,
    message: 'Wallet created successfully',
    data: wallet,
  });
});
export const getOrganizationWallet = asyncHandler(async (req, res) => {
  const { organizationId } = object({
    organizationId: objectIdSchema,
  }).parse(req.params);
  const wallet =
    await WalletRepository.findWalletByOrganizationId(organizationId);
  res.status(200).json({
    success: true,
    message: 'Wallet fetched successfully',
    data: wallet,
  });
});
