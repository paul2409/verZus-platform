// VERZUS M12.4 OPTIMISTIC NOTIFICATION MUTATIONS

"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useState } from "react";

import { notificationCenterKeys } from "../../center/api/notification-center.query";
import type {
  NotificationCenterSnapshot,
  NotificationLifecycleState,
} from "../../center/model/notification-center.types";
import { mutateNotification } from "../api/notification-mutation.client";
import { notificationMutationKeys } from "../api/notification-mutation.query";
import type {
  NotificationMutationInput,
  NotificationUnreadCount,
} from "../model/notification-mutation.types";

type MutationContext = {
  centerSnapshots: Array<[QueryKey, NotificationCenterSnapshot | undefined]>;
  badgeSnapshot: NotificationUnreadCount | undefined;
};

type CenterFilter = {
  state?: NotificationLifecycleState | "all";
};

function targetState(input: NotificationMutationInput): NotificationLifecycleState {
  if (input.kind === "read-all" || input.operation === "read") return "read";
  return input.operation;
}

function optimisticallyUpdateCenter(
  queryKey: QueryKey,
  snapshot: NotificationCenterSnapshot,
  input: NotificationMutationInput,
): NotificationCenterSnapshot {
  const filter = (queryKey[2] ?? {}) as CenterFilter;
  const nextState = targetState(input);
  const category = input.kind === "read-all" ? input.category : "all";
  const isTarget = (item: NotificationCenterSnapshot["items"][number]) =>
    input.kind === "single"
      ? item.id === input.notificationId
      : item.state === "unread" && (category === "all" || item.category === category);

  let updatedCount = 0;
  const transitioned = snapshot.items.map((item) => {
    if (!isTarget(item)) return item;
    if (item.state !== nextState) updatedCount += 1;
    return { ...item, state: nextState };
  });

  const visibleItems =
    filter.state && filter.state !== "all"
      ? transitioned.filter((item) => item.state === filter.state)
      : transitioned;

  const unreadReduction =
    input.kind === "single"
      ? input.expectedState === "unread"
        ? 1
        : 0
      : input.category === "all"
        ? snapshot.meta.unreadCount
        : updatedCount;

  const removedCount = Math.max(0, snapshot.items.length - visibleItems.length);
  const nextTotal = Math.max(0, snapshot.meta.total - removedCount);
  const nextTotalPages = nextTotal === 0 ? 0 : Math.ceil(nextTotal / snapshot.meta.pageSize);

  return {
    items: visibleItems,
    meta: {
      ...snapshot.meta,
      total: nextTotal,
      totalPages: nextTotalPages,
      unreadCount: Math.max(0, snapshot.meta.unreadCount - unreadReduction),
    },
  };
}

function optimisticUnreadCount(
  current: NotificationUnreadCount | undefined,
  input: NotificationMutationInput,
): NotificationUnreadCount {
  const existing = current?.unreadCount ?? 0;
  const reduction =
    input.kind === "read-all"
      ? input.category === "all"
        ? existing
        : 0
      : input.expectedState === "unread"
        ? 1
        : 0;

  return {
    unreadCount: Math.max(0, existing - reduction),
    requestId: current?.requestId ?? "notification-badge-optimistic",
    fetchedAt: current?.fetchedAt ?? new Date().toISOString(),
  };
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const [lastInput, setLastInput] = useState<NotificationMutationInput | null>(null);

  const mutation = useMutation({
    mutationFn: mutateNotification,
    retry: false,
    onMutate: async (input): Promise<MutationContext> => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationCenterKeys.all }),
        queryClient.cancelQueries({ queryKey: notificationMutationKeys.all }),
      ]);

      const centerSnapshots = queryClient.getQueriesData<NotificationCenterSnapshot>({
        queryKey: notificationCenterKeys.all,
      });
      const badgeSnapshot = queryClient.getQueryData<NotificationUnreadCount>(
        notificationMutationKeys.unreadCount("normal"),
      );

      for (const [queryKey, snapshot] of centerSnapshots) {
        if (!snapshot) continue;
        queryClient.setQueryData(
          queryKey,
          optimisticallyUpdateCenter(queryKey, snapshot, input),
        );
      }

      queryClient.setQueryData(
        notificationMutationKeys.unreadCount("normal"),
        optimisticUnreadCount(badgeSnapshot, input),
      );

      return { centerSnapshots, badgeSnapshot };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<NotificationUnreadCount>(
        notificationMutationKeys.unreadCount("normal"),
        {
          unreadCount: result.unreadCount,
          requestId: result.requestId,
          fetchedAt: new Date().toISOString(),
        },
      );
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      for (const [queryKey, snapshot] of context.centerSnapshots) {
        queryClient.setQueryData(queryKey, snapshot);
      }
      queryClient.setQueryData(
        notificationMutationKeys.unreadCount("normal"),
        context.badgeSnapshot,
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationCenterKeys.all }),
        queryClient.invalidateQueries({ queryKey: notificationMutationKeys.all }),
      ]);
    },
  });

  const submit = async (input: NotificationMutationInput) => {
    setLastInput(input);
    return mutation.mutateAsync(input);
  };

  const retry = async () => {
    if (!lastInput) return null;
    return mutation.mutateAsync(lastInput);
  };

  return {
    submit,
    retry,
    reset: mutation.reset,
    error: mutation.error,
    data: mutation.data,
    isPending: mutation.isPending,
    activeInput: mutation.variables ?? null,
    lastInput,
  };
}
