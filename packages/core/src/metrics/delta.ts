export function calculateDailyDelta(currentDownloadCount: number, previousDownloadCount?: number | null): number {
  if (previousDownloadCount === null || previousDownloadCount === undefined) {
    return 0;
  }

  return Math.max(0, currentDownloadCount - previousDownloadCount);
}

export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}
