export enum RegistrationStatus {
  DRAFT = 'DRAFT',
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RegistrationType {
  INDIVIDUAL_FREE = 'INDIVIDUAL_FREE',
  INDIVIDUAL_PAID = 'INDIVIDUAL_PAID',
  GROUP_FREE = 'GROUP_FREE',
  GROUP_PAID = 'GROUP_PAID',
}

export const RegistrationTypeHelpers = {
  isIndividual(type: RegistrationType): boolean {
    return type === RegistrationType.INDIVIDUAL_FREE || type === RegistrationType.INDIVIDUAL_PAID;
  },
  isGroup(type: RegistrationType): boolean {
    return type === RegistrationType.GROUP_FREE || type === RegistrationType.GROUP_PAID;
  },
  isFree(type: RegistrationType): boolean {
    return type === RegistrationType.INDIVIDUAL_FREE || type === RegistrationType.GROUP_FREE;
  },
  isPaid(type: RegistrationType): boolean {
    return type === RegistrationType.INDIVIDUAL_PAID || type === RegistrationType.GROUP_PAID;
  },
};
