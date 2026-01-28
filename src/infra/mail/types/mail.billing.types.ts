import z from "zod";
import { BillingSchema } from "../schema";

/**
 * Billing Email Types
 * TypeScript types inferred from Zod schemas
 */

export type PaymentSuccessType = z.infer<typeof BillingSchema.paymentSuccessSchema>;
