import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...actual, searchCities: vi.fn(), getWeather: vi.fn() };
});

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

const lisbon: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  administrativeRegions: [],
  latitude: 38.72,
  longitude: -9.14,
};

const porto: City = { ...lisbon, id: 2, name: 'Porto', latitude: 41.15, longitude: -8.61 };

function weatherFor(city: City): WeatherData {
  return {
    city,
    timeZone: 'Europe/Lisbon',
    utcOffsetSeconds: 0,
    current: { temperatureC: 20, weatherCode: 0, referenceTime: '2026-09-30T12:00:00.000Z' },
    forecastDays: [],
  };
}

describe('useWeather', () => {
  beforeEach(() => {
    searchCitiesMock.mockReset();
    getWeatherMock.mockReset();
  });

  it('começa em idle', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.state).toEqual({ status: 'idle' });
    expect(result.current.cities).toEqual([]);
  });

  it('busca cidades e carrega o clima da primeira', async () => {
    searchCitiesMock.mockResolvedValue([lisbon, porto]);
    getWeatherMock.mockResolvedValue(weatherFor(lisbon));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('  Lisboa '));

    expect(searchCitiesMock).toHaveBeenCalledWith('Lisboa', expect.any(AbortSignal));
    expect(getWeatherMock).toHaveBeenCalledWith(lisbon, expect.any(AbortSignal));
    expect(result.current.state).toEqual({ status: 'success', data: weatherFor(lisbon) });
    expect(result.current.query).toBe('Lisboa');
    expect(result.current.cities).toEqual([lisbon, porto]);
  });

  it('fica em empty quando não há cidades', async () => {
    searchCitiesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Xyz'));

    expect(result.current.state).toEqual({ status: 'empty' });
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('expõe a mensagem do WeatherServiceError em caso de erro', async () => {
    searchCitiesMock.mockRejectedValue(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Lisboa'));

    expect(result.current.state).toEqual({ status: 'error', message: 'Falha de rede.' });
  });

  it('usa mensagem genérica para erros inesperados', async () => {
    searchCitiesMock.mockRejectedValue(new TypeError('boom'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Lisboa'));

    expect(result.current.state).toEqual({
      status: 'error',
      message: 'Não foi possível carregar o clima. Tente novamente.',
    });
  });

  it('descarta cidades da busca anterior quando a nova busca falha', async () => {
    searchCitiesMock.mockResolvedValueOnce([lisbon]);
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    getWeatherMock.mockResolvedValue(weatherFor(lisbon));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Lisboa'));
    await act(() => result.current.search('Porto'));

    expect(result.current.state.status).toBe('error');
    expect(result.current.cities).toEqual([]);
    expect(result.current.query).toBe('Porto');
  });

  it('selectCity carrega o clima da cidade escolhida e atualiza a query', async () => {
    getWeatherMock.mockResolvedValue(weatherFor(porto));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.selectCity(porto));

    expect(getWeatherMock).toHaveBeenCalledWith(porto, expect.any(AbortSignal));
    expect(result.current.state).toEqual({ status: 'success', data: weatherFor(porto) });
    expect(result.current.query).toBe('Porto');
  });

  it('cancela a busca anterior e ignora sua resposta', async () => {
    let resolveFirst: (cities: City[]) => void = () => {};
    searchCitiesMock.mockImplementationOnce(
      () =>
        new Promise<City[]>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    searchCitiesMock.mockResolvedValueOnce([porto]);
    getWeatherMock.mockResolvedValue(weatherFor(porto));
    const { result } = renderHook(() => useWeather());

    let firstSearch: Promise<void> = Promise.resolve();
    act(() => {
      firstSearch = result.current.search('Lisboa');
    });
    await act(() => result.current.search('Porto'));

    expect(searchCitiesMock.mock.calls[0][1]?.aborted).toBe(true);

    await act(async () => {
      resolveFirst([lisbon]);
      await firstSearch;
    });

    expect(getWeatherMock).toHaveBeenCalledTimes(1);
    expect(result.current.state).toEqual({ status: 'success', data: weatherFor(porto) });
    expect(result.current.cities).toEqual([porto]);
  });

  it('retry refaz a última busca', async () => {
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    searchCitiesMock.mockResolvedValueOnce([lisbon]);
    getWeatherMock.mockResolvedValue(weatherFor(lisbon));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Lisboa'));
    expect(result.current.state.status).toBe('error');

    await act(() => result.current.retry());

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(result.current.state).toEqual({ status: 'success', data: weatherFor(lisbon) });
  });

  it('retry refaz a última seleção de cidade', async () => {
    getWeatherMock.mockRejectedValueOnce(new WeatherServiceError('A requisição demorou demais.'));
    getWeatherMock.mockResolvedValueOnce(weatherFor(porto));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.selectCity(porto));
    expect(result.current.state).toEqual({
      status: 'error',
      message: 'A requisição demorou demais.',
    });

    await act(() => result.current.retry());

    expect(getWeatherMock).toHaveBeenNthCalledWith(2, porto, expect.any(AbortSignal));
    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(result.current.state.status).toBe('success');
  });
});
