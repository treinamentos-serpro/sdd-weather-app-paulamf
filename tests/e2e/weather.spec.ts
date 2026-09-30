import { expect, type Page, test } from '@playwright/test';

async function mockLisbonWeather(page: Page) {
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Lisboa',
            country: 'Portugal',
            admin1: 'Lisboa',
            latitude: 38.72,
            longitude: -9.14,
          },
        ],
      }),
    });
  });

  await page.route('**/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'Europe/Lisbon',
        utc_offset_seconds: 3600,
        current: {
          time: '2026-09-30T12:00',
          temperature_2m: 20,
          weather_code: 0,
        },
        daily: {
          time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_max: [24, 25, 23, 22, 21],
          temperature_2m_min: [15, 16, 14, 13, 12],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    });
  });
}

test('busca uma cidade, exibe a previsão e alterna para Fahrenheit', async ({ page }) => {
  await mockLisbonWeather(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Resultado da consulta meteorológica' }),
  ).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(page.getByText('68°F', { exact: true })).toBeVisible();
});

test('exibe mensagem quando o geocoding não retorna cidades', async ({ page }) => {
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByRole('heading', { name: 'Nenhuma cidade encontrada para "Atlantis".' }),
  ).toBeVisible();
});

test('renderiza o clima no viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockLisbonWeather(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByText('20°C', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
});
