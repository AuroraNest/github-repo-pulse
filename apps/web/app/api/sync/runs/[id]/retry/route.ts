import { NextRequest } from "next/server";
import { jsonOk } from "../../../../../../lib/api";
import { requireSession } from "../../../../../../lib/session";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { id } = await context.params;
  return jsonOk({ retryQueued: true, syncRunId: id });
}
