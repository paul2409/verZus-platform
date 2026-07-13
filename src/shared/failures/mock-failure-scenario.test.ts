// VERZUS M4 STEP 4.10

import { describe, expect, it } from "vitest";

import { resolveMockFailureScenario } from "./mock-failure-scenario";

describe("mock failure scenario resolution", () => {
  it("allows known failure injection outside production", () => {
    expect(
      resolveMockFailureScenario({
        nodeEnv: "test",
        queryScenario: "maintenance",
        headerScenario: null,
      }),
    ).toBe("maintenance");
  });

  it("rejects unknown failure scenarios", () => {
    expect(
      resolveMockFailureScenario({
        nodeEnv: "development",
        queryScenario: "delete-everything",
        headerScenario: null,
      }),
    ).toBeNull();
  });

  it("disables failure injection in production", () => {
    expect(
      resolveMockFailureScenario({
        nodeEnv: "production",
        queryScenario: "offline",
        headerScenario: "maintenance",
      }),
    ).toBeNull();
  });
});
