import { Download, ExternalLink, GitFork, Star, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, Chip, EmptyState } from "../../../components/ui";
import { getReleaseData, getRepositoryData, getRepositoryReleaseAssets, getRepositoryTrafficTrends, isGitHubConfigurationRequired } from "../../../lib/data-source";
import { formatCompactNumber } from "../../../lib/format";
import { translateVisibility, type Locale } from "../../../lib/i18n";
import { getDictionary } from "../../../lib/locale";
import { RepositoryDetailTabs } from "./repository-detail-tabs";
import { RepositorySyncButton } from "./repository-sync-button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { locale, t } = await getDictionary();
  const { id } = await params;
  const { source, repository: repo } = await getRepositoryData(id);
  const releaseData = source.demo ? await getReleaseData() : undefined;
  const assets = repo ? source.demo ? releaseData?.assets.filter((asset) => asset.repositoryId === repo.id) || [] : await getRepositoryReleaseAssets(repo) : [];
  const trafficTrends = repo ? source.demo ? releaseData?.overview.viewsVsClones || [] : await getRepositoryTrafficTrends(repo) : [];
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

      <RepositoryDetailTabs
        assets={assets}
        growthTrends={source.demo ? releaseData?.overview.growthTrends || [] : []}
        labels={{
          clones: t.common.clones,
          downloads: t.common.downloads,
          forks: t.common.forks,
          funnelSubtitle: t.repositoryDetail.funnelSubtitle,
          funnelTitle: t.repositoryDetail.funnelTitle,
          growthSubtitle: t.repositoryDetail.growthSubtitle,
          growthTitle: t.repositoryDetail.growthTitle,
          noDataYet: t.common.noDataYet,
          noReleases: t.common.noReleases,
          popularContent: t.repositoryDetail.popularContent,
          releasePageViews: t.repositoryDetail.releasePageViews,
          releases: t.repositoryDetail.releases,
          stars: t.common.stars,
          tabs: t.repositoryDetail.tabs,
          trafficSubtitle: t.repositoryDetail.trafficSubtitle,
          visitors: t.repositoryDetail.visitors,
          views: t.common.views,
          viewsVsClones: t.overview.viewsVsClones
        }}
        locale={locale}
        repo={repo}
        sourceDescription={sourceDescription}
        trafficTrends={trafficTrends}
        useDemoContent={source.demo}
      />
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
