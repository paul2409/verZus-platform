"use client";

import { SystemStateScreen } from "@/components/layout/system-state";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" data-theme="retro-competitive">
      <body>
        <SystemStateScreen
          action={
            <button onClick={reset} type="button">
              Reload VERZUS
            </button>
          }
          description="The application shell could not start. Your account and competition data were not changed."
          eyebrow="SYSTEM STARTUP FAILURE"
          reference={error.digest ?? "GLOBAL-UNAVAILABLE"}
          title="VERZUS COULD NOT START"
          tone="error"
        />
      </body>
    </html>
  );
}
