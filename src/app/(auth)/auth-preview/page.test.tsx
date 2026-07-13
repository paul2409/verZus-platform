// VERZUS M4 STEP 4.3

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AuthPreviewPage from "./page";

describe("M4 static authentication preview", () => {
  it("links every Step 4.3 route", () => {
    render(<AuthPreviewPage />);

    const routes = [
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
      "/session-expired",
      "/account/suspended",
      "/account/banned",
    ];

    for (const route of routes) {
      expect(document.querySelector(`a[href="${route}"]`)).not.toBeNull();
    }
  });

  it("states that the forms are visual-only", () => {
    render(<AuthPreviewPage />);

    expect(screen.getByText(/forms are visual-only until M4 Step 4.4/i)).toBeVisible();
  });
});
