import { formatTimeTo12Hour } from "./time-utils.js";

const WEEKDAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const WEEKDAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const WEEKDAY_TO_INDEX = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const MONTH_LABELS = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const MONTH_WEEK_LABELS = {
  first: "First",
  second: "Second",
  third: "Third",
  fourth: "Fourth",
  last: "Last",
};

const FREQUENCY_LABELS = {
  one_time: "One-Time",
  "one-time": "One-Time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const DEFAULT_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WEEKLY_PREVIEW_OCCURRENCE_LIMIT = 24;
const OCCURRENCE_PREVIEW_MONTHS = 18;

const uniqNumbers = (values = []) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value))
    )
  ).sort((left, right) => left - right);

const normalizeMonths = (months = []) => {
  const normalized = uniqNumbers(months).filter((month) => month >= 1 && month <= 12);
  return normalized.length ? normalized : [...DEFAULT_MONTHS];
};

const normalizeWeekdays = (days = []) =>
  Array.from(
    new Set(
      (Array.isArray(days) ? days : [])
        .map((day) => String(day || "").trim().toLowerCase())
        .filter((day) => WEEKDAY_ORDER.includes(day))
    )
  ).sort(
    (left, right) => WEEKDAY_ORDER.indexOf(left) - WEEKDAY_ORDER.indexOf(right)
  );

const parseDateOnly = (value) => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const startOfDay = (value) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const addDays = (value, days) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
};

const addMonths = (value, months) =>
  new Date(value.getFullYear(), value.getMonth() + months, 1);

const toDateKey = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value, { includeYear = true } = {}) => {
  const parsed = parseDateOnly(value);
  if (!parsed) return "";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
  });
};

const formatTimeRange = (startTime, endTime) => {
  const start = formatTimeTo12Hour(startTime);
  const end = formatTimeTo12Hour(endTime);
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
};

const formatMonthList = (months = [], year) => {
  const normalizedMonths = normalizeMonths(months);
  if (!normalizedMonths.length) return "";

  const monthLabels = normalizedMonths.map(
    (month) => MONTH_LABELS[month] || `Month ${month}`
  );
  const monthText =
    monthLabels.length <= 4
      ? monthLabels.join(", ")
      : `${monthLabels.slice(0, 4).join(", ")} +${monthLabels.length - 4} more`;

  return year ? `${monthText} ${year}` : monthText;
};

const formatSpecificDateSummary = (schedule) => {
  const year =
    typeof schedule?.year === "number" && Number.isInteger(schedule.year)
      ? schedule.year
      : undefined;

  if (Array.isArray(schedule?.month_dates) && schedule.month_dates.length) {
    return schedule.month_dates
      .map((entry) => {
        const month = Number(entry?.month);
        const dates = uniqNumbers(entry?.dates).filter(
          (date) => date >= 1 && date <= 31
        );
        if (!dates.length) return null;
        const monthLabel = MONTH_LABELS[month] || `Month ${month}`;
        return year
          ? `${monthLabel} ${year}: ${dates.join(", ")}`
          : `${monthLabel}: ${dates.join(", ")}`;
      })
      .filter(Boolean)
      .join(" | ");
  }

  const dates = uniqNumbers(schedule?.dates).filter((date) => date >= 1 && date <= 31);
  if (!dates.length) return "";

  const monthText = formatMonthList(schedule?.months, year);
  return monthText ? `${monthText}: ${dates.join(", ")}` : dates.join(", ");
};

const buildShortSummary = (parts = []) =>
  parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" | ");

const maxDayForMonth = (monthValue, year = 2025) =>
  new Date(year, Number(monthValue), 0).getDate() || 31;

const normalizeDatesForMonth = (dates, monthValue, year = 2025) => {
  const maxDay = maxDayForMonth(monthValue, year);
  return Array.from(
    new Set(
      (Array.isArray(dates) ? dates : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= maxDay)
    )
  ).sort((a, b) => a - b);
};

