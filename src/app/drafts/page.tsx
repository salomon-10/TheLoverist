import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPostsByAuthor } from "@/data/posts";
import DraftCard from "@/components/post/DraftCard";
import EmptyState from "@/components/ui/EmptyState";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default async function DraftsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile?.isAuthor) redirect("/");

  const drafts = await getPostsByAuthor(user.id, user.id, "draft");

  return (
    <PageContainer>
      <PageHeader title="Brouillons" />
      {drafts.length === 0 ? (
        <EmptyState title="Aucun brouillon." hint="Vos brouillons enregistrés depuis l'éditeur apparaîtront ici." />
      ) : (
        <div className="flex flex-col gap-4 py-stack-sm">
          {drafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
