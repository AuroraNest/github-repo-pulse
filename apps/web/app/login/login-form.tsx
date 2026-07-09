"use client";

import { AlertCircle, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Dictionary } from "../../lib/i18n";

type LoginFormProps = {
  labels: Dictionary["login"];
};

export function LoginForm({ labels }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.ok === false) {
        setError(labels.failed);
        return;
      }

      router.replace(safeNext(searchParams.get("next")));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : labels.failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LockKeyhole size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-700">RepoPulse</p>
            <h1 className="text-2xl font-semibold">{labels.title}</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">{labels.subtitle}</p>

        <form className="mt-6 space-y-4" onSubmit={submitLogin}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{labels.email}</span>
            <span className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 ring-blue-100 focus-within:ring-4">
              <Mail className="text-slate-400" size={17} />
              <input
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">{labels.password}</span>
            <span className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 ring-blue-100 focus-within:ring-4">
              <LockKeyhole className="text-slate-400" size={17} />
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </span>
          </label>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              {error}
            </div>
          ) : null}

          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
            <LogIn size={17} />
            {submitting ? labels.submitting : labels.submit}
          </button>
        </form>
      </section>
    </main>
  );
}

function safeNext(next: string | null) {
  if (next?.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return "/overview";
}
