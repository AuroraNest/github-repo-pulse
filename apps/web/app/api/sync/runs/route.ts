import { mockSyncRuns } from "@repopulse/core";
import { jsonOk } from "../../../../lib/api";

export async function GET() {
  return jsonOk({ runs: mockSyncRuns });
}
