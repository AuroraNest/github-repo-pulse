import { Bot, Database, Github, ShieldAlert, Timer, Webhook, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { getDictionary } from "../../lib/locale";

export default async function SettingsPage() {
  const { t } = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t.settings.title}</h1>
        <p className="mt-2 text-slate-500">{t.settings.description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard icon={Github} title={t.settings.githubTitle} subtitle={t.settings.githubSubtitle}>
          <div className="flex flex-wrap gap-2">
            <Chip tone="green">{t.settings.connected}</Chip>
            <Chip>github_pat_****mock</Chip>
            <Chip>{t.settings.rateLimitHealthy}</Chip>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">{t.settings.reverifyToken}</button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">{t.settings.rotateToken}</button>
          </div>
        </SettingsCard>

        <SettingsCard icon={Timer} title={t.settings.syncTitle} subtitle={t.settings.syncSubtitle}>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label={t.settings.runTime} value="08:00" />
            <Field label={t.settings.timezone} value="UTC" />
            <Field label={t.settings.concurrency} value="3" />
          </div>
        </SettingsCard>

        <SettingsCard icon={Database} title={t.settings.dbTitle} subtitle={t.settings.dbSubtitle}>
          <div className="flex flex-wrap gap-2">
            <Chip tone="blue">{t.settings.providerMysql}</Chip>
            <Chip tone="green">{t.settings.mockFallbackActive}</Chip>
            <Chip>{t.settings.migration}</Chip>
          </div>
        </SettingsCard>

        <SettingsCard icon={Bot} title={t.settings.aiTitle} subtitle={t.settings.aiSubtitle}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t.settings.provider} value="OpenAI-compatible" />
            <Field label={t.settings.model} value={t.settings.modelValue} />
          </div>
          <p className="mt-3 text-sm text-slate-500">{t.settings.aiPrivacy}</p>
        </SettingsCard>

        <SettingsCard icon={Webhook} title={t.settings.notificationsTitle} subtitle={t.settings.notificationsSubtitle}>
          <div className="flex flex-wrap gap-2">
            <Chip tone="green">{t.settings.inAppEnabled}</Chip>
            <Chip>{t.settings.webhookNotConfigured}</Chip>
          </div>
        </SettingsCard>

        <SettingsCard icon={ShieldAlert} title={t.settings.privacyTitle} subtitle={t.settings.privacySubtitle}>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">{t.settings.exportCsv}</button>
            <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{t.settings.deleteAllData}</button>
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
