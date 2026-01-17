import mailQueue from "@queues/mail.queue";
import { EMAIL_SENDERS, EMAIL_LAYOUTS } from "../mail.constants";
import { EventType } from "../types";

const sendEventEmail = {
  registrationConfirmed: async (to: string, context: EventType.RegistrationConfirmedType) => {
    await mailQueue.add("template", {
      template: "events/registration-confirmed",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Registration Confirmed - ${context.eventName}`,
      data: context,
    });
  },

  paymentPending: async (to: string, context: EventType.PaymentPendingType) => {
    await mailQueue.add("template", {
      template: "events/payment-pending",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Complete Your Payment - ${context.eventName}`,
      data: context,
    });
  },

  ticketPurchase: async (to: string, context: EventType.TicketPurchaseType) => {
    await mailQueue.add("template", {
      template: "events/ticket-purchase",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Your Ticket for ${context.eventName}`,
      data: context,
    });
  },

  reminder24h: async (to: string, context: EventType.Reminder24hType) => {
    await mailQueue.add("template", {
      template: "events/reminder-24h",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Tomorrow - ${context.eventName}`,
      data: context,
    });
  },

  reminder1h: async (to: string, context: EventType.Reminder1hType) => {
    await mailQueue.add("template", {
      template: "events/reminder-1h",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Starting in 1 Hour - ${context.eventName}`,
      data: context,
    });
  },

  cancelled: async (to: string, context: EventType.EventCancelledType) => {
    await mailQueue.add("template", {
      template: "events/cancelled",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Event Cancelled - ${context.eventName}`,
      data: context,
    });
  },

  rescheduled: async (to: string, context: EventType.EventRescheduledType) => {
    await mailQueue.add("template", {
      template: "events/rescheduled",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Event Rescheduled - ${context.eventName}`,
      data: context,
    });
  },

  announcement: async (to: string, context: EventType.EventAnnouncementType) => {
    await mailQueue.add("template", {
      template: "events/announcement",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `${context.announcementTitle} - ${context.eventName}`,
      data: context,
    });
  },

  joinLink: async (to: string, context: EventType.JoinLinkType) => {
    await mailQueue.add("template", {
      template: "events/join-link",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Join ${context.eventName} Online`,
      data: context,
    });
  },

  ticketResend: async (to: string, context: EventType.TicketResendType) => {
    await mailQueue.add("template", {
      template: "events/ticket-resend",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.EVENTS,
      to,
      subject: `Your Ticket - ${context.eventName}`,
      data: context,
    });
  },
};

export default sendEventEmail;
