export const WEEKDAY_OPTIONS = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

export const MONTHLY_WEEK_OPTIONS = [
  { label: "First", value: "first" },
  { label: "Second", value: "second" },
  { label: "Third", value: "third" },
  { label: "Fourth", value: "fourth" },
  { label: "Last", value: "last" },
];

export const MONTHLY_PATTERN_OPTIONS = [
  { label: "Specific Dates", value: "specific_dates" },
  { label: "Weekday Pattern", value: "weekday_pattern" },
];

export const MONTH_OPTIONS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

const ALL_MONTH_VALUES = MONTH_OPTIONS.map((month) => month.value);
const MONTH_DAY_LIMITS = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

export const SCHEDULE_ERROR_KEYS = [
  "scheduleDate",
  "scheduleStartTime",
  "scheduleEndTime",
  "scheduleDays",
  "scheduleMonthlyMonths",
  "scheduleMonthlyDates",
  "scheduleMonthlyPattern",
];

const toMinutes = (value) => {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const isDateLike = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");
const isTimeLike = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");

export const createInitialCleaningScheduleState = () => ({
  oneTime: {
    date: "",
    startTime: "",
    endTime: "",
  },
  weekly: {
    days: [],
    startTime: "",
    endTime: "",
    repeatUntil: "",
  },
  monthly: {
    patternType: "specific_dates",
    months: [...ALL_MONTH_VALUES],
    dates: [],
    week: "first",
    day: "monday",
    startTime: "",
    endTime: "",
  },
});

const normalizeMonths = (months) => {
  const normalized = Array.from(
    new Set(
      (Array.isArray(months) ? months : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12)
    )
  ).sort((a, b) => a - b);
  return normalized.length ? normalized : [...ALL_MONTH_VALUES];
};

export const getMaxDayForMonths = (months) => {
  const normalizedMonths = normalizeMonths(months);
  const limits = normalizedMonths.map((month) => MONTH_DAY_LIMITS[month] || 31);
  return limits.length ? Math.max(...limits) : 31;
};

export const validateCleaningSchedule = (frequency, scheduleState) => {
  const errors = {};

  if (frequency === "one-time") {
    const oneTime = scheduleState.oneTime || {};
    if (!oneTime.date || !isDateLike(oneTime.date)) {
      errors.scheduleDate = "Date is required.";
    }
    if (!oneTime.startTime || !isTimeLike(oneTime.startTime)) {
      errors.scheduleStartTime = "Start time is required.";
    }
    if (!oneTime.endTime || !isTimeLike(oneTime.endTime)) {
      errors.scheduleEndTime = "End time is required.";
    }
    if (
      isTimeLike(oneTime.startTime) &&
      isTimeLike(oneTime.endTime) &&
      toMinutes(oneTime.endTime) <= toMinutes(oneTime.startTime)
    ) {
      errors.scheduleEndTime = "End time must be after start time.";
    }
  }

  if (frequency === "weekly") {
    const weekly = scheduleState.weekly || {};
    if (!Array.isArray(weekly.days) || weekly.days.length === 0) {
      errors.scheduleDays = "Select at least one weekday.";
    }
    if (!weekly.startTime || !isTimeLike(weekly.startTime)) {
      errors.scheduleStartTime = "Start time is required.";
    }
    if (!weekly.endTime || !isTimeLike(weekly.endTime)) {
      errors.scheduleEndTime = "End time is required.";
    }
    if (
      isTimeLike(weekly.startTime) &&
      isTimeLike(weekly.endTime) &&
      toMinutes(weekly.endTime) <= toMinutes(weekly.startTime)
    ) {
      errors.scheduleEndTime = "End time must be after start time.";
    }
    if (weekly.repeatUntil && !isDateLike(weekly.repeatUntil)) {
      errors.scheduleDate = "Repeat Until must be a valid date.";
    }
  }

  if (frequency === "monthly") {
    const monthly = scheduleState.monthly || {};
    const selectedMonths = Array.from(
      new Set(
        (Array.isArray(monthly.months) ? monthly.months : [])
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12)
      )
    );
    if (!selectedMonths.length) {
      errors.scheduleMonthlyMonths = "Select at least one month.";
    }
    if (!monthly.startTime || !isTimeLike(monthly.startTime)) {
      errors.scheduleStartTime = "Start time is required.";
    }
    if (!monthly.endTime || !isTimeLike(monthly.endTime)) {
      errors.scheduleEndTime = "End time is required.";
    }
    if (
      isTimeLike(monthly.startTime) &&
      isTimeLike(monthly.endTime) &&
      toMinutes(monthly.endTime) <= toMinutes(monthly.startTime)
    ) {
      errors.scheduleEndTime = "End time must be after start time.";
    }

    if (monthly.patternType === "specific_dates") {
      if (!Array.isArray(monthly.dates) || monthly.dates.length === 0) {
        errors.scheduleMonthlyDates = "Select at least one date of month.";
      } else {
        const maxDayForMonths = getMaxDayForMonths(monthly.months);
        const hasInvalidDate = monthly.dates.some(
          (value) => Number(value) > maxDayForMonths
        );
        if (hasInvalidDate) {
          errors.scheduleMonthlyDates =
            "Selected date(s) are not valid for the chosen month(s).";
        }
      }
    } else if (monthly.patternType === "weekday_pattern") {
      if (!monthly.week || !monthly.day) {
        errors.scheduleMonthlyPattern = "Select week and day pattern.";
      }
    } else {
      errors.scheduleMonthlyPattern = "Select a valid monthly pattern.";
    }
  }

  const firstError = Object.values(errors)[0];
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};

export const buildCleaningSchedulePayload = (frequency, scheduleState) => {
  if (frequency === "one-time") {
    const oneTime = scheduleState.oneTime;
    return {
      frequency: "one_time",
      schedule: {
        date: oneTime.date,
        start_time: oneTime.startTime,
        end_time: oneTime.endTime,
      },
    };
  }

  if (frequency === "weekly") {
    const weekly = scheduleState.weekly;
    return {
      frequency: "weekly",
      days: [...new Set(weekly.days)],
      start_time: weekly.startTime,
      end_time: weekly.endTime,
      repeat_until: weekly.repeatUntil || undefined,
    };
  }

  if (frequency === "monthly") {
    const monthly = scheduleState.monthly;
    const months = normalizeMonths(monthly.months);
    if (monthly.patternType === "specific_dates") {
      const maxDayForMonths = getMaxDayForMonths(months);
      return {
        frequency: "monthly",
        pattern_type: "specific_dates",
        months,
        dates: [...new Set(monthly.dates)]
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value >= 1 && value <= maxDayForMonths)
          .sort((a, b) => a - b),
        start_time: monthly.startTime,
        end_time: monthly.endTime,
      };
    }

    return {
      frequency: "monthly",
      pattern_type: "weekday_pattern",
      months,
      week: monthly.week,
      day: monthly.day,
      start_time: monthly.startTime,
      end_time: monthly.endTime,
    };
  }

  return null;
};
