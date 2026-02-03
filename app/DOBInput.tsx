import React, { useState, useEffect, useCallback } from 'react';

interface DOBInputProps {
  id?: string;
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
}

const DOBInput: React.FC<DOBInputProps> = ({ id, value, onChange, disabled, ariaLabel }) => {
  const getPartsFromValue = (val: string): [number | undefined, number | undefined, number | undefined] => {
    if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return [undefined, undefined, undefined];
    }
    const parts = val.split('-').map(s => parseInt(s, 10));
    return [parts[0], parts[1], parts[2]];
  };

  const [initialYear, initialMonth, initialDay] = getPartsFromValue(value);
  const [year, setYear] = useState<number | undefined>(initialYear);
  const [month, setMonth] = useState<number | undefined>(initialMonth);
  const [day, setDay] = useState<number | undefined>(initialDay);

  useEffect(() => {
    const [y, m, d] = getPartsFromValue(value);
    setYear(y);
    setMonth(m);
    setDay(d);
  }, [value]);

  const triggerChange = useCallback((y?: number, m?: number, d?: number) => {
    if (y && m && d) {
      const formattedDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (formattedDate !== value) {
        onChange(formattedDate);
      }
    } else {
      if (value !== "") {
        onChange("");
      }
    }
  }, [value, onChange]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newYear = val ? parseInt(val, 10) : undefined;
    setYear(newYear);
    let newDay = day;
    if (newYear && month && day) {
      const daysInMonth = new Date(newYear, month, 0).getDate();
      if (day > daysInMonth) {
        newDay = daysInMonth;
        setDay(newDay);
      }
    }
    triggerChange(newYear, month, newDay);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newMonth = val ? parseInt(val, 10) : undefined;
    setMonth(newMonth);
    let newDay = day;
    if (year && newMonth && day) {
      const daysInMonth = new Date(year, newMonth, 0).getDate();
      if (day > daysInMonth) {
        newDay = daysInMonth;
        setDay(newDay);
      }
    }
    triggerChange(year, newMonth, newDay);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newDay = val ? parseInt(val, 10) : undefined;
    setDay(newDay);
    triggerChange(year, month, newDay);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = (year && month) ? new Date(year, month, 0).getDate() : 31;
  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectClasses = "flex-1 px-2 py-3 bg-gray-800/50 border-2 border-transparent focus:border-fuchsia-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all duration-300 disabled:opacity-50 disabled:bg-gray-800/80";

  return (
    <div className="flex w-full items-center gap-2" id={id} aria-label={ariaLabel}>
      <select value={year || ""} onChange={handleYearChange} disabled={disabled} className={selectClasses} aria-label="生まれた年">
        <option value="" disabled>年</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month || ""} onChange={handleMonthChange} disabled={disabled || !year} className={selectClasses} aria-label="生まれた月">
        <option value="" disabled>月</option>
        {months.map(m => <option key={m} value={m}>{m}月</option>)}
      </select>
      <select value={day || ""} onChange={handleDayChange} disabled={disabled || !month} className={selectClasses} aria-label="生まれた日">
        <option value="" disabled>日</option>
        {daysList.map(d => <option key={d} value={d}>{d}日</option>)}
      </select>
    </div>
  );
};

export default DOBInput;
