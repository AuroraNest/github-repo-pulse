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
  const [deleteArmed, setDeleteArmed] = useState(false);
  const copy = locale === "zh" ? zhCopy : enCopy;

  async function run(action: string, request: () => Promise<Response>) {
    setBusy(action);
    setDeleteArmed(false);
    setFeedback(null);

    try {
      const response = await request();
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setFeedback({ tone: "red", message: payload?.error?.message || copy.failed });
        return;
      }

      setFeedback({ tone: "green", message: action === "delete" ? copy.deleteGuarded : copy.done });
    } catch (error) {
      setFeedback({ tone: "red", message: error instanceof Error ? error.message : copy.failed });
    } finally {
      setBusy(null);
    }
  }

  async function exportCsv() {
    setBusy("export");
    setDeleteArmed(false);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings/export", { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setFeedback({ tone: "red", message: payload?.error?.message || copy.failed });
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filenameFromDisposition(response.headers.get("Content-Disposition")) || "repopulse-analytics.csv";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setFeedback({ tone: "green", message: copy.exported });
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
        <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-60" disabled={busy !== null} onClick={exportCsv} type="button">
          {busy === "export" ? copy.working : labels.exportCsv}
        </button>
        <button
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 disabled:opacity-60"
          disabled={busy !== null}
          onClick={() => {
            if (!deleteArmed) {
              setDeleteArmed(true);
              setFeedback({ tone: "slate", message: copy.deleteConfirm });
              return;
            }
            void run("delete", () => fetch("/api/settings/data", { body: JSON.stringify({ confirmation: "DELETE" }), headers: { "Content-Type": "application/json" }, method: "DELETE" }));
          }}
          type="button"
        >
          {busy === "delete" ? copy.working : deleteArmed ? copy.confirmDelete : labels.deleteAllData}
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

function filenameFromDisposition(disposition: string | null) {
  return disposition?.match(/filename="([^"]+)"/)?.[1] || null;
}

const zhCopy = {
  confirmDelete: "确认删除",
  deleteConfirm: "再次点击确认删除. 当前版本仍会被后端保护, 不会实际删除数据.",
  deleteGuarded: "删除接口已受保护, 当前版本不会执行实际删除.",
  done: "操作已完成.",
  exported: "CSV 已准备下载.",
  failed: "操作失败.",
  working: "处理中..."
};

const enCopy = {
  confirmDelete: "Confirm delete",
  deleteConfirm: "Click again to confirm deletion. The backend still guards this version and will not delete data.",
  deleteGuarded: "Deletion is guarded; this version does not delete data.",
  done: "Action completed.",
  exported: "CSV is ready to download.",
  failed: "Action failed.",
  working: "Working..."
};
