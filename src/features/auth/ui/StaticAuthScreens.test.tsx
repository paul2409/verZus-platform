// VERZUS M4 STEP 4.3

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  BannedAccountStaticScreen,
  EmailVerificationStaticScreen,
  ForgotPasswordStaticScreen,
  LoginStaticScreen,
  RegisterStaticScreen,
  ResetPasswordStaticScreen,
  SessionExpiredStaticScreen,
  SuspendedAccountStaticScreen,
} from "./StaticAuthScreens";

describe("static authentication screens", () => {
  it("renders the login screen with accessible fields and recovery route", () => {
    render(<LoginStaticScreen />);

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    expect(screen.getByLabelText("Email or phone")).toBeVisible();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute("type", "button");
  });

  it("renders registration requirements and safe navigation", () => {
    render(<RegisterStaticScreen />);

    expect(screen.getByLabelText("Gamer tag")).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Phone number (optional)")).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "/login");
  });

  it("renders six verification-code fields", () => {
    render(<EmailVerificationStaticScreen />);

    for (let index = 1; index <= 6; index += 1) {
      expect(screen.getByLabelText(`Verification digit ${index}`)).toBeVisible();
    }
  });

  it("renders password recovery and reset screens", () => {
    const { unmount } = render(<ForgotPasswordStaticScreen />);

    expect(screen.getByRole("button", { name: "Send reset link" })).toBeVisible();

    unmount();
    render(<ResetPasswordStaticScreen />);

    expect(screen.getByLabelText("New password")).toBeVisible();
    expect(screen.getByText("Password requirements")).toBeVisible();
  });

  it("renders the session-expired recovery actions without credential fields", () => {
    render(<SessionExpiredStaticScreen />);

    expect(screen.getByRole("heading", { name: "Session expired" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Sign in again" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders explicit suspended and banned states", () => {
    const { unmount } = render(<SuspendedAccountStaticScreen />);

    expect(screen.getByRole("heading", { name: "Account access suspended" })).toBeVisible();

    unmount();
    render(<BannedAccountStaticScreen />);

    expect(screen.getByRole("heading", { name: "Account access blocked" })).toBeVisible();
  });
});
