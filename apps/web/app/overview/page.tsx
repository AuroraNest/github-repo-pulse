import { Download, Eye, GitFork, Star, Users, Workflow } from "lucide-react";
import Link from "next/link";
import { mockOverview } from "@repopulse/core";
import { GrowthChart, TrafficChart } from "../../components/charts";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { formatCompactNumber } from "../../lib/format";

const kpis = [
  { label: "Total Stars", value: mockOverview.kpis.totalStars, change: "+3.8%", icon: Star, tone: "text-amber-500 bg-amber-50" },
  { label: "Total Forks", value: mockOverview.kpis.totalForks, change: "+2.1%", icon: GitFork, tone: "text-violet-500 bg-violet-50" },
  { label: "Total Downloads", value: mockOverview.kpis.totalDownloads, change: "+8.4%", icon: Download, tone: "text-teal-500 bg-teal-50" },
  { label: "Today's New Downloads", value: mockOverview.kpis.downloadsToday, change: "+225", icon: Workflow, tone: "text-blue-500 bg-blue-50" },
  { label: "14-Day Visitors", value: mockOverview.kpis.visitors14d, change: "+9.1%", icon: Users, tone: "text-pink-500 bg-pink-50" },
  { label: "14-Day Clones", value: mockOverview.kpis.clones14d, change: "+4.7%", icon: Eye, tone: "text-slate-500 bg-slate-100" }
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">Overview</h1>
          <p className="mt-2 text-slate-500">Monitor aggregate repository growth, traffic, releases, and sync health.</p>
        </div>
        <div className="flex gap-2">
          <Chip tone="green">Healthy</Chip>
          <Chip tone="yellow">1 partial sync</Chip>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{kpi.label}</p>
                <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(kpi.value)}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${kpi.tone}`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="font-medium text-emerald-600">{kpi.change}</span>
              <span className="text-slate-500">vs previous period</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle title="30-Day Growth Trends" subtitle="Stars, forks, and release downloads." />
            <Chip>Last 30 days</Chip>
          </div>
          <GrowthChart data={mockOverview.growthTrends} />
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle title="Views vs Clones" subtitle="GitHub traffic window values by day." />
            <Chip>Aggregated</Chip>
          </div>
          <TrafficChart data={mockOverview.viewsVsClones} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Fastest Growing Repositories" />
          <div className="mt-4 space-y-3">
            {mockOverview.fastestGrowingRepositories.map((repo, index) => (
              <Link key={repo.repositoryId} href={`/repositories/${repo.repositoryId}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</span>
                  <span className="font-medium">{repo.name}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">+{repo.growthPercent}%</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Top Releases" />
          <div className="mt-4 space-y-3">
            {mockOverview.topReleases.map((asset) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="font-medium">{asset.repository}</div>
                <div className="mt-1 truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold text-teal-600">{formatCompactNumber(asset.totalDownloads)} downloads</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Activity Feed" />
          <div className="mt-4 space-y-3">
            {mockOverview.activityFeed.map((event) => (
              <div key={event.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{event.title}</p>
                  <Chip tone={event.severity === "warning" ? "yellow" : event.severity === "success" ? "green" : "slate"}>{event.severity}</Chip>
                </div>
                <p className="mt-1 text-xs text-slate-500">{event.repository}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
