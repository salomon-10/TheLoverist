import { getCurrentUser } from "@/lib/session";
import { getFeed } from "@/data/posts";
import PostComposer from "@/components/post/PostComposer";
import Feed from "@/components/layout/Feed";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default async function FeedPage() {
  const user = await getCurrentUser();
  const posts = await getFeed(user?.id ?? null);

  return (
    <PageContainer>
      <PageHeader title="Accueil" />
      {user?.profile?.isAuthor && <PostComposer author={user.profile} />}
      <Feed
        posts={posts}
        isAuthenticated={Boolean(user)}
        emptyTitle="Aucune publication pour le moment."
        emptyHint="Suivez des auteurs pour remplir votre fil, ou revenez plus tard."
      />
    </PageContainer>
  );
}
