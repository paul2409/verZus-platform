// VERZUS M12.7 NOTIFICATION SETTINGS ROUTE ERROR BOUNDARY

"use client";

export default function NotificationSettingsErrorBoundary(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <p>Notification settings could not render.</p>
      <button onClick={props.reset} type="button">Retry settings route</button>
      {props.error.digest ? <code>{props.error.digest}</code> : null}
    </main>
  );
}
