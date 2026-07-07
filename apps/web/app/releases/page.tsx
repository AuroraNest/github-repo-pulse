import { Download, PackageCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { DownloadsAreaChart, TrafficChart } from "../../components/charts";
import { Card, Chip, EmptyState, SectionTitle } from "../../components/ui";
import { getReleaseData, isGitHubConfigurationRequired } from "../../lib/data-source";
import { formatCompactNumber } from "../../lib/format";
import { translateStatus, type Locale } from "../../lib/i18n";
import { getDictionary } from "../../lib/locale";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const { locale, t } = await getDictionary();
  const { source, assets, overview } = await getReleaseData();
  const sourceDescription = isGitHubConfigurationRequired(source) ? t.common.githubConfigurationRequiredDescription : source.message;
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
              {overview.growthTrends.length > 0 ? <DownloadsAreaChart data={overview.growthTrends} label={t.common.downloads} /> : <EmptyState title={t.common.noDataYet} description={sourceDescription} />}
            </div>
          </Card>
          <Card>
            <SectionTitle title={t.releases.dailyDownloadsByRepo} />
            <div className="mt-4">
              {overview.growthTrends.length > 0 ? <TrafficChart data={overview.growthTrends} labels={{ views: t.common.views, clones: t.common.clones }} /> : <EmptyState title={t.common.noDataYet} description={sourceDescription} />}
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
          <div className="flex flex-wrap gap-2">
            {t.releases.filters.map((filter) => <Chip key={filter}>{filter}</Chip>)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                {t.releases.columns.map((column) => (
                  <th key={column} className="border-b border-slate-200 px-3 py-3">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-3 py-4 font-medium">{asset.repository}</td>
                  <td className="px-3 py-4">{asset.tagName}</td>
                  <td className="max-w-72 truncate px-3 py-4">{asset.assetName}</td>
                  <td className="px-3 py-4">{asset.assetSize}</td>
                  <td className="px-3 py-4">{asset.publishedAt}</td>
                  <td className="px-3 py-4">{formatCompactNumber(asset.totalDownloads, locale)}</td>
                  <td className="px-3 py-4 text-teal-600">+{formatCompactNumber(asset.todayDownloads, locale)}</td>
                  <td className="px-3 py-4">+{formatCompactNumber(asset.sevenDayDownloads, locale)}</td>
                  <td className="px-3 py-4">+{formatCompactNumber(asset.thirtyDayDownloads, locale)}</td>
                  <td className="px-3 py-4"><Chip tone="green">{translateStatus(asset.status, locale)}</Chip></td>
                  <td className="px-3 py-4"><a href={asset.browserDownloadUrl} className="rounded-lg border border-slate-200 px-3 py-2 font-medium">{t.common.github}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length === 0 ? <div className="mt-4"><EmptyState title={t.common.noReleases} description={sourceDescription} /></div> : null}
        </div>
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
