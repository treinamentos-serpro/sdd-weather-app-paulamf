export interface WeatherCondition {
  label: string;
  icon: string;
}

const WEATHER_CONDITIONS: Record<number, WeatherCondition> = {
  0: { label: 'Céu limpo', icon: '☀' },
  1: { label: 'Predominantemente limpo', icon: '🌤' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁' },
  45: { label: 'Nevoeiro', icon: '🌫' },
  48: { label: 'Nevoeiro com geada', icon: '🌫' },
  51: { label: 'Garoa fraca', icon: '🌦' },
  53: { label: 'Garoa moderada', icon: '🌦' },
  55: { label: 'Garoa intensa', icon: '🌧' },
  61: { label: 'Chuva fraca', icon: '🌧' },
  63: { label: 'Chuva moderada', icon: '🌧' },
  65: { label: 'Chuva intensa', icon: '🌧' },
  71: { label: 'Neve fraca', icon: '🌨' },
  73: { label: 'Neve moderada', icon: '🌨' },
  75: { label: 'Neve intensa', icon: '❄' },
  80: { label: 'Pancadas de chuva fracas', icon: '🌦' },
  81: { label: 'Pancadas de chuva moderadas', icon: '🌦' },
  82: { label: 'Pancadas de chuva violentas', icon: '🌧' },
  95: { label: 'Trovoada', icon: '⛈' },
  96: { label: 'Trovoada com granizo fraco', icon: '⛈' },
  99: { label: 'Trovoada com granizo intenso', icon: '⛈' },
};

export function getWeatherCondition(weatherCode: number): WeatherCondition {
  return (
    WEATHER_CONDITIONS[weatherCode] ?? {
      label: 'Condição meteorológica indisponível',
      icon: '－',
    }
  );
}
