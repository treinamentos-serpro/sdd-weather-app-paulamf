import type { Unit } from '../types/weather';

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(celsius: number, unit: Unit): string {
  return `${Math.round(convertTemperature(celsius, unit))}${unitLabel(unit)}`;
}
