import { findRepository, mockReleaseAssets, mockRepositories } from "@repopulse/core";
import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "../../../../../lib/api";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const repository = findRepository(mockRepositories, id);
  if (!repository) {
    return jsonError("NOT_FOUND", "Repository not found.", 404);
  }

  return jsonOk({
    repository,
    assets: mockReleaseAssets.filter((asset) => asset.repositoryId === repository.id)
  });
}
