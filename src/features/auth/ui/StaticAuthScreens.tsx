// VERZUS M4 STEP 4.3

import { AuthCodeFields } from "./AuthCodeFields";
import { AuthField } from "./AuthField";
import { AuthFrame } from "./AuthFrame";
import { AuthSecurityPanel } from "./AuthSecurityPanel";
import styles from "./AuthScreens.module.css";

function StaticActionNote() {
  return (
    <p className={styles.previewNote}>
      Static interface — submission logic is added in M4 Step 4.4
    </p>
  );
}

export function LoginStaticScreen() {
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

        <form className={styles.form}>
          <AuthField
            autoComplete="username"
            icon="@"
            id="login-identifier"
            inputMode="email"
            label="Email or phone"
            placeholder="Enter email or phone number"
          />
          <AuthField
            accessory="Show"
            autoComplete="current-password"
            icon="●"
            id="login-password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />

          <div className={styles.inlineRow}>
            <a className={styles.link} href="/forgot-password">
              Forgot password?
            </a>
            <span className={styles.rateLimit}>Rate limits active</span>
          </div>

          <button className={styles.primaryAction} type="button">
            Sign in
          </button>

          <div className={styles.orDivider}>or</div>

          <a className={styles.secondaryButton} href="/register">
            Create account
          </a>

          <StaticActionNote />
        </form>
      </section>

      <AuthSecurityPanel />
    </AuthFrame>
  );
}

export function RegisterStaticScreen() {
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

        <form className={styles.form}>
          <AuthField
            autoComplete="nickname"
            icon="ID"
            id="register-gamer-tag"
            label="Gamer tag"
            placeholder="Choose your gamer tag"
          />
          <AuthField
            autoComplete="email"
            icon="@"
            id="register-email"
            inputMode="email"
            label="Email"
            placeholder="Enter your email address"
            type="email"
          />
          <AuthField
            autoComplete="tel"
            icon="+"
            id="register-phone"
            inputMode="tel"
            label="Phone number (optional)"
            placeholder="Enter your phone number"
            type="tel"
          />
          <AuthField
            accessory="Show"
            autoComplete="new-password"
            icon="●"
            id="register-password"
            label="Password"
            placeholder="Create a strong password"
            type="password"
          />
          <AuthField
            accessory="Show"
            autoComplete="new-password"
            icon="●"
            id="register-confirm-password"
            label="Confirm password"
            placeholder="Confirm your password"
            type="password"
          />

          <label className={styles.checkboxRow}>
            <input className={styles.checkbox} type="checkbox" />
            <span>
              I agree to the <a href="/terms">Terms</a> and{" "}
              <a href="/community-rules">Community Rules</a>.
            </span>
          </label>

          <button className={styles.primaryAction} type="button">
            Create account
          </button>

          <div className={styles.orDivider}>or</div>

          <a className={styles.secondaryButton} href="/login">
            Back to sign in
          </a>

          <StaticActionNote />
        </form>
      </section>

      <AuthSecurityPanel />
    </AuthFrame>
  );
}

export function EmailVerificationStaticScreen() {
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
          <span>ja********@gmail.com</span>
        </div>

        <form className={styles.form}>
          <AuthCodeFields />

          <button className={styles.primaryAction} type="button">
            Verify
          </button>

          <div className={styles.orDivider}>or</div>

          <button className={styles.secondaryButton} type="button">
            Resend code (00:45)
          </button>

          <div className={styles.inlineRow}>
            <a className={styles.textAction} href="/register">
              Change email
            </a>
            <span className={styles.rateLimit}>Attempt limits active</span>
          </div>

          <StaticActionNote />
        </form>
      </section>

      <AuthSecurityPanel
        copy="Verified email access protects your identity and enables secure recovery."
        title="Verification protects you"
      />
    </AuthFrame>
  );
}

export function ForgotPasswordStaticScreen() {
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
            Reset instructions are time-limited and sent only to verified account channels.
          </p>
        </div>

        <form className={styles.form}>
          <AuthField
            autoComplete="username"
            icon="@"
            id="forgot-identifier"
            inputMode="email"
            label="Email or phone"
            placeholder="Enter email or phone number"
          />

          <button className={styles.primaryAction} type="button">
            Send reset link
          </button>

          <div className={styles.orDivider}>or</div>

          <a className={styles.secondaryButton} href="/login">
            Back to sign in
          </a>

          <StaticActionNote />
        </form>
      </section>

      <AuthSecurityPanel
        copy="Reset links expire automatically and never expose whether an account exists."
        title="Secure reset process"
      />
    </AuthFrame>
  );
}

