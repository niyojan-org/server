import { ClientSession } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import {
  IWebhookEvent,
  WebhookEventDocument,
  WebhookEventModel,
} from '../schemas/webhook-event.schema';
import { WebhookEventStatus } from '../types/webhook-event.enums';

class WebhookEventRepository {
  static async createEvent(
    data: Partial<IWebhookEvent>,
    session?: ClientSession,
  ): Promise<WebhookEventDocument> {
    const event = new WebhookEventModel(data);
    return event.save({ session });
  }

  static async findById(id: ObjectId | string) {
    return WebhookEventModel.findById(id);
  }

  static async updateStatus(
    id: ObjectId | string,
    status: WebhookEventStatus,
    updates?: Partial<IWebhookEvent>,
    session?: ClientSession,
  ) {
    return WebhookEventModel.findByIdAndUpdate(
      id,
      { status, ...updates },
      { new: true, session },
    );
  }
}

export default WebhookEventRepository;
