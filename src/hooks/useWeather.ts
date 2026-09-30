import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: WeatherData };

type Operation = { type: 'search'; name: string } | { type: 'select'; city: City };

const FALLBACK_ERROR_MESSAGE = 'Não foi possível carregar o clima. Tente novamente.';

function toErrorMessage(error: unknown): string {
  return error instanceof WeatherServiceError ? error.message : FALLBACK_ERROR_MESSAGE;
}

export interface UseWeatherResult {
  state: WeatherState;
  cities: City[];
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>({ status: 'idle' });
  const [cities, setCities] = useState<City[]>([]);
  const [query, setQuery] = useState('');
  const lastOperation = useRef<Operation | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const startRequest = useCallback((operation: Operation): AbortSignal => {
    lastOperation.current = operation;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'loading' });
    return controller.signal;
  }, []);

  const loadWeather = useCallback(async (city: City, signal: AbortSignal) => {
    const data = await getWeather(city, signal);
    if (!signal.aborted) {
      setState({ status: 'success', data });
    }
  }, []);

  const fail = useCallback((signal: AbortSignal, cause: unknown) => {
    if (!signal.aborted) {
      setState({ status: 'error', message: toErrorMessage(cause) });
    }
  }, []);

  const selectCity = useCallback(
    async (city: City) => {
      const signal = startRequest({ type: 'select', city });
      setQuery(city.name);
      try {
        await loadWeather(city, signal);
      } catch (cause) {
        fail(signal, cause);
      }
    },
    [startRequest, loadWeather, fail],
  );

  const search = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const signal = startRequest({ type: 'search', name: trimmedName });
      setQuery(trimmedName);
      setCities([]);
      try {
        const results = await searchCities(trimmedName, signal);
        if (signal.aborted) return;
        setCities(results);

        if (results.length === 0) {
          setState({ status: 'empty' });
          return;
        }

        await loadWeather(results[0], signal);
      } catch (cause) {
        fail(signal, cause);
      }
    },
    [startRequest, loadWeather, fail],
  );

  const retry = useCallback(async () => {
    const operation = lastOperation.current;
    if (!operation) return;
    if (operation.type === 'search') {
      await search(operation.name);
    } else {
      await selectCity(operation.city);
    }
  }, [search, selectCity]);

  return { state, cities, query, search, selectCity, retry };
}
