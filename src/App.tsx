import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { state, query, search, retry } = useWeather();
  const resultRegionRef = useRef<HTMLElement>(null);
  const previousStatusRef = useRef(state.status);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const completedSearch =
      previousStatus === 'loading' &&
      (state.status === 'success' || state.status === 'empty' || state.status === 'error');

    if (completedSearch) {
      resultRegionRef.current?.focus();
    }

    previousStatusRef.current = state.status;
  }, [state.status]);

  function renderContent() {
    switch (state.status) {
      case 'idle':
        return (
          <EmptyState
            title="Consulte o clima de uma cidade"
            hint="Use a busca acima para começar."
          />
        );
      case 'loading':
        return <LoadingState />;
      case 'empty':
        return (
          <EmptyState
            title={`Nenhuma cidade encontrada para "${query}".`}
            hint="Verifique a grafia e tente novamente."
          />
        );
      case 'error':
        return <ErrorState message={state.message} onRetry={() => void retry()} />;
      case 'success':
        return (
          <div className="space-y-6">
            <CurrentWeather city={state.data.city} current={state.data.current} unit={unit} />
            <ForecastList forecastDays={state.data.forecastDays} unit={unit} />
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(109,124,255,0.2),_transparent_36%),_#0b1020] text-white">
      <header className="border-b border-white/10 bg-night-900/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-400">
              WeatherView
            </p>
            <p className="mt-1 text-sm text-white/60">Previsão clara para o seu dia</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
            <SearchBar
              onSearch={(name) => void search(name)}
              disabled={state.status === 'loading'}
            />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12"
        aria-live="polite"
        aria-busy={state.status === 'loading'}
      >
        <section
          ref={resultRegionRef}
          className="rounded-xl outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-4 focus:ring-offset-night-900"
          tabIndex={-1}
          aria-label="Resultado da consulta meteorológica"
        >
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
