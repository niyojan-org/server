import z from "zod";
import { REDIS_KEYS } from "./redis.keys";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5050),
  MONGO_URI: z.string(),
  PSQL_URI: z.string(),
  APP_NAME: z.string().default("Orgatick"),

  //SMTP
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),

  //JWT
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRY: z.string(),
  JWT_REFRESH_TOKEN_EXPIRY: z.string(),
  AUTH_URL: z.string(),
  COOKIE_DOMAIN: z.string().optional(),

  //REDIS
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  //PASSKEY
  RP_ID: z.string(),
  // RP_NAME: z.string(),

  //OAUTH
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),

  //CLOUDINARY
  CLOUDINARY_ClOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  //WHATSAPP API
  WHATSAPP_API_URL: z.string(),
  WHATSAPP_API_KEY: z.string(),

  //PAYMENT GATEWAY
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),

  PHONEPE_CLIENT_ID: z.string(),
  PHONEPE_CLIENT_SECRET: z.string(),

  //MONITORING
  OTEL_SERVICE_NAME: z.string().default("orgatick-backend"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default("http://localhost:4318"),
});

export type Env = z.infer<typeof envSchema>;
