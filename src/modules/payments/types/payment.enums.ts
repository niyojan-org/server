export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentGateway {
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
  CASH = 'CASH',
}
