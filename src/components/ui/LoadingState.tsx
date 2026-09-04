export default function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true" aria-label="Chargement du contenu">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border border-line bg-paper p-5 shadow-card">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-surface-sunken" />
          <div className="flex-1 space-y-2.5 py-1">
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-sunken" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-surface-sunken" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-surface-sunken" />
          </div>
        </div>
      ))}
    </div>
  );
}
