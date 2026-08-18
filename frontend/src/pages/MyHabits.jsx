import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  ListTodo,
  AlertCircle,
} from 'lucide-react';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitActive,
} from '../api/habits';
import { useToast } from '../context/ToastContext';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitFormModal } from '../components/habits/HabitFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Categories' },
  { id: 'health', label: 'Health' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'study', label: 'Study' },
  { id: 'personal', label: 'Personal' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'other', label: 'Other' },
];

export const MyHabits = () => {
  const toast = useToast();

  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'paused'

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHabitsList = useCallback(async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (statusFilter === 'active') params.is_active = 'true';
      if (statusFilter === 'paused') params.is_active = 'false';
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await getHabits(params);
      setHabits(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load habits.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, statusFilter, searchQuery, toast]);

  useEffect(() => {
    fetchHabitsList();
  }, [fetchHabitsList]);

  // Handle create or update submit
  const handleFormSubmit = async (formData) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, formData);
      toast.success('Habit updated successfully!');
    } else {
      await createHabit(formData);
      toast.success('Habit created successfully!');
    }
    fetchHabitsList();
  };

  // Handle active/paused toggle
  const handleToggleActive = async (habitId) => {
    try {
      const res = await toggleHabitActive(habitId);
      toast.success(res.message);
      fetchHabitsList();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update habit status.');
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingHabit) return;
    setIsDeleting(true);
    try {
      await deleteHabit(deletingHabit.id);
      toast.success(`Habit "${deletingHabit.name}" deleted.`);
      setDeletingHabit(null);
      fetchHabitsList();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete habit.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Habits
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, customize, and organize all your routines in one place.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingHabit(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search habits by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'paused'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Paused
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Cards Grid */}
      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading habits..." />
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' ? 'No habits found' : 'You haven’t created any habits yet'}
          description={
            searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Try changing your search query or filter settings.'
              : 'Start your journey by creating your first daily or weekly habit.'
          }
          actionText={searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' ? 'Reset Filters' : 'Create Habit'}
          onAction={
            searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? () => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }
              : () => {
                  setEditingHabit(null);
                  setIsFormModalOpen(true);
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={(h) => {
                setEditingHabit(h);
                setIsFormModalOpen(true);
              }}
              onDelete={(h) => setDeletingHabit(h)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitFormModal
        isOpen={isFormModalOpen}
        habit={editingHabit}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingHabit}
        title={`Delete "${deletingHabit?.name}"?`}
        message="Deleting this habit will permanently remove all of its associated completion logs and streak history. This action cannot be reversed."
        confirmText="Delete Habit"
        isLoading={isDeleting}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
