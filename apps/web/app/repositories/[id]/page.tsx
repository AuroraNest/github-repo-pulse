import { Download, ExternalLink, GitFork, Star, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { GrowthChart, TrafficChart } from "../../../components/charts";
import { Card, Chip, EmptyState, SectionTitle } from "../../../components/ui";
import { getReleaseData, getRepositoryData, isGitHubConfigurationRequired } from "../../../lib/data-source";
import { formatCompactNumber } from "../../../lib/format";
import { translateVisibility, type Locale } from "../../../lib/i18n";
import { getDictionary } from "../../../lib/locale";
import { RepositorySyncButton } from "./repository-sync-button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { locale, t } = await getDictionary();
  const { id } = await params;
  const { source, repository: repo } = await getRepositoryData(id);
  const releaseData = await getReleaseData();
  const assets = repo ? releaseData.assets.filter((asset) => asset.repositoryId === repo.id) : [];
  const sourceDescription = isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequiredDescription : source.message;

  if (!repo) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-sm text-slate-500">{t.nav.repositories}</div>
          <h1 className="mt-3 text-3xl font-semibold">{isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequired : t.common.noRepositories}</h1>
        </div>
        <EmptyState
          title={isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequired : t.common.noRepositories}
          description={sourceDescription}
          action={<Link href="/setup" className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">{t.common.configureGitHub}</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm text-slate-500">{t.nav.repositories} &gt; {repo.name}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold">{repo.name}</h1>
            {repo.favorite ? <Star className="fill-amber-400 text-amber-400" size={22} /> : null}
            <Chip tone={repo.isPrivate ? "purple" : "green"}>{translateVisibility(repo.visibility, locale)}</Chip>
            <Chip>{repo.primaryLanguage}</Chip>
          </div>
          <p className="mt-2 max-w-3xl text-slate-500">{repo.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={repo.htmlUrl} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium">
            <ExternalLink size={16} />
            {t.common.github}
          </Link>
          <RepositorySyncButton
            labels={{
              failed: t.repositories.syncFailed,
              queued: t.repositories.syncQueued,
              syncNow: t.repositoryDetail.syncNow,
              working: t.repositories.working
            }}
            repositoryId={repo.id}
            repositoryName={repo.fullName}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RepoKpi label={t.repositoryDetail.kpis.stars} value={repo.stars} icon={Star} locale={locale} />
        <RepoKpi label={t.repositoryDetail.kpis.forks} value={repo.forks} icon={GitFork} locale={locale} />
        <RepoKpi label={t.repositoryDetail.kpis.views14d} value={repo.visitors14d} icon={Users} locale={locale} />
        <RepoKpi label={t.repositoryDetail.kpis.clones14d} value={repo.clones14d} icon={Users} locale={locale} />
        <RepoKpi label={t.repositoryDetail.kpis.totalDownloads} value={repo.totalDownloads} icon={Download} locale={locale} />
        <RepoKpi label={t.repositoryDetail.kpis.downloadsToday} value={repo.todayDownloads} icon={Download} locale={locale} />
      </div>

      <div className="flex flex-wrap gap-2">
        {t.repositoryDetail.tabs.map((tab) => (
          <button key={tab} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium">{tab}</button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionTitle title={t.repositoryDetail.growthTitle} subtitle={t.repositoryDetail.growthSubtitle} />
          <div className="mt-4">
            {releaseData.overview.growthTrends.length > 0 ? <GrowthChart data={releaseData.overview.growthTrends} labels={{ stars: t.common.stars, forks: t.common.forks, downloads: t.common.downloads }} /> : <EmptyState title={t.common.noDataYet} description={sourceDescription} />}
          </div>
        </Card>
        <Card>
          <SectionTitle title={t.overview.viewsVsClones} subtitle={t.repositoryDetail.trafficSubtitle} />
          <div className="mt-4">
            {releaseData.overview.viewsVsClones.length > 0 ? <TrafficChart data={releaseData.overview.viewsVsClones} labels={{ views: t.common.views, clones: t.common.clones }} /> : <EmptyState title={t.common.noDataYet} description={sourceDescription} />}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle title={t.repositoryDetail.funnelTitle} subtitle={t.repositoryDetail.funnelSubtitle} />
          <div className="mt-5 space-y-3">
            <FunnelRow label={t.repositoryDetail.visitors} value={repo.visitors14d} locale={locale} />
            <FunnelRow label={t.repositoryDetail.releasePageViews} value={Math.round(repo.visitors14d * 0.28)} locale={locale} />
            <FunnelRow label={t.repositoryDetail.downloads} value={repo.todayDownloads * 7} locale={locale} />
          </div>
        </Card>
        <Card>
          <SectionTitle title={t.repositoryDetail.popularContent} />
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
          <SectionTitle title={t.repositoryDetail.releases} />
          <div className="mt-4 space-y-3">
            {assets.length > 0 ? assets.map((asset) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="font-medium">{asset.tagName}</div>
                <div className="truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold">{formatCompactNumber(asset.totalDownloads, locale)} {t.common.downloads}</div>
              </div>
            )) : <EmptyState title={t.common.noReleases} description={sourceDescription} />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function RepoKpi({ label, value, icon: Icon, locale }: { label: string; value: number; icon: LucideIcon; locale: Locale }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(value, locale)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
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
