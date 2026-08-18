import React from 'react';
import { Link } from 'react-router-dom';
import { HabitIconRenderer } from '../common/IconPicker';
import { DayCell } from './DayCell';
import { Flame, Plus, Sparkles } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const WeeklyGrid = ({
  matrixData,
  onToggleSimple,
  onOpenMeasurableModal,
  onCreateHabit,
}) => {
  if (!matrixData || !matrixData.habits || matrixData.habits.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No active habits to track"
        description="You have no active habits for this period. Create your first habit to start filling your tracker!"
        actionText="Create Habit"
        onAction={onCreateHabit}
      />
    );
  }

  const { days_header, habits } = matrixData;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[700px]">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75">
              <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/3 min-w-[220px]">
                Habit
              </th>
              {days_header.map((day) => (
                <th
                  key={day.date}
                  className={`py-3 px-2 text-center text-xs font-semibold w-[9%] ${
                    day.is_today
                      ? 'bg-emerald-50/80 text-emerald-900 border-x border-emerald-200/60'
                      : 'text-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="uppercase text-[11px] font-bold text-slate-400">
                      {day.day_name}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold ${
                        day.is_today
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-700'
                      }`}
                    >
                      {day.day_number}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-slate-100">
            {habits.map((habit) => (
              <tr
                key={habit.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                {/* Habit Name Column */}
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <HabitIconRenderer iconName={habit.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/habits/${habit.id}`}
                        className="font-semibold text-sm text-slate-800 hover:text-emerald-600 transition-colors truncate block"
                      >
                        {habit.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-slate-400 capitalize">
                          {habit.category}
                        </span>
                        {habit.current_streak > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {habit.current_streak}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Day Cells */}
                {habit.days.map((cell, idx) => {
                  const headerDay = days_header[idx];
                  return (
                    <td
                      key={cell.date}
                      className={`p-0 text-center ${
                        headerDay?.is_today
                          ? 'bg-emerald-50/20 border-x border-emerald-100/60'
                          : ''
                      }`}
                    >
                      <DayCell
                        habit={habit}
                        cell={cell}
                        isToday={headerDay?.is_today}
                        onToggleSimple={onToggleSimple}
                        onOpenMeasurableModal={onOpenMeasurableModal}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
