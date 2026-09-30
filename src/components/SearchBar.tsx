import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (!trimmedCity || disabled) {
      return;
    }

    onSearch(trimmedCity);
  }

  return (
    <form
      className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          className="w-full rounded-lg border border-white/10 bg-night-800 px-3 py-2 text-white outline-none placeholder:text-white/50 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          id="city-search"
          name="city"
          type="search"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite uma cidade"
          autoComplete="address-level2"
          disabled={disabled}
        />
      </div>
      <button
        className="rounded-lg bg-accent-500 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-600 active:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent-500"
        type="submit"
        disabled={disabled}
      >
        Buscar
      </button>
    </form>
  );
}
