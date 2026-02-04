
import React, { createContext, useContext, useRef, useCallback } from 'react';

interface CacheContextType {
  setCache: (key: string, data: any) => void;
  getCache: (key: string) => any;
  clearCache: (key: string) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We use useRef to hold the cache so it persists without causing re-renders of the provider
  const cache = useRef<Record<string, any>>({});

  const setCache = useCallback((key: string, data: any) => {
    cache.current[key] = data;
  }, []);

  const getCache = useCallback((key: string) => {
    return cache.current[key];
  }, []);

  const clearCache = useCallback((key: string) => {
    delete cache.current[key];
  }, []);

  return (
    <CacheContext.Provider value={{ setCache, getCache, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};
