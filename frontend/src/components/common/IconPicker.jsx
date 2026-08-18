import React from 'react';
import {
  Sparkles,
  Droplets,
  Dumbbell,
  BookOpen,
  Brain,
  Heart,
  Sun,
  Moon,
  Flame,
  Code,
  Music,
  Target,
  Bike,
  Coffee,
  Zap,
  Smile,
  CheckCircle2,
  Trophy,
  Apple,
  Bed,
} from 'lucide-react';

export const HABIT_ICONS = {
  sparkles: { label: 'Sparkles', component: Sparkles },
  droplets: { label: 'Water / Hydration', component: Droplets },
  dumbbell: { label: 'Fitness / Workout', component: Dumbbell },
  book: { label: 'Reading / Study', component: BookOpen },
  brain: { label: 'Mindfulness / Focus', component: Brain },
  heart: { label: 'Health / Cardio', component: Heart },
  sun: { label: 'Morning Routine', component: Sun },
  moon: { label: 'Sleep / Night', component: Moon },
  flame: { label: 'Streak / High Energy', component: Flame },
  code: { label: 'Coding / Skills', component: Code },
  music: { label: 'Music / Creativity', component: Music },
  target: { label: 'Goal / Target', component: Target },
  bike: { label: 'Cycling / Outdoors', component: Bike },
  coffee: { label: 'Nutrition / Break', component: Coffee },
  zap: { label: 'Productivity / Quick', component: Zap },
  smile: { label: 'Wellbeing / Mood', component: Smile },
  apple: { label: 'Healthy Eating', component: Apple },
  bed: { label: 'Rest / Recovery', component: Bed },
  trophy: { label: 'Milestone', component: Trophy },
  check: { label: 'Standard Task', component: CheckCircle2 },
};

export const HabitIconRenderer = ({ iconName, className = "w-5 h-5", ...props }) => {
  const iconObj = HABIT_ICONS[iconName] || HABIT_ICONS.sparkles;
  const Component = iconObj.component;
  return <Component className={className} {...props} />;
};

export const IconPicker = ({ selectedIcon, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Choose Icon
      </label>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
        {Object.entries(HABIT_ICONS).map(([key, { label, component: Icon }]) => {
          const isSelected = selectedIcon === key;
          return (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => onSelect(key)}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-2'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
