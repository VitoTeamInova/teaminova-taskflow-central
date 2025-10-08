import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  defaultProjectId: string;
  setDefaultProjectId: (projectId: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [defaultProjectId, setDefaultProjectIdState] = useState<string>('');

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
      setDefaultProjectId
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