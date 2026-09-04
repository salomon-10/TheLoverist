import { getCommentsForPost } from "@/data/comments";
import CommentForm from "@/components/comment/CommentForm";
import CommentItem from "@/components/comment/CommentItem";
import EmptyState from "@/components/ui/EmptyState";

export default async function CommentSection({
  postId,
  viewerId,
  isAuthenticated
}: {
  postId: string;
  viewerId: string | null;
  isAuthenticated: boolean;
}) {
  const comments = await getCommentsForPost(postId, viewerId);

  return (
    <section id="comments" className="mt-4 rounded-lg border border-line bg-paper p-5 shadow-card" aria-label="Commentaires">
      <h2 className="mb-4 font-display text-headline-sm text-ink">
        Commentaires
        {comments.length > 0 && <span className="font-sans text-body-md text-muted"> · {comments.length}</span>}
      </h2>

      <CommentForm postId={postId} isAuthenticated={isAuthenticated} />

      <div className="mt-4 divide-y divide-line">
        {comments.length === 0 ? (
          <EmptyState title="Aucun commentaire pour le moment." hint="Soyez le premier à réagir." />
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} isAuthenticated={isAuthenticated} />
          ))
        )}
      </div>
    </section>
  );
}