export function ResetPasswordStaticScreen() {
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
          <p className={styles.noticeCopy}>This secure link will expire in 15 minutes.</p>
        </div>

        <form className={styles.form}>
          <AuthField
            accessory="Show"
            autoComplete="new-password"
            icon="●"
            id="reset-password"
            label="New password"
            placeholder="Enter new password"
            type="password"
          />
          <AuthField
            accessory="Show"
            autoComplete="new-password"
            icon="●"
            id="reset-confirm-password"
            label="Confirm new password"
            placeholder="Confirm new password"
            type="password"
          />

          <div className={styles.infoNotice}>
            <h3 className={styles.noticeTitle}>Password requirements</h3>
            <ul className={styles.passwordRules}>
              <li>At least 8 characters</li>
              <li>Uppercase and lowercase letters</li>
              <li>At least one number</li>
              <li>At least one special character</li>
              <li>Both passwords must match</li>
            </ul>
          </div>

          <button className={styles.primaryAction} type="button">
            Update password
          </button>

          <div className={styles.orDivider}>or</div>

          <a className={styles.secondaryButton} href="/login">
            Back to sign in
          </a>

          <StaticActionNote />
        </form>
      </section>

      <AuthSecurityPanel />
    </AuthFrame>
  );
}

export function SessionExpiredStaticScreen() {
  return (
    <AuthFrame
      accent="warning"
      description="For your security, your previous session is no longer valid."
      statusDetail="Session expired"
      statusLabel="Authentication interruption"
      title="Session expired"
    >
      <section className={styles.statePanel} aria-labelledby="expired-title">
        <div className={styles.stateHeader}>
          <span className={styles.stateIcon} aria-hidden="true">
            TIME
          </span>
          <div className={styles.stateContent}>
            <h2 className={styles.noticeTitle} id="expired-title">
              What happened?
            </h2>
            <p className={styles.noticeCopy}>VERZUS ended the session to protect account access.</p>
          </div>
        </div>

        <ul className={styles.stateList}>
          <li className={styles.stateListItem}>
            <span className={styles.stateItemMarker}>01</span>
            <div>
              <h3 className={styles.stateItemTitle}>Inactivity timeout</h3>
              <p className={styles.stateItemCopy}>
                The account was inactive beyond the secure session limit.
              </p>
            </div>
          </li>
          <li className={styles.stateListItem}>
            <span className={styles.stateItemMarker}>02</span>
            <div>
              <h3 className={styles.stateItemTitle}>Session refresh failed</h3>
              <p className={styles.stateItemCopy}>
                The previous session could not be safely renewed.
              </p>
            </div>
          </li>
          <li className={styles.stateListItem}>
            <span className={styles.stateItemMarker}>03</span>
            <div>
              <h3 className={styles.stateItemTitle}>Security protection</h3>
              <p className={styles.stateItemCopy}>
                Access was ended after a security-sensitive change.
              </p>
            </div>
          </li>
        </ul>

        <a className={styles.primaryAction} href="/login">
          Sign in again
        </a>
        <a className={styles.secondaryButton} href="/">
          Back to home
        </a>
      </section>

      <AuthSecurityPanel title="Your security matters" />
    </AuthFrame>
  );
}

export function SuspendedAccountStaticScreen() {
  return (
    <AuthFrame
      accent="warning"
      description="This account is temporarily restricted while a trust or moderation review is active."
      statusDetail="Temporary restriction"
      statusLabel="Account suspended"
      title="Account access suspended"
    >
      <section className={styles.statePanel} aria-labelledby="suspended-title">
        <div className={styles.stateHeader}>
          <span className={styles.stateIcon} aria-hidden="true">
            HOLD
          </span>
          <div className={styles.stateContent}>
            <h2 className={styles.noticeTitle} id="suspended-title">
              Competitive access is paused
            </h2>
            <p className={styles.noticeCopy}>
              Match entry, Crew actions, rewards, and profile changes remain unavailable until the
              review is resolved.
            </p>
          </div>
        </div>

        <div className={styles.infoNotice}>
          <h3 className={styles.noticeTitle}>Reference</h3>
          <p className={styles.noticeCopy}>AUTH-SUSPENSION-REVIEW</p>
        </div>

        <a className={styles.primaryAction} href="/login">
          Return to sign in
        </a>
        <a className={styles.secondaryButton} href="/">
          Back to home
        </a>
      </section>
    </AuthFrame>
  );
}

export function BannedAccountStaticScreen() {
  return (
    <AuthFrame
      accent="danger"
      description="This account cannot access VERZUS because of a confirmed enforcement decision."
      statusDetail="Access blocked"
      statusLabel="Account banned"
      title="Account access blocked"
    >
      <section className={styles.statePanel} aria-labelledby="banned-title">
        <div className={styles.stateHeader}>
          <span className={styles.stateIcon} aria-hidden="true">
            STOP
          </span>
          <div className={styles.stateContent}>
            <h2 className={styles.noticeTitle} id="banned-title">
              This decision is server-enforced
            </h2>
            <p className={styles.noticeCopy}>
              Creating another account to avoid enforcement may trigger additional trust and
              identity restrictions.
            </p>
          </div>
        </div>

        <div className={styles.infoNotice}>
          <h3 className={styles.noticeTitle}>Reference</h3>
          <p className={styles.noticeCopy}>AUTH-BAN-ENFORCED</p>
        </div>

        <a className={styles.primaryAction} href="/">
          Return home
        </a>
      </section>
    </AuthFrame>
  );
}
