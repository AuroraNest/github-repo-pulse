"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "../../lib/i18n";

type SettingsActionsProps = {
  kind: "github" | "privacy";
  labels: {
    deleteAllData: string;
    exportCsv: string;
    reverifyToken: string;
    rotateToken: string;
  };
  locale: Locale;
};

type Feedback = {
  tone: "green" | "red" | "slate";
  message: string;
};

export function SettingsActions({ kind, labels, locale }: SettingsActionsProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const copy = locale === "zh" ? zhCopy : enCopy;

  async function run(action: string, request: () => Promise<Response>) {
    setBusy(action);
    setFeedback(null);

    try {
      const response = await request();
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setFeedback({ tone: "red", message: payload?.error?.message || copy.failed });
        return;
      }

      setFeedback({ tone: "green", message: action === "delete" ? payload.data.note : copy.done });
    } catch (error) {
      setFeedback({ tone: "red", message: error instanceof Error ? error.message : copy.failed });
    } finally {
      setBusy(null);
    }
  }

  if (kind === "github") {
    return (
      <div className="mt-4">
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-60" disabled={busy !== null} onClick={() => run("reverify", () => fetch("/api/settings/github/reverify", { method: "POST" }))} type="button">
            {busy === "reverify" ? copy.working : labels.reverifyToken}
          </button>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium" onClick={() => router.push("/setup")} type="button">
            {labels.rotateToken}
          </button>
        </div>
        {feedback ? <FeedbackMessage feedback={feedback} /> : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-60" disabled={busy !== null} onClick={() => run("export", () => fetch("/api/settings/export", { method: "POST" }))} type="button">
          {busy === "export" ? copy.working : labels.exportCsv}
        </button>
        <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 disabled:opacity-60" disabled={busy !== null} onClick={() => run("delete", () => fetch("/api/settings/data", { body: JSON.stringify({ confirmation: "DELETE" }), headers: { "Content-Type": "application/json" }, method: "DELETE" }))} type="button">
          {busy === "delete" ? copy.working : labels.deleteAllData}
        </button>
      </div>
      {feedback ? <FeedbackMessage feedback={feedback} /> : null}
    </div>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  const tone = feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${tone}`}>{feedback.message}</div>;
}

const zhCopy = {
  done: "操作已完成.",
  failed: "操作失败.",
  working: "处理中..."
};

const enCopy = {
  done: "Action completed.",
  failed: "Action failed.",
  working: "Working..."
};
