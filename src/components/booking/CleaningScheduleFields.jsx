import { useEffect, useState } from "react";
import {
  MONTH_OPTIONS,
  MONTHLY_PATTERN_OPTIONS,
  MONTHLY_WEEK_OPTIONS,
  WEEKDAY_OPTIONS,
  createInitialCleaningScheduleState,
  getDaysInMonth,
  getMonthScopeKey,
  getMonthlyYearOptions,
  getScheduleMinDate,
  isMonthDateSelectable,
  isMonthSelectableForYear,
} from "../../lib/cleaningSchedule";
import { formatTimeTo12Hour, parseTimeTo24Hour } from "../../lib/time-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const labelClass = "text-sm font-semibold text-gray-800 mb-2";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#C85344] focus:ring-2 focus:ring-[#C85344]/20 transition";
const calendarWeekdays = ["S", "M", "T", "W", "T", "F", "S"];
const timePlaceholder = "10:00 AM";

const normalizeMonthList = (months) =>
  Array.from(
    new Set(
      (Array.isArray(months) ? months : [])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12)
    )
  ).sort((a, b) => a - b);

const isNormalizedTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");

function TimeTextField({ value, onChange, className, placeholder = timePlaceholder }) {
  const [draftValue, setDraftValue] = useState(value ? formatTimeTo12Hour(value) : "");

  useEffect(() => {
    setDraftValue(value ? formatTimeTo12Hour(value) : "");
  }, [value]);

  const commitValue = (nextValue) => {
    const trimmedValue = nextValue.trim();
    if (!trimmedValue) {
      setDraftValue("");
      onChange("");
      return;
    }

    const normalized = parseTimeTo24Hour(trimmedValue);
    if (!isNormalizedTime(normalized)) {
      setDraftValue(value ? formatTimeTo12Hour(value) : "");
      return;
    }

    onChange(normalized);
    setDraftValue(formatTimeTo12Hour(normalized));
  };

  return (
    <input
      type="text"
      inputMode="text"
      autoComplete="off"
      placeholder={placeholder}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value.toUpperCase())}
      onBlur={(event) => commitValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitValue(event.currentTarget.value);
          event.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
}

