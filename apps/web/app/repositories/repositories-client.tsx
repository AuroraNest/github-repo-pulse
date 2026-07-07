"use client";

import type { ApiResponse, RepositorySummary, RepositorySyncResult } from "@repopulse/core";
import { BarChart3, Eye, GitFork, Github, PauseCircle, PlayCircle, RefreshCw, Star, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Chip, EmptyState } from "../../components/ui";
import { formatCompactNumber, formatDate } from "../../lib/format";
import { translateStatus, translateVisibility, type Locale } from "../../lib/i18n";

type TabKey = "all" | "active" | "private" | "public" | "favorites";
type SortKey = "name" | "stars" | "forks" | "downloads" | "lastSync";

type Labels = {
  columns: readonly string[];
  configureGitHub: string;
  favorite: string;
  filters: readonly string[];
  noMatchingRepositories: string;
  noRepositories: string;
  pauseTracking: string;
  reports: string;
  resumeTracking: string;
  searchPlaceholder: string;
  sortBy: string;
  syncFailed: string;
  syncNow: string;
  syncQueued: string;
  tabs: readonly string[];
  unfavorite: string;
  view: string;
  working: string;
};

type Feedback = {
  tone: "green" | "red" | "slate";
  message: string;
};

export function RepositoriesClient({
  configurationRequired,
  initialQuery,
  initialRepositories,
  labels,
  locale,
  sourceDescription
}: {
  configurationRequired: boolean;
  initialQuery?: string;
  initialRepositories: RepositorySummary[];
  labels: Labels;
  locale: Locale;
  sourceDescription: string;
}) {
  const [repositories, setRepositories] = useState(initialRepositories);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [query, setQuery] = useState(initialQuery || "");
  const [sortBy, setSortBy] = useState<SortKey>("stars");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const visibleRepositories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...repositories]
      .filter((repo) => {
        if (needle && !`${repo.fullName} ${repo.description} ${repo.primaryLanguage}`.toLowerCase().includes(needle)) return false;
        if (activeTab === "active") return repo.tracked;
        if (activeTab === "private") return repo.isPrivate;
        if (activeTab === "public") return !repo.isPrivate;
        if (activeTab === "favorites") return repo.favorite;
        return true;
      })
      .sort((a, b) => sortRepositories(a, b, sortBy));
  }, [activeTab, query, repositories, sortBy]);

  async function patchRepository(repo: RepositorySummary, patch: Partial<Pick<RepositorySummary, "favorite" | "tracked">>, busyKey: string) {
    setBusy(`${repo.id}-${busyKey}`);
    setFeedback(null);

    try {
      const response = await fetch(`/api/repositories/${encodeURIComponent(repo.id)}`, {
        body: JSON.stringify(patch),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse<{ repository: RepositorySummary }> | null;
      if (!response.ok || !payload?.ok) {
        setFeedback({ tone: "red", message: payload?.ok === false ? payload.error.message : labels.syncFailed });
        return;
      }

      // ponytail: page-local state until DB-backed repository persistence lands.
      setRepositories((items) => items.map((item) => item.id === repo.id ? payload.data.repository : item));
      setFeedback({ tone: "green", message: `${payload.data.repository.fullName} ${labels.syncQueued}` });
    } catch (error) {
      setFeedback({ tone: "red", message: error instanceof Error ? error.message : labels.syncFailed });
    } finally {
      setBusy(null);
    }
  }

  async function syncRepository(repo: RepositorySummary) {
    setBusy(`${repo.id}-sync`);
    setFeedback(null);

    try {
      const response = await fetch(`/api/repositories/${encodeURIComponent(repo.id)}/sync`, { method: "POST" });
      const payload = (await response.json().catch(() => null)) as ApiResponse<{ syncRunItem: RepositorySyncResult }> | null;
      if (!response.ok || !payload?.ok) {
        setFeedback({ tone: "red", message: payload?.ok === false ? payload.error.message : labels.syncFailed });
        return;
      }

      const status = payload.data.syncRunItem.status === "success" ? "healthy" : payload.data.syncRunItem.status === "partial_failed" ? "warning" : "error";
      setRepositories((items) => items.map((item) => item.id === repo.id ? { ...item, lastSyncAt: new Date().toISOString(), status } : item));
      setFeedback({ tone: status === "error" ? "red" : "green", message: payload.data.syncRunItem.errorMessage || `${repo.fullName} ${labels.syncQueued}` });
    } catch (error) {
      setFeedback({ tone: "red", message: error instanceof Error ? error.message : labels.syncFailed });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      {configurationRequired ? (
        <EmptyState
          action={<Link href="/setup" className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">{labels.configureGitHub}</Link>}
          description={sourceDescription}
          title={labels.configureGitHub}
        />
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabKeys.map((tab, index) => (
            <button
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${activeTab === tab ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {labels.tabs[index]}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="h-10 min-w-[220px] rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            type="search"
            value={query}
          />
          <label className="sr-only" htmlFor="repository-sort">{labels.sortBy}</label>
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            id="repository-sort"
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            value={sortBy}
          >
            <option value="stars">{labels.columns[3]}</option>
            <option value="forks">{labels.columns[4]}</option>
            <option value="downloads">{labels.columns[7]}</option>
            <option value="lastSync">{labels.columns[9]}</option>
            <option value="name">{labels.columns[0]}</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {labels.filters.map((filter) => (
          <Chip key={filter}>{filter}</Chip>
        ))}
      </div>

      {feedback ? <FeedbackMessage feedback={feedback} /> : null}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1160px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-500">
              {labels.columns.map((column) => (
                <th key={column} className="border-b border-slate-200 px-3 py-3 font-semibold">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRepositories.map((repo) => (
              <tr key={repo.id} className="border-b border-slate-100">
                <td className="px-3 py-4">
                  <Link href={`/repositories/${repo.id}`} className="flex items-center gap-3">
                    <Github size={18} className="text-slate-500" />
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {repo.name}
                        {repo.favorite ? <Star size={14} className="fill-amber-400 text-amber-400" /> : null}
                      </div>
                      <div className="text-xs text-slate-500">{repo.fullName}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-4"><Chip tone={repo.isPrivate ? "purple" : "green"}>{translateVisibility(repo.visibility, locale)}</Chip></td>
                <td className="px-3 py-4">{repo.primaryLanguage}</td>
                <td className="px-3 py-4"><Metric icon={Star} value={repo.stars} locale={locale} /></td>
                <td className="px-3 py-4"><Metric icon={GitFork} value={repo.forks} locale={locale} /></td>
                <td className="px-3 py-4"><Metric icon={Eye} value={repo.visitors14d} locale={locale} /></td>
                <td className="px-3 py-4">{formatCompactNumber(repo.clones14d, locale)}</td>
                <td className="px-3 py-4">{formatCompactNumber(repo.totalDownloads, locale)}</td>
                <td className="px-3 py-4">{repo.latestRelease}</td>
                <td className="px-3 py-4">{formatDate(repo.lastSyncAt, locale)}</td>
                <td className="px-3 py-4"><Chip tone={repo.status === "warning" ? "yellow" : repo.status === "error" ? "red" : "green"}>{translateStatus(repo.status, locale)}</Chip></td>
                <td className="px-3 py-4 align-middle">
                  <div className="flex min-w-[208px] items-center justify-end gap-1.5">
                    <Link aria-label={labels.view} href={`/repositories/${repo.id}`} title={labels.view} className={actionClass("primary")}>
                      <Eye size={14} />
                      <span className="sr-only">{labels.view}</span>
                    </Link>
                    <button aria-label={labels.syncNow} title={labels.syncNow} className={actionClass()} disabled={busy !== null} onClick={() => syncRepository(repo)} type="button">
                      <RefreshCw className={busy === `${repo.id}-sync` ? "animate-spin" : ""} size={14} />
                      <span className="sr-only">{busy === `${repo.id}-sync` ? labels.working : labels.syncNow}</span>
                    </button>
                    <button aria-label={repo.tracked ? labels.pauseTracking : labels.resumeTracking} title={repo.tracked ? labels.pauseTracking : labels.resumeTracking} className={actionClass()} disabled={busy !== null} onClick={() => patchRepository(repo, { tracked: !repo.tracked }, "tracked")} type="button">
                      {repo.tracked ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                      <span className="sr-only">{repo.tracked ? labels.pauseTracking : labels.resumeTracking}</span>
                    </button>
                    <button aria-label={repo.favorite ? labels.unfavorite : labels.favorite} title={repo.favorite ? labels.unfavorite : labels.favorite} className={actionClass()} disabled={busy !== null} onClick={() => patchRepository(repo, { favorite: !repo.favorite }, "favorite")} type="button">
                      <Star className={repo.favorite ? "fill-amber-400 text-amber-400" : ""} size={14} />
                      <span className="sr-only">{repo.favorite ? labels.unfavorite : labels.favorite}</span>
                    </button>
                    <Link aria-label={labels.reports} href="/reports" title={labels.reports} className={actionClass()}>
                      <BarChart3 size={14} />
                      <span className="sr-only">{labels.reports}</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {repositories.length === 0 ? <div className="mt-4"><EmptyState title={labels.noRepositories} description={sourceDescription} /></div> : null}
        {repositories.length > 0 && visibleRepositories.length === 0 ? <div className="mt-4"><EmptyState title={labels.noMatchingRepositories} description={sourceDescription} /></div> : null}
      </div>
    </Card>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  const tone = feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${tone}`} role="status">{feedback.message}</div>;
}

function Metric({ icon: Icon, value, locale }: { icon: LucideIcon; value: number; locale: Locale }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} className="text-slate-400" />
      {formatCompactNumber(value, locale)}
    </span>
  );
}

function actionClass(tone: "primary" | "default" = "default") {
  const toneClass = tone === "primary"
    ? "border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-blue-100"
    : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-slate-50 hover:text-slate-900";
  return `inline-flex size-8 items-center justify-center rounded-lg border text-xs font-medium shadow-sm shadow-slate-100 transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`;
}

function sortRepositories(a: RepositorySummary, b: RepositorySummary, sortBy: SortKey) {
  if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
  if (sortBy === "forks") return b.forks - a.forks || a.fullName.localeCompare(b.fullName);
  if (sortBy === "downloads") return b.totalDownloads - a.totalDownloads || a.fullName.localeCompare(b.fullName);
  if (sortBy === "lastSync") return Date.parse(b.lastSyncAt) - Date.parse(a.lastSyncAt) || a.fullName.localeCompare(b.fullName);
  return b.stars - a.stars || a.fullName.localeCompare(b.fullName);
}

const tabKeys: TabKey[] = ["all", "active", "private", "public", "favorites"];