const resolveMonthlyDatesMap = (schedule, scheduleYear) => {
  const months = normalizeMonths(schedule?.months);
  const result = new Map();

  if (Array.isArray(schedule?.month_dates) && schedule.month_dates.length > 0) {
    schedule.month_dates.forEach((entry) => {
      const month = Number(entry?.month);
      if (!months.includes(month)) return;
      const dates = normalizeDatesForMonth(entry?.dates, month, scheduleYear);
      if (dates.length > 0) {
        result.set(month, dates);
      }
    });
    return result;
  }

  const fallbackDates = Array.from(
    new Set(
      (Array.isArray(schedule?.dates) ? schedule.dates : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 31)
    )
  ).sort((a, b) => a - b);

  months.forEach((month) => {
    const dates = normalizeDatesForMonth(fallbackDates, month, scheduleYear);
    if (dates.length > 0) {
      result.set(month, dates);
    }
  });

  return result;
};

const getWeekdayPatternDayOfMonth = (year, month, week, day) => {
  const targetWeekday = WEEKDAY_TO_INDEX[day];
  if (targetWeekday === undefined) return null;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (week === "last") {
    const lastWeekday = new Date(year, month, daysInMonth).getDay();
    const delta = (lastWeekday - targetWeekday + 7) % 7;
    return daysInMonth - delta;
  }

  const firstWeekday = new Date(year, month, 1).getDay();
  const offsetFromFirst = (targetWeekday - firstWeekday + 7) % 7;
  const weekOffset =
    week === "first"
      ? 0
      : week === "second"
      ? 1
      : week === "third"
      ? 2
      : week === "fourth"
      ? 3
      : null;

  if (weekOffset === null) return null;
  const dayOfMonth = 1 + offsetFromFirst + weekOffset * 7;
  return dayOfMonth <= daysInMonth ? dayOfMonth : null;
};

const buildOccurrenceItems = (quote = {}) => {
  const schedule = quote?.cleaningSchedule;
  const fallbackDate = parseDateOnly(quote?.serviceDate);
  const baseDate =
    fallbackDate || parseDateOnly(schedule?.schedule?.date || quote?.serviceDate);

  if (!baseDate) {
    return {
      occurrenceItems: [],
      occurrenceCountLabel: "0 scheduled dates",
      occurrenceNote: "",
    };
  }

  const serviceFloor = startOfDay(baseDate);
  const today = startOfDay(new Date());
  const previewEnd = addMonths(today > serviceFloor ? today : serviceFloor, OCCURRENCE_PREVIEW_MONTHS);
  const occurrenceMap = new Map();
  let occurrenceNote = "";

  const addOccurrence = (candidateDate) => {
    if (!candidateDate) return;
    const normalized = startOfDay(candidateDate);
    if (normalized < serviceFloor) return;

    const dateKey = toDateKey(normalized);
    if (!occurrenceMap.has(dateKey)) {
      occurrenceMap.set(dateKey, {
        dateKey,
        dateLabel: formatDate(dateKey),
        weekdayLabel: normalized.toLocaleDateString("en-US", {
          weekday: "long",
        }),
      });
    }
  };

  if (!schedule || typeof schedule !== "object" || !schedule.frequency) {
    addOccurrence(serviceFloor);
  } else if (schedule.frequency === "one_time") {
    addOccurrence(parseDateOnly(schedule?.schedule?.date || quote?.serviceDate));
  } else if (schedule.frequency === "weekly") {
    const days = new Set(normalizeWeekdays(schedule.days));
    const repeatUntil = parseDateOnly(schedule.repeat_until);
    const endLimit = repeatUntil ? startOfDay(repeatUntil) : previewEnd;
    let cursor = serviceFloor;
    let safetyCounter = 0;

    while (
      cursor <= endLimit &&
      (repeatUntil || occurrenceMap.size < WEEKLY_PREVIEW_OCCURRENCE_LIMIT) &&
      safetyCounter < 800
    ) {
      const weekday = WEEKDAY_ORDER[(cursor.getDay() + 6) % 7];
      if (days.has(weekday)) {
        addOccurrence(cursor);
      }
      cursor = addDays(cursor, 1);
      safetyCounter += 1;
    }

    if (!repeatUntil) {
      occurrenceNote = `No end date is set. Showing the next ${occurrenceMap.size} projected visits.`;
    }
  } else if (
    schedule.frequency === "monthly" &&
    schedule.pattern_type === "specific_dates"
  ) {
    const scheduleYear =
      typeof schedule?.year === "number" && Number.isInteger(schedule.year)
        ? schedule.year
        : serviceFloor.getFullYear();
    const months = normalizeMonths(schedule.months);
    const monthDatesMap = resolveMonthlyDatesMap(schedule, scheduleYear);

    months.forEach((monthValue) => {
      const dates = monthDatesMap.get(monthValue) || [];
      dates.forEach((day) => {
        const candidate = new Date(scheduleYear, monthValue - 1, day);
        if (
          candidate.getFullYear() === scheduleYear &&
          candidate.getMonth() === monthValue - 1
        ) {
          addOccurrence(candidate);
        }
      });
    });
  } else if (
    schedule.frequency === "monthly" &&
    schedule.pattern_type === "weekday_pattern"
  ) {
    const scheduleYear =
      typeof schedule?.year === "number" && Number.isInteger(schedule.year)
        ? schedule.year
        : serviceFloor.getFullYear();
    const months = normalizeMonths(schedule.months);
    const week = String(schedule.week || "").trim().toLowerCase();
    const day = String(schedule.day || "").trim().toLowerCase();

    months.forEach((monthValue) => {
      const dayOfMonth = getWeekdayPatternDayOfMonth(
        scheduleYear,
        monthValue - 1,
        week,
        day
      );
      if (!dayOfMonth) return;
      addOccurrence(new Date(scheduleYear, monthValue - 1, dayOfMonth));
    });
  } else {
    addOccurrence(serviceFloor);
  }

  const timeRangeLabel = formatTimeRange(
    schedule?.schedule?.start_time || schedule?.start_time || quote?.preferredTime,
    schedule?.schedule?.end_time || schedule?.end_time
  );
  const occurrenceItems = Array.from(occurrenceMap.values()).sort((left, right) =>
    left.dateKey > right.dateKey ? 1 : -1
  );

  return {
    occurrenceItems: occurrenceItems.map((item) => {
      const resolvedTimeLabel = timeRangeLabel || "";
      return {
        ...item,
        timeLabel: resolvedTimeLabel,
        displayLabel: resolvedTimeLabel
          ? `${item.weekdayLabel}, ${item.dateLabel} | ${resolvedTimeLabel}`
          : `${item.weekdayLabel}, ${item.dateLabel}`,
      };
    }),
    occurrenceCountLabel:
      occurrenceItems.length === 1
        ? "1 scheduled date"
        : `${occurrenceItems.length} scheduled dates`,
    occurrenceNote,
  };
};

