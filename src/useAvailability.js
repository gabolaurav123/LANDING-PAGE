import { useCallback, useEffect, useState } from 'react';
import { fetchCounter } from './api.js';

export function useAvailability({ enabled = true, pollingMs = 12_000 } = {}) {
  const [counter, setCounter] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return null;

    try {
      const nextCounter = await fetchCounter();
      setCounter(nextCounter);
      setError('');
      return nextCounter;
    } catch {
      setError('No pudimos consultar la disponibilidad en este momento.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    refresh();
    const interval = window.setInterval(refresh, pollingMs);
    return () => window.clearInterval(interval);
  }, [enabled, pollingMs, refresh]);

  return { counter, error, loading, refresh };
}
