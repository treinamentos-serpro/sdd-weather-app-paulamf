import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  const referenceDate = new Date('2026-09-30T12:00:00');

  it('retorna "Hoje" para o índice 0', () => {
    expect(formatDayLabel('2026-09-30', referenceDate)).toBe('Hoje');
  });

  it('retorna "Amanhã" para o índice 1', () => {
    expect(formatDayLabel('2026-10-01', referenceDate)).toBe('Amanhã');
  });

  it('retorna o dia da semana para os demais índices', () => {
    expect(formatDayLabel('2026-10-02', referenceDate)).toBe('sex');
  });
});

describe('getShortDate', () => {
  it('formata uma data ISO como dia e mês', () => {
    expect(getShortDate('2026-09-30')).toBe('30/09');
  });
});