const buildReadableSummary = (
  frequencyLabel,
  primaryDateLabel,
  timeRangeLabel,
  schedule
) => {
  if (!schedule || typeof schedule !== "object" || !schedule.frequency) {
    const parts = [
      frequencyLabel || "One-Time",
      primaryDateLabel ? `service date ${primaryDateLabel}` : "",
      timeRangeLabel ? `at ${timeRangeLabel}` : "",
    ].filter(Boolean);
    return parts.length ? `${parts.join(", ")}.` : "";
  }

  if (schedule.frequency === "one_time") {
    const datePart = primaryDateLabel ? `on ${primaryDateLabel}` : "";
    const timePart = timeRangeLabel ? `during ${timeRangeLabel}` : "";
    return ["This booking is scheduled once", datePart, timePart]
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/\s+\./g, ".")
      .concat(".");
  }

  if (schedule.frequency === "weekly") {
    const daysLabel = normalizeWeekdays(schedule.days)
      .map((day) => WEEKDAY_LABELS[day] || day)
      .join(", ");
    const startPart = primaryDateLabel ? `starting ${primaryDateLabel}` : "";
    const endPart = schedule.repeat_until
      ? `until ${formatDate(schedule.repeat_until)}`
      : "with no end date set";
    const timePart = timeRangeLabel ? `during ${timeRangeLabel}` : "";

    return [
      "This booking repeats weekly",
      daysLabel ? `on ${daysLabel}` : "",
      timePart,
      startPart,
      endPart,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/\s+\./g, ".")
      .concat(".");
  }

  if (schedule.pattern_type === "specific_dates") {
    const datesLabel = formatSpecificDateSummary(schedule);
    const timePart = timeRangeLabel ? `during ${timeRangeLabel}` : "";
    return [
      "This booking repeats monthly",
      datesLabel ? `on ${datesLabel}` : "",
      timePart,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/\s+\./g, ".")
      .concat(".");
  }

  const patternWeekLabel =
    MONTH_WEEK_LABELS[String(schedule.week || "").toLowerCase()];
  const patternDayLabel =
    WEEKDAY_LABELS[String(schedule.day || "").toLowerCase()];
  const patternLabel = [patternWeekLabel, patternDayLabel].filter(Boolean).join(" ");
  const monthsLabel = formatMonthList(schedule.months, schedule.year);
  const timePart = timeRangeLabel ? `during ${timeRangeLabel}` : "";

  return [
    "This booking repeats monthly",
    patternLabel ? `on the ${patternLabel}` : "",
    monthsLabel ? `for ${monthsLabel}` : "",
    timePart,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
    .replace(/\s+\./g, ".")
    .concat(".");
};

