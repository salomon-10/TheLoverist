import PageContainer from "@/components/layout/PageContainer";
import LoadingState from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <PageContainer>
      <div className="py-stack-sm">
        <div className="h-8 w-32 animate-pulse rounded bg-surface-sunken" />
      </div>
      <LoadingState rows={1} />
      <div className="mt-stack-sm">
        <LoadingState rows={3} />
      </div>
    </PageContainer>
  );
}
