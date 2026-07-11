import { z } from "zod";

export const appEnvironmentSchema = z.enum([
  "local",
  "test",
  "development",
  "preview",
  "staging",
  "production",
]);

export type AppEnvironment = z.infer<typeof appEnvironmentSchema>;
export type EnvSource = Record<string, string | undefined>;

const publicInputSchema = z.object({
  NEXT_PUBLIC_APP_ENV: appEnvironmentSchema.default("local"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:3000/api"),
  NEXT_PUBLIC_ENABLE_MOCKS: z.string().optional(),
  NEXT_PUBLIC_RELEASE_SHA: z.string().min(1).default("local"),
  NEXT_PUBLIC_SENTRY_DSN: z.union([z.string().url(), z.literal("")]).optional(),
});

const serverInputSchema = z.object({
  NEXT_PUBLIC_APP_ENV: appEnvironmentSchema.default("local"),
  DATABASE_URL: z.union([z.string().url(), z.literal("")]).optional(),
  AUTH_SECRET: z.string().optional(),
  REDIS_URL: z.union([z.string().url(), z.literal("")]).optional(),
});

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Expected a boolean string but received '${value}'.`);
}

export function parsePublicEnv(source: EnvSource) {
  const input = publicInputSchema.parse(source);
  const defaultMocks =
    input.NEXT_PUBLIC_APP_ENV === "local" || input.NEXT_PUBLIC_APP_ENV === "test";
  const enableMocks = parseBoolean(input.NEXT_PUBLIC_ENABLE_MOCKS, defaultMocks);

  if (["staging", "production"].includes(input.NEXT_PUBLIC_APP_ENV) && enableMocks) {
    throw new Error("Mocks must be disabled in staging and production.");
  }

  return {
    appEnv: input.NEXT_PUBLIC_APP_ENV,
    apiBaseUrl: input.NEXT_PUBLIC_API_BASE_URL,
    enableMocks,
    releaseSha: input.NEXT_PUBLIC_RELEASE_SHA,
    sentryDsn: input.NEXT_PUBLIC_SENTRY_DSN || undefined,
  } as const;
}

export function parseServerEnv(source: EnvSource) {
  const input = serverInputSchema.parse(source);
  const requiresInfrastructure = ["staging", "production"].includes(input.NEXT_PUBLIC_APP_ENV);

  if (requiresInfrastructure) {
    if (!input.DATABASE_URL) {
      throw new Error("DATABASE_URL is required in staging and production.");
    }

    if (!input.AUTH_SECRET || input.AUTH_SECRET.length < 32) {
      throw new Error("AUTH_SECRET must contain at least 32 characters in staging and production.");
    }
  }

  return {
    databaseUrl: input.DATABASE_URL || undefined,
    authSecret: input.AUTH_SECRET || undefined,
    redisUrl: input.REDIS_URL || undefined,
  } as const;
}
