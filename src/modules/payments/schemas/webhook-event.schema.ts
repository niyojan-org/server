import { HydratedDocument, model, Schema } from 'mongoose';
import { PaymentGateway } from '../types/payment.enums';
import { WebhookEventStatus } from '../types/webhook-event.enums';
import { ObjectId } from '@helpers/zod';

export interface IWebhookEvent {
  gateway: PaymentGateway;
  eventType: string;
  gatewayEventId?: string;
  signature?: string;
  payload: Record<string, unknown>;
  headers?: Record<string, unknown>;
  status: WebhookEventStatus;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount: number;
  nextRetryAt?: Date;
  relatedPaymentId?: ObjectId;
  relatedPaymentOrderId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEventDocument = HydratedDocument<IWebhookEvent>;

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
      index: true,
    },
    eventType: { type: String, required: true, index: true, trim: true },
    gatewayEventId: { type: String, trim: true, index: true, sparse: true },
    signature: { type: String, trim: true },
    payload: { type: Schema.Types.Mixed, required: true },
    headers: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: Object.values(WebhookEventStatus),
      default: WebhookEventStatus.PENDING,
      index: true,
    },
    processedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String, trim: true },
    retryCount: { type: Number, default: 0, min: 0 },
    nextRetryAt: { type: Date },
    relatedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'payments',
      index: true,
    },
    relatedPaymentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'payment_orders',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'webhook_events',
  },
);

//indexes
WebhookEventSchema.index(
  { gateway: 1, gatewayEventId: 1 },
  { unique: true, sparse: true },
);
WebhookEventSchema.index({ gateway: 1, eventType: 1, gatewayEventId: 1 });
WebhookEventSchema.index({ status: 1, nextRetryAt: 1 });
WebhookEventSchema.index({ relatedPaymentId: 1 });
WebhookEventSchema.index({ relatedPaymentOrderId: 1 });
WebhookEventSchema.index({ createdAt: -1 });

export const WebhookEventModel = model<IWebhookEvent>(
  'webhook_events',
  WebhookEventSchema,
);
