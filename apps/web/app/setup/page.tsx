import { githubDataSourcePayload, getRepositoryCollection } from "../../lib/data-source";
import { getDictionary } from "../../lib/locale";
import { SetupClient } from "./setup-client";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const { locale, t } = await getDictionary();
  const { source, repositories } = await getRepositoryCollection();

  return (
    <SetupClient
      common={t.common}
      initialRepositories={repositories}
      initialSource={githubDataSourcePayload(source)}
      locale={locale}
      setup={t.setup}
    />
  );
}
