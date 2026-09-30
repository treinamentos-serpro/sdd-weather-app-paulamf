interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhum dado meteorológico encontrado.',
  hint = 'Pesquise uma cidade para consultar a previsão do tempo.',
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </div>
  );
}
