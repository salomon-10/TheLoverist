import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatRelativeTime, cx } from "@/lib/utils";
import type { Notification } from "@/types";

const VERB: Record<Notification["type"], string> = {
  like: "a aimé votre publication",
  comment: "a commenté votre publication",
  reply: "a répondu à votre commentaire",
  follow: "vous suit maintenant",
  repost: "a republié votre publication"
};

export default function NotificationItem({ notification }: { notification: Notification }) {
  const href = notification.postId ? `/post/${notification.postId}` : `/profile/${notification.actor.username}`;

  return (
    <Link
      href={href}
      className={cx(
        "focus-ring transition-platform flex items-center gap-4 px-5 py-4 hover:bg-surface",
        !notification.isRead && "bg-accent-soft/50"
      )}
    >
      <UserAvatar src={notification.actor.avatarUrl} name={notification.actor.displayName} size="md" />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-body-lg text-ink">
          <span className="font-semibold">{notification.actor.displayName}</span>{" "}
          <span>{VERB[notification.type]}</span>
        </p>
        <p className="mt-0.5 font-sans text-body-sm text-muted">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Non lu" />
      )}
    </Link>
  );
}
