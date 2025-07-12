import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface SettingsContextType {
  defaultProjectId: string;
  setDefaultProjectId: (projectId: string) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [defaultProjectId, setDefaultProjectIdState] = useState<string>('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('defaultProjectId');
    if (saved) {
      setDefaultProjectIdState(saved);
    }
  }, []);

  const setDefaultProjectId = (projectId: string) => {
    setDefaultProjectIdState(projectId);
    localStorage.setItem('defaultProjectId', projectId);
  };

  return (
    <SettingsContext.Provider value={{
      defaultProjectId,
      setDefaultProjectId,
      theme,
      setTheme
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}