import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPostById } from "@/data/posts";
import PostCard from "@/components/post/PostCard";
import CommentSection from "@/components/comment/CommentSection";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

export default async function PostPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const post = await getPostById(params.id, user?.id ?? null);

  // Un brouillon n'est jamais visible en dehors de son auteur.
  if (!post || (post.status === "draft" && post.authorId !== user?.id)) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader title="Publication" />
      <PostCard post={post} isAuthenticated={Boolean(user)} />
      <CommentSection postId={post.id} viewerId={user?.id ?? null} isAuthenticated={Boolean(user)} />
    </PageContainer>
  );
}
