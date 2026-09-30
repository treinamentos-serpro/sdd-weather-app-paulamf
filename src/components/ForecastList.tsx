import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecastDays: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecastDays, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title">
      <h2 id="forecast-title" className="mb-4 text-xl font-semibold text-white">
        Previsão de 5 dias
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecastDays.map((day) => (
          <ForecastCard key={day.localDate} day={day} unit={unit} />
        ))}
      </div>
    </section>
  );
}
