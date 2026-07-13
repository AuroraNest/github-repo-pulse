import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { jsonOk } from "../../../../lib/api";
import { githubRepositoryCacheTag } from "../../../../lib/data-source";
import { requireSession } from "../../../../lib/session";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  revalidateTag(githubRepositoryCacheTag, { expire: 0 });
  return jsonOk({ refreshed: true });
}
