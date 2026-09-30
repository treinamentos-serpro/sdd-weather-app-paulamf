import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      className="inline-flex w-fit rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
      aria-label="Unidade de temperatura"
    >
      <button
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 ${unit === 'celsius' ? 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700' : 'text-white/70 hover:bg-white/10 hover:text-white active:bg-white/15'}`}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
      >
        °C
      </button>
      <button
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 ${unit === 'fahrenheit' ? 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700' : 'text-white/70 hover:bg-white/10 hover:text-white active:bg-white/15'}`}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
      >
        °F
      </button>
    </div>
  );
}
