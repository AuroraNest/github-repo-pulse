import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "../components/shell";
import { getGitHubDataSource } from "../lib/data-source";
import { getDictionary } from "../lib/locale";
import { getRuntimeSetupState } from "../lib/runtime-setup-state";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoPulse",
  description: "Self-hosted GitHub analytics dashboard"
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { locale, t } = await getDictionary();
  const githubSource = await getGitHubDataSource();
  const setup = await getRuntimeSetupState();

  return (
    <html lang={locale}>
      <body>
        <AppShell locale={locale} labels={t} githubSource={githubSource} trackedRepositoriesCount={setup.selectedRepositoryIds.length}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
