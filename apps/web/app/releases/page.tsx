import { Download, PackageCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { DownloadsAreaChart } from "../../components/charts";
import { Card, Chip, EmptyState, SectionTitle } from "../../components/ui";
import { getReleaseData, isGitHubConfigurationRequired } from "../../lib/data-source";
import { formatCompactNumber } from "../../lib/format";
import type { Locale } from "../../lib/i18n";
import { getDictionary } from "../../lib/locale";
import { ReleasesClient } from "./releases-client";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const { locale, t } = await getDictionary();
  const { source, assets, overview } = await getReleaseData();
  const sourceDescription = isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequiredDescription : source.message;
  const trendDescription = assets.length > 0 ? t.releases.downloadTrendEmptyDescription : sourceDescription;
  const mostDownloaded = [...assets].sort((a, b) => b.totalDownloads - a.totalDownloads)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t.releases.title}</h1>
        <p className="mt-2 text-slate-500">{t.releases.description}</p>
      </div>

      {isGitHubConfigurationRequired(source) ? (
        <EmptyState title={t.common.githubConfigurationRequired} description={t.common.githubConfigurationRequiredDescription} />
      ) : null}

      {!isGitHubConfigurationRequired(source) ? (
        <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReleaseKpi label={t.releases.totalDownloads} value={overview.kpis.totalDownloads} icon={Download} locale={locale} />
        <ReleaseKpi label={t.releases.downloadsToday} value={overview.kpis.downloadsToday} icon={TrendingUp} locale={locale} />
        <ReleaseKpi label={t.releases.activeReleases} value={assets.length} icon={PackageCheck} locale={locale} />
        <Card>
          <p className="text-sm text-slate-500">{t.releases.mostDownloadedAsset}</p>
          <p className="mt-3 line-clamp-2 text-lg font-semibold">{mostDownloaded?.assetName || t.common.noDataYet}</p>
          <p className="mt-2 text-sm font-medium text-teal-600">{formatCompactNumber(mostDownloaded?.totalDownloads || 0, locale)} {t.common.downloads}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <SectionTitle title={t.releases.cumulativeDownloads} />
            <div className="mt-4">
              {overview.growthTrends.length > 0 ? <DownloadsAreaChart data={overview.growthTrends} label={t.common.downloads} /> : <EmptyState title={t.common.noDataYet} description={trendDescription} />}
            </div>
          </Card>
          <Card>
            <SectionTitle title={t.releases.dailyDownloadsByRepo} />
            <div className="mt-4">
              {overview.growthTrends.length > 0 ? <DownloadsAreaChart data={overview.growthTrends} label={t.common.downloads} /> : <EmptyState title={t.common.noDataYet} description={trendDescription} />}
            </div>
          </Card>
        </div>
        <Card>
          <SectionTitle title={t.releases.topAssets} />
          <div className="mt-4 space-y-3">
            {assets.length > 0 ? assets.map((asset, index) => (
              <div key={asset.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">{index + 1}</span>
                  <Chip tone="green">+{formatCompactNumber(asset.todayDownloads, locale)} {t.releases.today}</Chip>
                </div>
                <div className="mt-3 font-medium">{asset.repository}</div>
                <div className="mt-1 truncate text-sm text-slate-500">{asset.assetName}</div>
                <div className="mt-2 text-sm font-semibold">{formatCompactNumber(asset.totalDownloads, locale)} {t.common.downloads}</div>
              </div>
            )) : <EmptyState title={t.common.noReleases} description={sourceDescription} />}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionTitle title={t.releases.releaseAssets} subtitle={t.releases.releaseAssetsSubtitle} />
        </div>
        <ReleasesClient
          assets={assets}
          labels={{
            all: locale === "zh" ? "全部" : "All",
            columns: t.releases.columns,
            filters: t.releases.filters,
            github: t.common.github,
            noReleases: t.common.noReleases,
            search: t.common.searchRepositories,
            sortBy: locale === "zh" ? "排序" : "Sort by"
          }}
          locale={locale}
          sourceDescription={sourceDescription}
        />
      </Card>
        </>
      ) : null}
    </div>
  );
}

function ReleaseKpi({ label, value, icon: Icon, locale }: { label: string; value: number; icon: LucideIcon; locale: Locale }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(value, locale)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}
