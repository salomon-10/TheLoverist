import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSavedPosts } from "@/data/posts";
import Feed from "@/components/layout/Feed";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await getSavedPosts(user.id);

  return (
    <PageContainer>
      <PageHeader title="Sauvegardes" />
      <Feed
        posts={posts}
        isAuthenticated
        emptyTitle="Vous n'avez encore rien enregistré."
        emptyHint="Le bouton d'enregistrement sur une publication l'ajoute ici."
      />
    </PageContainer>
  );
}
