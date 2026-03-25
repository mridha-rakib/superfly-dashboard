import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatFrequencyLabel,
  getQuoteSchedulePresentation,
} from "../src/lib/quoteSchedule.js";

describe("quoteSchedule presentation", () => {
  it("formats weekly schedules with explicit weekdays", () => {
    const presentation = getQuoteSchedulePresentation({
      cleaningFrequency: "weekly",
      serviceDate: "2026-04-06",
      cleaningSchedule: {
        frequency: "weekly",
        days: ["wednesday", "monday", "friday"],
        start_time: "09:00",
        end_time: "11:30",
        repeat_until: "2026-06-30",
      },
    });

    assert.equal(presentation.frequencyLabel, "Weekly");
    assert.equal(
      presentation.shortSummary,
      "Weekly • Monday, Wednesday, Friday"
    );
    assert.deepEqual(presentation.detailItems, [
      { label: "Scheduled Days", value: "Monday, Wednesday, Friday" },
      { label: "Time Window", value: "9:00 AM - 11:30 AM" },
      { label: "Repeat Until", value: "Jun 30, 2026" },
    ]);
  });

  it("formats monthly specific dates by month", () => {
    const presentation = getQuoteSchedulePresentation({
      cleaningFrequency: "monthly",
      cleaningSchedule: {
        frequency: "monthly",
        pattern_type: "specific_dates",
        year: 2026,
        months: [1, 2],
        month_dates: [
          { month: 1, dates: [5, 19] },
          { month: 2, dates: [2, 16] },
        ],
        start_time: "18:00",
        end_time: "20:00",
      },
    });

    assert.equal(
      presentation.shortSummary,
      "Monthly • Jan 2026: 5, 19 • Feb 2026: 2, 16"
    );
    assert.deepEqual(presentation.detailItems, [
      {
        label: "Scheduled Dates",
        value: "Jan 2026: 5, 19 • Feb 2026: 2, 16",
      },
      { label: "Time Window", value: "6:00 PM - 8:00 PM" },
    ]);
  });

  it("formats monthly weekday patterns with months", () => {
    const presentation = getQuoteSchedulePresentation({
      cleaningFrequency: "monthly",
      cleaningSchedule: {
        frequency: "monthly",
        pattern_type: "weekday_pattern",
        year: 2026,
        months: [1, 2, 3],
        week: "first",
        day: "monday",
        start_time: "07:00",
        end_time: "09:00",
      },
    });

    assert.equal(
      presentation.shortSummary,
      "Monthly • First Monday • Jan, Feb, Mar 2026"
    );
    assert.deepEqual(presentation.detailItems, [
      { label: "Monthly Pattern", value: "First Monday" },
      { label: "Months", value: "Jan, Feb, Mar 2026" },
      { label: "Time Window", value: "7:00 AM - 9:00 AM" },
    ]);
  });

  it("falls back to the saved frequency label when no schedule exists", () => {
    assert.equal(formatFrequencyLabel("one-time"), "One-Time");
    assert.equal(formatFrequencyLabel("monthly"), "Monthly");
  });
});
