import WalletRepository from '../repositories/wallet.repository';

import { ObjectId } from '@helpers/zod';

class WalletCreateService {
  static async create(organizationId: ObjectId | string) {
    const existingWallet =
      await WalletRepository.findWalletByOrganizationId(organizationId);
    if (existingWallet) {
      return existingWallet;
    }
    const wallet = await WalletRepository.createWallet(organizationId);
    return wallet;
  }
}

export default WalletCreateService;
