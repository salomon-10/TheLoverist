"use client";

import { useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import LikeButton from "@/components/social/LikeButton";
import ReplyItem from "@/components/comment/ReplyItem";
import CommentForm from "@/components/comment/CommentForm";
import { formatRelativeTime } from "@/lib/utils";
import type { Comment } from "@/types";

export default function CommentItem({
  comment,
  postId,
  isAuthenticated
}: {
  comment: Comment;
  postId: string;
  isAuthenticated: boolean;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex gap-3">
        <Link href={`/profile/${comment.author.username}`} className="focus-ring shrink-0 rounded-full">
          <UserAvatar src={comment.author.avatarUrl} name={comment.author.displayName} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/profile/${comment.author.username}`}
              className="focus-ring transition-platform rounded font-sans text-body-md font-semibold text-ink hover:underline"
            >
              {comment.author.displayName}
            </Link>
            <span className="font-sans text-body-sm text-muted">@{comment.author.username}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <span className="font-sans text-body-sm text-muted">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words font-sans text-body-lg text-ink">{comment.content}</p>
          <div className="mt-1 flex items-center gap-1">
            <LikeButton
              target="comment"
              commentId={comment.id}
              postId={postId}
              initialLiked={comment.viewerHasLiked}
              initialCount={comment.likesCount}
              isAuthenticated={isAuthenticated}
            />
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              aria-expanded={replying}
              className="focus-ring transition-platform flex min-h-[40px] items-center rounded-full px-2 font-sans text-body-md text-muted hover:text-ink"
            >
              Répondre
            </button>
          </div>

          {replying && (
            <div className="animate-field-in mt-3">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                isAuthenticated={isAuthenticated}
                placeholder={`Répondre à ${comment.author.displayName}…`}
                autoFocus
                onDone={() => setReplying(false)}
              />
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} postId={postId} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
