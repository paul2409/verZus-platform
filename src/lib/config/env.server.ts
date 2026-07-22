import "server-only";

import { parseServerEnv } from "./env.schema";

export const serverEnv = parseServerEnv({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_SSL_MODE: process.env.DATABASE_SSL_MODE,
  DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
  AUTH_SECRET: process.env.AUTH_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
});
