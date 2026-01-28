import { objectIdSchema } from "@helpers/zod";
import z from "zod";

export const OrganizationBankSchema = z.object({
  accountHolderName: z
    .string({ message: "Account holder name is required" })
    .min(3, { message: "Account holder name must be at least 3 characters long" })
    .max(100, { message: "Account holder name must be at most 100 characters long" }),
  bankName: z
    .string({ message: "Bank name is required" })
    .min(3, { message: "Bank name must be at least 3 characters long" })
    .max(100, { message: "Bank name must be at most 100 characters long" }),
  branchName: z
    .string({ message: "Branch name is required" })
    .min(3, { message: "Branch name must be at least 3 characters long" })
    .max(100, { message: "Branch name must be at most 100 characters long" }),
  accountNumber: z
    .string({ message: "Account number is required" })
    .min(5, { message: "Account number must be at least 5 characters long" })
    .max(20, { message: "Account number must be at most 20 characters long" }),
  ifscCode: z
    .string({ message: "IFSC code is required" })
    .min(4, { message: "IFSC code must be at least 4 characters long" })
    .max(11, { message: "IFSC code must be at most 11 characters long" }),
  upiId: z
    .string({ message: "UPI ID is required" })
    .min(5, { message: "UPI ID must be at least 5 characters long" })
    .max(50, { message: "UPI ID must be at most 50 characters long" }),
  verified: z.boolean().default(false),
  verifiedAt: z.date().optional(),
  verifiedBy: objectIdSchema.optional(),
});

export const PaymentGatewaysSchema = z.object({
  razorpay: z.boolean().default(false),
  cashfree: z.boolean().default(false),
  phonePe: z.boolean().default(true),
});
