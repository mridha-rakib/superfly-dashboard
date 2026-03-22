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

export const SCHEDULE_ERROR_KEYS = [
  "scheduleDate",
  "scheduleStartTime",
  "scheduleEndTime",
  "scheduleDays",
  "scheduleMonthlyYear",
  "scheduleMonthlyMonths",
  "scheduleMonthlyDates",
  "scheduleMonthlyPattern",
  "scheduleMonthlyTimes",
];

const toMinutes = (value) => {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const isDateLike = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");
const isTimeLike = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");

const toDateOnly = (value) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const addDays = (value, days) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return toDateOnly(next);
};

const toDateString = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateString = (value) => {
  if (!isDateLike(value)) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return toDateOnly(parsed);
};

export const getScheduleMinDate = () => {
  const tomorrow = addDays(toDateOnly(new Date()), 1);
  return toDateString(tomorrow);
};

export const getMonthlyYearOptions = (yearsAhead = 5) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: Math.max(1, Number(yearsAhead) + 1) }, (_, index) =>
    currentYear + index
  );
};

export const getMonthScopeKey = (year, monthValue) =>
  `${Number(year)}-${String(Number(monthValue)).padStart(2, "0")}`;

const normalizeMonthList = (months) =>
  Array.from(
    new Set(
      (Array.isArray(months) ? months : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12)
    )
  ).sort((a, b) => a - b);

const normalizeMonths = (months) => {
  const normalized = normalizeMonthList(months);
  return normalized.length ? normalized : [...ALL_MONTH_VALUES];
};

export const getDaysInMonth = (monthValue, year = new Date().getFullYear()) => {
  const month = Number(monthValue);
  const resolvedYear = Number(year);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return 31;
  }
  const parsed = new Date(resolvedYear, month, 0).getDate();
  return Number.isFinite(parsed) ? parsed : 31;
};

export const isMonthSelectableForYear = (
  year,
  monthValue,
  minDate = getScheduleMinDate()
) => {
  const month = Number(monthValue);
  const selectedYear = Number(year);
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(selectedYear)) return false;

  const min = parseDateString(minDate);
  if (!min) return true;
  const lastDay = new Date(selectedYear, month, 0);
  return toDateOnly(lastDay) >= min;
};

export const isMonthDateSelectable = (
  year,
  monthValue,
  dayValue,
  minDate = getScheduleMinDate()
) => {
  const month = Number(monthValue);
  const day = Number(dayValue);
  const selectedYear = Number(year);
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1) return false;
  if (!Number.isInteger(selectedYear)) return false;

  const maxDay = getDaysInMonth(month, selectedYear);
  if (day > maxDay) return false;

  const min = parseDateString(minDate);
  if (!min) return true;

  const candidate = toDateOnly(new Date(selectedYear, month - 1, day));
  return candidate >= min;
};

const readMonthScopedArray = (collection, year, monthValue) => {
  if (!collection || typeof collection !== "object") return [];
  const scopeKey = getMonthScopeKey(year, monthValue);
  const month = Number(monthValue);
  const values = Array.isArray(collection?.[scopeKey])
    ? collection[scopeKey]
    : Array.isArray(collection?.[month])
    ? collection[month]
    : Array.isArray(collection?.[String(month)])
    ? collection[String(month)]
    : [];
  return Array.isArray(values) ? values : [];
};

const readMonthScopedObject = (collection, year, monthValue) => {
  if (!collection || typeof collection !== "object") return {};
  const scopeKey = getMonthScopeKey(year, monthValue);
  const month = Number(monthValue);
  const value =
    collection?.[scopeKey] ??
    collection?.[month] ??
    collection?.[String(month)] ??
    {};
  return value && typeof value === "object" ? value : {};
};

const normalizeDatesForMonth = (dates, monthValue, year) => {
  const maxDay = getDaysInMonth(monthValue, year);
  return Array.from(
    new Set(
      (Array.isArray(dates) ? dates : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= maxDay)
    )
  ).sort((a, b) => a - b);
};

const normalizeMonthDates = (
  monthDates,
  selectedMonths,
  fallbackDates = [],
  selectedYear = new Date().getFullYear()
) => {
  const hasExplicitMonthDates =
    monthDates &&
    typeof monthDates === "object" &&
    Object.keys(monthDates).length > 0;

  const result = {};
  selectedMonths.forEach((month) => {
    const sourceDates = hasExplicitMonthDates
      ? readMonthScopedArray(monthDates, selectedYear, month)
      : fallbackDates;
    result[month] = normalizeDatesForMonth(sourceDates, month, selectedYear);
  });

  return result;
};

const resolveSelectedMonths = (months) => normalizeMonthList(months);

const resolveMonthlyTimeForMonth = (monthly = {}, month, selectedYear) => {
  const scopedTime = readMonthScopedObject(monthly.monthTimes, selectedYear, month);
  return {
    startTime: scopedTime.startTime || monthly.startTime || "",
    endTime: scopedTime.endTime || monthly.endTime || "",
  };
};

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
    year: new Date().getFullYear(),
    patternType: "specific_dates",
    months: [],
    activeMonth: null,
    monthDates: {},
    monthTimes: {},
    dates: [],
    week: "first",
    day: "monday",
    startTime: "",
    endTime: "",
  },
});

export const getMaxDayForMonths = (months, year = new Date().getFullYear()) => {
  const normalizedMonths = normalizeMonths(months);
  const limits = normalizedMonths.map((month) => getDaysInMonth(month, year));
  return limits.length ? Math.max(...limits) : 31;
};

