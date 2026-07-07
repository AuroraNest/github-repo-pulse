import { Eye, GitFork, Github, Star, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { mockRepositories } from "@repopulse/core";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { formatCompactNumber, formatDate } from "../../lib/format";
import { translateStatus, translateVisibility, type Locale } from "../../lib/i18n";
import { getDictionary } from "../../lib/locale";

export default async function RepositoriesPage() {
  const { locale, t } = await getDictionary();
  const fastest = [...mockRepositories].sort((a, b) => b.todayDownloads - a.todayDownloads)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t.repositories.title}</h1>
        <p className="mt-2 text-slate-500">{t.repositories.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <SectionTitle title={t.repositories.totalTracked} />
          <p className="mt-4 text-3xl font-semibold">{mockRepositories.filter((repo) => repo.tracked).length}</p>
        </Card>
        <Card>
          <SectionTitle title={t.repositories.activeAlerts} />
          <p className="mt-4 text-3xl font-semibold">1</p>
        </Card>
        <Card>
          <SectionTitle title={t.repositories.fastestGrowing} />
          <p className="mt-4 text-2xl font-semibold">{fastest.name}</p>
          <p className="text-sm text-emerald-600">+{formatCompactNumber(fastest.todayDownloads, locale)} {t.common.downloadsToday}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {t.repositories.tabs.map((tab) => (
              <button key={tab} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">{tab}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {t.repositories.filters.map((filter) => (
              <Chip key={filter}>{filter}</Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                {t.repositories.columns.map((column) => (
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
                  <td className="px-3 py-4"><Chip tone={repo.isPrivate ? "purple" : "green"}>{translateVisibility(repo.visibility, locale)}</Chip></td>
                  <td className="px-3 py-4">{repo.primaryLanguage}</td>
                  <td className="px-3 py-4"><Metric icon={Star} value={repo.stars} locale={locale} /></td>
                  <td className="px-3 py-4"><Metric icon={GitFork} value={repo.forks} locale={locale} /></td>
                  <td className="px-3 py-4"><Metric icon={Eye} value={repo.visitors14d} locale={locale} /></td>
                  <td className="px-3 py-4">{formatCompactNumber(repo.clones14d, locale)}</td>
                  <td className="px-3 py-4">{formatCompactNumber(repo.totalDownloads, locale)}</td>
                  <td className="px-3 py-4">{repo.latestRelease}</td>
                  <td className="px-3 py-4">{formatDate(repo.lastSyncAt, locale)}</td>
                  <td className="px-3 py-4"><Chip tone={repo.status === "warning" ? "yellow" : "green"}>{translateStatus(repo.status, locale)}</Chip></td>
                  <td className="px-3 py-4">
                    <Link href={`/repositories/${repo.id}`} className="rounded-lg border border-slate-200 px-3 py-2 font-medium">{t.common.view}</Link>
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

function Metric({ icon: Icon, value, locale }: { icon: LucideIcon; value: number; locale: Locale }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} className="text-slate-400" />
      {formatCompactNumber(value, locale)}
    </span>
  );
}
