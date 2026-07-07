import { Download, PackageCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { mockOverview, mockReleaseAssets } from "@repopulse/core";
import { DownloadsAreaChart, TrafficChart } from "../../components/charts";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { formatCompactNumber } from "../../lib/format";

export default function ReleasesPage() {
  const mostDownloaded = [...mockReleaseAssets].sort((a, b) => b.totalDownloads - a.totalDownloads)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Releases / Downloads</h1>
        <p className="mt-2 text-slate-500">Analyze release assets, package downloads, and daily deltas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReleaseKpi label="Total Release Downloads" value={mockOverview.kpis.totalDownloads} icon={Download} />
        <ReleaseKpi label="Today's New Downloads" value={mockOverview.kpis.downloadsToday} icon={TrendingUp} />
        <ReleaseKpi label="Active Releases" value={mockReleaseAssets.length} icon={PackageCheck} />
        <Card>
          <p className="text-sm text-slate-500">Most Downloaded Asset</p>
          <p className="mt-3 line-clamp-2 text-lg font-semibold">{mostDownloaded.assetName}</p>
          <p className="mt-2 text-sm font-medium text-teal-600">{formatCompactNumber(mostDownloaded.totalDownloads)} downloads</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Cumulative Downloads Over Time" />
            <div className="mt-4">
              <DownloadsAreaChart data={mockOverview.growthTrends} />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Daily New Downloads by Repository" />
            <div className="mt-4">
              <TrafficChart data={mockOverview.growthTrends} />
            </div>
          </Card>
        </div>
        <Card>
          <SectionTitle title="Top Assets" />
          <div className="mt-4 space-y-3">
            {mockReleaseAssets.map((asset, index) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">{index + 1}</span>
                  <Chip tone="green">+{asset.todayDownloads} today</Chip>
                </div>
                <div className="mt-3 font-medium">{asset.repository}</div>
                <div className="mt-1 truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold">{asset.totalDownloads.toLocaleString()} downloads</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionTitle title="Release Assets" subtitle="Sortable MVP table with demo data fallback." />
          <div className="flex flex-wrap gap-2">
            {["repository", "tag", "asset type", "date range", "min downloads"].map((filter) => <Chip key={filter}>{filter}</Chip>)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                {["Repository", "Version / Tag", "Asset Name", "Asset Size", "Published Date", "Total Downloads", "Today", "7-Day", "30-Day", "Status", "Actions"].map((column) => (
                  <th key={column} className="border-b border-slate-200 px-3 py-3">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockReleaseAssets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-3 py-4 font-medium">{asset.repository}</td>
                  <td className="px-3 py-4">{asset.tagName}</td>
                  <td className="max-w-72 truncate px-3 py-4">{asset.assetName}</td>
                  <td className="px-3 py-4">{asset.assetSize}</td>
                  <td className="px-3 py-4">{asset.publishedAt}</td>
                  <td className="px-3 py-4">{asset.totalDownloads.toLocaleString()}</td>
                  <td className="px-3 py-4 text-teal-600">+{asset.todayDownloads}</td>
                  <td className="px-3 py-4">+{asset.sevenDayDownloads}</td>
                  <td className="px-3 py-4">+{asset.thirtyDayDownloads}</td>
                  <td className="px-3 py-4"><Chip tone="green">{asset.status}</Chip></td>
                  <td className="px-3 py-4"><a href={asset.browserDownloadUrl} className="rounded-lg border border-slate-200 px-3 py-2 font-medium">GitHub</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ReleaseKpi({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(value)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}
