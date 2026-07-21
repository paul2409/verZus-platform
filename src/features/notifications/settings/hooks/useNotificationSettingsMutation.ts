// VERZUS M12.7 OPTIMISTIC SETTINGS MUTATION

"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useState } from "react";

import { updateNotificationSettings } from "../api/notification-settings.client";
import { notificationSettingsKeys } from "../api/notification-settings.query";
import type {
  NotificationSettingsSnapshot,
  NotificationSettingsUpdateInput,
} from "../model/notification-settings.types";

type MutationContext = {
  snapshots: Array<[QueryKey, NotificationSettingsSnapshot | undefined]>;
};

function optimisticSnapshot(
  previous: NotificationSettingsSnapshot | undefined,
  input: NotificationSettingsUpdateInput,
): NotificationSettingsSnapshot {
  return {
    ...input.preferences,
    version: previous?.version ?? input.expectedVersion,
    updatedAt: previous?.updatedAt ?? new Date().toISOString(),
    requestId: previous?.requestId ?? "notification-settings-optimistic",
  };
}

export function useNotificationSettingsMutation() {
  const queryClient = useQueryClient();
  const [lastInput, setLastInput] = useState<NotificationSettingsUpdateInput | null>(null);

  const mutation = useMutation({
    mutationFn: updateNotificationSettings,
    retry: false,
    onMutate: async (input): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: notificationSettingsKeys.all });
      const snapshots = queryClient.getQueriesData<NotificationSettingsSnapshot>({
        queryKey: notificationSettingsKeys.all,
      });

      for (const [queryKey, snapshot] of snapshots) {
        queryClient.setQueryData(queryKey, optimisticSnapshot(snapshot, input));
      }
      return { snapshots };
    },
    onSuccess: (result) => {
      queryClient.setQueriesData<NotificationSettingsSnapshot>(
        { queryKey: notificationSettingsKeys.all },
        result.settings,
      );
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      for (const [queryKey, snapshot] of context.snapshots) {
        queryClient.setQueryData(queryKey, snapshot);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationSettingsKeys.all });
    },
  });

  const submit = async (input: NotificationSettingsUpdateInput) => {
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
    lastInput,
  };
}