const buildSummaryLines = (schedule, timeRangeLabel, primaryDateLabel) => {
  if (!schedule || typeof schedule !== "object" || !schedule.frequency) {
    return [
      primaryDateLabel ? `Service date: ${primaryDateLabel}` : "",
      timeRangeLabel ? `Preferred time: ${timeRangeLabel}` : "",
    ].filter(Boolean);
  }

  if (schedule.frequency === "one_time") {
    return [
      primaryDateLabel ? `Scheduled date: ${primaryDateLabel}` : "",
      timeRangeLabel ? `Time window: ${timeRangeLabel}` : "",
    ].filter(Boolean);
  }

  if (schedule.frequency === "weekly") {
    const daysLabel = normalizeWeekdays(schedule.days)
      .map((day) => WEEKDAY_LABELS[day] || day)
      .join(", ");

    return [
      primaryDateLabel ? `Starts on: ${primaryDateLabel}` : "",
      daysLabel ? `Repeats every: ${daysLabel}` : "",
      timeRangeLabel ? `Time window: ${timeRangeLabel}` : "",
      schedule.repeat_until
        ? `Repeat until: ${formatDate(schedule.repeat_until)}`
        : "Repeat until: Not set",
    ].filter(Boolean);
  }

  if (schedule.pattern_type === "specific_dates") {
    const datesLabel = formatSpecificDateSummary(schedule);
    return [
      primaryDateLabel ? `Starts on: ${primaryDateLabel}` : "",
      datesLabel ? `Scheduled dates: ${datesLabel}` : "",
      timeRangeLabel ? `Time window: ${timeRangeLabel}` : "",
    ].filter(Boolean);
  }

  const patternWeekLabel =
    MONTH_WEEK_LABELS[String(schedule.week || "").toLowerCase()];
  const patternDayLabel =
    WEEKDAY_LABELS[String(schedule.day || "").toLowerCase()];
  const patternLabel = [patternWeekLabel, patternDayLabel].filter(Boolean).join(" ");
  const monthsLabel = formatMonthList(schedule.months, schedule.year);

  return [
    primaryDateLabel ? `Starts on: ${primaryDateLabel}` : "",
    patternLabel ? `Pattern: ${patternLabel}` : "",
    monthsLabel ? `Months: ${monthsLabel}` : "",
    timeRangeLabel ? `Time window: ${timeRangeLabel}` : "",
  ].filter(Boolean);
};

export const formatFrequencyLabel = (cleaningFrequency, cleaningSchedule) => {
  const raw = cleaningSchedule?.frequency || cleaningFrequency;
  const normalized = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  return FREQUENCY_LABELS[normalized] || "-";
};

