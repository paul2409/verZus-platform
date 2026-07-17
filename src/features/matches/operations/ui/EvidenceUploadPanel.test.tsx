// VERZUS M7.6 EVIDENCE UPLOAD PANEL TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EvidenceUploadPanel } from "./EvidenceUploadPanel";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../api/match-result.mutations", () => ({
  useMatchEvidenceMutation: () => ({ mutate, isPending: false, data: null, error: null }),
}));

const value = {
  visible: true,
  maxFiles: 5,
  maxFileSizeBytes: 25 * 1024 * 1024,
  acceptedMimeTypes: ["image/png", "image/jpeg", "video/mp4"],
  uploadedCount: 0,
  uploadEnabled: true,
  attachments: [],
};

describe("EvidenceUploadPanel", () => {
  it("uploads evidence independently using the current state and version", () => {
    mutate.mockClear();
    render(
      <EvidenceUploadPanel
        currentState="submit-result"
        matchId="m7-preview"
        matchVersion={12}
        seedState="submit-result"
        value={value}
      />,
    );

    const file = new File(["score"], "score.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Evidence file"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload evidence" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedState: "submit-result",
        expectedVersion: 12,
        file,
      }),
      expect.any(Object),
    );
  });

  it("renders persisted attachment checksum evidence", () => {
    render(
      <EvidenceUploadPanel
        currentState="disputed"
        matchId="m7-preview"
        matchVersion={15}
        seedState="disputed"
        value={{
          ...value,
          uploadedCount: 1,
          attachments: [
            {
              evidenceId: "evidence-1",
              fileName: "final-score.png",
              mimeType: "image/png",
              sizeBytes: 2048,
              sha256: "a".repeat(64),
              uploadedAt: "2026-07-17T01:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("final-score.png")).toBeVisible();
    expect(screen.getByText("aaaaaaaaaaaa")).toBeVisible();
  });
});
