import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const WeekSelector = ({
  startDate,
  endDate,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek = false,
}) => {
  const formatDateRange = (startStr, endStr) => {
    if (!startStr || !endStr) return '';
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');

    const startMonth = start.toLocaleString('default', { month: 'short' });
    const endMonth = end.toLocaleString('default', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">
            {formatDateRange(startDate, endDate)}
          </h2>
          <p className="text-xs text-slate-500">Weekly Habit Progress Matrix</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreviousWeek}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Previous Week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onCurrentWeek}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isCurrentWeek
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={onNextWeek}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Next Week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
