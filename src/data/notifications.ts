import "server-only";
import { sql } from "@/lib/db";
import type { Notification, NotificationType } from "@/types";

function rowToNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    actor: {
      id: row.actor_id,
      username: row.actor_username,
      displayName: row.actor_display_name,
      avatarUrl: row.actor_avatar_url,
      bio: "",
      isAuthor: false,
      createdAt: ""
    },
    postId: row.post_id,
    commentId: row.comment_id,
    isRead: row.is_read,
    createdAt: row.created_at
  };
}

export async function getNotifications(recipientId: string, limit = 30): Promise<Notification[]> {
  const rows = await sql`
    select n.id, n.type, n.actor_id, n.post_id, n.comment_id, n.is_read, n.created_at,
      pr.username as actor_username, pr.display_name as actor_display_name, pr.avatar_url as actor_avatar_url
    from notifications n
    join profiles pr on pr.id = n.actor_id
    where n.recipient_id = ${recipientId}
    order by n.created_at desc
    limit ${limit}
  `;
  return (rows as any[]).map(rowToNotification);
}

export async function getUnreadCount(recipientId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as count from notifications where recipient_id = ${recipientId} and is_read = false
  `;
  return rows[0]?.count ?? 0;
}

export async function markAsRead(notificationId: string, recipientId: string): Promise<void> {
  await sql`
    update notifications set is_read = true
    where id = ${notificationId} and recipient_id = ${recipientId}
  `;
}

export async function markAllAsRead(recipientId: string): Promise<void> {
  await sql`update notifications set is_read = true where recipient_id = ${recipientId} and is_read = false`;
}

/**
 * Crée une notification, sauf si l'acteur et le destinataire sont la même
 * personne (on ne se notifie jamais soi-même).
 */
export async function notify(input: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string | null;
  commentId?: string | null;
}): Promise<void> {
  if (input.recipientId === input.actorId) return;
  await sql`
    insert into notifications (recipient_id, actor_id, type, post_id, comment_id)
    values (${input.recipientId}, ${input.actorId}, ${input.type}, ${input.postId ?? null}, ${input.commentId ?? null})
  `;
}
