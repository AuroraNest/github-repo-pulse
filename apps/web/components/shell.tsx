import { Activity, BarChart3, Bell, Database, Download, Github, LayoutDashboard, RefreshCw, Search, Settings, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { GitHubDataSource } from "../lib/data-source";
import type { Dictionary, Locale } from "../lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { Chip } from "./ui";

const navItems = [
  { href: "/overview", labelKey: "overview", icon: LayoutDashboard },
  { href: "/repositories", labelKey: "repositories", icon: Github },
  { href: "/releases", labelKey: "releases", icon: Download },
  { href: "/reports", labelKey: "reports", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

export function AppShell({ children, labels, locale, githubSource, trackedRepositoriesCount }: { children: ReactNode; labels: Dictionary; locale: Locale; githubSource: GitHubDataSource; trackedRepositoriesCount: number }) {
  const status = getSourceStatus(labels, githubSource);
  const displayedTrackedCount = githubSource.demo && trackedRepositoriesCount === 0 ? 4 : trackedRepositoriesCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-slate-200 bg-white/80 p-4 backdrop-blur-xl lg:block">
        <Link href="/overview" className="flex items-center gap-3 rounded-lg px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold">RepoPulse</div>
            <div className="text-xs text-slate-500">{labels.common.productSubtitle}</div>
          </div>
        </Link>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
              <item.icon size={18} />
              {labels.nav[item.labelKey]}
            </Link>
          ))}
        </nav>

        <div className="mt-8 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Database size={14} />
              {labels.common.systemStatus}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{status.label}</span>
              <Chip tone={status.tone}>{status.chip}</Chip>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Star size={14} />
              {labels.common.tracking}
            </div>
            <p className="mt-2 text-2xl font-semibold">{githubSource.configured ? displayedTrackedCount.toLocaleString(locale === "zh" ? "zh-CN" : "en-US") : "0"}</p>
            <p className="text-xs text-slate-500">{labels.common.repositoriesEnabled}</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-sm font-medium">{labels.common.admin}</div>
          <div className="text-xs text-slate-500">admin@example.com</div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <Topbar labels={labels} locale={locale} githubSource={githubSource} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">{labels.common.footer}</footer>
      </div>
    </div>
  );
}

function Topbar({ labels, locale, githubSource }: { labels: Dictionary; locale: Locale; githubSource: GitHubDataSource }) {
  const status = getSourceStatus(labels, githubSource);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">RepoPulse</p>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.common.dashboardTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 min-w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <Search size={16} />
            {labels.common.searchRepositories}
          </div>
          <Chip tone={status.tone}>{status.chip}</Chip>
          <Chip tone="slate">{githubSource.demo ? labels.common.lastSync : labels.common.noDataYet}</Chip>
          <LanguageSwitcher locale={locale} labels={labels.common} />
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600" aria-label={labels.common.refreshData}>
            <RefreshCw size={16} />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600" aria-label={labels.common.alerts}>
            <Bell size={16} />
          </button>
          <Link href="/setup" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">
            <Activity size={16} />
            {labels.common.setup}
          </Link>
        </div>
      </div>
    </header>
  );
}

function getSourceStatus(labels: Dictionary, source: GitHubDataSource) {
  if (source.mode === "demo") {
    return { label: labels.common.demoDataActive, chip: labels.common.demoMode, tone: "yellow" as const };
  }

  if (source.mode === "live") {
    return { label: labels.common.liveGitHub, chip: labels.common.healthy, tone: "green" as const };
  }

  return { label: labels.common.githubConfigurationRequired, chip: labels.common.configureGitHub, tone: "red" as const };
}
