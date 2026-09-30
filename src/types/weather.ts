export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country?: string;
  administrativeRegions: string[];
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC?: number;
  relativeHumidityPercent?: number;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
  weatherCode: number;
  referenceTime: string;
}

export interface ForecastDay {
  localDate: string;
  minimumC: number;
  maximumC: number;
  weatherCode: number;
  precipitationProbabilityPercent?: number;
}

export interface WeatherData {
  city: City;
  timeZone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  forecastDays: ForecastDay[];
}

export type RequestError =
  | {
      kind: 'network' | 'timeout' | 'rate-limit' | 'server';
      message: string;
      retryable: true;
    }
  | {
      kind: 'api' | 'invalid-response';
      message: string;
      retryable: false;
    };

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: City[] }
  | { status: 'empty' }
  | { status: 'error'; error: RequestError };

export type ForecastState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WeatherData; partial: boolean }
  | { status: 'empty' }
  | { status: 'error'; error: RequestError };
