import z from "zod";

/**
 * Billing Email Schemas
 * Validation schemas for all billing-related email templates
 */

// Payment Success Schema
export const paymentSuccessSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.number().positive({ message: "Amount must be positive" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  transactionId: z.string().min(1, { message: "Transaction ID is required" }),
  // Optional fields
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  eventName: z.string().optional(),
  ticketDetails: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  supportEmail: z.string().email().optional(),
});
