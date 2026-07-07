export type TrafficPermissionResult =
  | { ok: true }
  | { ok: false; code: "TRAFFIC_PERMISSION_MISSING"; message: string };
