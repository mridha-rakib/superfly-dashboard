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

const uniqNumbers = (values = []) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value))
    )
  ).sort((left, right) => left - right);

const normalizeMonths = (months = []) =>
  uniqNumbers(months).filter((month) => month >= 1 && month <= 12);

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
      .join(" • ");
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
    .join(" • ");

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
    return {
      frequencyLabel,
      shortSummary: buildShortSummary([frequencyLabel, legacyDate]),
      detailItems: [],
      timeRangeLabel: legacyTime,
      primaryDateLabel: legacyDate,
    };
  }

  if (schedule.frequency === "one_time") {
    const primaryDateLabel = formatDate(schedule?.schedule?.date || quote?.serviceDate);
    const timeRangeLabel = formatTimeRange(
      schedule?.schedule?.start_time || quote?.preferredTime,
      schedule?.schedule?.end_time
    );

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
    };
  }

  if (schedule.frequency === "weekly") {
    const daysLabel = normalizeWeekdays(schedule.days)
      .map((day) => WEEKDAY_LABELS[day] || day)
      .join(", ");
    const timeRangeLabel = formatTimeRange(schedule.start_time, schedule.end_time);
    const repeatUntilLabel = formatDate(schedule.repeat_until);
    const primaryDateLabel = formatDate(quote?.serviceDate);

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
    };
  }

  const timeRangeLabel = formatTimeRange(schedule.start_time, schedule.end_time);
  const primaryDateLabel = formatDate(quote?.serviceDate);

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
  };
};
