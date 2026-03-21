import { z } from "zod";

export const envSchema = z.object({
  // ... your existing env schema

  // Cloudinary Configuration (Add these)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});
