import z from "zod";
import { userZodSchema } from "./user.schema";
import mongoose from "mongoose";

export type User = z.infer<typeof userZodSchema>;

export type UserDocument = User & mongoose.Document;
