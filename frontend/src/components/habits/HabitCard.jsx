import React from 'react';
import { Link } from 'react-router-dom';
import { HabitIconRenderer } from '../common/IconPicker';
import {
  Flame,
  Calendar,
  Target,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Power,
} from 'lucide-react';

const CATEGORY_COLORS = {
  health: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  fitness: 'bg-orange-50 text-orange-700 border-orange-200/80',
  study: 'bg-blue-50 text-blue-700 border-blue-200/80',
  personal: 'bg-purple-50 text-purple-700 border-purple-200/80',
  productivity: 'bg-amber-50 text-amber-700 border-amber-200/80',
  other: 'bg-slate-50 text-slate-700 border-slate-200/80',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HabitCard = ({
  habit,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const categoryStyle = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.other;

  const frequencyLabel =
    habit.frequency === 'daily'
      ? 'Every day'
      : habit.selected_days && habit.selected_days.length > 0
      ? habit.selected_days
          .map((d) => DAY_NAMES[Number(d)])
          .filter(Boolean)
          .join(', ')
      : 'Selected weekdays';

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all ${
        habit.is_active
          ? 'border-slate-200/80'
          : 'border-slate-200/60 bg-slate-50/40 opacity-75'
      }`}
    >
      {/* Top row: Icon, Category & Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
            <HabitIconRenderer iconName={habit.icon} className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${categoryStyle}`}
              >
                {habit.category}
              </span>
              {!habit.is_active && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                  Paused
                </span>
              )}
            </div>
            <Link
              to={`/habits/${habit.id}`}
              className="font-bold text-slate-800 text-base hover:text-emerald-600 transition-colors line-clamp-1 mt-0.5"
            >
              {habit.name}
            </Link>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleActive(habit.id)}
            title={habit.is_active ? 'Pause Habit' : 'Activate Habit'}
            className={`p-2 rounded-xl transition-colors ${
              habit.is_active
                ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                : 'text-amber-500 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(habit)}
            title="Edit Habit"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit)}
            title="Delete Habit"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description if present */}
      {habit.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
          {habit.description}
        </p>
      )}

      {/* Meta tags (Frequency & Target) */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 border border-slate-200/50">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{frequencyLabel}</span>
        </div>
        {habit.is_measurable && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-700">
            <Target className="w-3.5 h-3.5" />
            <span>
              {habit.target} {habit.unit} / day
            </span>
          </div>
        )}
      </div>

      {/* Footer stats row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Flame className={`w-4 h-4 ${habit.current_streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
            <span>{habit.current_streak || 0}d streak</span>
          </div>

          {/* 30-Day Rate */}
          <div className="flex items-center gap-1 text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{habit.completion_rate_30d || 0}% rate</span>
          </div>
        </div>

        <Link
          to={`/habits/${habit.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
