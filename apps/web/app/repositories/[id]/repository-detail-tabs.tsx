"use client";

import type { ReleaseAssetSummary, RepositorySummary, TrendPoint } from "@repopulse/core";
import { useState } from "react";
import { GrowthChart, TrafficChart } from "../../../components/charts";
import { Card, EmptyState, SectionTitle } from "../../../components/ui";
import { formatCompactNumber } from "../../../lib/format";
import type { Locale } from "../../../lib/i18n";

type DetailTabKey = "overview" | "traffic" | "releases" | "reports" | "settings";

type Labels = {
  clones: string;
  downloads: string;
  forks: string;
  funnelSubtitle: string;
  funnelTitle: string;
  growthSubtitle: string;
  growthTitle: string;
  noDataYet: string;
  noReleases: string;
  popularContent: string;
  releasePageViews: string;
  releases: string;
  stars: string;
  tabs: readonly string[];
  trafficSubtitle: string;
  visitors: string;
  views: string;
  viewsVsClones: string;
};

export function RepositoryDetailTabs({
  assets,
  growthTrends,
  labels,
  locale,
  repo,
  sourceDescription,
  trafficTrends,
  useDemoContent
}: {
  assets: ReleaseAssetSummary[];
  growthTrends: TrendPoint[];
  labels: Labels;
  locale: Locale;
  repo: RepositorySummary;
  sourceDescription: string;
  trafficTrends: TrendPoint[];
  useDemoContent: boolean;
}) {
  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");
  const popularPaths = useDemoContent ? ["/README.md", "/releases", `/releases/tag/${repo.latestRelease}`, "/tree/main/apps"] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {detailTabKeys.map((tab, index) => (
          <button
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${activeTab === tab ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {labels.tabs[index]}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionTitle title={labels.growthTitle} subtitle={labels.growthSubtitle} />
            <div className="mt-4">
              {growthTrends.length > 0 ? <GrowthChart data={growthTrends} labels={{ stars: labels.stars, forks: labels.forks, downloads: labels.downloads }} /> : <EmptyState title={labels.noDataYet} description={sourceDescription} />}
            </div>
          </Card>
          <FunnelCard labels={labels} locale={locale} repo={repo} />
        </div>
      ) : null}

      {activeTab === "traffic" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionTitle title={labels.viewsVsClones} subtitle={labels.trafficSubtitle} />
            <div className="mt-4">
              {trafficTrends.length > 0 ? <TrafficChart data={trafficTrends} labels={{ views: labels.views, clones: labels.clones }} /> : <EmptyState title={labels.noDataYet} description={sourceDescription} />}
            </div>
          </Card>
          <Card>
            <SectionTitle title={labels.popularContent} />
            <div className="mt-4 space-y-3 text-sm">
              {popularPaths.length > 0 ? popularPaths.map((path) => (
                <div key={path} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>{path}</span>
                  <span className="font-medium">{formatCompactNumber(Math.round(repo.visitors14d / 6), locale)}</span>
                </div>
              )) : <EmptyState title={labels.noDataYet} description={sourceDescription} />}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "releases" ? (
        <Card>
          <SectionTitle title={labels.releases} />
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assets.length > 0 ? assets.map((asset) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="font-medium">{asset.tagName}</div>
                <div className="truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold">{formatCompactNumber(asset.totalDownloads, locale)} {labels.downloads}</div>
              </div>
            )) : <EmptyState title={labels.noReleases} description={sourceDescription} />}
          </div>
        </Card>
      ) : null}

      {activeTab === "reports" || activeTab === "settings" ? <EmptyState title={labels.noDataYet} description={sourceDescription} /> : null}
    </div>
  );
}

function FunnelCard({ labels, locale, repo }: { labels: Labels; locale: Locale; repo: RepositorySummary }) {
  return (
    <Card>
      <SectionTitle title={labels.funnelTitle} subtitle={labels.funnelSubtitle} />
      <div className="mt-5 space-y-3">
        <FunnelRow label={labels.visitors} value={repo.visitors14d} locale={locale} />
        <FunnelRow label={labels.releasePageViews} value={Math.round(repo.visitors14d * 0.28)} locale={locale} />
        <FunnelRow label={labels.downloads} value={repo.todayDownloads * 7} locale={locale} />
      </div>
    </Card>
  );
}

function FunnelRow({ label, value, locale }: { label: string; value: number; locale: Locale }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium">{formatCompactNumber(value, locale)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(16, Math.min(100, value / 40))}%` }} />
      </div>
    </div>
  );
}

const detailTabKeys: DetailTabKey[] = ["overview", "traffic", "releases", "reports", "settings"];
