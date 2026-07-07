import { jsonOk } from "../../../lib/api";
import { getOverviewData, githubDataSourcePayload } from "../../../lib/data-source";

export async function GET() {
  const { source, overview } = await getOverviewData();
  return jsonOk({ ...overview, github: githubDataSourcePayload(source) });
}
