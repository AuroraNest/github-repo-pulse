"use client";

import { Bell, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type TopbarControlsProps = {
  labels: {
    alerts: string;
    refreshData: string;
    searchRepositories: string;
  };
  status: {
    chip: string;
    label: string;
  };
};

export function TopbarControls({ labels, status }: TopbarControlsProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("search") || "").trim();
    router.push(value ? `/repositories?search=${encodeURIComponent(value)}` : "/repositories");
  }

  async function refreshData() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetch("/api/cache/refresh", { method: "POST", cache: "no-store" });
    } finally {
      router.refresh();
      window.setTimeout(() => setRefreshing(false), 500);
    }
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <form action="/repositories" className="flex h-10 min-w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500" method="get" onSubmit={submitSearch}>
        <button className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" type="submit" aria-label={labels.searchRepositories}>
          <Search size={16} />
        </button>
        <input
          aria-label={labels.searchRepositories}
          className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-500"
          name="search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.searchRepositories}
          type="search"
          value={query}
        />
      </form>
      <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600" onClick={refreshData} type="button" aria-label={labels.refreshData}>
        <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
      </button>
      <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600" onClick={() => setAlertsOpen((open) => !open)} type="button" aria-label={labels.alerts}>
        <Bell size={16} />
      </button>
      {alertsOpen ? (
        <div className="absolute right-0 top-12 z-30 w-72 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg" role="status">
          <div className="font-medium text-slate-900">{labels.alerts}</div>
          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-slate-600">
            <div className="font-medium text-slate-900">{status.chip}</div>
            <div className="mt-1 text-xs">{status.label}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
