import Link from "next/link";
import Image from "next/image";
import { Link as LinkIcon } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import PostActions from "@/components/post/PostActions";
import { formatRelativeTime } from "@/lib/utils";
import type { Post } from "@/types";

export default function PostCard({ post, isAuthenticated }: { post: Post; isAuthenticated: boolean }) {
  return (
    <article className="animate-card-in rounded-lg bg-paper p-5 shadow-card transition-platform hover:shadow-card-hover">
      <div className="flex gap-4">
        <Link href={`/profile/${post.author.username}`} className="focus-ring shrink-0 rounded-full">
          <UserAvatar src={post.author.avatarUrl} name={post.author.displayName} size="md" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/profile/${post.author.username}`}
              className="focus-ring transition-platform rounded font-sans text-[15px] font-semibold text-ink hover:text-accent"
            >
              {post.author.displayName}
            </Link>
            <span className="font-sans text-body-sm text-muted">@{post.author.username}</span>
            <span aria-hidden="true" className="text-muted">
              ·
            </span>
            <Link
              href={`/post/${post.id}`}
              className="focus-ring transition-platform rounded font-sans text-body-sm text-muted hover:text-accent"
            >
              {formatRelativeTime(post.publishedAt ?? post.createdAt)}
            </Link>
          </div>

          <Link href={`/post/${post.id}`} className="focus-ring block">
            {post.content && (
              <p className="mt-2 whitespace-pre-wrap break-words font-sans text-body-lg text-ink">{post.content}</p>
            )}

            {post.type === "link" && post.linkUrl && (
              <span className="mt-3 flex items-center gap-2 truncate rounded-md border border-line bg-surface px-3.5 py-2.5 font-sans text-body-sm text-muted">
                <LinkIcon size={14} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{post.linkUrl}</span>
              </span>
            )}

            {post.media[0] && (
              <span className="mt-3 block overflow-hidden rounded-md border border-line bg-surface">
                <Image
                  src={post.media[0].url}
                  alt={post.media[0].altText || "Image de la publication"}
                  width={640}
                  height={420}
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="h-auto max-h-[440px] w-full object-cover"
                />
              </span>
            )}
          </Link>

          <div className="mt-4 border-t border-line pt-3">
            <PostActions post={post} isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </article>
  );
}
