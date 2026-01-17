import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  // Ensure the returned value is always treated as a string for safety in search scenarios
  return (typeof debouncedValue === 'string' || debouncedValue === null || debouncedValue === undefined)
    ? (debouncedValue as any || "") as T
    : debouncedValue;
}
