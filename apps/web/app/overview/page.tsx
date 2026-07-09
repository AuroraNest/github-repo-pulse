import { Download, Eye, GitFork, Star, Users, Workflow } from "lucide-react";
import Link from "next/link";
import { GrowthChart, TrafficChart } from "../../components/charts";
import { Card, Chip, EmptyState, SectionTitle } from "../../components/ui";
import { getOverviewData, isGitHubConfigurationRequired } from "../../lib/data-source";
import { formatCompactNumber } from "../../lib/format";
import { translateStatus } from "../../lib/i18n";
import { getDictionary } from "../../lib/locale";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const { locale, t } = await getDictionary();
  const { source, overview } = await getOverviewData();
  const sourceDescription = isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequiredDescription : source.message;
  const kpis = [
    { label: t.overview.kpis.totalStars, value: overview.kpis.totalStars, change: source.demo ? "+3.8%" : "+0", icon: Star, tone: "text-amber-500 bg-amber-50" },
    { label: t.overview.kpis.totalForks, value: overview.kpis.totalForks, change: source.demo ? "+2.1%" : "+0", icon: GitFork, tone: "text-violet-500 bg-violet-50" },
    { label: t.overview.kpis.totalDownloads, value: overview.kpis.totalDownloads, change: source.demo ? "+8.4%" : "+0", icon: Download, tone: "text-teal-500 bg-teal-50" },
    { label: t.overview.kpis.downloadsToday, value: overview.kpis.downloadsToday, change: source.demo ? "+225" : "+0", icon: Workflow, tone: "text-blue-500 bg-blue-50" },
    { label: t.overview.kpis.visitors14d, value: overview.kpis.visitors14d, change: source.demo ? "+9.1%" : "+0", icon: Users, tone: "text-pink-500 bg-pink-50" },
    { label: t.overview.kpis.clones14d, value: overview.kpis.clones14d, change: source.demo ? "+4.7%" : "+0", icon: Eye, tone: "text-slate-500 bg-slate-100" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">{t.overview.title}</h1>
          <p className="mt-2 text-slate-500">{t.overview.description}</p>
        </div>
        <div className="flex gap-2">
          <Chip tone={source.demo ? "yellow" : source.configured ? "green" : "red"}>{source.demo ? t.common.demoMode : source.configured ? t.common.healthy : t.common.configureGitHub}</Chip>
          {source.demo ? <Chip tone="yellow">{t.common.demoDataActive}</Chip> : null}
        </div>
      </div>

      {isGitHubConfigurationRequired(source) ? (
        <EmptyState
          title={t.common.githubConfigurationRequired}
          description={t.common.githubConfigurationRequiredDescription}
          action={<Link href="/setup" className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">{t.common.configureGitHub}</Link>}
        />
      ) : null}

      {!isGitHubConfigurationRequired(source) ? (
        <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{kpi.label}</p>
                <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(kpi.value, locale)}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${kpi.tone}`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="font-medium text-emerald-600">{kpi.change}</span>
              <span className="text-slate-500">{t.overview.vsPrevious}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle title={t.overview.growthTitle} subtitle={t.overview.growthSubtitle} />
            <Chip>{t.overview.last30Days}</Chip>
          </div>
          {overview.growthTrends.length > 0 ? (
            <GrowthChart data={overview.growthTrends} labels={{ stars: t.common.stars, forks: t.common.forks, downloads: t.common.downloads }} />
          ) : (
            <EmptyState title={t.common.noDataYet} description={source.demo ? sourceDescription : t.overview.historyRequiredDescription} />
          )}
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle title={t.overview.viewsVsClones} subtitle={t.overview.viewsVsClonesSubtitle} />
            <Chip>{t.overview.aggregated}</Chip>
          </div>
          {overview.viewsVsClones.length > 0 ? (
            <TrafficChart data={overview.viewsVsClones} labels={{ views: t.common.views, clones: t.common.clones }} />
          ) : (
            <EmptyState title={t.common.noDataYet} description={sourceDescription} />
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle title={t.overview.fastestGrowing} />
          <div className="mt-4 space-y-3">
            {overview.fastestGrowingRepositories.length > 0 ? overview.fastestGrowingRepositories.map((repo, index) => (
              <Link key={repo.repositoryId} href={`/repositories/${repo.repositoryId}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">{index + 1}</span>
                  <span className="font-medium">{repo.name}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">+{repo.growthPercent}%</span>
              </Link>
            )) : <EmptyState title={t.common.noRepositories} description={sourceDescription} />}
          </div>
        </Card>

        <Card>
          <SectionTitle title={t.overview.topReleases} />
          <div className="mt-4 space-y-3">
            {overview.topReleases.length > 0 ? overview.topReleases.map((asset) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="font-medium">{asset.repository}</div>
                <div className="mt-1 truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold text-teal-600">{formatCompactNumber(asset.totalDownloads, locale)} {t.common.downloads}</div>
              </div>
            )) : <EmptyState title={t.common.noReleases} description={t.overview.noTopReleasesDescription} />}
          </div>
        </Card>

        <Card>
          <SectionTitle title={t.overview.activityFeed} />
          <div className="mt-4 space-y-3">
            {overview.activityFeed.length > 0 ? overview.activityFeed.map((event) => (
              <div key={event.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{formatActivityTitle(event.title, t.overview)}</p>
                  <Chip tone={event.severity === "warning" ? "yellow" : event.severity === "success" ? "green" : "slate"}>{translateStatus(event.severity, locale)}</Chip>
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatActivityRepository(event.repository, t.overview)}</p>
              </div>
            )) : <EmptyState title={t.common.noDataYet} description={sourceDescription} />}
          </div>
        </Card>
      </div>
        </>
      ) : null}
    </div>
  );
}

function formatActivityTitle(title: string, labels: { syncCompleted: string; syncFailed: string; syncPartiallyCompleted: string }) {
  if (title === "Sync completed") return labels.syncCompleted;
  if (title === "Sync failed") return labels.syncFailed;
  if (title === "Sync partially completed") return labels.syncPartiallyCompleted;
  return title;
}

function formatActivityRepository(repository: string, labels: { syncedRepositories: string }) {
  const match = repository.match(/^(\d+)\/(\d+) repositories synced$/);
  if (!match) return repository;
  return labels.syncedRepositories.replace("{success}", match[1]).replace("{total}", match[2]);
}
