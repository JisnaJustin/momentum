import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { IconPicker } from '../common/IconPicker';
import { Sparkles, Calendar, Check, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'health', label: 'Health' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'study', label: 'Study' },
  { id: 'personal', label: 'Personal' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'other', label: 'Other' },
];

const WEEKDAYS = [
  { idx: 0, label: 'M', full: 'Mon' },
  { idx: 1, label: 'T', full: 'Tue' },
  { idx: 2, label: 'W', full: 'Wed' },
  { idx: 3, label: 'T', full: 'Thu' },
  { idx: 4, label: 'F', full: 'Fri' },
  { idx: 5, label: 'S', full: 'Sat' },
  { idx: 6, label: 'S', full: 'Sun' },
];

export const HabitFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  habit = null, // if provided, we are in Edit mode
}) => {
  const isEdit = !!habit;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [icon, setIcon] = useState('sparkles');
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4]); // Mon-Fri default
  const [isMeasurable, setIsMeasurable] = useState(false);
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setCategory(habit.category || 'personal');
      setIcon(habit.icon || 'sparkles');
      setFrequency(habit.frequency || 'daily');
      setSelectedDays(habit.selected_days || [0, 1, 2, 3, 4]);
      setIsMeasurable(habit.is_measurable || !!(habit.target && habit.target > 0));
      setTarget(habit.target ? String(habit.target) : '');
      setUnit(habit.unit || '');
      setStartDate(habit.start_date || new Date().toISOString().split('T')[0]);
      setIsActive(habit.is_active !== undefined ? habit.is_active : true);
    } else {
      setName('');
      setDescription('');
      setCategory('personal');
      setIcon('sparkles');
      setFrequency('daily');
      setSelectedDays([0, 1, 2, 3, 4]);
      setIsMeasurable(false);
      setTarget('');
      setUnit('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setIsActive(true);
    }
    setErrors({});
  }, [habit, isOpen]);

  const toggleDay = (dayIdx) => {
    setSelectedDays((prev) =>
      prev.includes(dayIdx)
        ? prev.filter((d) => d !== dayIdx)
        : [...prev, dayIdx].sort((a, b) => a - b)
    );
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Habit name is required.';
    }
    if (frequency === 'selected_days' && selectedDays.length === 0) {
      errs.selectedDays = 'Please select at least one day.';
    }
    if (isMeasurable) {
      const numTarget = parseFloat(target);
      if (!target || isNaN(numTarget) || numTarget <= 0) {
        errs.target = 'Target must be a positive number greater than 0.';
      }
      if (!unit.trim()) {
        errs.unit = 'Unit is required for measurable habits (e.g. pages, glasses, mins).';
      }
    }
    if (!startDate) {
      errs.startDate = 'Start date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        frequency,
        selected_days: frequency === 'selected_days' ? selectedDays : [],
        target: isMeasurable ? parseFloat(target) : null,
        unit: isMeasurable ? unit.trim() : '',
        start_date: startDate,
        is_active: isActive,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const backendErrs = {};
        Object.entries(err.response.data).forEach(([key, val]) => {
          backendErrs[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setErrors(backendErrs);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Habit' : 'Create New Habit'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Habit Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Habit Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Read 10 Pages, Drink Water, Morning Walk..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
              errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
            </p>
          )}
        </div>

        {/* Category & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.startDate}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Description / Motivation <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows="2"
            placeholder="Why is this habit important to you?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Icon Picker */}
        <IconPicker selectedIcon={icon} onSelect={setIcon} />

        {/* Frequency & Days */}
        <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Frequency
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFrequency('daily')}
              className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                frequency === 'daily'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Every Day
            </button>
            <button
              type="button"
              onClick={() => setFrequency('selected_days')}
              className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                frequency === 'selected_days'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Selected Weekdays
            </button>
          </div>

          {frequency === 'selected_days' && (
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Choose active days:
              </p>
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {WEEKDAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.idx);
                  return (
                    <button
                      key={day.idx}
                      type="button"
                      onClick={() => toggleDay(day.idx)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title={day.full}
                    >
                      <span className="sm:hidden">{day.label}</span>
                      <span className="hidden sm:inline">{day.full}</span>
                    </button>
                  );
                })}
              </div>
              {errors.selectedDays && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.selectedDays}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Measurable Target Toggle */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Track Measurable Target?</p>
              <p className="text-xs text-slate-500">
                Track numeric metrics like glasses of water, pages read, or minutes exercised.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMeasurable}
                onChange={(e) => setIsMeasurable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {isMeasurable && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Daily Target *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  placeholder="e.g. 8, 10, 30"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {errors.target && (
                  <p className="mt-1 text-xs text-rose-600">{errors.target}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  placeholder="glasses, pages, mins, km"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {errors.unit && (
                  <p className="mt-1 text-xs text-rose-600">{errors.unit}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active / Inactive switch in edit mode */}
        {isEdit && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-800">Habit Active Status</p>
              <p className="text-xs text-slate-500">Deactivated habits are paused and hidden from daily checklist.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        )}

        {/* Modal Actions */}
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
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
