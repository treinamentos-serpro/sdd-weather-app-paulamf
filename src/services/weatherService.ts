import type { City, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;
const FORECAST_DAYS = 5;
const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  timezone: string;
  utc_offset_seconds: number;
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    surface_pressure?: number;
    precipitation?: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: Array<number | null>;
  };
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface FetchOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function fetchWithTimeout(
  url: string,
  { timeoutMs = REQUEST_TIMEOUT_MS, signal }: FetchOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();

  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    return await fetch(url, { signal: controller.signal });
  } catch {
    if (timedOut) {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    if (controller.signal.aborted) {
      throw new WeatherServiceError('Requisição cancelada.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

type CompleteForecastResponse = ForecastResponse &
  Required<Pick<ForecastResponse, 'current' | 'daily'>>;

function hasMinimumLength(values: unknown): boolean {
  return Array.isArray(values) && values.length >= FORECAST_DAYS;
}

function isCompleteForecast(payload: ForecastResponse | null): payload is CompleteForecastResponse {
  if (!payload?.current || !payload.daily) {
    return false;
  }

  const { current, daily } = payload;
  return (
    typeof payload.utc_offset_seconds === 'number' &&
    typeof current.time === 'string' &&
    hasMinimumLength(daily.time) &&
    hasMinimumLength(daily.weather_code) &&
    hasMinimumLength(daily.temperature_2m_max) &&
    hasMinimumLength(daily.temperature_2m_min)
  );
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return [];
  }

  const query = `name=${encodeURIComponent(trimmedName)}&count=5&language=pt&format=json`;

  const response = await fetchWithTimeout(`${GEOCODING_URL}?${query}`, { signal });

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar cidades.');
  }

  let payload: GeocodingResponse | null;
  try {
    payload = (await response.json()) as GeocodingResponse | null;
  } catch {
    throw new WeatherServiceError('Resposta inválida do serviço de cidades.');
  }

  return (payload?.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    administrativeRegions: [result.admin1, result.admin2, result.admin3, result.admin4].filter(
      (region): region is string => Boolean(region),
    ),
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const query = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${query.toString()}`, { signal });

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar a previsão do tempo.');
  }

  let payload: ForecastResponse | null;
  try {
    payload = (await response.json()) as ForecastResponse | null;
  } catch {
    throw new WeatherServiceError('Resposta inválida do serviço de previsão.');
  }

  if (!isCompleteForecast(payload)) {
    throw new WeatherServiceError('Resposta incompleta do serviço de previsão.');
  }

  const { current, daily } = payload;
  // A API devolve o horário local sem offset (ex.: "2026-09-30T12:00").
  if (!LOCAL_DATE_TIME_PATTERN.test(current.time)) {
    throw new WeatherServiceError('Resposta inválida do serviço de previsão.');
  }
  const referenceTimestamp = Date.parse(`${current.time}:00Z`) - payload.utc_offset_seconds * 1000;
  if (Number.isNaN(referenceTimestamp)) {
    throw new WeatherServiceError('Resposta inválida do serviço de previsão.');
  }
  const referenceTime = new Date(referenceTimestamp).toISOString();

  return {
    city,
    timeZone: payload.timezone,
    utcOffsetSeconds: payload.utc_offset_seconds,
    current: {
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature,
      relativeHumidityPercent: current.relative_humidity_2m,
      windSpeedKmh: current.wind_speed_10m,
      precipitationMm: current.precipitation,
      pressureHpa: current.surface_pressure,
      weatherCode: current.weather_code,
      referenceTime,
    },
    forecastDays: daily.time.slice(0, FORECAST_DAYS).map((localDate, index) => ({
      localDate,
      minimumC: daily.temperature_2m_min[index],
      maximumC: daily.temperature_2m_max[index],
      weatherCode: daily.weather_code[index],
      precipitationProbabilityPercent: daily.precipitation_probability_max?.[index] ?? 0,
    })),
  };
}
