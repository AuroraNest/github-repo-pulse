import { NextRequest, NextResponse } from "next/server";
import { getRepositoryCollection } from "../../../../lib/data-source";
import { requireSession } from "../../../../lib/session";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (!session.ok) return session.response;

  const { repositories, source } = await getRepositoryCollection({ includeMetrics: true });
  const rows = repositories.map((repo) => ({
    repository: repo.fullName,
    tracked: repo.tracked,
    favorite: repo.favorite,
    visibility: repo.visibility,
    language: repo.primaryLanguage,
    stars: repo.stars,
    forks: repo.forks,
    totalViews: repo.totalViews,
    totalClones: repo.totalClones,
    totalDownloads: repo.totalDownloads,
    todayDownloads: repo.todayDownloads,
    latestRelease: repo.latestRelease,
    lastSyncAt: repo.lastSyncAt,
    status: repo.status,
    dataMode: source.mode
  }));
  const filename = `repopulse-analytics-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

function toCsv(rows: Array<Record<string, string | number | boolean>>) {
  const headers = ["repository", "tracked", "favorite", "visibility", "language", "stars", "forks", "totalViews", "totalClones", "totalDownloads", "todayDownloads", "latestRelease", "lastSyncAt", "status", "dataMode"];
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
  ];
  return lines.join("\n");
}

function csvCell(value: string | number | boolean | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
