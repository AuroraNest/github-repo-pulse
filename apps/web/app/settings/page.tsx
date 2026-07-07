import { Bot, Database, Github, ShieldAlert, Timer, Webhook, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { getGitHubDataSource } from "../../lib/data-source";
import { getDictionary } from "../../lib/locale";
import { SettingsActions } from "./settings-actions";

export default async function SettingsPage() {
  const { locale, t } = await getDictionary();
  const githubSource = await getGitHubDataSource();
  const actionLabels = {
    deleteAllData: t.settings.deleteAllData,
    exportCsv: t.settings.exportCsv,
    reverifyToken: t.settings.reverifyToken,
    rotateToken: t.settings.rotateToken
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t.settings.title}</h1>
        <p className="mt-2 text-slate-500">{t.settings.description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsCard icon={Github} title={t.settings.githubTitle} subtitle={t.settings.githubSubtitle}>
          <div className="flex flex-wrap gap-2">
            <Chip tone={githubSource.configured ? "green" : "red"}>{githubSource.configured ? t.settings.connected : t.common.configureGitHub}</Chip>
            {githubSource.demo ? <Chip tone="yellow">{t.common.demoMode}</Chip> : null}
            {githubSource.mode === "live" ? <Chip>{t.common.liveGitHub}</Chip> : null}
            {!githubSource.configured ? <Chip tone="red">{t.common.githubConfigurationRequired}</Chip> : null}
          </div>
          <SettingsActions kind="github" labels={actionLabels} locale={locale} />
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
            {githubSource.demo ? <Chip tone="yellow">{t.settings.mockFallbackActive}</Chip> : null}
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
          <SettingsActions kind="privacy" labels={actionLabels} locale={locale} />
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
