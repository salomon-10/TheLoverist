import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import LikeButton from "@/components/social/LikeButton";
import { formatRelativeTime } from "@/lib/utils";
import type { Comment } from "@/types";

export default function ReplyItem({
  reply,
  postId,
  isAuthenticated
}: {
  reply: Comment;
  postId: string;
  isAuthenticated: boolean;
}) {
  return (
    <div className="thread-line ml-6 flex gap-3 border-l py-3 pl-4">
      <Link href={`/profile/${reply.author.username}`} className="focus-ring shrink-0 rounded-full">
        <UserAvatar src={reply.author.avatarUrl} name={reply.author.displayName} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Link
            href={`/profile/${reply.author.username}`}
            className="focus-ring transition-platform rounded font-sans text-body-md font-semibold text-ink hover:underline"
          >
            {reply.author.displayName}
          </Link>
          <span className="font-sans text-body-sm text-muted">@{reply.author.username}</span>
          <span aria-hidden="true" className="text-muted">
            ·
          </span>
          <span className="font-sans text-body-sm text-muted">
            {formatRelativeTime(reply.createdAt)}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words font-sans text-body-md text-ink">{reply.content}</p>
        <div className="mt-1">
          <LikeButton
            target="comment"
            commentId={reply.id}
            postId={postId}
            initialLiked={reply.viewerHasLiked}
            initialCount={reply.likesCount}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
