// VERZUS M4 STEP 4.4

import type { AuthSubmissionError } from "../contracts";

export type AuthSubmitResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      error: AuthSubmissionError;
    };

export type AuthSubmitter<TInput> = (input: TInput) => Promise<AuthSubmitResult>;

export function createPreviewAuthSubmitter<TInput>(message: string): AuthSubmitter<TInput> {
  return async () => {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 350);
    });

    return {
      ok: true,
      message,
    };
  };
}
