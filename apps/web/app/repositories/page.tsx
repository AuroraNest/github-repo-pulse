import { Eye, GitFork, Github, Star, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { mockRepositories } from "@repopulse/core";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { formatCompactNumber, formatDate } from "../../lib/format";

export default function RepositoriesPage() {
  const fastest = [...mockRepositories].sort((a, b) => b.todayDownloads - a.todayDownloads)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Repositories</h1>
        <p className="mt-2 text-slate-500">Browse and manage all tracked GitHub repositories.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <SectionTitle title="Total Tracked Repositories" />
          <p className="mt-4 text-3xl font-semibold">{mockRepositories.filter((repo) => repo.tracked).length}</p>
        </Card>
        <Card>
          <SectionTitle title="Active Alerts" />
          <p className="mt-4 text-3xl font-semibold">1</p>
        </Card>
        <Card>
          <SectionTitle title="Fastest Growing" />
          <p className="mt-4 text-2xl font-semibold">{fastest.name}</p>
          <p className="text-sm text-emerald-600">+{fastest.todayDownloads} downloads today</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", "Active", "Private", "Public", "Favorites"].map((tab) => (
              <button key={tab} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">{tab}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["Language", "Growth", "Traffic", "Release Enabled", "More filters"].map((filter) => (
              <Chip key={filter}>{filter}</Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                {["Repository", "Visibility", "Language", "Stars", "Forks", "14-Day Visitors", "14-Day Clones", "Total Downloads", "Latest Release", "Last Sync", "Status", "Actions"].map((column) => (
                  <th key={column} className="border-b border-slate-200 px-3 py-3 font-semibold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockRepositories.map((repo) => (
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
                  <td className="px-3 py-4"><Chip tone={repo.isPrivate ? "purple" : "green"}>{repo.visibility}</Chip></td>
                  <td className="px-3 py-4">{repo.primaryLanguage}</td>
                  <td className="px-3 py-4"><Metric icon={Star} value={repo.stars} /></td>
                  <td className="px-3 py-4"><Metric icon={GitFork} value={repo.forks} /></td>
                  <td className="px-3 py-4"><Metric icon={Eye} value={repo.visitors14d} /></td>
                  <td className="px-3 py-4">{formatCompactNumber(repo.clones14d)}</td>
                  <td className="px-3 py-4">{formatCompactNumber(repo.totalDownloads)}</td>
                  <td className="px-3 py-4">{repo.latestRelease}</td>
                  <td className="px-3 py-4">{formatDate(repo.lastSyncAt)}</td>
                  <td className="px-3 py-4"><Chip tone={repo.status === "warning" ? "yellow" : "green"}>{repo.status}</Chip></td>
                  <td className="px-3 py-4">
                    <Link href={`/repositories/${repo.id}`} className="rounded-lg border border-slate-200 px-3 py-2 font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, value }: { icon: LucideIcon; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} className="text-slate-400" />
      {formatCompactNumber(value)}
    </span>
  );
}
