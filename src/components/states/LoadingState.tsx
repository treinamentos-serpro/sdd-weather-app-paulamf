export default function LoadingState() {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/80 shadow-glass backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="inline-block animate-pulse motion-reduce:animate-none">
        Carregando dados meteorológicos...
      </span>
    </div>
  );
}
