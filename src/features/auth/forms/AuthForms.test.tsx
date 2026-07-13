// VERZUS M4 STEP 4.4

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AuthSubmitter } from "./auth-form.submitter";
import { EmailVerificationForm } from "./EmailVerificationForm";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

describe("interactive authentication forms", () => {
  it("shows accessible login validation errors", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");

    expect(alert).toBeVisible();
    expect(within(alert).getByText("Enter your email address or phone number.")).toBeVisible();
    expect(within(alert).getByText("Enter your password.")).toBeVisible();
    expect(screen.getByLabelText("Email or phone")).toHaveAttribute("aria-invalid", "true");
  });

  it("toggles password visibility without submitting", () => {
    render(<LoginForm />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("prevents duplicate submissions while a request is in flight", async () => {
    type LoginInput = {
      identifier: string;
      password: string;
    };

    let resolveRequest: (value: { ok: true; message: string }) => void = () => {
      throw new Error("Deferred authentication request was not initialized.");
    };

    const submitterImplementation: AuthSubmitter<LoginInput> = () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      });

    const submitter = vi.fn(submitterImplementation);

    render(<LoginForm submitter={submitter} />);

    fireEvent.change(screen.getByLabelText("Email or phone"), {
      target: { value: "player@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass1!" },
    });

    const submit = screen.getByRole("button", { name: "Sign in" });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(submitter).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();

    resolveRequest({
      ok: true,
      message: "Signed in.",
    });

    await waitFor(() => {
      expect(screen.getByText("Signed in.")).toBeVisible();
    });
  });

  it("shows a structured retryable server error", async () => {
    type LoginInput = {
      identifier: string;
      password: string;
    };

    const submitter: AuthSubmitter<LoginInput> = async () => ({
      ok: false,
      error: {
        code: "service_unavailable",
        message: "Authentication service is temporarily unavailable.",
        requestId: "AUTH-503",
        retryable: true,
        fieldErrors: {},
        retryAfterSeconds: null,
      },
    });

    render(<LoginForm submitter={submitter} />);

    fireEvent.change(screen.getByLabelText("Email or phone"), {
      target: { value: "player@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Authentication service is temporarily unavailable."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry submission" })).toBeVisible();
    expect(screen.getByText(/AUTH-503/)).toBeVisible();
  });

  it("validates registration password confirmation", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Gamer tag"), {
      target: { value: "JayFlex" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "player@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "DifferentPass1!" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /I agree to the Terms and Community Rules/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    const alert = await screen.findByRole("alert");

    expect(within(alert).getByText("Passwords do not match.")).toBeVisible();
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute("aria-invalid", "true");
  });

  it("accepts a pasted six-digit verification code", () => {
    render(<EmailVerificationForm />);

    const first = screen.getByLabelText("Verification digit 1");

    fireEvent.paste(first, {
      clipboardData: {
        getData: () => "123456",
      },
    });

    for (let index = 1; index <= 6; index += 1) {
      expect(screen.getByLabelText(`Verification digit ${index}`)).toHaveValue(String(index));
    }
  });
});
