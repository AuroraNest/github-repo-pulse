import { readRuntimeConfig } from "@repopulse/core";
import { runSyncAllRepositories } from "./jobs/sync-all-repositories";

const config = readRuntimeConfig();

async function main() {
  const mode = process.argv.includes("--once") ? "once" : "idle";

  if (mode === "once") {
    const result = await runSyncAllRepositories("manual");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`RepoPulse worker ready. mockGitHub=${config.mockGitHub} concurrency=${config.syncConcurrency}`);
  console.log("Scheduler wiring is intentionally minimal for MVP; run with --once for local smoke.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
