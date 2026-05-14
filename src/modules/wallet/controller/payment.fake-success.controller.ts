import { asyncHandler } from '@core/utils/asyncHandler';
import { objectIdSchema } from '@helpers/zod';
import WalletCreditService from '@modules/wallet/services/wallet.credit.service';

import {
  LedgerBalanceType,
  LedgerCategory,
  LedgerReferenceType,
} from '@modules/wallet/types/ledger.enums';
import { int, object } from 'zod';

export const fakePaymentSuccess = asyncHandler(async (req, res) => {
  const { organizationId, amount, eventId, paymentId } = object({
    organizationId: objectIdSchema,
    amount: int(),
    eventId: objectIdSchema,
    paymentId: objectIdSchema,
  }).parse(req.body);
  const result = await WalletCreditService.credit({
    organizationId,
    amount,
    balanceType: LedgerBalanceType.HOLD,
    category: LedgerCategory.EVENT_PAYMENT_HOLD,
    referenceType: LedgerReferenceType.PAYMENT,
    referenceId: paymentId,
    eventId,
    paymentId,
    description: 'Fake payment success for testing',
  });

  res.status(200).json({
    success: true,
    message: 'Wallet credited successfully',
    data: result,
  });
});
