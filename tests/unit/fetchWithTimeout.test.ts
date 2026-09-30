import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function stubHangingFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    ),
  );
}

function stubJsonResponse(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
  );
}

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retorna a resposta quando o fetch conclui a tempo', async () => {
    const response = new Response('{}', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(fetchWithTimeout('https://example.test')).resolves.toBe(response);
  });

  it('converte o abort por timeout em "A requisição demorou demais."', async () => {
    vi.useFakeTimers();
    stubHangingFetch();

    const request = fetchWithTimeout('https://example.test');
    const assertion = expect(request).rejects.toThrow(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });

  it('converte falha de rede em "Falha de rede."', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const request = fetchWithTimeout('https://example.test');
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toThrow('Falha de rede.');
  });

  it('limpa o timer ao concluir', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(fetchWithTimeout('https://example.test')).rejects.toThrow();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('propaga o cancelamento feito por quem chamou', async () => {
    stubHangingFetch();
    const controller = new AbortController();

    const request = fetchWithTimeout('https://example.test', { signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toThrow(new WeatherServiceError('Requisição cancelada.'));
  });
});

describe('searchCities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['', '   '])('retorna lista vazia sem chamar fetch para input %j', async (name) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica caracteres especiais na URL e mapeia o resultado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              country: 'Brasil',
              admin1: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São Paulo & Centro ')).resolves.toEqual([
      {
        id: 1,
        name: 'São Paulo',
        country: 'Brasil',
        administrativeRegions: ['São Paulo'],
        latitude: -23.55,
        longitude: -46.63,
      },
    ]);

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.searchParams.get('name')).toBe('São Paulo & Centro');
    expect(requestUrl.searchParams.get('count')).toBe('5');
    expect(requestUrl.searchParams.get('language')).toBe('pt');
    expect(requestUrl.searchParams.get('format')).toBe('json');
    expect(requestUrl.search).toContain('%26');
  });

  it('mapeia os resultados de geocodificação', async () => {
    stubJsonResponse({
      results: [
        {
          id: 1,
          name: 'Lisboa',
          country: 'Portugal',
          admin1: 'Lisboa',
          admin3: 'Lisboa',
          latitude: 38.72,
          longitude: -9.14,
        },
      ],
    });

    await expect(searchCities('Lisboa')).resolves.toEqual([
      {
        id: 1,
        name: 'Lisboa',
        country: 'Portugal',
        administrativeRegions: ['Lisboa', 'Lisboa'],
        latitude: 38.72,
        longitude: -9.14,
      },
    ]);
  });

  it('retorna lista vazia quando o payload é null', async () => {
    stubJsonResponse(null);

    await expect(searchCities('Lisboa')).resolves.toEqual([]);
  });

  it('retorna lista vazia quando results está ausente', async () => {
    stubJsonResponse({});

    await expect(searchCities('Lisboa')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError quando a resposta não é OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(searchCities('Lisboa')).rejects.toThrow(
      new WeatherServiceError('Não foi possível buscar cidades.'),
    );
  });
});

describe('getWeather', () => {
  const city: City = {
    id: 1,
    name: 'Lisboa',
    administrativeRegions: [],
    latitude: 38.72,
    longitude: -9.14,
  };

  function forecastPayload() {
    return {
      timezone: 'Europe/Lisbon',
      utc_offset_seconds: 3600,
      current: { time: '2026-09-30T12:00', temperature_2m: 21, weather_code: 1 },
      daily: {
        time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
        weather_code: [1, 2, 3, 61, 0],
        temperature_2m_max: [24, 25, 23, 20, 22],
        temperature_2m_min: [15, 16, 14, 13, 12],
        precipitation_probability_max: [10, null, 30, 80, 0],
      },
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mapeia current e os 5 dias de daily', async () => {
    stubJsonResponse(forecastPayload());

    const weather = await getWeather(city);

    expect(weather.current.referenceTime).toBe('2026-09-30T11:00:00.000Z');
    expect(weather.forecastDays).toHaveLength(5);
    expect(weather.forecastDays[0]).toEqual({
      localDate: '2026-09-30',
      minimumC: 15,
      maximumC: 24,
      weatherCode: 1,
      precipitationProbabilityPercent: 10,
    });
  });

  it('converte precipitação nula para zero', async () => {
    stubJsonResponse(forecastPayload());

    const weather = await getWeather(city);

    expect(weather.forecastDays[1].precipitationProbabilityPercent).toBe(0);
  });

  it.each([
    ['payload null', () => null],
    ['sem current', () => ({ ...forecastPayload(), current: undefined })],
    ['sem daily', () => ({ ...forecastPayload(), daily: undefined })],
    ['sem utc_offset_seconds', () => ({ ...forecastPayload(), utc_offset_seconds: undefined })],
    [
      'sem daily.time',
      () => ({ ...forecastPayload(), daily: { ...forecastPayload().daily, time: undefined } }),
    ],
    [
      'daily com menos de 5 dias',
      () => ({
        ...forecastPayload(),
        daily: { ...forecastPayload().daily, temperature_2m_min: [15, 16] },
      }),
    ],
  ])('lança "Resposta incompleta" quando %s', async (_label, buildPayload) => {
    stubJsonResponse(buildPayload());

    await expect(getWeather(city)).rejects.toThrow(
      new WeatherServiceError('Resposta incompleta do serviço de previsão.'),
    );
  });

  it('lança WeatherServiceError quando a resposta da previsão não é OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(getWeather(city)).rejects.toThrow(
      new WeatherServiceError('Não foi possível buscar a previsão do tempo.'),
    );
  });

  it('lança "Resposta inválida" quando current.time não é uma data', async () => {
    const payload = forecastPayload();
    stubJsonResponse({ ...payload, current: { ...payload.current, time: 'ontem' } });

    await expect(getWeather(city)).rejects.toThrow(
      new WeatherServiceError('Resposta inválida do serviço de previsão.'),
    );
  });
});
