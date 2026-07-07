import { Download, ExternalLink, GitFork, Star, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { findRepository, mockOverview, mockReleaseAssets, mockRepositories } from "@repopulse/core";
import { GrowthChart, TrafficChart } from "../../../components/charts";
import { Card, Chip, SectionTitle } from "../../../components/ui";
import { formatCompactNumber } from "../../../lib/format";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const repo = findRepository(mockRepositories, id) || mockRepositories[0];
  const assets = mockReleaseAssets.filter((asset) => asset.repositoryId === repo.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm text-slate-500">Repositories &gt; {repo.name}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold">{repo.name}</h1>
            {repo.favorite ? <Star className="fill-amber-400 text-amber-400" size={22} /> : null}
            <Chip tone={repo.isPrivate ? "purple" : "green"}>{repo.visibility}</Chip>
            <Chip>{repo.primaryLanguage}</Chip>
          </div>
          <p className="mt-2 max-w-3xl text-slate-500">{repo.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={repo.htmlUrl} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium">
            <ExternalLink size={16} />
            GitHub
          </Link>
          <button className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">Sync now</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RepoKpi label="Stars" value={repo.stars} icon={Star} />
        <RepoKpi label="Forks" value={repo.forks} icon={GitFork} />
        <RepoKpi label="14-Day Views" value={repo.visitors14d} icon={Users} />
        <RepoKpi label="14-Day Clones" value={repo.clones14d} icon={Users} />
        <RepoKpi label="Total Release Downloads" value={repo.totalDownloads} icon={Download} />
        <RepoKpi label="Today's New Downloads" value={repo.todayDownloads} icon={Download} />
      </div>

      <div className="flex flex-wrap gap-2">
        {["Overview", "Traffic", "Releases", "Reports", "Settings"].map((tab) => (
          <button key={tab} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium">{tab}</button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle title="90-Day Growth Trends" subtitle="Views, clones, downloads, stars, and forks." />
          <div className="mt-4">
            <GrowthChart data={mockOverview.growthTrends} />
          </div>
        </Card>
        <Card>
          <SectionTitle title="Views vs Clones" subtitle="GitHub traffic collection may be partial if token permissions are limited." />
          <div className="mt-4">
            <TrafficChart data={mockOverview.viewsVsClones} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Estimated Conversion Funnel" subtitle="Based on traffic and release download deltas." />
          <div className="mt-5 space-y-3">
            <FunnelRow label="Visitors" value={repo.visitors14d} />
            <FunnelRow label="Release Page Views" value={Math.round(repo.visitors14d * 0.28)} />
            <FunnelRow label="Downloads" value={repo.todayDownloads * 7} />
          </div>
        </Card>
        <Card>
          <SectionTitle title="Popular Content" />
          <div className="mt-4 space-y-3 text-sm">
            {["/README.md", "/releases", "/releases/tag/" + repo.latestRelease, "/tree/main/apps"].map((path) => (
              <div key={path} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>{path}</span>
                <span className="font-medium">{Math.round(repo.visitors14d / 6)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Releases" />
          <div className="mt-4 space-y-3">
            {(assets.length > 0 ? assets : mockReleaseAssets.slice(0, 1)).map((asset) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="font-medium">{asset.tagName}</div>
                <div className="truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold">{asset.totalDownloads.toLocaleString()} downloads</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function RepoKpi({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(value)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function FunnelRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium">{formatCompactNumber(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(16, Math.min(100, value / 40))}%` }} />
      </div>
    </div>
  );
}
