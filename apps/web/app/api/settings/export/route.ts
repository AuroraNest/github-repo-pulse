import { jsonOk } from "../../../../lib/api";

export async function POST() {
  return jsonOk({ exportQueued: true, formats: ["csv", "markdown", "json"] });
}
