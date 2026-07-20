"use client";

// VERZUS M11.8 PROFILE RELEASE ERROR BOUNDARY AND TELEMETRY

import Link from "next/link";
import { Component, type ReactNode } from "react";

import styles from "./ProfileReleaseBoundary.module.css";

export type ProfileSurface =
  | "owner-profile"
  | "public-profile"
  | "profile-edit"
  | "match-history"
  | "identity-insights"
  | "privacy-settings";

type Props = {
  children: ReactNode;
  surface: ProfileSurface;
};

type State = {
  failed: boolean;
  errorId: string | null;
};

function createErrorId() {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function reportFailure(surface: ProfileSurface, errorId: string) {
  try {
    await fetch("/api/telemetry/profiles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventType: "surface_failed",
        surface,
        outcome: "error",
        errorId,
      }),
      keepalive: true,
    });
  } catch {
    // Telemetry must never replace the controlled user fallback.
  }
}

export class ProfileReleaseBoundary extends Component<Props, State> {
  override state: State = { failed: false, errorId: null };

  static getDerivedStateFromError(): State {
    return { failed: true, errorId: createErrorId() };
  }

  override componentDidCatch() {
    if (this.state.errorId) void reportFailure(this.props.surface, this.state.errorId);
  }

  private retry = () => {
    this.setState({ failed: false, errorId: null });
  };

  override render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className={styles.fallback} data-m11-release-boundary="failed">
        <span>PROFILE MODULE RECOVERY</span>
        <h1>This profile surface stopped</h1>
        <p>
          The application shell and unrelated VERZUS features remain available. Retry this profile
          surface or return to Play.
        </p>
        <div className={styles.actions}>
          <button onClick={this.retry} type="button">
            Retry profile
          </button>
          <Link href="/play">Return to Play</Link>
        </div>
        {this.state.errorId ? <small>Error ID: {this.state.errorId}</small> : null}
      </main>
    );
  }
}