export const validateCleaningSchedule = (frequency, scheduleState) => {
  const errors = {};
  const minScheduleDate = getScheduleMinDate();

  if (frequency === "one-time") {
    const oneTime = scheduleState.oneTime || {};
    if (!oneTime.date || !isDateLike(oneTime.date)) {
      errors.scheduleDate = "Date is required.";
    } else if (oneTime.date < minScheduleDate) {
      errors.scheduleDate = "Past dates are not allowed.";
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
    if (!weekly.repeatUntil) {
      errors.scheduleDate = "Repeat Until is required for weekly bookings.";
    } else if (!isDateLike(weekly.repeatUntil)) {
      errors.scheduleDate = "Repeat Until must be a valid date.";
    } else if (weekly.repeatUntil < minScheduleDate) {
      errors.scheduleDate = "Repeat Until cannot be in the past.";
    }
  }

  if (frequency === "monthly") {
    const monthly = scheduleState.monthly || {};
    const currentYear = new Date().getFullYear();
    const selectedYearRaw = Number(monthly.year);
    const selectedYear =
      Number.isInteger(selectedYearRaw) && selectedYearRaw >= currentYear
        ? selectedYearRaw
        : currentYear;
    const selectedMonths = resolveSelectedMonths(monthly.months);

    if (!selectedMonths.length) {
      errors.scheduleMonthlyMonths = "Select at least one month.";
    }

    const hasPastMonth = selectedMonths.some(
      (month) => !isMonthSelectableForYear(selectedYear, month, minScheduleDate)
    );
    if (hasPastMonth) {
      errors.scheduleMonthlyMonths = "Past months are not allowed for the selected year.";
    }

    if (monthly.patternType === "specific_dates") {
      const monthDates = normalizeMonthDates(
        monthly.monthDates,
        selectedMonths,
        monthly.dates,
        selectedYear
      );
      const missingMonths = selectedMonths.filter(
        (month) => !monthDates[month] || monthDates[month].length === 0
      );
      if (missingMonths.length) {
        errors.scheduleMonthlyDates =
          "Select at least one date for each selected month.";
      } else {
        const hasPastDate = selectedMonths.some((month) =>
          (monthDates[month] || []).some(
            (dateValue) =>
              !isMonthDateSelectable(
                selectedYear,
                month,
                dateValue,
                minScheduleDate
              )
          )
        );
        if (hasPastDate) {
          errors.scheduleMonthlyDates = "Past dates are not allowed.";
        }
      }
    } else if (monthly.patternType === "weekday_pattern") {
      if (!monthly.week || !monthly.day) {
        errors.scheduleMonthlyPattern = "Select week and day pattern.";
      }
    } else {
      errors.scheduleMonthlyPattern = "Select a valid monthly pattern.";
    }

    const missingMonthTimes = [];
    const invalidMonthTimes = [];
    selectedMonths.forEach((month) => {
      const { startTime, endTime } = resolveMonthlyTimeForMonth(
        monthly,
        month,
        selectedYear
      );
      if (!isTimeLike(startTime) || !isTimeLike(endTime)) {
        missingMonthTimes.push(month);
        return;
      }
      if (toMinutes(endTime) <= toMinutes(startTime)) {
        invalidMonthTimes.push(month);
      }
    });

    if (missingMonthTimes.length) {
      errors.scheduleMonthlyTimes =
        "Set start and end time for each selected month.";
    } else if (invalidMonthTimes.length) {
      errors.scheduleMonthlyTimes =
        "End time must be after start time for each selected month.";
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
    const months = resolveSelectedMonths(monthly.months);
    const selectedYearRaw = Number(monthly.year);
    const selectedYear = Number.isInteger(selectedYearRaw)
      ? selectedYearRaw
      : new Date().getFullYear();

    const monthTimes = months.map((month) => {
      const monthTime = resolveMonthlyTimeForMonth(monthly, month, selectedYear);
      return {
        month,
        start_time: monthTime.startTime,
        end_time: monthTime.endTime,
      };
    });

    const primaryMonthTime = monthTimes[0] || {};
    const defaultStartTime = primaryMonthTime.start_time || monthly.startTime || "";
    const defaultEndTime = primaryMonthTime.end_time || monthly.endTime || "";

    if (monthly.patternType === "specific_dates") {
      const monthDates = normalizeMonthDates(
        monthly.monthDates,
        months,
        monthly.dates,
        selectedYear
      );
      const monthDateEntries = months
        .map((month) => {
          const monthTime =
            monthTimes.find((entry) => entry.month === month) || primaryMonthTime;
          const dates = (monthDates[month] || []).filter((dateValue) =>
            isMonthDateSelectable(
              selectedYear,
              month,
              dateValue,
              getScheduleMinDate()
            )
          );
          return {
            month,
            dates,
            start_time: monthTime.start_time || defaultStartTime,
            end_time: monthTime.end_time || defaultEndTime,
          };
        })
        .filter((entry) => entry.dates.length > 0);

      return {
        frequency: "monthly",
        pattern_type: "specific_dates",
        year: selectedYear,
        months,
        month_dates: monthDateEntries,
        month_times: monthTimes,
        // Keep legacy `dates` for backward compatibility while API is transitioning.
        dates: Array.from(
          new Set(monthDateEntries.flatMap((entry) => entry.dates))
        ).sort((a, b) => a - b),
        start_time: defaultStartTime,
        end_time: defaultEndTime,
      };
    }

    return {
      frequency: "monthly",
      pattern_type: "weekday_pattern",
      year: selectedYear,
      months,
      week: monthly.week,
      day: monthly.day,
      month_times: monthTimes,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
    };
  }

  return null;
};
