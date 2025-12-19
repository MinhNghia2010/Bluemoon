'use client'

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference on mount
    const stored = localStorage.getItem('bluemoon-theme');
    const initialDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(initialDark);
    
    if (initialDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bluemoon-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bluemoon-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Moon className="size-5 text-text-secondary" />
      ) : (
        <Sun className="size-5 text-text-secondary" />
      )}
    </button>
  );
}
