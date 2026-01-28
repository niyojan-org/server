import mailQueue from "@queues/mail.queue";
import { EMAIL_SENDERS, EMAIL_LAYOUTS } from "../mail.constants";
import { BillingType } from "../types";

const sendBillingEmail = {
  paymentSuccess: async (to: string, context: BillingType.PaymentSuccessType) => {
    await mailQueue.add("template", {
      template: "billing/payment-success",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.BILLING,
      to,
      subject: "Payment Successful",
      data: context,
    });
  },
};

export default sendBillingEmail;
