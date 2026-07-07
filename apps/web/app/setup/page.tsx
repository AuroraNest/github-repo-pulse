import { CheckCircle2, EyeOff, Github, Lock, Search, ShieldCheck } from "lucide-react";
import { mockRepositories } from "@repopulse/core";
import { Card, Chip, SectionTitle } from "../../components/ui";
import { toIntlLocale, translateVisibility } from "../../lib/i18n";
import { getDictionary } from "../../lib/locale";

export default async function SetupPage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">{t.setup.title}</h1>
          <p className="mt-2 text-slate-500">{t.setup.description}</p>
        </div>

        <Card>
          <StepHeader step="1" title={t.setup.tokenTitle} subtitle={t.setup.tokenSubtitle} />
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="flex min-h-11 flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-400">{t.setup.tokenPlaceholder}</div>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700">
              <EyeOff size={16} />
              {t.setup.show}
            </button>
            <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white">{t.setup.verifyToken}</button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {t.setup.scopes.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="text-emerald-500" size={17} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <Lock size={16} />
            {t.setup.tokenSafe}
          </div>
        </Card>

        <Card>
          <StepHeader step="2" title={t.setup.chooseReposTitle} subtitle={t.setup.chooseReposSubtitle} />
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <Search size={16} />
              {t.common.searchRepositories}
            </div>
            <button className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium">{t.setup.selectAll}</button>
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600">
              <input type="checkbox" defaultChecked />
              {t.setup.includePrivate}
            </label>
          </div>
          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {mockRepositories.map((repo) => (
              <label key={repo.id} className="flex items-center gap-3 p-4">
                <input type="checkbox" defaultChecked={repo.tracked} />
                <Github size={18} className="text-slate-500" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{repo.fullName}</div>
                  <div className="text-sm text-slate-500">{repo.primaryLanguage} - {repo.stars.toLocaleString(toIntlLocale(locale))} {t.common.stars} - {repo.forks.toLocaleString(toIntlLocale(locale))} {t.common.forks}</div>
                </div>
                <Chip tone={repo.isPrivate ? "purple" : "green"}>{translateVisibility(repo.visibility, locale)}</Chip>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <StepHeader step="3" title={t.setup.scheduleTitle} subtitle={t.setup.scheduleSubtitle} />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label={t.setup.dailySyncTime} value="08:00" />
            <Field label={t.setup.timezone} value="UTC" />
            <Field label={t.setup.dataRetention} value={t.setup.retentionValue} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Chip tone="green">{t.setup.releaseTrackingOn}</Chip>
            <Chip tone="green">{t.setup.trafficTrackingOn}</Chip>
            <Chip>{t.setup.aiSummaryDisabled}</Chip>
          </div>
          <button className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white">{t.setup.startTracking}</button>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <SectionTitle title={t.setup.collectedTitle} subtitle={t.setup.collectedSubtitle} />
          <div className="mt-5 space-y-3">
            {t.setup.collectedItems.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span>{item}</span>
                <Chip tone="blue">{t.common.daily}</Chip>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={22} />
            <div>
              <div className="font-semibold">{t.setup.securityTitle}</div>
              <p className="text-sm text-slate-500">{t.setup.securitySubtitle}</p>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function StepHeader({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{step}</div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="mt-2 block rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm">{value}</span>
    </label>
  );
}
