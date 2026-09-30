import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const precipitation = day.precipitationProbabilityPercent;

  return (
    <article className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:p-4">
      <time className="block text-sm font-medium capitalize text-white" dateTime={day.localDate}>
        {formatDayLabel(day.localDate)}
      </time>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="shrink-0 text-3xl" aria-hidden="true">
          {condition.icon}
        </span>
        <div className="min-w-0 text-right">
          <p className="font-semibold text-white">{formatTemperature(day.maximumC, unit)}</p>
          <p className="text-sm text-white/60">{formatTemperature(day.minimumC, unit)}</p>
        </div>
      </div>
      <p className="mt-3 break-words text-sm text-white/70">{condition.label}</p>
      <p className="mt-2 text-xs text-white/60">
        Chuva: {precipitation === undefined ? 'Indisponível' : `${precipitation}%`}
      </p>
    </article>
  );
}
