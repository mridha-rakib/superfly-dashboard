import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatFrequencyLabel,
  getQuoteSchedulePresentation,
} from "../src/lib/quoteSchedule.js";

describe("quoteSchedule presentation", () => {
  it("formats weekly schedules with readable text and occurrence dates", () => {
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
      "Weekly | Monday, Wednesday, Friday"
    );
    assert.deepEqual(presentation.detailItems, [
      { label: "Scheduled Days", value: "Monday, Wednesday, Friday" },
      { label: "Time Window", value: "9:00 AM - 11:30 AM" },
      { label: "Repeat Until", value: "Jun 30, 2026" },
    ]);
    assert.equal(
      presentation.readableSummary,
      "This booking repeats weekly on Monday, Wednesday, Friday during 9:00 AM - 11:30 AM starting Apr 6, 2026 until Jun 30, 2026."
    );
    assert.deepEqual(presentation.summaryLines, [
      "Starts on: Apr 6, 2026",
      "Repeats every: Monday, Wednesday, Friday",
      "Time window: 9:00 AM - 11:30 AM",
      "Repeat until: Jun 30, 2026",
    ]);
    assert.equal(presentation.occurrenceCountLabel, "37 scheduled dates");
    assert.equal(presentation.occurrenceItems.length, 37);
    assert.deepEqual(
      presentation.occurrenceItems.slice(0, 3).map((item) => item.displayLabel),
      [
        "Monday, Apr 6, 2026 | 9:00 AM - 11:30 AM",
        "Wednesday, Apr 8, 2026 | 9:00 AM - 11:30 AM",
        "Friday, Apr 10, 2026 | 9:00 AM - 11:30 AM",
      ]
    );
  });

  it("formats monthly specific dates by month and lists each occurrence", () => {
    const presentation = getQuoteSchedulePresentation({
      cleaningFrequency: "monthly",
      serviceDate: "2026-01-01",
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
      "Monthly | Jan 2026: 5, 19 | Feb 2026: 2, 16"
    );
    assert.deepEqual(presentation.detailItems, [
      {
        label: "Scheduled Dates",
        value: "Jan 2026: 5, 19 | Feb 2026: 2, 16",
      },
      { label: "Time Window", value: "6:00 PM - 8:00 PM" },
    ]);
    assert.equal(
      presentation.readableSummary,
      "This booking repeats monthly on Jan 2026: 5, 19 | Feb 2026: 2, 16 during 6:00 PM - 8:00 PM."
    );
    assert.deepEqual(
      presentation.occurrenceItems.map((item) => item.displayLabel),
      [
        "Monday, Jan 5, 2026 | 6:00 PM - 8:00 PM",
        "Monday, Jan 19, 2026 | 6:00 PM - 8:00 PM",
        "Monday, Feb 2, 2026 | 6:00 PM - 8:00 PM",
        "Monday, Feb 16, 2026 | 6:00 PM - 8:00 PM",
      ]
    );
  });

  it("formats monthly weekday patterns with months and occurrences", () => {
    const presentation = getQuoteSchedulePresentation({
      cleaningFrequency: "monthly",
      serviceDate: "2026-01-01",
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
      "Monthly | First Monday | Jan, Feb, Mar 2026"
    );
    assert.deepEqual(presentation.detailItems, [
      { label: "Monthly Pattern", value: "First Monday" },
      { label: "Months", value: "Jan, Feb, Mar 2026" },
      { label: "Time Window", value: "7:00 AM - 9:00 AM" },
    ]);
    assert.equal(
      presentation.readableSummary,
      "This booking repeats monthly on the First Monday for Jan, Feb, Mar 2026 during 7:00 AM - 9:00 AM."
    );
    assert.deepEqual(
      presentation.occurrenceItems.map((item) => item.displayLabel),
      [
        "Monday, Jan 5, 2026 | 7:00 AM - 9:00 AM",
        "Monday, Feb 2, 2026 | 7:00 AM - 9:00 AM",
        "Monday, Mar 2, 2026 | 7:00 AM - 9:00 AM",
      ]
    );
  });

  it("falls back to the saved frequency label when no schedule exists", () => {
    assert.equal(formatFrequencyLabel("one-time"), "One-Time");
    assert.equal(formatFrequencyLabel("monthly"), "Monthly");
  });

  it("marks weekly schedules without an end date as a projected preview", () => {
    const presentation = getQuoteSchedulePresentation({
      cleaningFrequency: "weekly",
      serviceDate: "2026-04-06",
      cleaningSchedule: {
        frequency: "weekly",
        days: ["monday", "friday"],
        start_time: "09:00",
        end_time: "10:00",
      },
    });

    assert.match(
      presentation.occurrenceNote,
      /^No end date is set\. Showing the next \d+ projected visits\.$/
    );
    assert.equal(presentation.occurrenceItems.length, 24);
  });
});
