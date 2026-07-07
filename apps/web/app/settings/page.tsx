import { Bot, Database, Github, ShieldAlert, Timer, Webhook, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, Chip, SectionTitle } from "../../components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-slate-500">Manage GitHub, sync, storage, AI, notifications, and privacy controls.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard icon={Github} title="GitHub Connection" subtitle="AuroraNest connected with masked token.">
          <div className="flex flex-wrap gap-2">
            <Chip tone="green">Connected</Chip>
            <Chip>github_pat_****mock</Chip>
            <Chip>Rate limit healthy</Chip>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Reverify token</button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Rotate token</button>
          </div>
        </SettingsCard>

        <SettingsCard icon={Timer} title="Sync Schedule" subtitle="Daily sync runs at 08:00 UTC.">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Run time" value="08:00" />
            <Field label="Timezone" value="UTC" />
            <Field label="Concurrency" value="3" />
          </div>
        </SettingsCard>

        <SettingsCard icon={Database} title="Database Backend" subtitle="MySQL-first schema with placeholder-only local configuration.">
          <div className="flex flex-wrap gap-2">
            <Chip tone="blue">Provider: MySQL</Chip>
            <Chip tone="green">Mock fallback active</Chip>
            <Chip>Migration: 0001_initial.sql</Chip>
          </div>
        </SettingsCard>

        <SettingsCard icon={Bot} title="AI Settings" subtitle="Rule-based reports are used when AI is disabled or unavailable.">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Provider" value="OpenAI-compatible" />
            <Field label="Model" value="Not configured" />
          </div>
          <p className="mt-3 text-sm text-slate-500">RepoPulse only sends aggregated metrics to AI providers. Tokens and secrets are never sent.</p>
        </SettingsCard>

        <SettingsCard icon={Webhook} title="Notification Channels" subtitle="In-app notifications are ready; webhook delivery is a later integration.">
          <div className="flex flex-wrap gap-2">
            <Chip tone="green">In-app enabled</Chip>
            <Chip>Webhook not configured</Chip>
          </div>
        </SettingsCard>

        <SettingsCard icon={ShieldAlert} title="Privacy & Data Controls" subtitle="Dangerous actions require explicit confirmation.">
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Export analytics CSV</button>
            <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">Delete all data</button>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, subtitle, children }: { icon: LucideIcon; title: string; subtitle: string; children: ReactNode }) {
  return (
    <Card>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>
        <SectionTitle title={title} subtitle={subtitle} />
      </div>
      {children}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
      <div className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">{value}</div>
    </div>
  );
}
