import logger from '@config/logger';
import { MailAttachment } from './mail.attachment';
import transporter from './mail.config';
import renderTemplate from './mail.templates';

export interface sendTemplateEmailPayload<T extends Record<string, unknown> = Record<string, unknown>> {
  template: string;
  layout: string;
  to: string;
  from: string;
  subject: string;
  data: T;
  attachments?: MailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export const sendTemplateEmail = async <T extends Record<string, unknown>>(
  payload: sendTemplateEmailPayload<T>,
) => {
  try {
    const html = renderTemplate(payload.template, payload.layout, payload.data);
    await transporter.sendMail({
      to: payload.to,
      from: payload.from,
      subject: payload.subject,
      html,
      attachments: payload.attachments,
      cc: payload.cc,
      bcc: payload.bcc,
      replyTo: payload.replyTo,
    });
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${payload.to}:`, error);
    throw error;
  }
};
