import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "../../../../lib/api";

const deleteSchema = z.object({
  confirmation: z.literal("DELETE")
});

export async function DELETE(request: NextRequest) {
  const body = deleteSchema.safeParse(await request.json());
  if (!body.success) {
    return jsonError("CONFIRMATION_REQUIRED", "Send confirmation DELETE to delete all data.", 400);
  }

  return jsonOk({ deleted: false, note: "MVP route is guarded; destructive DB deletion is intentionally not implemented in this slice." });
}
