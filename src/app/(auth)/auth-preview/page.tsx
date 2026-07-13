// VERZUS M4 STEP 4.3

import styles from "./page.module.css";

const screens = [
  {
    href: "/login",
    title: "Login",
    description: "Returning player access with password recovery.",
  },
  {
    href: "/register",
    title: "Register",
    description: "New account creation and terms acknowledgement.",
  },
  {
    href: "/verify-email",
    title: "Email verification",
    description: "Six-digit verification code and resend state.",
  },
  {
    href: "/forgot-password",
    title: "Forgot password",
    description: "Secure recovery request by email or phone.",
  },
  {
    href: "/reset-password",
    title: "Reset password",
    description: "Token-confirmed password replacement.",
  },
  {
    href: "/session-expired",
    title: "Session expired",
    description: "Controlled sign-out and recovery routes.",
  },
  {
    href: "/account/suspended",
    title: "Suspended account",
    description: "Temporary restriction with controlled messaging.",
  },
  {
    href: "/account/banned",
    title: "Banned account",
    description: "Server-enforced account restriction state.",
  },
] as const;

export default function AuthPreviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p>M4 Step 4.3</p>
        <h1>Static Authentication Screens</h1>
        <span>
          Review every screen at 360, 390, 430, 768, 1024, and 1440 pixels. Forms are visual-only
          until M4 Step 4.4.
        </span>
      </header>

      <nav aria-label="Authentication screen previews" className={styles.grid}>
        {screens.map((screen) => (
          <a className={styles.card} href={screen.href} key={screen.href}>
            <div>
              <h2>{screen.title}</h2>
              <p>{screen.description}</p>
            </div>
            <span className={styles.route}>{screen.href}</span>
          </a>
        ))}
      </nav>
    </main>
  );
}
