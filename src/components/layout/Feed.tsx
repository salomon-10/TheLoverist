import PostCard from "@/components/post/PostCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Post } from "@/types";

export default function Feed({
  posts,
  isAuthenticated,
  emptyTitle = "Aucune publication pour le moment.",
  emptyHint
}: {
  posts: Post[];
  isAuthenticated: boolean;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (posts.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }

  return (
    <div className="flex flex-col gap-4 py-stack-sm">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  );
}
