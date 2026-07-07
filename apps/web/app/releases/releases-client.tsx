"use client";

import type { ReleaseAssetSummary } from "@repopulse/core";
import { useMemo, useState } from "react";
import { Chip, EmptyState } from "../../components/ui";
import { formatCompactNumber } from "../../lib/format";
import { translateStatus, type Locale } from "../../lib/i18n";

type SortKey = "total" | "today" | "sevenDay" | "thirtyDay" | "published";
type StatusKey = "all" | ReleaseAssetSummary["status"];

type Labels = {
  all: string;
  columns: readonly string[];
  filters: readonly string[];
  github: string;
  noReleases: string;
  search: string;
  sortBy: string;
};

export function ReleasesClient({
  assets,
  labels,
  locale,
  sourceDescription
}: {
  assets: ReleaseAssetSummary[];
  labels: Labels;
  locale: Locale;
  sourceDescription: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("total");

  const visibleAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...assets]
      .filter((asset) => {
        if (needle && !`${asset.repository} ${asset.tagName} ${asset.assetName}`.toLowerCase().includes(needle)) return false;
        if (status !== "all" && asset.status !== status) return false;
        return true;
      })
      .sort((a, b) => sortAssets(a, b, sortBy));
  }, [assets, query, sortBy, status]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="h-10 min-w-[220px] rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            type="search"
            value={query}
          />
          <label className="sr-only" htmlFor="release-sort">{labels.sortBy}</label>
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            id="release-sort"
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            value={sortBy}
          >
            <option value="total">{labels.columns[5]}</option>
            <option value="today">{labels.columns[6]}</option>
            <option value="sevenDay">{labels.columns[7]}</option>
            <option value="thirtyDay">{labels.columns[8]}</option>
            <option value="published">{labels.columns[4]}</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${status === filter ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600"}`}
              key={filter}
              onClick={() => setStatus(filter)}
              type="button"
            >
              {filter === "all" ? labels.all : translateStatus(filter, locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {labels.filters.map((filter) => <Chip key={filter}>{filter}</Chip>)}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-500">
              {labels.columns.map((column) => (
                <th key={column} className="border-b border-slate-200 px-3 py-3">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleAssets.map((asset) => (
              <tr key={asset.id}>
                <td className="px-3 py-4 font-medium">{asset.repository}</td>
                <td className="px-3 py-4">{asset.tagName}</td>
                <td className="max-w-72 truncate px-3 py-4">{asset.assetName}</td>
                <td className="px-3 py-4">{asset.assetSize}</td>
                <td className="px-3 py-4">{asset.publishedAt}</td>
                <td className="px-3 py-4">{formatCompactNumber(asset.totalDownloads, locale)}</td>
                <td className="px-3 py-4 text-teal-600">+{formatCompactNumber(asset.todayDownloads, locale)}</td>
                <td className="px-3 py-4">+{formatCompactNumber(asset.sevenDayDownloads, locale)}</td>
                <td className="px-3 py-4">+{formatCompactNumber(asset.thirtyDayDownloads, locale)}</td>
                <td className="px-3 py-4"><Chip tone={asset.status === "Warning" ? "yellow" : "green"}>{translateStatus(asset.status, locale)}</Chip></td>
                <td className="px-3 py-4"><a href={asset.browserDownloadUrl} className="rounded-lg border border-slate-200 px-3 py-2 font-medium">{labels.github}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleAssets.length === 0 ? <div className="mt-4"><EmptyState title={labels.noReleases} description={sourceDescription} /></div> : null}
      </div>
    </>
  );
}

function sortAssets(a: ReleaseAssetSummary, b: ReleaseAssetSummary, sortBy: SortKey) {
  if (sortBy === "today") return b.todayDownloads - a.todayDownloads || a.assetName.localeCompare(b.assetName);
  if (sortBy === "sevenDay") return b.sevenDayDownloads - a.sevenDayDownloads || a.assetName.localeCompare(b.assetName);
  if (sortBy === "thirtyDay") return b.thirtyDayDownloads - a.thirtyDayDownloads || a.assetName.localeCompare(b.assetName);
  if (sortBy === "published") return Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.assetName.localeCompare(b.assetName);
  return b.totalDownloads - a.totalDownloads || a.assetName.localeCompare(b.assetName);
}

const statusFilters: StatusKey[] = ["all", "Active", "Baseline captured", "Warning"];