export const getQuoteSchedulePresentation = (quote = {}) => {
  const schedule = quote?.cleaningSchedule;
  const frequencyLabel = formatFrequencyLabel(quote?.cleaningFrequency, schedule);

  if (!schedule || typeof schedule !== "object" || !schedule.frequency) {
    const legacyDate = formatDate(quote?.serviceDate);
    const legacyTime = formatTimeRange(quote?.preferredTime);
    const occurrenceData = buildOccurrenceItems(quote);
    return {
      frequencyLabel,
      shortSummary: buildShortSummary([frequencyLabel, legacyDate]),
      detailItems: [],
      timeRangeLabel: legacyTime,
      primaryDateLabel: legacyDate,
      readableSummary: buildReadableSummary(
        frequencyLabel,
        legacyDate,
        legacyTime,
        schedule
      ),
      summaryLines: buildSummaryLines(schedule, legacyTime, legacyDate),
      ...occurrenceData,
    };
  }

  if (schedule.frequency === "one_time") {
    const primaryDateLabel = formatDate(schedule?.schedule?.date || quote?.serviceDate);
    const timeRangeLabel = formatTimeRange(
      schedule?.schedule?.start_time || quote?.preferredTime,
      schedule?.schedule?.end_time
    );
    const occurrenceData = buildOccurrenceItems(quote);

    return {
      frequencyLabel,
      shortSummary: buildShortSummary([frequencyLabel, primaryDateLabel]),
      detailItems: [
        ...(primaryDateLabel
          ? [{ label: "Service Date", value: primaryDateLabel }]
          : []),
        ...(timeRangeLabel
          ? [{ label: "Time Window", value: timeRangeLabel }]
          : []),
      ],
      timeRangeLabel,
      primaryDateLabel,
      readableSummary: buildReadableSummary(
        frequencyLabel,
        primaryDateLabel,
        timeRangeLabel,
        schedule
      ),
      summaryLines: buildSummaryLines(schedule, timeRangeLabel, primaryDateLabel),
      ...occurrenceData,
    };
  }

  if (schedule.frequency === "weekly") {
    const daysLabel = normalizeWeekdays(schedule.days)
      .map((day) => WEEKDAY_LABELS[day] || day)
      .join(", ");
    const timeRangeLabel = formatTimeRange(schedule.start_time, schedule.end_time);
    const repeatUntilLabel = formatDate(schedule.repeat_until);
    const primaryDateLabel = formatDate(quote?.serviceDate);
    const occurrenceData = buildOccurrenceItems(quote);

    return {
      frequencyLabel,
      shortSummary: buildShortSummary([frequencyLabel, daysLabel]),
      detailItems: [
        ...(daysLabel ? [{ label: "Scheduled Days", value: daysLabel }] : []),
        ...(timeRangeLabel
          ? [{ label: "Time Window", value: timeRangeLabel }]
          : []),
        ...(repeatUntilLabel
          ? [{ label: "Repeat Until", value: repeatUntilLabel }]
          : []),
      ],
      timeRangeLabel,
      primaryDateLabel,
      readableSummary: buildReadableSummary(
        frequencyLabel,
        primaryDateLabel,
        timeRangeLabel,
        schedule
      ),
      summaryLines: buildSummaryLines(schedule, timeRangeLabel, primaryDateLabel),
      ...occurrenceData,
    };
  }

  const timeRangeLabel = formatTimeRange(schedule.start_time, schedule.end_time);
  const primaryDateLabel = formatDate(quote?.serviceDate);
  const occurrenceData = buildOccurrenceItems(quote);

  if (schedule.pattern_type === "specific_dates") {
    const datesLabel = formatSpecificDateSummary(schedule);
    return {
      frequencyLabel,
      shortSummary: buildShortSummary([frequencyLabel, datesLabel]),
      detailItems: [
        ...(datesLabel ? [{ label: "Scheduled Dates", value: datesLabel }] : []),
        ...(timeRangeLabel
          ? [{ label: "Time Window", value: timeRangeLabel }]
          : []),
      ],
      timeRangeLabel,
      primaryDateLabel,
      readableSummary: buildReadableSummary(
        frequencyLabel,
        primaryDateLabel,
        timeRangeLabel,
        schedule
      ),
      summaryLines: buildSummaryLines(schedule, timeRangeLabel, primaryDateLabel),
      ...occurrenceData,
    };
  }

  const patternWeekLabel =
    MONTH_WEEK_LABELS[String(schedule.week || "").toLowerCase()];
  const patternDayLabel =
    WEEKDAY_LABELS[String(schedule.day || "").toLowerCase()];
  const patternLabel = [patternWeekLabel, patternDayLabel]
    .filter(Boolean)
    .join(" ");
  const monthsLabel = formatMonthList(schedule.months, schedule.year);

  return {
    frequencyLabel,
    shortSummary: buildShortSummary([frequencyLabel, patternLabel, monthsLabel]),
    detailItems: [
      ...(patternLabel ? [{ label: "Monthly Pattern", value: patternLabel }] : []),
      ...(monthsLabel ? [{ label: "Months", value: monthsLabel }] : []),
      ...(timeRangeLabel
        ? [{ label: "Time Window", value: timeRangeLabel }]
        : []),
    ],
    timeRangeLabel,
    primaryDateLabel,
    readableSummary: buildReadableSummary(
      frequencyLabel,
      primaryDateLabel,
      timeRangeLabel,
      schedule
    ),
    summaryLines: buildSummaryLines(schedule, timeRangeLabel, primaryDateLabel),
    ...occurrenceData,
  };
};
