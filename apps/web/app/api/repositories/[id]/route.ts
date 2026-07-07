import { findRepository, mockRepositories } from "@repopulse/core";
import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";
import { requireSession } from "../../../../lib/session";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const patchSchema = z.object({
  tracked: z.boolean().optional(),
  favorite: z.boolean().optional()
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const repository = findRepository(mockRepositories, id);
  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  return jsonOk({ repository });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { id } = await context.params;
  const repository = findRepository(mockRepositories, id);
  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  const body = patchSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("VALIDATION_ERROR", "Repository update payload is invalid.", 400, body.error.flatten());
  }

  return jsonOk({ repository: { ...repository, ...body.data } });
}
