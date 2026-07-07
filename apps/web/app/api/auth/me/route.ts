import { NextRequest } from "next/server";
import { jsonOk } from "../../../../lib/api";
import { getSessionUser } from "../../../../lib/session";

export async function GET(request: NextRequest) {
  return jsonOk({ user: getSessionUser(request) });
}
