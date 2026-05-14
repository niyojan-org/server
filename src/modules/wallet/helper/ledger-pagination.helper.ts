import { LedgerPaginationQuery } from '../types/ledger-pagination.types';

export const buildPaginationQuery = (query: LedgerPaginationQuery) => {
  const {
    page = 1,
    limit = 20,
    category,
    type,
    balanceType,
    organizationId,
    walletId,
    eventId,
    paymentId,
    refundId,
    payoutId,
    referenceId,
    referenceType,
    fromDate,
    toDate,
  } = query;
  const filters: Record<string, unknown> = {};
  if (category) {
    filters.category = category;
  }
  if (type) {
    filters.type = type;
  }
  if (balanceType) {
    filters.balanceType = balanceType;
  }
  if (organizationId) {
    filters.organizationId = organizationId;
  }
  if (walletId) {
    filters.walletId = walletId;
  }
  if (eventId) {
    filters.eventId = eventId;
  }
  if (paymentId) {
    filters.paymentId = paymentId;
  }
  if (refundId) {
    filters.refundId = refundId;
  }
  if (payoutId) {
    filters.payoutId = payoutId;
  }
  if (referenceId) {
    filters.referenceId = referenceId;
  }
  if (referenceType) {
    filters.referenceType = referenceType;
  }
  if (fromDate || toDate) {
    filters.createdAt = {};

    if (fromDate) {
      (filters.createdAt as Record<string, unknown>).$gte = fromDate;
    }

    if (toDate) {
      (filters.createdAt as Record<string, unknown>).$lte = toDate;
    }
  }
  return { filters, page, limit };
};
