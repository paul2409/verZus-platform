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
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.union([z.string().url(), z.literal("")]).optional(),
  DATABASE_SSL_MODE: z.enum(["disable", "require", "verify-full"]).default("disable"),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  AUTH_SECRET: z.string().optional(),
  REDIS_URL: z.union([z.string().url(), z.literal("")]).optional(),
  SMTP_HOST: z.string().min(1).default("localhost"),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().min(3).default("VERZUS <no-reply@verzus.local>"),
  PROACTIVE_OPERATIONS_ENABLED: z.string().optional(),
  PROACTIVE_OPERATIONS_TOKEN: z.string().optional(),
  PROACTIVE_OPERATIONS_BATCH_SIZE: z.coerce.number().int().min(1).max(1000).default(250),
});

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Expected a boolean string but received '${value}'.`);
}

export function parsePublicEnv(source: EnvSource) {
  const input = publicInputSchema.parse(source);
  const enableMocks = parseBoolean(input.NEXT_PUBLIC_ENABLE_MOCKS, false);

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
    if (!input.DATABASE_URL) throw new Error("DATABASE_URL is required in staging and production.");
    if (!input.AUTH_SECRET || input.AUTH_SECRET.length < 32) {
      throw new Error("AUTH_SECRET must contain at least 32 characters in staging and production.");
    }
    if (!input.SMTP_HOST || !input.SMTP_FROM) {
      throw new Error("SMTP_HOST and SMTP_FROM are required in staging and production.");
    }
    const proactiveEnabled = parseBoolean(input.PROACTIVE_OPERATIONS_ENABLED, true);
    if (
      proactiveEnabled &&
      (!input.PROACTIVE_OPERATIONS_TOKEN || input.PROACTIVE_OPERATIONS_TOKEN.length < 32)
    ) {
      throw new Error(
        "PROACTIVE_OPERATIONS_TOKEN must contain at least 32 characters when proactive operations are enabled in staging and production.",
      );
    }
  }

  return {
    appUrl: input.NEXT_PUBLIC_APP_URL,
    databaseUrl: input.DATABASE_URL || undefined,
    databaseSslMode: input.DATABASE_SSL_MODE,
    databasePoolMax: input.DATABASE_POOL_MAX,
    authSecret: input.AUTH_SECRET || undefined,
    redisUrl: input.REDIS_URL || undefined,
    smtpHost: input.SMTP_HOST,
    smtpPort: input.SMTP_PORT,
    smtpSecure: parseBoolean(input.SMTP_SECURE, false),
    smtpUser: input.SMTP_USER || undefined,
    smtpPassword: input.SMTP_PASSWORD || undefined,
    smtpFrom: input.SMTP_FROM,
    proactiveOperationsEnabled: parseBoolean(input.PROACTIVE_OPERATIONS_ENABLED, true),
    proactiveOperationsToken: input.PROACTIVE_OPERATIONS_TOKEN || undefined,
    proactiveOperationsBatchSize: input.PROACTIVE_OPERATIONS_BATCH_SIZE,
  } as const;
}
