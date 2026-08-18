import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import { getHabit, updateHabit, deleteHabit, toggleHabitActive } from '../api/habits';
import { HabitIconRenderer } from '../components/common/IconPicker';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HabitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [habit, setHabit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHabitDetail = useCallback(async () => {
    try {
      const data = await getHabit(id);
      setHabit(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load habit details.');
      navigate('/habits');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchHabitDetail();
  }, [fetchHabitDetail]);

  const handleEditSubmit = async (formData) => {
    try {
      await updateHabit(id, formData);
      toast.success('Habit updated successfully!');
      fetchHabitDetail();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update habit.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteHabit(id);
      toast.success('Habit deleted.');
      navigate('/habits');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete habit.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await toggleHabitActive(id);
      toast.success(res.message);
      fetchHabitDetail();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update active state.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading habit details..." />
      </div>
    );
  }

  if (!habit) return null;

  const stats = habit.stats || {};
  const recentLogs = habit.recent_logs || [];

  const frequencyLabel =
    habit.frequency === 'daily'
      ? 'Every day'
      : habit.selected_days && habit.selected_days.length > 0
      ? habit.selected_days
          .map((d) => DAY_NAMES[Number(d)])
          .filter(Boolean)
          .join(', ')
      : 'Selected days';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <div>
        <Link
          to="/habits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Habits</span>
        </Link>
      </div>

      {/* Habit Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
              <HabitIconRenderer iconName={habit.icon} className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 capitalize">
                  {habit.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                    habit.is_active
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {habit.is_active ? 'Active' : 'Paused'}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{habit.name}</h1>
              {habit.description && (
                <p className="text-sm text-slate-500 mt-1 max-w-xl">{habit.description}</p>
              )}
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleToggleActive}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                habit.is_active
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {habit.is_active ? 'Pause Habit' : 'Activate Habit'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Edit Habit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors"
              title="Delete Habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              Frequency
            </span>
            <span className="font-medium text-slate-800">{frequencyLabel}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              Target / Goal
            </span>
            <span className="font-medium text-slate-800">
              {habit.is_measurable ? `${habit.target} ${habit.unit} / day` : 'Completion (Done/Not Done)'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              Started On
            </span>
            <span className="font-medium text-slate-800">{habit.start_date}</span>
          </div>
        </div>
      </div>

      {/* 4 Analytics Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.current_streak || 0} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Consecutive scheduled days</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Longest Streak</span>
            <Trophy className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.longest_streak || 0} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Personal all-time best</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">30-Day Rate</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats.completion_rate_30d || 0}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Last 30 scheduled days</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Completed</span>
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.total_completed_days || 0} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Lifetime total completions</p>
        </div>
      </div>

      {/* Completion Log History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Recent Activity & Logs</h2>
        <p className="text-xs text-slate-500 mb-6">Showing recent tracking history for this habit.</p>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-sm">
            No activity logs recorded yet. Complete this habit in the Dashboard or Weekly Tracker to build history!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log) => {
              const isDone = log.is_completed || log.is_done;
              return (
                <div key={log.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : '○'}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-slate-800">{log.date}</span>
                      {habit.is_measurable && log.value !== null && (
                        <p className="text-xs text-slate-500">
                          Recorded: {log.value} / {habit.target} {habit.unit}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Logged / Incomplete'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Habit Modal */}
      <HabitFormModal
        isOpen={isEditModalOpen}
        habit={habit}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={`Delete "${habit.name}"?`}
        message="Deleting this habit will permanently remove all of its associated completion logs and streak statistics."
        confirmText="Delete Habit"
        isLoading={isDeleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
