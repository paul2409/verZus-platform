"use client";

// VERZUS M7.6 INDEPENDENT EVIDENCE UPLOAD PANEL

import { useRef, useState } from "react";

import { MatchOperationsApiClientError } from "../api/match-operations-api.adapter";
import { useMatchEvidenceMutation } from "../api/match-result.mutations";
import type { MatchEvidenceViewModel } from "../model/match-resource.types";
import type { MatchOperationState } from "../model/match-operations.types";
import styles from "./MatchOperationsScreen.module.css";

export type EvidenceUploadPanelProps = {
  matchId: string;
  seedState: MatchOperationState;
  currentState: MatchOperationState;
  matchVersion: number;
  value: MatchEvidenceViewModel;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceUploadPanel({
  matchId,
  seedState,
  currentState,
  matchVersion,
  value,
}: EvidenceUploadPanelProps) {
  const mutation = useMatchEvidenceMutation();
  const clickLock = useRef(false);
  const key = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  if (!value.visible) return null;

  const error = mutation.error instanceof MatchOperationsApiClientError ? mutation.error : null;

  function upload() {
    if (!file || clickLock.current || mutation.isPending) return;
    clickLock.current = true;
    key.current ??= `evidence-${crypto.randomUUID()}`;
    mutation.mutate(
      {
        matchId,
        seedState,
        expectedState: currentState,
        expectedVersion: matchVersion,
        idempotencyKey: key.current,
        file,
      },
      {
        onSuccess: () => {
          key.current = null;
          setFile(null);
        },
        onError: (mutationError) => {
          if (mutationError instanceof MatchOperationsApiClientError && !mutationError.retryable) {
            key.current = null;
          }
        },
        onSettled: () => {
          clickLock.current = false;
        },
      },
    );
  }

  return (
    <section className={styles.secondaryPanel} data-evidence-operations="m7.6">
      <div className={styles.panelHeading}>
        <p>INDEPENDENT RESOURCE</p>
        <h2>Evidence</h2>
      </div>
      <p>
        {value.uploadedCount} of {value.maxFiles} files attached. Maximum{" "}
        {formatBytes(value.maxFileSizeBytes)} each.
      </p>

      {value.attachments.length > 0 ? (
        <ul className={styles.evidenceList}>
          {value.attachments.map((attachment) => (
            <li key={attachment.evidenceId}>
              <div>
                <strong>{attachment.fileName}</strong>
                <span>
                  {attachment.mimeType} · {formatBytes(attachment.sizeBytes)}
                </span>
              </div>
              <code>{attachment.sha256.slice(0, 12)}</code>
            </li>
          ))}
        </ul>
      ) : (
        <p>No evidence attached yet.</p>
      )}

      <label className={styles.filePicker}>
        Evidence file
        <input
          accept={value.acceptedMimeTypes.join(",")}
          disabled={!value.uploadEnabled || mutation.isPending}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>
      {file ? (
        <p className={styles.selectedFile}>
          Selected: {file.name} · {formatBytes(file.size)}
        </p>
      ) : null}
      <button
        disabled={!value.uploadEnabled || !file || mutation.isPending}
        onClick={upload}
        type="button"
      >
        {mutation.isPending ? "Uploading..." : "Upload evidence"}
      </button>

      {mutation.data ? (
        <p className={styles.resultSuccess} role="status">
          {mutation.data.outcome === "evidence_uploaded"
            ? "Evidence uploaded independently. Result draft state was not changed."
            : "This evidence file was already registered."}
        </p>
      ) : null}
      {error ? (
        <p className={styles.resultError} role="alert">
          {error.message} · Error ID {error.requestId}
        </p>
      ) : null}
      <p className={styles.evidencePolicy}>
        Allowed: PNG, JPEG and MP4. Files are checksum-verified and do not submit or confirm the
        match result.
      </p>
    </section>
  );
}
