import { describe, expect, it } from 'vitest';
import {
  convertTemperature,
  formatTemperature,
  toFahrenheit,
  unitLabel,
} from '../../src/lib/temperature';

describe('temperature utilities', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s°C para %s°F', (celsius, fahrenheit) => {
    expect(toFahrenheit(celsius)).toBe(fahrenheit);
  });

  it('converte a temperatura de acordo com a unidade', () => {
    expect(convertTemperature(21, 'celsius')).toBe(21);
    expect(convertTemperature(21, 'fahrenheit')).toBe(69.8);
  });

  it.each([
    [21.4, 'celsius', '21°C'],
    [21.6, 'celsius', '22°C'],
    [21, 'fahrenheit', '70°F'],
  ] as const)('arredonda e formata %s na unidade %s como %s', (temperature, unit, expected) => {
    expect(formatTemperature(temperature, unit)).toBe(expected);
  });

  it.each([
    ['celsius', '°C'],
    ['fahrenheit', '°F'],
  ] as const)('retorna o símbolo da unidade %s', (unit, expected) => {
    expect(unitLabel(unit)).toBe(expected);
  });
});
