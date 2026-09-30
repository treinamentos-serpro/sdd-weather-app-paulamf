import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('retorna a condição conhecida para um código meteorológico', () => {
    expect(getWeatherCondition(61)).toEqual({ label: 'Chuva fraca', icon: '🌧' });
  });

  it('retorna a condição indisponível para um código desconhecido', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição meteorológica indisponível',
      icon: '－',
    });
  });
});
