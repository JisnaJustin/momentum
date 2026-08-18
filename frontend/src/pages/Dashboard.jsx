import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  TrendingUp,
  Clock,
  ArrowRight,
  ListTodo,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboardToday, saveHabitLog } from '../api/logs';
import { createHabit } from '../api/habits';
import { HabitIconRenderer } from '../components/common/IconPicker';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { LogValueModal } from '../components/habits/LogValueModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [logModalHabit, setLogModalHabit] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await getDashboardToday();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load today’s dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format today's date
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Toggle simple habit completion
  const handleToggleSimple = async (habit, nextDone) => {
    // Optimistic local update
    setDashboardData((prev) => {
      if (!prev) return prev;
      const updatedHabits = prev.today_habits.map((h) => {
        if (h.id === habit.id) {
          const updatedLog = { ...h.today_log, is_done: nextDone, is_completed: nextDone };
          return { ...h, today_log: updatedLog };
        }
        return h;
      });
      const completedCount = updatedHabits.filter((h) => h.today_log.is_completed).length;
      const scheduledCount = updatedHabits.length;
      const percentage = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;
      return {
        ...prev,
        today_habits: updatedHabits,
        completed_count: completedCount,
        remaining_count: Math.max(0, scheduledCount - completedCount),
        completion_percentage: percentage,
      };
    });

    try {
      await saveHabitLog({
        habit: habit.id,
        date: dashboardData.date,
        is_done: nextDone,
        value: null,
      });
      // Silent sync
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update habit log.');
      fetchDashboard(); // revert
    }
  };

  // Save measurable habit value
  const handleSaveMeasurableLog = async (logData) => {
    try {
      await saveHabitLog(logData);
      toast.success('Progress recorded!');
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save progress.');
    }
  };

  // Create habit from modal
  const handleCreateHabit = async (habitData) => {
    try {
      await createHabit(habitData);
      toast.success('Habit created successfully!');
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create habit.');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const {
    scheduled_count = 0,
    completed_count = 0,
    remaining_count = 0,
    completion_percentage = 0,
    today_habits = [],
    total_active_habits = 0,
  } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedToday}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.username} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {scheduled_count === 0
              ? 'No habits scheduled for today. Take a break or add a new goal!'
              : remaining_count === 0
              ? '🎉 Outstanding! You completed all your habits for today.'
              : `You have ${remaining_count} habit${remaining_count === 1 ? '' : 's'} remaining today. Keep going!`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHabitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
          <Link
            to="/tracker"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl transition-colors"
          >
            <span>Weekly Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Today's Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {completion_percentage}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completion_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Completed Habits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {completed_count} <span className="text-sm font-medium text-slate-400">/ {scheduled_count}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Habits done today</p>
          </div>
        </div>

        {/* Card 3: Remaining Habits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {remaining_count}
            </div>
            <p className="text-xs text-slate-400 mt-1">Pending for today</p>
          </div>
        </div>

        {/* Card 4: Total Active Habits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Habits</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {total_active_habits}
            </div>
            <p className="text-xs text-slate-400 mt-1">In your routine</p>
          </div>
        </div>
      </div>

      {/* Main Checklist: Today's Scheduled Habits */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Habits</h2>
            <p className="text-xs text-slate-500">
              Check off completed items or update measurable numbers.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {completed_count} of {scheduled_count} done
          </span>
        </div>

        {today_habits.length === 0 ? (
          total_active_habits === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="You haven't created any habits yet"
              description="Build momentum by establishing daily routines. Create your first habit now!"
              actionText="Create Habit"
              onAction={() => setIsHabitModalOpen(true)}
            />
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No habits scheduled for today"
              description="Enjoy your rest day! You can view your full weekly schedule in the Weekly Tracker."
              actionText="View Weekly Tracker"
              onAction={() => window.location.assign('/tracker')}
            />
          )
        ) : (
          <div className="space-y-3">
            {today_habits.map((habit) => {
              const isCompleted = habit.today_log?.is_completed;
              const isDone = habit.today_log?.is_done;
              const val = habit.today_log?.value || 0;

              return (
                <div
                  key={habit.id}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200/60'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Action button / Checkbox */}
                    {habit.is_measurable ? (
                      <button
                        type="button"
                        onClick={() =>
                          setLogModalHabit({
                            habit,
                            date: dashboardData.date,
                            initialValue: val,
                            initialDone: isDone,
                          })
                        }
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-transform active:scale-95 shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : val > 0
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'border-2 border-slate-300 text-slate-400 hover:border-emerald-500'
                        }`}
                        title="Click to log measurable progress"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span>{val}/{habit.target}</span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleSimple(habit, !isDone)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all transform active:scale-90 shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                        title={isDone ? 'Mark Incomplete' : 'Mark Done'}
                      >
                        <CheckCircle2 className={`w-6 h-6 ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/habits/${habit.id}`}
                          className={`font-semibold text-sm hover:text-emerald-600 transition-colors truncate ${
                            isCompleted ? 'text-slate-700 line-through decoration-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {habit.name}
                        </Link>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                          {habit.category}
                        </span>
                      </div>

                      {/* Subtitle / Progress */}
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {habit.is_measurable ? (
                          <span>
                            Progress:{' '}
                            <span className="font-semibold text-slate-700">
                              {val} / {habit.target} {habit.unit}
                            </span>
                          </span>
                        ) : (
                          <span>{habit.frequency === 'daily' ? 'Daily habit' : 'Selected days'}</span>
                        )}

                        {habit.current_streak > 0 && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {habit.current_streak}d streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action for measurable or details link */}
                  <div className="flex items-center gap-2 pl-3">
                    {habit.is_measurable && (
                      <button
                        type="button"
                        onClick={() =>
                          setLogModalHabit({
                            habit,
                            date: dashboardData.date,
                            initialValue: val,
                            initialDone: isDone,
                          })
                        }
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Log Value
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Habit Create Modal */}
      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSubmit={handleCreateHabit}
      />

      {/* Measurable Habit Value Log Modal */}
      {logModalHabit && (
        <LogValueModal
          isOpen={!!logModalHabit}
          onClose={() => setLogModalHabit(null)}
          habit={logModalHabit.habit}
          date={logModalHabit.date}
          initialValue={logModalHabit.initialValue}
          initialDone={logModalHabit.initialDone}
          onSave={handleSaveMeasurableLog}
        />
      )}
    </div>
  );
};
