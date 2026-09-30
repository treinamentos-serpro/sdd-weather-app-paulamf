interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({
  onRetry,
  message = 'Não foi possível carregar os dados meteorológicos.',
}: ErrorStateProps) {
  return (
    <div
      className="rounded-xl border border-red-300/30 bg-red-950/30 p-6 text-center shadow-glass backdrop-blur-md"
      role="alert"
    >
      <p className="text-white">{message}</p>
      <button
        className="mt-4 rounded-lg bg-accent-500 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-600 active:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
        type="button"
        onClick={onRetry}
      >
        Tentar novamente
      </button>
    </div>
  );
}
