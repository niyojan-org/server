import z from 'zod';
// import { REDIS_KEYS } from './redis.keys';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5050),
  MONGO_URI: z.string(),
  PSQL_URI: z.string(),
  APP_NAME: z.string().default('Orgatick'),

  //SMTP
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),

  //JWT
  JWT_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRY: z.string(),
  JWT_REFRESH_TOKEN_EXPIRY: z.string(),
  AUTH_URL: z.string(),
  COOKIE_DOMAIN: z.string(),

  //REDIS
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  //WEB PUSH (Push Notifications)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  //FRONTEND
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  //PASSKEY
  RP_ID: z.string(),
  // RP_NAME: z.string(),

  //OAUTH
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),

  //CLOUDINARY
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  //WHATSAPP API
  WHATSAPP_API_URL: z.string(),
  WHATSAPP_API_KEY: z.string(),
  WHATSAPP_SESSION: z.string(),

  //PAYMENT GATEWAY
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),

  PHONEPE_CLIENT_ID: z.string(),
  PHONEPE_CLIENT_SECRET: z.string(),
  PHONEPE_SALT_INDEX: z.coerce.number().default(1),
  PHONEPE_BASE_URL: z.string().default('https://api.phonepe.com/apis/hermes'),

  //MONITORING
  LOKI_HOST: z.url(),
  LOKI_USER: z.string(),
  LOKI_API_KEY: z.string(),
  METRICS_ALLOWED_IP: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
