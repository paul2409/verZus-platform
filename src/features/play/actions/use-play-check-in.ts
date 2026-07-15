// VERZUS M5 STEPS 5.9-5.13

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { playQueryKeys, PlayApiClientError } from "../api";
import { submitPlayCheckIn } from "../api/check-in-api.client";
import type { CurrentCheckIn, NextMatch, PlayScenario } from "../model";
import { recordPlayTelemetry } from "../telemetry/play-telemetry";

export interface PlayCheckInAction {
  state: "idle" | "pending" | "success" | "error";
  errorCode: string | null;
  requestId: string | null;
  checkIn: (value: CurrentCheckIn) => void;
  reset: () => void;
}

export function usePlayCheckIn(scenario: PlayScenario): PlayCheckInAction {
  const queryClient = useQueryClient();
  const immediateLock = useRef(false);

  const mutation = useMutation({
    mutationKey: ["play", "check-in", scenario],
    mutationFn: submitPlayCheckIn,
    onMutate: ({ command }) => {
      recordPlayTelemetry("play.check_in.started", {
        route: "/play",
        scenario,
        matchId: command.matchId,
      });
    },
    onSuccess: (result) => {
      queryClient.setQueryData<CurrentCheckIn>(playQueryKeys.currentCheckIn(scenario), (current) =>
        current
          ? {
              ...current,
              state: "checked_in",
              checkedInAt: result.checkedInAt,
              canCheckIn: false,
            }
          : current,
      );

      queryClient.setQueryData<NextMatch | null>(playQueryKeys.nextMatch(scenario), (current) =>
        current
          ? {
              ...current,
              status: "checked_in",
            }
          : current,
      );

      recordPlayTelemetry("play.check_in.succeeded", {
        route: "/play",
        scenario,
        matchId: result.matchId,
        requestId: result.requestId,
        duplicate: result.duplicate,
      });
    },
    onError: (error, variables) => {
      recordPlayTelemetry("play.check_in.failed", {
        route: "/play",
        scenario,
        matchId: variables.command.matchId,
        requestId: error instanceof PlayApiClientError ? error.requestId : null,
        errorCode: error instanceof PlayApiClientError ? error.code : "unknown_error",
        retryable: error instanceof PlayApiClientError ? error.retryable : false,
      });
    },
    onSettled: () => {
      immediateLock.current = false;
    },
  });

  return {
    state: mutation.isPending
      ? "pending"
      : mutation.isSuccess
        ? "success"
        : mutation.isError
          ? "error"
          : "idle",
    errorCode:
      mutation.error instanceof PlayApiClientError
        ? mutation.error.code
        : mutation.isError
          ? "unknown_error"
          : null,
    requestId:
      mutation.error instanceof PlayApiClientError
        ? mutation.error.requestId
        : (mutation.data?.requestId ?? null),
    checkIn: (value) => {
      if (
        immediateLock.current ||
        mutation.isPending ||
        !value.matchId ||
        !value.mutationKey ||
        !value.canCheckIn
      ) {
        return;
      }

      immediateLock.current = true;

      mutation.mutate({
        scenario,
        command: {
          matchId: value.matchId,
          mutationKey: value.mutationKey,
          idempotencyKey: globalThis.crypto.randomUUID(),
        },
      });
    },
    reset: mutation.reset,
  };
}
