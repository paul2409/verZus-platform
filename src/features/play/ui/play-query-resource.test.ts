// VERZUS M5 STEPS 5.5-5.8

import { describe, expect, it } from "vitest";

import { PlayApiClientError } from "../api";
import { playResourceFromQuery } from "./play-query-resource";

describe("playResourceFromQuery", () => {
  it("keeps existing data visible while a refresh is running", () => {
    expect(
      playResourceFromQuery({
        isPending: false,
        isError: false,
        isFetching: true,
        data: { rank: 17 },
        error: null,
      }),
    ).toMatchObject({
      state: "stale",
      data: { rank: 17 },
    });
  });

  it("classifies an offline API error without inventing data", () => {
    const error = new PlayApiClientError({
      code: "offline",
      message: "Offline",
      requestId: "request-offline",
      retryable: true,
      fieldErrors: {},
    });

    expect(
      playResourceFromQuery({
        isPending: false,
        isError: true,
        isFetching: false,
        data: undefined,
        error,
      }),
    ).toEqual({
      state: "offline",
      data: null,
      errorCode: "offline",
      requestId: "request-offline",
    });
  });

  it("supports collection-specific empty detection", () => {
    expect(
      playResourceFromQuery(
        {
          isPending: false,
          isError: false,
          isFetching: false,
          data: [],
          error: null,
        },
        (items) => items.length === 0,
      ).state,
    ).toBe("empty");
  });
});
