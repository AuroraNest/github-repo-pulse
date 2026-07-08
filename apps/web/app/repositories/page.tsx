import { Card, SectionTitle } from "../../components/ui";
import { getRepositoryCollection, isGitHubConfigurationRequired } from "../../lib/data-source";
import { formatCompactNumber } from "../../lib/format";
import { getDictionary } from "../../lib/locale";
import { RepositoriesClient } from "./repositories-client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ search?: string }> | { search?: string };
};

export default async function RepositoriesPage({ searchParams }: PageProps) {
  const { locale, t } = await getDictionary();
  const params = await searchParams;
  const { source, repositories } = await getRepositoryCollection({ includeMetrics: true });
  const sourceDescription = isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequiredDescription : source.message;
  const trackedRepositories = repositories.filter((repo) => repo.tracked);
  const fastest = [...trackedRepositories].sort((a, b) => b.todayDownloads - a.todayDownloads || b.stars - a.stars)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t.repositories.title}</h1>
        <p className="mt-2 text-slate-500">{t.repositories.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <SectionTitle title={t.repositories.totalTracked} />
          <p className="mt-4 text-3xl font-semibold">{trackedRepositories.length}</p>
        </Card>
        <Card>
          <SectionTitle title={t.repositories.activeAlerts} />
          <p className="mt-4 text-3xl font-semibold">{source.demo ? "1" : "0"}</p>
        </Card>
        <Card>
          <SectionTitle title={t.repositories.fastestGrowing} />
          <p className="mt-4 text-2xl font-semibold">{fastest?.name || t.common.noDataYet}</p>
          <p className="text-sm text-emerald-600">+{formatCompactNumber(fastest?.todayDownloads || 0, locale)} {t.common.downloadsToday}</p>
        </Card>
      </div>

      <RepositoriesClient
        configurationRequired={isGitHubConfigurationRequired(source)}
        initialQuery={params?.search || ""}
        initialRepositories={repositories}
        labels={{
          columns: t.repositories.columns,
          configureGitHub: t.common.configureGitHub,
          favorite: t.repositories.favorite,
          filters: t.repositories.filters,
          noMatchingRepositories: t.repositories.noMatchingRepositories,
          noRepositories: t.common.noRepositories,
          pauseTracking: t.repositories.pauseTracking,
          reports: t.nav.reports,
          resumeTracking: t.repositories.resumeTracking,
          searchPlaceholder: t.common.searchRepositories,
          sortBy: t.repositories.sortBy,
          syncFailed: t.repositories.syncFailed,
          syncNow: t.repositories.syncNow,
          syncQueued: t.repositories.syncQueued,
          tabs: t.repositories.tabs,
          unfavorite: t.repositories.unfavorite,
          view: t.common.view,
          working: t.repositories.working
        }}
        locale={locale}
        sourceDescription={sourceDescription}
      />
    </div>
  );
}
