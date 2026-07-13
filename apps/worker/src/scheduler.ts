import cron, { type ScheduledTask } from "node-cron";
import { readAppSettings, type AppSettings } from "@repopulse/db";
import { runSyncAllRepositories } from "./jobs/sync-all-repositories";

const settingsRefreshIntervalMs = 60 * 1000;

export function startScheduler() {
  let task: ScheduledTask | undefined;
  let scheduledKey = "";
  let refreshing = false;

  const refreshSchedule = async () => {
    if (refreshing) return;
    refreshing = true;
    try {
      const settings = await readAppSettings();
      const nextKey = getScheduleKey(settings);
      if (nextKey === scheduledKey) return;

      task?.destroy();
      task = undefined;
      scheduledKey = nextKey;

      if (!settings.syncEnabled) {
        console.log("RepoPulse scheduler disabled.");
        return;
      }
      if (!cron.validate(settings.syncCron)) {
        console.error(`RepoPulse scheduler ignored invalid cron: ${settings.syncCron}`);
        return;
      }

      task = cron.schedule(settings.syncCron, async () => {
        try {
          const result = await runSyncAllRepositories("schedule");
          console.log(`RepoPulse scheduled sync ${result.id} finished with ${result.status}.`);
        } catch (error) {
          console.error("RepoPulse scheduled sync crashed.", error);
        }
      }, {
        name: "repopulse-daily-sync",
        timezone: settings.syncTimezone,
        noOverlap: true
      });
      console.log(`RepoPulse scheduler active: ${settings.syncCron} (${settings.syncTimezone}).`);
    } catch (error) {
      console.error("RepoPulse scheduler could not refresh settings.", error);
    } finally {
      refreshing = false;
    }
  };

  void refreshSchedule();
  const refreshTimer = setInterval(() => void refreshSchedule(), settingsRefreshIntervalMs);

  return {
    refreshSchedule,
    stop() {
      clearInterval(refreshTimer);
      task?.destroy();
    }
  };
}

function getScheduleKey(settings: AppSettings) {
  return `${settings.syncEnabled}:${settings.syncCron}:${settings.syncTimezone}`;
}
