// VERZUS M4 STEP 4.4

import {
  EmailVerificationForm,
  ForgotPasswordForm,
  LoginForm,
  RegisterForm,
  ResendVerificationButton,
  ResetPasswordForm,
} from "../forms";
import { AuthFrame } from "./AuthFrame";
import { AuthSecurityPanel } from "./AuthSecurityPanel";
import styles from "./AuthScreens.module.css";

export function LoginInteractiveScreen() {
  return (
    <AuthFrame
      description="Sign in to check your next match, current position, Crew activity, and competitive opportunities."
      statusDetail="Verified and protected"
      statusLabel="Secure sign-in"
      title="Welcome back"
    >
      <section className={styles.card} aria-labelledby="login-form-title">
        <div className={styles.cardHeading}>
          <h2 className={styles.cardTitle} id="login-form-title">
            Player login
          </h2>
          <p className={styles.cardDescription}>
            Use the account linked to your verified player identity.
          </p>
        </div>

        <LoginForm />

        <div className={styles.inlineRow}>
          <a className={styles.link} href="/forgot-password">
            Forgot password?
          </a>
          <span className={styles.rateLimit}>Rate limits active</span>
        </div>

        <div className={styles.orDivider}>or</div>

        <a className={styles.secondaryButton} href="/register">
          Create account
        </a>
      </section>

      <AuthSecurityPanel />
    </AuthFrame>
  );
}

export function RegisterInteractiveScreen() {
  return (
    <AuthFrame
      description="Create a secure account, then verify your identity and build your competitive player profile."
      statusDetail="Verified and protected"
      statusLabel="Secure sign-up"
      title="Create account"
    >
      <section className={styles.card} aria-labelledby="register-form-title">
        <div className={styles.cardHeading}>
          <h2 className={styles.cardTitle} id="register-form-title">
            New player access
          </h2>
          <p className={styles.cardDescription}>
            Start with account credentials. Competitive identity follows during onboarding.
          </p>
        </div>

        <RegisterForm />

        <div className={styles.orDivider}>or</div>

        <a className={styles.secondaryButton} href="/login">
          Back to sign in
        </a>
      </section>

      <AuthSecurityPanel />
    </AuthFrame>
  );
}

export function EmailVerificationInteractiveScreen({ email }: { email: string }) {
  return (
    <AuthFrame
      accent="info"
      description="Enter the six-digit code sent to your registered email address."
      statusDetail="VERZUS protected"
      statusLabel="Secure verification"
      title="Verify your email"
    >
      <section className={styles.card} aria-labelledby="verification-form-title">
        <div className={styles.cardHeading}>
          <h2 className={styles.cardTitle} id="verification-form-title">
            Identity checkpoint
          </h2>
          <p className={styles.cardDescription}>
            Verification protects your competitive identity and account recovery.
          </p>
        </div>

        <div className={styles.maskedIdentity}>
          <span aria-hidden="true">@</span>
          <span>{email.replace(/(^.).*(@.*$)/u, "$1********$2")}</span>
        </div>

        <EmailVerificationForm />

        <div className={styles.orDivider}>or</div>

        <ResendVerificationButton email={email} />

        <div className={styles.inlineRow}>
          <a className={styles.textAction} href="/register">
            Change email
          </a>
          <span className={styles.rateLimit}>Attempt limits active</span>
        </div>
      </section>

      <AuthSecurityPanel
        copy="Verified email access protects your identity and enables secure recovery."
        title="Verification protects you"
      />
    </AuthFrame>
  );
}

export function ForgotPasswordInteractiveScreen() {
  return (
    <AuthFrame
      description="Enter the email address or phone number linked to your account."
      statusDetail="Verified and protected"
      statusLabel="Secure password reset"
      title="Forgot password"
    >
      <section className={styles.card} aria-labelledby="forgot-form-title">
        <div className={styles.cardHeading}>
          <h2 className={styles.cardTitle} id="forgot-form-title">
            Recover secure access
          </h2>
          <p className={styles.cardDescription}>
            The response never reveals whether an account exists.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className={styles.orDivider}>or</div>

        <a className={styles.secondaryButton} href="/login">
          Back to sign in
        </a>
      </section>

      <AuthSecurityPanel
        copy="Reset links expire automatically and never expose whether an account exists."
        title="Secure reset process"
      />
    </AuthFrame>
  );
}

export function ResetPasswordInteractiveScreen({ resetToken }: { resetToken: string }) {
  return (
    <AuthFrame
      description="Create a new password to restore secure access to your VERZUS account."
      statusDetail="Token verified"
      statusLabel="Secure reset"
      title="Reset password"
    >
      <section className={styles.card} aria-labelledby="reset-form-title">
        <div className={styles.tokenNotice}>
          <h2 className={styles.noticeTitle} id="reset-form-title">
            Reset token is valid
          </h2>
          <p className={styles.noticeCopy}>
            The reset link is checked once when you submit the new password.
          </p>
        </div>

        <ResetPasswordForm resetToken={resetToken} />

        <div className={styles.orDivider}>or</div>

        <a className={styles.secondaryButton} href="/login">
          Back to sign in
        </a>
      </section>

      <AuthSecurityPanel />
    </AuthFrame>
  );
}
