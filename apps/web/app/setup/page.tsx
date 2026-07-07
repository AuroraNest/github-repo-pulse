import { defaultAppSettings, readAppSettings } from "@repopulse/db";
import { githubDataSourcePayload, getRepositoryCollection } from "../../lib/data-source";
import { getDictionary } from "../../lib/locale";
import { SetupClient } from "./setup-client";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const { locale, t } = await getDictionary();
  const { source, repositories } = await getRepositoryCollection();
  const settings = await readAppSettings().catch(() => defaultAppSettings());

  return (
    <SetupClient
      common={t.common}
      initialSyncCron={settings.syncCron}
      initialSyncTimezone={settings.syncTimezone}
      initialRepositories={repositories}
      initialSource={githubDataSourcePayload(source)}
      locale={locale}
      setup={t.setup}
    />
  );
}
