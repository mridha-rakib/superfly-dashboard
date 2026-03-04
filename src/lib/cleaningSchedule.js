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

export const SCHEDULE_ERROR_KEYS = [
  "scheduleDate",
  "scheduleStartTime",
  "scheduleEndTime",
  "scheduleDays",
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
    dates: [],
    week: "first",
    day: "monday",
    startTime: "",
    endTime: "",
  },
});

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
    if (monthly.patternType === "specific_dates") {
      return {
        frequency: "monthly",
        pattern_type: "specific_dates",
        dates: [...new Set(monthly.dates)].sort((a, b) => a - b),
        start_time: monthly.startTime,
        end_time: monthly.endTime,
      };
    }

    return {
      frequency: "monthly",
      pattern_type: "weekday_pattern",
      week: monthly.week,
      day: monthly.day,
      start_time: monthly.startTime,
      end_time: monthly.endTime,
    };
  }

  return null;
};
