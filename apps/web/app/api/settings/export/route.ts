import { NextRequest } from "next/server";
import { jsonOk } from "../../../../lib/api";
import { requireSession } from "../../../../lib/session";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  return jsonOk({ exportQueued: true, formats: ["csv", "markdown", "json"] });
}
