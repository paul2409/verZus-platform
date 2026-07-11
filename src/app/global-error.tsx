"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>VERZUS could not start</h1>
          <p>Reload the application. Reference code: {error.digest ?? "unavailable"}</p>
          <button type="button" onClick={reset}>
            Reload application
          </button>
        </main>
      </body>
    </html>
  );
}
