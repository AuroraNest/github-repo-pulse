import { jsonOk } from "../../../../lib/api";
import { getSyncRunData, githubDataSourcePayload } from "../../../../lib/data-source";

export async function GET() {
  const { source, runs } = getSyncRunData();
  return jsonOk({ github: githubDataSourcePayload(source), runs });
}
