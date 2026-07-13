import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { readRuntimeConfig } from "@repopulse/core";
import { runSyncAllRepositories } from "./jobs/sync-all-repositories";
import { startScheduler } from "./scheduler";

loadEnv({ path: fileURLToPath(new URL("../../../.env.local", import.meta.url)) });

const config = readRuntimeConfig();

async function main() {
  const mode = process.argv.includes("--once") ? "once" : "idle";

  if (mode === "once") {
    const result = await runSyncAllRepositories("manual");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`RepoPulse worker ready. mockGitHub=${config.mockGitHub} concurrency=${config.syncConcurrency}`);
  const scheduler = startScheduler();
  const stop = () => {
    scheduler.stop();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
