import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { HabitIconRenderer } from '../common/IconPicker';
import { Check, Plus, Minus } from 'lucide-react';

export const LogValueModal = ({
  isOpen,
  onClose,
  habit,
  date,
  initialValue = 0,
  initialDone = false,
  onSave,
}) => {
  const [value, setValue] = useState(initialValue || 0);
  const [isDone, setIsDone] = useState(initialDone || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValue(initialValue !== null && initialValue !== undefined ? initialValue : 0);
    setIsDone(initialDone || false);
  }, [initialValue, initialDone, isOpen]);

  if (!habit) return null;

  const target = habit.target || 1;
  const unit = habit.unit || 'units';

  const handleQuickAdd = (amount) => {
    const nextVal = Math.max(0, Number((value + amount).toFixed(2)));
    setValue(nextVal);
    if (nextVal >= target) {
      setIsDone(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const numVal = parseFloat(value) || 0;
      const completed = numVal >= target || isDone;
      await onSave({
        habit: habit.id,
        date,
        value: numVal,
        is_done: completed,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentage = Math.min(100, Math.round(((parseFloat(value) || 0) / target) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Progress: ${habit.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HabitIconRenderer iconName={habit.icon} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">{habit.name}</h4>
            <p className="text-xs text-slate-500">
              Target: <span className="font-medium text-slate-700">{target} {unit}</span> for {date}
            </p>
          </div>
        </div>

        {/* Progress Bar preview */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Progress: {value} / {target} {unit}</span>
            <span className={percentage >= 100 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60">
            <div
              className={`h-full transition-all duration-300 ${
                percentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Numeric Stepper & Direct input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Recorded Value ({unit})
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickAdd(-1)}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="flex-1 h-12 text-center text-xl font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleQuickAdd(1)}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setValue(0)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Reset (0)
          </button>
          <button
            type="button"
            onClick={() => setValue(Math.round(target / 2))}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Half ({Math.round(target / 2)})
          </button>
          <button
            type="button"
            onClick={() => {
              setValue(target);
              setIsDone(true);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
          >
            Complete ({target} {unit})
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
