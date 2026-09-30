import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: 3448439,
    name: 'Sao Paulo',
    country: 'Brasil',
    administrativeRegions: ['Sao Paulo'],
    latitude: -23.5475,
    longitude: -46.6361,
  },
  timeZone: 'America/Sao_Paulo',
  utcOffsetSeconds: -10800,
  current: {
    temperatureC: 22,
    apparentTemperatureC: 22.8,
    relativeHumidityPercent: 68,
    windSpeedKmh: 12.4,
    precipitationMm: 0,
    pressureHpa: 1014,
    weatherCode: 2,
    referenceTime: '2026-09-30T15:00:00.000Z',
  },
  forecastDays: [
    {
      localDate: '2026-09-30',
      minimumC: 17,
      maximumC: 25,
      weatherCode: 2,
      precipitationProbabilityPercent: 20,
    },
    {
      localDate: '2026-10-01',
      minimumC: 18,
      maximumC: 27,
      weatherCode: 61,
      precipitationProbabilityPercent: 70,
    },
    {
      localDate: '2026-10-02',
      minimumC: 19,
      maximumC: 28,
      weatherCode: 80,
      precipitationProbabilityPercent: 60,
    },
    {
      localDate: '2026-10-03',
      minimumC: 18,
      maximumC: 26,
      weatherCode: 3,
      precipitationProbabilityPercent: 30,
    },
    {
      localDate: '2026-10-04',
      minimumC: 16,
      maximumC: 24,
      weatherCode: 1,
      precipitationProbabilityPercent: 10,
    },
  ],
};
