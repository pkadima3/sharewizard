
import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' && <Sun size={20} className="text-amber-500" />}
        {theme === 'dark' && <Moon size={20} className="text-indigo-400" />}
        {theme === 'system' && <Laptop size={20} className="text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full transition-colors ${
          theme === 'light' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Light theme"
      >
        <Sun size={20} className={theme === 'light' ? 'text-amber-500' : 'text-gray-600 dark:text-gray-300'} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full transition-colors ${
          theme === 'dark' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Dark theme"
      >
        <Moon size={20} className={theme === 'dark' ? 'text-indigo-400' : 'text-gray-600 dark:text-gray-300'} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full transition-colors ${
          theme === 'system' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="System theme"
      >
        <Laptop size={20} className={theme === 'system' ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'} />
      </button>
    </div>
  );
};

export default ThemeToggle;
