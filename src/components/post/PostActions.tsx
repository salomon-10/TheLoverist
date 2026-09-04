"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import LikeButton from "@/components/social/LikeButton";
import SaveButton from "@/components/social/SaveButton";
import ShareButton from "@/components/social/ShareButton";
import type { Post } from "@/types";

export default function PostActions({ post, isAuthenticated }: { post: Post; isAuthenticated: boolean }) {
  return (
    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1">
        <Link
          href={`/post/${post.id}#comments`}
          aria-label={`${post.commentsCount} commentaires`}
          className="focus-ring transition-platform flex min-h-[40px] items-center gap-2 rounded-full px-2 font-sans text-body-md text-muted hover:text-ink"
        >
          <MessageCircle size={18} strokeWidth={1.75} />
          <span className="tabular-nums">{post.commentsCount}</span>
        </Link>
        <LikeButton
          target="post"
          postId={post.id}
          initialLiked={post.viewerHasLiked}
          initialCount={post.likesCount}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <div className="flex items-center gap-1">
        <SaveButton postId={post.id} initialSaved={post.viewerHasSaved} isAuthenticated={isAuthenticated} />
        <ShareButton postId={post.id} />
      </div>
    </div>
  );
}