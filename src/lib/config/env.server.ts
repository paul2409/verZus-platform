import "server-only";

import { parseServerEnv } from "./env.schema";

export const serverEnv = parseServerEnv({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  REDIS_URL: process.env.REDIS_URL,
});
