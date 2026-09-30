import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

interface Metric {
  label: string;
  value: string;
}

function formatMetric(value: number | undefined, suffix: string): string | undefined {
  return value === undefined ? undefined : `${value}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const metrics: Metric[] = [
    {
      label: 'Umidade',
      value: formatMetric(current.relativeHumidityPercent, '%') ?? 'Indisponível',
    },
    {
      label: 'Vento',
      value: formatMetric(current.windSpeedKmh, ' km/h') ?? 'Indisponível',
    },
    {
      label: 'Precipitação',
      value: formatMetric(current.precipitationMm, ' mm') ?? 'Indisponível',
    },
    {
      label: 'Pressão',
      value: formatMetric(current.pressureHpa, ' hPa') ?? 'Indisponível',
    },
  ];

  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md"
      aria-labelledby="current-weather-title"
    >
      <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-white/60">Agora em</p>
          <h1 id="current-weather-title" className="break-words text-2xl font-semibold text-white">
            {city.name}
          </h1>
          <p className="break-words text-sm text-white/60">
            {[city.country, ...city.administrativeRegions].filter(Boolean).join(', ')}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-4">
          <span className="shrink-0 text-5xl" aria-hidden="true">
            {condition.icon}
          </span>
          <div className="min-w-0">
            <p className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {formatTemperature(current.temperatureC, unit)}
            </p>
            <p className="text-white/70">{condition.label}</p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-lg border border-white/10 bg-night-800/60 p-3" key={metric.label}>
            <dt className="text-xs text-white/60">{metric.label}</dt>
            <dd className="mt-1 text-sm font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
