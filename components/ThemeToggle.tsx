'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted on client so we don't get hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a blank placeholder of the exact same size before the component mounts
  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse" />;
  }

  // Force strict boolean checking
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-ondhokar-border dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm dark:shadow-none"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      )}
    </button>
  );
}