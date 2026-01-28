import { Types } from "mongoose";
import z from "zod";

export const objectIdSchema = z
  .instanceof(Types.ObjectId, { message: "Invalid ObjectId" })
  .or(
    z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId format",
    }),
  )
  .transform((val) => (typeof val === "string" ? new Types.ObjectId(val) : val));
