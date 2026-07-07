"use client";

import type { ApiResponse, RepositorySyncResult } from "@repopulse/core";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type Feedback = {
  tone: "green" | "red";
  message: string;
};

export function RepositorySyncButton({
  labels,
  repositoryId,
  repositoryName
}: {
  labels: {
    failed: string;
    queued: string;
    syncNow: string;
    working: string;
  };
  repositoryId: string;
  repositoryName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function syncRepository() {
    setBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/repositories/${encodeURIComponent(repositoryId)}/sync`, { method: "POST" });
      const payload = (await response.json().catch(() => null)) as ApiResponse<{ syncRunItem: RepositorySyncResult }> | null;
      if (!response.ok || !payload?.ok) {
        setFeedback({ tone: "red", message: payload?.ok === false ? payload.error.message : labels.failed });
        return;
      }

      setFeedback({
        tone: payload.data.syncRunItem.status === "failed" ? "red" : "green",
        message: payload.data.syncRunItem.errorMessage || `${repositoryName} ${labels.queued}`
      });
    } catch (error) {
      setFeedback({ tone: "red", message: error instanceof Error ? error.message : labels.failed });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-60" disabled={busy} onClick={syncRepository} type="button">
        <RefreshCw className={busy ? "animate-spin" : ""} size={16} />
        {busy ? labels.working : labels.syncNow}
      </button>
      {feedback ? <div className={`rounded-lg border px-3 py-2 text-sm ${feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`} role="status">{feedback.message}</div> : null}
    </div>
  );
}
