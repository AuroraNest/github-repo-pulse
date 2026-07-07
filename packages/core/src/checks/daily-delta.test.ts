import assert from "node:assert/strict";
import test from "node:test";
import { calculateDailyDelta } from "../metrics/delta.ts";

test("calculateDailyDelta keeps first sync from reporting historical downloads as new", () => {
  assert.equal(calculateDailyDelta(72, undefined), 0);
});

test("calculateDailyDelta clamps reset download counters to zero", () => {
  assert.equal(calculateDailyDelta(4, 72), 0);
});

test("calculateDailyDelta returns the positive day-over-day difference", () => {
  assert.equal(calculateDailyDelta(86, 72), 14);
});
