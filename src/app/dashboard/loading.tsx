import PageContainer from "@/components/layout/PageContainer";

export default function Loading() {
  return (
    <PageContainer width="column">
      <div className="py-stack-sm">
        <div className="h-8 w-44 animate-pulse rounded bg-surface-sunken" />
      </div>
      <div className="grid grid-cols-3 gap-3 py-stack-sm" role="status" aria-busy="true" aria-label="Chargement">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-line bg-surface-sunken" />
        ))}
      </div>
    </PageContainer>
  );
}
