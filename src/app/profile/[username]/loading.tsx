import PageContainer from "@/components/layout/PageContainer";
import LoadingState from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <PageContainer>
      <div
        className="mt-4 flex items-center gap-5 rounded-lg border border-line bg-paper p-6 shadow-card"
        role="status"
        aria-busy="true"
        aria-label="Chargement du profil"
      >
        <div className="h-[88px] w-[88px] animate-pulse rounded-full bg-surface-sunken" />
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-surface-sunken" />
          <div className="h-4 w-24 animate-pulse rounded bg-surface-sunken" />
        </div>
      </div>
      <div className="pt-2">
        <LoadingState rows={3} />
      </div>
    </PageContainer>
  );
}
