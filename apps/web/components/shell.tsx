import { Activity, BarChart3, Bell, Database, Download, Github, LayoutDashboard, RefreshCw, Search, Settings, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Chip } from "./ui";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: Github },
  { href: "/releases", label: "Releases", icon: Download },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-slate-200 bg-white/80 p-4 backdrop-blur-xl lg:block">
        <Link href="/overview" className="flex items-center gap-3 rounded-lg px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold">RepoPulse</div>
            <div className="text-xs text-slate-500">GitHub Analytics</div>
          </div>
        </Link>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Database size={14} />
              System Status
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Mock fallback</span>
              <Chip tone="green">Healthy</Chip>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Star size={14} />
              Tracking
            </div>
            <p className="mt-2 text-2xl font-semibold">4</p>
            <p className="text-xs text-slate-500">Repositories enabled</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-sm font-medium">Admin</div>
          <div className="text-xs text-slate-500">admin@example.com</div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <Topbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">RepoPulse v1.0.0 - Self-hosted - GitHub Analytics Dashboard</footer>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">RepoPulse</p>
          <h1 className="text-2xl font-semibold text-slate-950">GitHub Analytics Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 min-w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
            <Search size={16} />
            Search repositories
          </div>
          <Chip tone="blue">Tracking 4 repos</Chip>
          <Chip tone="slate">Last sync 08:00</Chip>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600" aria-label="Refresh data">
            <RefreshCw size={16} />
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600" aria-label="Alerts">
            <Bell size={16} />
          </button>
          <Link href="/setup" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white">
            <Activity size={16} />
            Setup
          </Link>
        </div>
      </div>
    </header>
  );
}
