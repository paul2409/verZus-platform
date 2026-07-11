import { clientEnv } from "./env.client";

export const release = {
  environment: clientEnv.appEnv,
  sha: clientEnv.releaseSha,
} as const;
