import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium text-slate-500">
          Momentum &copy; {new Date().getFullYear()} — Full-Stack Habit Tracker
        </p>
        <p className="text-slate-400">
          Designed with React, Tailwind CSS & Django REST Framework
        </p>
      </div>
    </footer>
  );
};
