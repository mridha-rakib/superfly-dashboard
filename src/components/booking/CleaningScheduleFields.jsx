import {
  MONTH_OPTIONS,
  MONTHLY_PATTERN_OPTIONS,
  MONTHLY_WEEK_OPTIONS,
  WEEKDAY_OPTIONS,
  createInitialCleaningScheduleState,
  getMaxDayForMonths,
} from "../../lib/cleaningSchedule";

const labelClass = "text-sm font-semibold text-gray-800 mb-2";
const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#C85344] focus:ring-2 focus:ring-[#C85344]/20 transition";

function CleaningScheduleFields({ frequency, schedule, errors, onScheduleChange }) {
  const safeSchedule = schedule || createInitialCleaningScheduleState();
  const oneTime = safeSchedule.oneTime;
  const weekly = safeSchedule.weekly;
  const monthly = safeSchedule.monthly;
  const defaultMonthValues = MONTH_OPTIONS.map((month) => month.value);
  const selectedMonths = Array.isArray(monthly.months)
    ? monthly.months
    : defaultMonthValues;
  const maxMonthlyDate = getMaxDayForMonths(selectedMonths);

  const applyScheduleUpdate = (updater) => {
    onScheduleChange((prevSchedule) => {
      const base = prevSchedule || createInitialCleaningScheduleState();
      return updater(base);
    });
  };

  const setOneTimeField = (field, value) => {
    applyScheduleUpdate((prevSchedule) => ({
      ...prevSchedule,
      oneTime: {
        ...prevSchedule.oneTime,
        [field]: value,
      },
    }));
  };

  const setWeeklyField = (field, value) => {
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

  const toggleMonthlyDate = (date) => {
    applyScheduleUpdate((prevSchedule) => {
      const exists = prevSchedule.monthly.dates.includes(date);
      const dates = exists
        ? prevSchedule.monthly.dates.filter((value) => value !== date)
        : [...prevSchedule.monthly.dates, date];

      return {
        ...prevSchedule,
        monthly: {
          ...prevSchedule.monthly,
          dates,
        },
      };
    });
  };

  const toggleMonthlyMonth = (monthValue) => {
    applyScheduleUpdate((prevSchedule) => {
      const currentMonths = Array.isArray(prevSchedule.monthly.months)
        ? prevSchedule.monthly.months
        : defaultMonthValues;
      const exists = currentMonths.includes(monthValue);
      const months = exists
        ? currentMonths.filter((value) => value !== monthValue)
        : [...currentMonths, monthValue].sort((a, b) => a - b);
      const maxDayForMonths = getMaxDayForMonths(months);
      const dates = (prevSchedule.monthly.dates || []).filter(
        (value) => Number(value) <= maxDayForMonths
      );

      return {
        ...prevSchedule,
        monthly: {
          ...prevSchedule.monthly,
          months,
          dates,
        },
      };
    });
  };

  const selectAllMonthlyMonths = () => {
    setMonthlyField("months", defaultMonthValues);
  };

  return (
    <div className="space-y-5">
      {frequency === "one-time" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
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
            <input
              type="time"
              value={oneTime.startTime}
              onChange={(event) => setOneTimeField("startTime", event.target.value)}
              className={inputClass}
            />
            {errors.scheduleStartTime && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduleStartTime}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>End Time</label>
            <input
              type="time"
              value={oneTime.endTime}
              onChange={(event) => setOneTimeField("endTime", event.target.value)}
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
              <input
                type="time"
                value={weekly.startTime}
                onChange={(event) => setWeeklyField("startTime", event.target.value)}
                className={inputClass}
              />
              {errors.scheduleStartTime && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleStartTime}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="time"
                value={weekly.endTime}
                onChange={(event) => setWeeklyField("endTime", event.target.value)}
                className={inputClass}
              />
              {errors.scheduleEndTime && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleEndTime}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Repeat Until (Optional)</label>
              <input
                type="date"
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
                  onClick={() => setMonthlyField("months", [])}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MONTH_OPTIONS.map((month) => {
                const selected = selectedMonths.includes(month.value);
                return (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => toggleMonthlyMonth(month.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
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
            <div>
              <label className={labelClass}>Specific Date(s) of Month</label>
              <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-12 gap-2">
                {Array.from({ length: maxMonthlyDate }, (_, index) => index + 1).map((date) => {
                  const selected = monthly.dates.includes(date);
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => toggleMonthlyDate(date)}
                      className={`h-9 rounded-lg border text-xs font-semibold transition ${
                        selected
                          ? "border-[#C85344] bg-[#C85344]/10 text-[#C85344]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
              {errors.scheduleMonthlyDates && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleMonthlyDates}</p>
              )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time</label>
              <input
                type="time"
                value={monthly.startTime}
                onChange={(event) => setMonthlyField("startTime", event.target.value)}
                className={inputClass}
              />
              {errors.scheduleStartTime && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleStartTime}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="time"
                value={monthly.endTime}
                onChange={(event) => setMonthlyField("endTime", event.target.value)}
                className={inputClass}
              />
              {errors.scheduleEndTime && (
                <p className="mt-1 text-xs text-red-600">{errors.scheduleEndTime}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CleaningScheduleFields;
