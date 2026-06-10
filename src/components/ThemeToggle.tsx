import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon, SunMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Mode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'theme-mode';

// "Авто" = тёмная тема в тёмное время суток.
const isNight = () => {
  const h = new Date().getHours();
  return h < 7 || h >= 20;
};

export const ThemeToggle = () => {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem(STORAGE_KEY) as Mode) || 'auto');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);

    const apply = () => {
      const dark = mode === 'dark' || (mode === 'auto' && isNight());
      document.documentElement.classList.toggle('dark', dark);
    };

    apply();
    if (mode === 'auto') {
      const timer = setInterval(apply, 60_000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  const cycle = useCallback(() => {
    setMode(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'auto' : 'light'));
  }, []);

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : SunMoon;
  const label = mode === 'light' ? 'День' : mode === 'dark' ? 'Ночь' : 'Авто';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="theme-toggle"
      title={`Тема: ${label}`}
      aria-label={`Тема: ${label}`}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
};

export default ThemeToggle;
