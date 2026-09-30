function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDayLabel(localDate: string, referenceDate = new Date()): string {
  const currentDate = new Date(`${toDateKey(referenceDate)}T00:00:00`);
  const forecastDate = new Date(`${localDate}T00:00:00`);
  const differenceInDays = Math.round(
    (forecastDate.getTime() - currentDate.getTime()) / 86_400_000,
  );

  if (differenceInDays === 0) {
    return 'Hoje';
  }

  if (differenceInDays === 1) {
    return 'Amanhã';
  }

  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(forecastDate)
    .replace('.', '');
}

export function getShortDate(localDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${localDate}T00:00:00`));
}
