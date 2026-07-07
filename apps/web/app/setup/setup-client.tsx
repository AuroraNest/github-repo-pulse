"use client";

import type { ApiResponse, RepositorySummary, TokenVerificationResult } from "@repopulse/core";
import { CheckCircle2, Eye, EyeOff, Github, Loader2, Lock, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, Chip, EmptyState, SectionTitle } from "../../components/ui";
import type { GitHubDataSource } from "../../lib/data-source";
import type { Dictionary, Locale } from "../../lib/i18n";
import { toIntlLocale, translateVisibility } from "../../lib/i18n";

type SetupClientProps = {
  common: Dictionary["common"];
  initialRepositories: RepositorySummary[];
  initialSource: GitHubDataSource;
  locale: Locale;
  setup: Dictionary["setup"];
};

type RepositoriesPayload = {
  github: GitHubDataSource;
  repositories: RepositorySummary[];
  page: number;
  pageSize: number;
};

type CompletePayload = {
  setupCompleted: boolean;
  trackedRepositoriesCount: number;
  firstSync: { status: string; trigger: string };
};

type Feedback = {
  tone: "green" | "red" | "slate";
  message: string;
};

export function SetupClient({ common, initialRepositories, initialSource, locale, setup }: SetupClientProps) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tokenFeedback, setTokenFeedback] = useState<Feedback | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [repositories, setRepositories] = useState(initialRepositories);
  const [source, setSource] = useState(initialSource);
  const [search, setSearch] = useState("");
  const [includePrivate, setIncludePrivate] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialRepositories.filter((repo) => repo.tracked).map((repo) => repo.id)));
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  const [repositoryFeedback, setRepositoryFeedback] = useState<Feedback | null>(null);
  const [completeFeedback, setCompleteFeedback] = useState<Feedback | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const intlLocale = toIntlLocale(locale);
  const allVisibleSelected = repositories.length > 0 && repositories.every((repo) => selectedIds.has(repo.id));
  const selectedCount = selectedIds.size;
  const isConfigurationRequired = source.mode === "configuration_required";

  const repositorySummary = useMemo(() => setup.selectedCount.replace("{count}", selectedCount.toLocaleString(intlLocale)), [intlLocale, selectedCount, setup.selectedCount]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRepositories();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, includePrivate]);

  async function verifyToken() {
    setTokenFeedback(null);
    setIsVerifying(true);

    try {
      const response = await postJson<TokenVerificationResult>("/api/setup/verify-token", { token });
      if (!response.ok) {
        setTokenFeedback({ tone: "red", message: response.error.message });
        return;
      }

      setTokenFeedback({ tone: "green", message: setup.tokenVerified.replace("{login}", response.data.account.login) });
    } catch (error) {
      setTokenFeedback({ tone: "red", message: errorMessage(error) });
    } finally {
      setIsVerifying(false);
    }
  }

  async function loadRepositories() {
    setIsLoadingRepositories(true);
    setRepositoryFeedback(null);

    const params = new URLSearchParams({
      search,
      visibility: includePrivate ? "all" : "public"
    });

    try {
      const response = await getJson<RepositoriesPayload>(`/api/setup/repositories?${params.toString()}`);
      if (!response.ok) {
        setRepositoryFeedback({ tone: "red", message: response.error.message });
        return;
      }

      setRepositories(response.data.repositories);
      setSource(response.data.github);
    } catch (error) {
      setRepositoryFeedback({ tone: "red", message: errorMessage(error) });
    } finally {
      setIsLoadingRepositories(false);
    }
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        repositories.forEach((repo) => next.delete(repo.id));
      } else {
        repositories.forEach((repo) => next.add(repo.id));
      }
      return next;
    });
  }

  function toggleIncludePrivate(checked: boolean) {
    setIncludePrivate(checked);
    if (checked) return;

    setSelectedIds((current) => {
      const next = new Set(current);
      repositories.filter((repo) => repo.isPrivate).forEach((repo) => next.delete(repo.id));
      return next;
    });
  }

  function toggleRepository(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function completeSetup() {
    setCompleteFeedback(null);
    setIsCompleting(true);

    try {
      const response = await postJson<CompletePayload>("/api/setup/complete", {
        selectedRepositoryIds: Array.from(selectedIds),
        trackAll: false,
        includePrivate,
        syncCron: "0 8 * * *",
        syncTimezone: "UTC",
        dataRetentionDays: 365
      });

      if (!response.ok) {
        setCompleteFeedback({ tone: "red", message: response.error.code === "UNAUTHORIZED" ? setup.loginRequiredToStart : response.error.message });
        return;
      }

      setCompleteFeedback({
        tone: "green",
        message: setup.setupCompleted
          .replace("{count}", response.data.trackedRepositoriesCount.toLocaleString(intlLocale))
          .replace("{status}", response.data.firstSync.status)
      });
    } catch (error) {
      setCompleteFeedback({ tone: "red", message: errorMessage(error) });
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{setup.title}</h1>
          <p className="mt-2 text-slate-500">{setup.description}</p>
        </div>

        <Card>
          <StepHeader step="1" title={setup.tokenTitle} subtitle={setup.tokenSubtitle} />
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-100 placeholder:text-slate-400 focus:ring-4"
              onChange={(event) => setToken(event.target.value)}
              placeholder={setup.tokenPlaceholder}
              type={showToken ? "text" : "password"}
              value={token}
            />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setShowToken((current) => !current)}
              type="button"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              {showToken ? setup.hide : setup.show}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isVerifying || token.trim().length < 8}
              onClick={verifyToken}
              type="button"
            >
              {isVerifying ? <Loader2 className="animate-spin" size={16} /> : null}
              {isVerifying ? setup.verifyingToken : setup.verifyToken}
            </button>
          </div>
          {tokenFeedback ? <FeedbackMessage feedback={tokenFeedback} /> : null}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {setup.scopes.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="text-emerald-500" size={17} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <Lock size={16} />
            {setup.tokenSafe}
          </div>
        </Card>

        <Card>
          <StepHeader step="2" title={setup.chooseReposTitle} subtitle={setup.chooseReposSubtitle} />
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <Search size={16} />
              <input
                className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-500"
                onChange={(event) => setSearch(event.target.value)}
                placeholder={common.searchRepositories}
                type="search"
                value={search}
              />
            </label>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoadingRepositories}
              onClick={loadRepositories}
              type="button"
            >
              <RefreshCw className={isLoadingRepositories ? "animate-spin" : ""} size={16} />
              {setup.reloadRepositories}
            </button>
            <button
              className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              disabled={repositories.length === 0}
              onClick={toggleAllVisible}
              type="button"
            >
              {allVisibleSelected ? setup.clearSelection : setup.selectAll}
            </button>
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600">
              <input checked={includePrivate} onChange={(event) => toggleIncludePrivate(event.target.checked)} type="checkbox" />
              {setup.includePrivate}
            </label>
          </div>
          <div className="mt-3 text-sm text-slate-500">{repositorySummary}</div>
          {repositoryFeedback ? <FeedbackMessage feedback={repositoryFeedback} /> : null}
          {repositories.length > 0 ? (
            <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {repositories.map((repo) => (
                <label key={repo.id} className="flex items-center gap-3 p-4">
                  <input checked={selectedIds.has(repo.id)} onChange={() => toggleRepository(repo.id)} type="checkbox" />
                  <Github size={18} className="text-slate-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{repo.fullName}</div>
                    <div className="text-sm text-slate-500">
                      {repo.primaryLanguage} - {repo.stars.toLocaleString(intlLocale)} {common.stars} - {repo.forks.toLocaleString(intlLocale)} {common.forks}
                    </div>
                  </div>
                  <Chip tone={repo.isPrivate ? "purple" : "green"}>{translateVisibility(repo.visibility, locale)}</Chip>
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title={isConfigurationRequired ? common.githubConfigurationRequired : common.noRepositories}
                description={isConfigurationRequired ? common.githubConfigurationRequiredDescription : setup.noMatchingRepositories}
              />
            </div>
          )}
        </Card>

        <Card>
          <StepHeader step="3" title={setup.scheduleTitle} subtitle={setup.scheduleSubtitle} />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label={setup.dailySyncTime} value="08:00" />
            <Field label={setup.timezone} value="UTC" />
            <Field label={setup.dataRetention} value={setup.retentionValue} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Chip tone="green">{setup.releaseTrackingOn}</Chip>
            <Chip tone="green">{setup.trafficTrackingOn}</Chip>
            <Chip>{setup.aiSummaryDisabled}</Chip>
          </div>
          <button
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCompleting || selectedCount === 0}
            onClick={completeSetup}
            type="button"
          >
            {isCompleting ? <Loader2 className="animate-spin" size={16} /> : null}
            {isCompleting ? setup.startingTracking : setup.startTracking}
          </button>
          {completeFeedback ? <FeedbackMessage feedback={completeFeedback} /> : null}
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <SectionTitle title={setup.collectedTitle} subtitle={setup.collectedSubtitle} />
          <div className="mt-5 space-y-3">
            {setup.collectedItems.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span>{item}</span>
                <Chip tone="blue">{common.daily}</Chip>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={22} />
            <div>
              <div className="font-semibold">{setup.securityTitle}</div>
              <p className="text-sm text-slate-500">{setup.securitySubtitle}</p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

async function getJson<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return parseApiResponse<T>(response);
}

async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  return parseApiResponse<T>(response);
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (payload) return payload;
  return { ok: false, error: { code: "HTTP_ERROR", message: `Request failed with ${response.status}` } };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed.";
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  const tone = feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700";
  return <div className={`mt-4 rounded-lg border px-3 py-2 text-sm ${tone}`}>{feedback.message}</div>;
}

function StepHeader({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{step}</div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="mt-2 block rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm">{value}</span>
    </label>
  );
}