function CleaningScheduleFields({ frequency, schedule, errors, onScheduleChange }) {
  const safeSchedule = schedule || createInitialCleaningScheduleState();
  const oneTime = safeSchedule.oneTime || {};
  const weekly = safeSchedule.weekly || {};
  const monthly = safeSchedule.monthly || {};
  const minScheduleDate = getScheduleMinDate();
  const minScheduleYear = Number(minScheduleDate.slice(0, 4));
  const yearOptions = getMonthlyYearOptions(5);
  const selectedYearRaw = Number(monthly.year);
  const selectedYear =
    Number.isInteger(selectedYearRaw) && selectedYearRaw >= minScheduleYear
      ? selectedYearRaw
      : minScheduleYear;

  const selectedMonths = normalizeMonthList(monthly.months);
  const selectableMonthValues = MONTH_OPTIONS.filter((month) =>
    isMonthSelectableForYear(selectedYear, month.value, minScheduleDate)
  ).map((month) => month.value);
  const visibleSelectedMonths = selectedMonths.filter((month) =>
    selectableMonthValues.includes(month)
  );

  const resolveMonthDates = (monthValue, sourceMonthly = monthly, year = selectedYear) => {
    const scopeKey = getMonthScopeKey(year, monthValue);
    const values = Array.isArray(sourceMonthly.monthDates?.[scopeKey])
      ? sourceMonthly.monthDates[scopeKey]
      : Array.isArray(sourceMonthly.monthDates?.[monthValue])
      ? sourceMonthly.monthDates[monthValue]
      : Array.isArray(sourceMonthly.monthDates?.[String(monthValue)])
      ? sourceMonthly.monthDates[String(monthValue)]
      : [];

    return Array.isArray(values)
      ? Array.from(
          new Set(
            values
              .map((value) => Number(value))
              .filter((value) => Number.isInteger(value))
          )
        ).sort((a, b) => a - b)
      : [];
  };

  const resolveMonthTime = (monthValue, sourceMonthly = monthly, year = selectedYear) => {
    const scopeKey = getMonthScopeKey(year, monthValue);
    const scoped =
      sourceMonthly.monthTimes?.[scopeKey] ??
      sourceMonthly.monthTimes?.[monthValue] ??
      sourceMonthly.monthTimes?.[String(monthValue)] ??
      {};

    return {
      startTime: scoped?.startTime || sourceMonthly.startTime || "",
      endTime: scoped?.endTime || sourceMonthly.endTime || "",
    };
  };

  const buildLegacyDates = (
    months,
    monthDatesMap,
    yearValue = selectedYear
  ) => {
    return Array.from(
      new Set(
        months.flatMap((monthValue) => {
          const scopeKey = getMonthScopeKey(yearValue, monthValue);
          const dates = Array.isArray(monthDatesMap?.[scopeKey])
            ? monthDatesMap[scopeKey]
            : [];
          return dates
            .map((value) => Number(value))
            .filter(
              (value) =>
                Number.isInteger(value) &&
                value >= 1 &&
                value <= getDaysInMonth(monthValue, yearValue)
            );
        })
      )
    ).sort((a, b) => a - b);
  };

  const resolvedActiveMonth = visibleSelectedMonths.includes(Number(monthly.activeMonth))
    ? Number(monthly.activeMonth)
    : visibleSelectedMonths[0] || null;
  const activeMonthLabel = MONTH_OPTIONS.find(
    (month) => month.value === resolvedActiveMonth
  )?.label;
  const activeMonthDays = resolvedActiveMonth
    ? getDaysInMonth(resolvedActiveMonth, selectedYear)
    : 31;
  const activeMonthStartDay = resolvedActiveMonth
    ? new Date(selectedYear, resolvedActiveMonth - 1, 1).getDay()
    : 0;
  const leadingEmptyDays = Array.from({ length: activeMonthStartDay }, (_, index) => index);
  const trailingEmptyDayCount = (7 - ((activeMonthStartDay + activeMonthDays) % 7)) % 7;
  const trailingEmptyDays = Array.from(
    { length: trailingEmptyDayCount },
    (_, index) => index
  );
  const activeMonthDates = resolvedActiveMonth
    ? resolveMonthDates(resolvedActiveMonth).filter((dateValue) =>
        isMonthDateSelectable(
          selectedYear,
          resolvedActiveMonth,
          dateValue,
          minScheduleDate
        )
      )
    : [];

  const activeMonthPosition = visibleSelectedMonths.indexOf(resolvedActiveMonth);
  const hasPreviousActiveMonth = activeMonthPosition > 0;
  const hasNextActiveMonth =
    activeMonthPosition > -1 && activeMonthPosition < visibleSelectedMonths.length - 1;

  const applyScheduleUpdate = (updater) => {
    onScheduleChange((prevSchedule) => {
      const base = prevSchedule || createInitialCleaningScheduleState();
      return updater(base);
    });
  };

  const setOneTimeField = (field, value) => {
    if (field === "date" && value && value < minScheduleDate) {
      return;
    }
    applyScheduleUpdate((prevSchedule) => ({
      ...prevSchedule,
      oneTime: {
        ...prevSchedule.oneTime,
        [field]: value,
      },
    }));
  };

  const setWeeklyField = (field, value) => {
    if (field === "repeatUntil" && value && value < minScheduleDate) {
      return;
    }
    applyScheduleUpdate((prevSchedule) => ({
      ...prevSchedule,
      weekly: {
        ...prevSchedule.weekly,
        [field]: value,
      },
    }));
  };

  const toggleWeeklyDay = (day) => {
    applyScheduleUpdate((prevSchedule) => {
      const days = prevSchedule.weekly.days.includes(day)
        ? prevSchedule.weekly.days.filter((value) => value !== day)
        : [...prevSchedule.weekly.days, day];

      return {
        ...prevSchedule,
        weekly: {
          ...prevSchedule.weekly,
          days,
        },
      };
    });
  };

  const setMonthlyField = (field, value) => {
    applyScheduleUpdate((prevSchedule) => ({
      ...prevSchedule,
      monthly: {
        ...prevSchedule.monthly,
        [field]: value,
      },
    }));
  };

  const setMonthlyYear = (yearValue) => {
    const nextYear = Number(yearValue);
    if (!Number.isInteger(nextYear) || nextYear < minScheduleYear) {
      return;
    }

    applyScheduleUpdate((prevSchedule) => {
      const prevMonthly = prevSchedule.monthly || {};
      const prevMonths = normalizeMonthList(prevMonthly.months);
      const nextMonths = prevMonths.filter((monthValue) =>
        isMonthSelectableForYear(nextYear, monthValue, minScheduleDate)
      );

      let nextActiveMonth = Number(prevMonthly.activeMonth);
      if (!nextMonths.length) {
        nextActiveMonth = null;
      } else if (!nextMonths.includes(nextActiveMonth)) {
        nextActiveMonth = nextMonths[0];
      }

      const monthDates = { ...(prevMonthly.monthDates || {}) };
      const monthTimes = { ...(prevMonthly.monthTimes || {}) };

      nextMonths.forEach((monthValue) => {
        const scopeKey = getMonthScopeKey(nextYear, monthValue);
        if (!Array.isArray(monthDates[scopeKey])) {
          const legacyDates = Array.isArray(monthDates[monthValue])
            ? monthDates[monthValue]
            : Array.isArray(monthDates[String(monthValue)])
            ? monthDates[String(monthValue)]
            : [];
          monthDates[scopeKey] = legacyDates;
        }
        if (!monthTimes[scopeKey] || typeof monthTimes[scopeKey] !== "object") {
          const legacyTime =
            monthTimes[monthValue] || monthTimes[String(monthValue)] || {};
          monthTimes[scopeKey] = {
            startTime: legacyTime.startTime || prevMonthly.startTime || "",
            endTime: legacyTime.endTime || prevMonthly.endTime || "",
          };
        }
      });

      const dates = buildLegacyDates(nextMonths, monthDates, nextYear);
      const firstMonth = nextMonths[0];
      const firstTime = firstMonth
        ? monthTimes[getMonthScopeKey(nextYear, firstMonth)] || {}
        : {};

      return {
        ...prevSchedule,
        monthly: {
          ...prevMonthly,
          year: nextYear,
          months: nextMonths,
          activeMonth: nextActiveMonth,
          monthDates,
          monthTimes,
          dates,
          startTime: firstTime.startTime || prevMonthly.startTime || "",
          endTime: firstTime.endTime || prevMonthly.endTime || "",
        },
      };
    });
  };

  const setMonthlyActiveMonth = (monthValue) => {
    setMonthlyField("activeMonth", monthValue);
  };

  const navigateActiveMonth = (direction) => {
    if (!resolvedActiveMonth) return;

    const currentIndex = visibleSelectedMonths.indexOf(resolvedActiveMonth);
    if (currentIndex < 0) return;

    const nextMonth = visibleSelectedMonths[currentIndex + direction];
    if (!nextMonth) return;

    setMonthlyActiveMonth(nextMonth);
  };

  const setMonthlyMonthTime = (monthValue, field, value) => {
    applyScheduleUpdate((prevSchedule) => {
      const prevMonthly = prevSchedule.monthly || {};
      const yearValue = Number(prevMonthly.year) || minScheduleYear;
      const scopeKey = getMonthScopeKey(yearValue, monthValue);
      const monthTimes = { ...(prevMonthly.monthTimes || {}) };
      const existing = monthTimes[scopeKey] || {};
      monthTimes[scopeKey] = {
        ...existing,
        [field]: value,
      };

      const months = normalizeMonthList(prevMonthly.months);
      const firstMonth = months[0];
      const firstTime = firstMonth
        ? monthTimes[getMonthScopeKey(yearValue, firstMonth)] || {}
        : {};

      return {
        ...prevSchedule,
        monthly: {
          ...prevMonthly,
          monthTimes,
          startTime: firstTime.startTime || prevMonthly.startTime || "",
          endTime: firstTime.endTime || prevMonthly.endTime || "",
        },
      };
    });
  };

  const toggleMonthlyDate = (dateValue) => {
    if (!resolvedActiveMonth) return;
    if (
      !isMonthDateSelectable(
        selectedYear,
        resolvedActiveMonth,
        dateValue,
        minScheduleDate
      )
    ) {
      return;
    }

    applyScheduleUpdate((prevSchedule) => {
      const prevMonthly = prevSchedule.monthly || {};
      const yearValue = Number(prevMonthly.year) || minScheduleYear;
      const monthDates = { ...(prevMonthly.monthDates || {}) };
      const scopeKey = getMonthScopeKey(yearValue, resolvedActiveMonth);
      const currentDates = Array.isArray(monthDates[scopeKey]) ? monthDates[scopeKey] : [];
      const exists = currentDates.includes(dateValue);
      const nextDates = exists
        ? currentDates.filter((value) => value !== dateValue)
        : [...currentDates, dateValue];

      monthDates[scopeKey] = Array.from(new Set(nextDates)).sort((a, b) => a - b);
      const months = normalizeMonthList(prevMonthly.months).filter((monthValue) =>
        isMonthSelectableForYear(yearValue, monthValue, minScheduleDate)
      );
      const dates = buildLegacyDates(months, monthDates, yearValue);

      return {
        ...prevSchedule,
        monthly: {
          ...prevMonthly,
          monthDates,
          dates,
        },
      };
    });
  };

  const toggleMonthlyMonth = (monthValue) => {
    if (!isMonthSelectableForYear(selectedYear, monthValue, minScheduleDate)) {
      return;
    }

    applyScheduleUpdate((prevSchedule) => {
      const prevMonthly = prevSchedule.monthly || {};
      const yearValue = Number(prevMonthly.year) || minScheduleYear;
      const currentMonths = normalizeMonthList(prevMonthly.months).filter((month) =>
        isMonthSelectableForYear(yearValue, month, minScheduleDate)
      );
      const exists = currentMonths.includes(monthValue);
      const monthDates = { ...(prevMonthly.monthDates || {}) };
      const monthTimes = { ...(prevMonthly.monthTimes || {}) };
      const scopeKey = getMonthScopeKey(yearValue, monthValue);

      let months;
      let activeMonth = Number(prevMonthly.activeMonth);

      if (exists) {
        months = currentMonths.filter((value) => value !== monthValue);
        delete monthDates[scopeKey];
        delete monthTimes[scopeKey];
      } else {
        months = [...currentMonths, monthValue].sort((a, b) => a - b);
        if (!Array.isArray(monthDates[scopeKey])) {
          monthDates[scopeKey] = [];
        }
        if (!monthTimes[scopeKey] || typeof monthTimes[scopeKey] !== "object") {
          monthTimes[scopeKey] = {
            startTime: prevMonthly.startTime || "",
            endTime: prevMonthly.endTime || "",
          };
        }
      }

      if (!months.length) {
        activeMonth = null;
      } else if (!months.includes(activeMonth)) {
        activeMonth = months[0];
      }

      const dates = buildLegacyDates(months, monthDates, yearValue);
      const firstMonth = months[0];
      const firstTime = firstMonth
        ? monthTimes[getMonthScopeKey(yearValue, firstMonth)] || {}
        : {};

      return {
        ...prevSchedule,
        monthly: {
          ...prevMonthly,
          months,
          activeMonth,
          monthDates,
          monthTimes,
          dates,
          startTime: firstTime.startTime || prevMonthly.startTime || "",
          endTime: firstTime.endTime || prevMonthly.endTime || "",
        },
      };
    });
  };

  const selectAllMonthlyMonths = () => {
    applyScheduleUpdate((prevSchedule) => {
      const prevMonthly = prevSchedule.monthly || {};
      const yearValue = Number(prevMonthly.year) || minScheduleYear;
      const selectableMonths = MONTH_OPTIONS.filter((month) =>
        isMonthSelectableForYear(yearValue, month.value, minScheduleDate)
      ).map((month) => month.value);

      const monthDates = { ...(prevMonthly.monthDates || {}) };
      const monthTimes = { ...(prevMonthly.monthTimes || {}) };
      selectableMonths.forEach((monthValue) => {
        const scopeKey = getMonthScopeKey(yearValue, monthValue);
        if (!Array.isArray(monthDates[scopeKey])) {
          monthDates[scopeKey] = [];
        }
        if (!monthTimes[scopeKey] || typeof monthTimes[scopeKey] !== "object") {
          monthTimes[scopeKey] = {
            startTime: prevMonthly.startTime || "",
            endTime: prevMonthly.endTime || "",
          };
        }
      });

      const firstMonth = selectableMonths[0];
      const firstTime = firstMonth
        ? monthTimes[getMonthScopeKey(yearValue, firstMonth)] || {}
        : {};

      return {
        ...prevSchedule,
        monthly: {
          ...prevMonthly,
          months: selectableMonths,
          activeMonth: Number(prevMonthly.activeMonth) || selectableMonths[0] || null,
          monthDates,
          monthTimes,
          dates: buildLegacyDates(selectableMonths, monthDates, yearValue),
          startTime: firstTime.startTime || prevMonthly.startTime || "",
          endTime: firstTime.endTime || prevMonthly.endTime || "",
        },
      };
    });
  };

  const clearMonthlyMonths = () => {
    applyScheduleUpdate((prevSchedule) => ({
      ...prevSchedule,
      monthly: {
        ...prevSchedule.monthly,
        months: [],
        activeMonth: null,
        monthDates: {},
        monthTimes: {},
        dates: [],
        startTime: "",
        endTime: "",
      },
    }));
  };

  return (
    <div className="space-y-5">
      {frequency === "one-time" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              min={minScheduleDate}
              value={oneTime.date}
              onChange={(event) => setOneTimeField("date", event.target.value)}
              className={inputClass}
            />
            {errors.scheduleDate && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleDate}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Start Time</label>
            <TimeTextField
              value={oneTime.startTime}
              onChange={(value) => setOneTimeField("startTime", value)}
              className={inputClass}
            />
            {errors.scheduleStartTime && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleStartTime}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>End Time</label>
            <TimeTextField
              value={oneTime.endTime}
              onChange={(value) => setOneTimeField("endTime", value)}
              className={inputClass}
            />
            {errors.scheduleEndTime && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleEndTime}</p>
            )}
          </div>
        </div>
      )}

      {frequency === "weekly" && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Days of Week</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {WEEKDAY_OPTIONS.map((weekday) => {
                const selected = weekly.days.includes(weekday.value);
                return (
                  <button
                    key={weekday.value}
                    type="button"
                    onClick={() => toggleWeeklyDay(weekday.value)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {weekday.label.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {errors.scheduleDays && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleDays}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Start Time</label>
              <TimeTextField
                value={weekly.startTime}
                onChange={(value) => setWeeklyField("startTime", value)}
                className={inputClass}
              />
              {errors.scheduleStartTime && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleStartTime}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <TimeTextField
                value={weekly.endTime}
                onChange={(value) => setWeeklyField("endTime", value)}
                className={inputClass}
              />
              {errors.scheduleEndTime && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleEndTime}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Repeat Until</label>
              <input
                type="date"
                min={minScheduleDate}
                value={weekly.repeatUntil}
                onChange={(event) => setWeeklyField("repeatUntil", event.target.value)}
                className={inputClass}
              />
              {errors.scheduleDate && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleDate}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {frequency === "monthly" && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Pattern</label>
            <div className="flex flex-wrap gap-3">
              {MONTHLY_PATTERN_OPTIONS.map((pattern) => {
                const selected = monthly.patternType === pattern.value;
                return (
                  <button
                    key={pattern.value}
                    type="button"
                    onClick={() => setMonthlyField("patternType", pattern.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                      selected
                        ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {pattern.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelClass}>Year</label>
            <select
              value={selectedYear}
              onChange={(event) => setMonthlyYear(event.target.value)}
              className={`${inputClass} md:max-w-xs`}
            >
              {yearOptions.map((yearValue) => (
                <option key={yearValue} value={yearValue}>
                  {yearValue}
                </option>
              ))}
            </select>
            {errors.scheduleMonthlyYear && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleMonthlyYear}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className={labelClass}>Months</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllMonthlyMonths}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearMonthlyMonths}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MONTH_OPTIONS.map((month) => {
                const selected = visibleSelectedMonths.includes(month.value);
                const selectable = selectableMonthValues.includes(month.value);
                return (
                  <button
                    key={month.value}
                    type="button"
                    disabled={!selectable}
                    onClick={() => toggleMonthlyMonth(month.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
            {errors.scheduleMonthlyMonths && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleMonthlyMonths}</p>
            )}
          </div>

          {monthly.patternType === "specific_dates" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Pick Month To Set Dates</label>
                {visibleSelectedMonths.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Select at least one month first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {visibleSelectedMonths.map((monthValue) => {
                      const monthOption = MONTH_OPTIONS.find(
                        (month) => month.value === monthValue
                      );
                      const monthDates = resolveMonthDates(monthValue).filter((dateValue) =>
                        isMonthDateSelectable(
                          selectedYear,
                          monthValue,
                          dateValue,
                          minScheduleDate
                        )
                      );
                      const selected = monthValue === resolvedActiveMonth;
                      return (
                        <button
                          key={monthValue}
                          type="button"
                          onClick={() => setMonthlyActiveMonth(monthValue)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            selected
                              ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {monthOption?.label || monthValue} ({monthDates.length})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Specific Date(s)
                </label>
                <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {activeMonthLabel || "Month"} {selectedYear}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigateActiveMonth(-1)}
                        disabled={!hasPreviousActiveMonth}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateActiveMonth(1)}
                        disabled={!hasNextActiveMonth}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {!resolvedActiveMonth ? (
                    <p className="text-sm text-gray-500">Select a month to set dates.</p>
                  ) : (
                    <>
                      <div className="mb-2 grid grid-cols-7 gap-1">
                        {calendarWeekdays.map((day, index) => (
                          <div
                            key={`${day}-${index}`}
                            className="h-8 text-center text-xs font-semibold text-gray-500"
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {leadingEmptyDays.map((slot) => (
                          <span key={`leading-${slot}`} aria-hidden="true" className="h-9" />
                        ))}
                        {Array.from({ length: activeMonthDays }, (_, index) => index + 1).map(
                          (dateValue) => {
                            const selected = activeMonthDates.includes(dateValue);
                            const selectable = isMonthDateSelectable(
                              selectedYear,
                              resolvedActiveMonth,
                              dateValue,
                              minScheduleDate
                            );

                            return (
                              <button
                                key={dateValue}
                                type="button"
                                disabled={!selectable}
                                onClick={() => toggleMonthlyDate(dateValue)}
                                className={`h-9 rounded-lg border text-xs font-semibold transition ${
                                  selected
                                    ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                } disabled:cursor-not-allowed disabled:opacity-40`}
                              >
                                {dateValue}
                              </button>
                            );
                          }
                        )}
                        {trailingEmptyDays.map((slot) => (
                          <span key={`trailing-${slot}`} aria-hidden="true" className="h-9" />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {errors.scheduleMonthlyDates && (
                  <p className="mt-1 text-xs text-red-600">{errors.scheduleMonthlyDates}</p>
                )}
              </div>
            </div>
          )}

          {monthly.patternType === "weekday_pattern" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Week</label>
                <select
                  value={monthly.week}
                  onChange={(event) => setMonthlyField("week", event.target.value)}
                  className={inputClass}
                >
                  {MONTHLY_WEEK_OPTIONS.map((week) => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Day</label>
                <select
                  value={monthly.day}
                  onChange={(event) => setMonthlyField("day", event.target.value)}
                  className={inputClass}
                >
                  {WEEKDAY_OPTIONS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.scheduleMonthlyPattern && (
                <p className="md:col-span-2 mt-1 text-xs text-red-600">
                  {errors.scheduleMonthlyPattern}
                </p>
              )}
            </div>
          )}

          <div>
            <label className={labelClass}>Month-wise Time</label>
            {visibleSelectedMonths.length === 0 ? (
              <p className="text-xs text-gray-500">
                Select month(s) to set start and end time for each.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleSelectedMonths.map((monthValue) => {
                  const monthOption = MONTH_OPTIONS.find(
                    (month) => month.value === monthValue
                  );
                  const monthTime = resolveMonthTime(monthValue);
                  return (
                    <div
                      key={monthValue}
                      className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-[120px,1fr,1fr]"
                    >
                      <div className="self-center text-sm font-semibold text-gray-800">
                        {monthOption?.label} {selectedYear}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                          Start Time
                        </label>
                        <TimeTextField
                          value={monthTime.startTime}
                          onChange={(value) =>
                            setMonthlyMonthTime(monthValue, "startTime", value)
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                          End Time
                        </label>
                        <TimeTextField
                          value={monthTime.endTime}
                          onChange={(value) =>
                            setMonthlyMonthTime(monthValue, "endTime", value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.scheduleMonthlyTimes && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleMonthlyTimes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CleaningScheduleFields;
