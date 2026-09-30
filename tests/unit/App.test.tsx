import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...actual, searchCities: vi.fn(), getWeather: vi.fn() };
});

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

async function searchFor(name: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Cidade'), name);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  return user;
}

describe('App', () => {
  beforeEach(() => {
    searchCitiesMock.mockReset();
    getWeatherMock.mockReset();
  });

  it('mostra o estado inicial antes da busca', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Consulte o clima de uma cidade' }),
    ).toBeInTheDocument();
  });

  it('mostra o clima da cidade buscada e alterna a unidade', async () => {
    searchCitiesMock.mockResolvedValue([MOCK_WEATHER.city]);
    getWeatherMock.mockResolvedValue(MOCK_WEATHER);
    render(<App />);

    const user = await searchFor('Sao Paulo');

    expect(await screen.findByRole('heading', { name: 'Sao Paulo' })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Resultado da consulta meteorológica' }),
    ).toHaveFocus();
    expect(screen.getAllByText('22°C').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getAllByText('72°F').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Celsius' }));

    expect(screen.getAllByText('22°C').length).toBeGreaterThan(0);
    expect(searchCitiesMock).toHaveBeenCalledTimes(1);
    expect(getWeatherMock).toHaveBeenCalledTimes(1);
  });

  it('mostra o erro quando a previsão falha', async () => {
    searchCitiesMock.mockResolvedValue([MOCK_WEATHER.city]);
    getWeatherMock.mockRejectedValue(
      new WeatherServiceError('Não foi possível buscar a previsão do tempo.'),
    );
    render(<App />);

    await searchFor('Sao Paulo');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível buscar a previsão do tempo.',
    );
    expect(
      screen.getByRole('region', { name: 'Resultado da consulta meteorológica' }),
    ).toHaveFocus();
  });

  it('mostra o estado vazio quando nenhuma cidade é encontrada', async () => {
    searchCitiesMock.mockResolvedValue([]);
    render(<App />);

    await searchFor('Xyz');

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada para "Xyz".' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Resultado da consulta meteorológica' }),
    ).toHaveFocus();
  });

  it('marca o conteúdo principal como ocupado durante o carregamento', async () => {
    let resolveSearch: (cities: (typeof MOCK_WEATHER.city)[]) => void = () => undefined;
    searchCitiesMock.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    render(<App />);

    const user = await searchFor('Sao Paulo');

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    resolveSearch([MOCK_WEATHER.city]);
    getWeatherMock.mockResolvedValue(MOCK_WEATHER);
    await screen.findByRole('heading', { name: 'Sao Paulo' });
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).not.toHaveFocus();
    void user;
  });

  it('mostra o erro e refaz a busca ao clicar em "Tentar novamente"', async () => {
    searchCitiesMock
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([MOCK_WEATHER.city]);
    getWeatherMock.mockResolvedValue(MOCK_WEATHER);
    render(<App />);

    const user = await searchFor('Sao Paulo');

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Sao Paulo' })).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
  });
});
