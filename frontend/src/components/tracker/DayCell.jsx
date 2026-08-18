import React from 'react';
import { Check, Minus } from 'lucide-react';

export const DayCell = ({
  habit,
  cell,
  onToggleSimple,
  onOpenMeasurableModal,
  isToday = false,
}) => {
  const { is_scheduled, is_done, value, is_completed, date } = cell;

  // Case 1: Non-scheduled day
  if (!is_scheduled) {
    return (
      <div
        className={`h-14 flex items-center justify-center text-slate-300 text-sm font-medium ${
          isToday ? 'bg-emerald-50/30' : ''
        }`}
        title="Rest day (Not scheduled)"
      >
        <Minus className="w-4 h-4 opacity-40" />
      </div>
    );
  }

  // Case 2: Measurable habit
  if (habit.is_measurable) {
    const target = habit.target || 1;
    const currentVal = value !== null && value !== undefined ? value : 0;
    const isFull = is_completed || currentVal >= target;
    const isPartial = currentVal > 0 && !isFull;

    return (
      <div
        className={`h-14 flex items-center justify-center p-1.5 ${
          isToday ? 'bg-emerald-50/40' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => onOpenMeasurableModal(habit, date, currentVal, is_done)}
          className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all transform active:scale-95 ${
            isFull
              ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 ring-2 ring-emerald-600/20'
              : isPartial
              ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              : 'bg-white border border-slate-200/80 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
          }`}
          title={`Log progress: ${currentVal} / ${target} ${habit.unit}`}
        >
          <span>{currentVal}/{target}</span>
          <span className="text-[9px] font-normal uppercase tracking-wider opacity-80 truncate max-w-[45px]">
            {habit.unit}
          </span>
        </button>
      </div>
    );
  }

  // Case 3: Simple habit (Done / Not Done)
  return (
    <div
      className={`h-14 flex items-center justify-center p-1.5 ${
        isToday ? 'bg-emerald-50/40' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleSimple(habit, date, !is_done)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all transform active:scale-90 ${
          is_done
            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 ring-2 ring-emerald-600/20'
            : 'border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 text-transparent'
        }`}
        title={is_done ? 'Completed! Click to uncheck' : 'Click to complete'}
      >
        <Check className={`w-5 h-5 stroke-[2.5] ${is_done ? 'opacity-100' : 'opacity-0'}`} />
      </button>
    </div>
  );
};
