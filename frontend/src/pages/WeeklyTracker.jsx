import React, { useState, useEffect, useCallback } from 'react';
import { WeekSelector } from '../components/tracker/WeekSelector';
import { WeeklyGrid } from '../components/tracker/WeeklyGrid';
import { LogValueModal } from '../components/habits/LogValueModal';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getWeeklyTracker, saveHabitLog } from '../api/logs';
import { createHabit } from '../api/habits';
import { useToast } from '../context/ToastContext';

export const WeeklyTracker = () => {
  const toast = useToast();

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    return monday.toISOString().split('T')[0];
  });

  const [matrixData, setMatrixData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [logModalData, setLogModalData] = useState(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  const fetchMatrix = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getWeeklyTracker(startDate);
      setMatrixData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load weekly tracking matrix.');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, toast]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // Navigate to previous week (subtract 7 days)
  const handlePreviousWeek = () => {
    const curr = new Date(startDate + 'T00:00:00');
    curr.setDate(curr.getDate() - 7);
    setStartDate(curr.toISOString().split('T')[0]);
  };

  // Navigate to next week (add 7 days)
  const handleNextWeek = () => {
    const curr = new Date(startDate + 'T00:00:00');
    curr.setDate(curr.getDate() + 7);
    setStartDate(curr.toISOString().split('T')[0]);
  };

  // Jump to current week
  const handleCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    setStartDate(monday.toISOString().split('T')[0]);
  };

  // Check if viewing current week
  const isCurrentWeek = (() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - dayOfWeek);
    return currentMonday.toISOString().split('T')[0] === startDate;
  })();

  // Toggle simple habit cell
  const handleToggleSimple = async (habit, date, nextDone) => {
    // Optimistically update the cell in matrixData
    setMatrixData((prev) => {
      if (!prev) return prev;
      const updatedHabits = prev.habits.map((h) => {
        if (h.id === habit.id) {
          const updatedDays = h.days.map((d) => {
            if (d.date === date) {
              return { ...d, is_done: nextDone, is_completed: nextDone };
            }
            return d;
          });
          return { ...h, days: updatedDays };
        }
        return h;
      });
      return { ...prev, habits: updatedHabits };
    });

    try {
      await saveHabitLog({
        habit: habit.id,
        date,
        is_done: nextDone,
        value: null,
      });
      // Background reload to update streaks accurately
      const refreshed = await getWeeklyTracker(startDate);
      setMatrixData(refreshed);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update habit log.');
      fetchMatrix(); // Revert on failure
    }
  };

  // Open modal for measurable habit cell
  const handleOpenMeasurableModal = (habit, date, currentValue, currentDone) => {
    setLogModalData({
      habit,
      date,
      initialValue: currentValue,
      initialDone: currentDone,
    });
  };

  // Save measurable log
  const handleSaveMeasurableLog = async (logPayload) => {
    try {
      await saveHabitLog(logPayload);
      toast.success('Progress saved!');
      const refreshed = await getWeeklyTracker(startDate);
      setMatrixData(refreshed);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save progress.');
    }
  };

  // Create habit
  const handleCreateHabit = async (habitData) => {
    try {
      await createHabit(habitData);
      toast.success('Habit created successfully!');
      fetchMatrix();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create habit.');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Selector Bar */}
      <WeekSelector
        startDate={matrixData?.start_date || startDate}
        endDate={matrixData?.end_date}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
        isCurrentWeek={isCurrentWeek}
      />

      {/* Main Weekly Tracker Matrix */}
      {isLoading ? (
        <div className="py-24 bg-white border border-slate-200/80 rounded-2xl">
          <LoadingSpinner size="lg" text="Loading tracking grid..." />
        </div>
      ) : (
        <WeeklyGrid
          matrixData={matrixData}
          onToggleSimple={handleToggleSimple}
          onOpenMeasurableModal={handleOpenMeasurableModal}
          onCreateHabit={() => setIsHabitModalOpen(true)}
        />
      )}

      {/* Legend / Guide */}
      <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-white/70 border border-slate-200/60 rounded-2xl text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
            ✓
          </div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
            4/8
          </div>
          <span>Measurable Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
            ○
          </div>
          <span>Scheduled / Incomplete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center text-slate-300 font-bold">
            —
          </div>
          <span>Non-scheduled (Rest Day)</span>
        </div>
      </div>

      {/* Measurable Log Value Modal */}
      {logModalData && (
        <LogValueModal
          isOpen={!!logModalData}
          onClose={() => setLogModalData(null)}
          habit={logModalData.habit}
          date={logModalData.date}
          initialValue={logModalData.initialValue}
          initialDone={logModalData.initialDone}
          onSave={handleSaveMeasurableLog}
        />
      )}

      {/* Habit Create Modal */}
      <HabitFormModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSubmit={handleCreateHabit}
      />
    </div>
  );
};
