import { CheckCircle2, EyeOff, Github, Lock, Search, ShieldCheck } from "lucide-react";
import { mockRepositories } from "@repopulse/core";
import { Card, Chip, SectionTitle } from "../../components/ui";

export default function SetupPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Connect GitHub</h1>
          <p className="mt-2 text-slate-500">Set up RepoPulse in 3 simple steps and start tracking your repositories.</p>
        </div>

        <Card>
          <StepHeader step="1" title="Add GitHub Token" subtitle="Use a read-only token to securely access your GitHub data." />
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="flex min-h-11 flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-400">Personal Access Token</div>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700">
              <EyeOff size={16} />
              Show
            </button>
            <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white">Verify Token</button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {["Read user profile", "Read repository metadata", "Read public repositories", "Read private repositories if selected", "Read traffic data", "Read releases and assets"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="text-emerald-500" size={17} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <Lock size={16} />
            Your token is encrypted and stored locally.
          </div>
        </Card>

        <Card>
          <StepHeader step="2" title="Choose repositories to track" subtitle="Search, filter, and select repositories from the connected account." />
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500">
              <Search size={16} />
              Search repositories
            </div>
            <button className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium">Select all</button>
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600">
              <input type="checkbox" defaultChecked />
              Include private
            </label>
          </div>
          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {mockRepositories.map((repo) => (
              <label key={repo.id} className="flex items-center gap-3 p-4">
                <input type="checkbox" defaultChecked={repo.tracked} />
                <Github size={18} className="text-slate-500" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{repo.fullName}</div>
                  <div className="text-sm text-slate-500">{repo.primaryLanguage} - {repo.stars.toLocaleString()} stars - {repo.forks.toLocaleString()} forks</div>
                </div>
                <Chip tone={repo.isPrivate ? "purple" : "green"}>{repo.visibility}</Chip>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <StepHeader step="3" title="Schedule daily sync" subtitle="Configure how RepoPulse keeps repository metrics fresh." />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Daily sync time" value="08:00" />
            <Field label="Timezone" value="UTC" />
            <Field label="Data retention" value="12 months" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Chip tone="green">Release tracking on</Chip>
            <Chip tone="green">Traffic tracking on</Chip>
            <Chip>AI summary disabled</Chip>
          </div>
          <button className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white">Start Tracking</button>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <SectionTitle title="What will be collected" subtitle="Daily snapshots with safe local storage." />
          <div className="mt-5 space-y-3">
            {["Stars", "Forks", "Traffic", "Clones", "Release Downloads", "Popular Pages", "Referrers", "Daily Summaries"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span>{item}</span>
                <Chip tone="blue">Daily</Chip>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={22} />
            <div>
              <div className="font-semibold">Local-first security</div>
              <p className="text-sm text-slate-500">Tokens stay server-side and are never returned by API routes.</p>
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
