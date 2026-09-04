import "server-only";
import { sql } from "@/lib/db";
import type { Comment } from "@/types";

function rowToComment(row: any): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    author: {
      id: row.author_id,
      username: row.author_username,
      displayName: row.author_display_name,
      avatarUrl: row.author_avatar_url,
      bio: "",
      isAuthor: row.author_is_author,
      createdAt: ""
    },
    parentCommentId: row.parent_comment_id,
    content: row.content,
    likesCount: Number(row.likes_count),
    createdAt: row.created_at,
    viewerHasLiked: Boolean(row.viewer_has_liked),
    replies: []
  };
}

/** Charge tous les commentaires d'une publication et assemble l'arbre à 2 niveaux. */
export async function getCommentsForPost(postId: string, viewerId: string | null): Promise<Comment[]> {
  const rows = await sql`
    select
      c.id, c.post_id, c.author_id, c.parent_comment_id, c.content, c.likes_count, c.created_at,
      pr.username as author_username, pr.display_name as author_display_name,
      pr.avatar_url as author_avatar_url, pr.is_author as author_is_author,
      exists(select 1 from likes l where l.comment_id = c.id and l.user_id = ${viewerId}) as viewer_has_liked
    from comments c
    join profiles pr on pr.id = c.author_id
    where c.post_id = ${postId}
    order by c.created_at asc
  `;

  const all = (rows as any[]).map(rowToComment);
  const byId = new Map(all.map((c) => [c.id, c]));
  const roots: Comment[] = [];

  for (const comment of all) {
    if (comment.parentCommentId) {
      const parent = byId.get(comment.parentCommentId);
      parent?.replies.push(comment);
    } else {
      roots.push(comment);
    }
  }

  return roots;
}

export async function createComment(input: {
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
}): Promise<Comment> {
  const rows = await sql`
    insert into comments (post_id, author_id, parent_comment_id, content)
    values (${input.postId}, ${input.authorId}, ${input.parentCommentId}, ${input.content})
    returning id
  `;
  await sql`update posts set comments_count = comments_count + 1 where id = ${input.postId}`;

  const commentId = rows[0]!.id as string;
  const created = await sql`
    select
      c.id, c.post_id, c.author_id, c.parent_comment_id, c.content, c.likes_count, c.created_at,
      pr.username as author_username, pr.display_name as author_display_name,
      pr.avatar_url as author_avatar_url, pr.is_author as author_is_author,
      false as viewer_has_liked
    from comments c
    join profiles pr on pr.id = c.author_id
    where c.id = ${commentId}
  `;
  return rowToComment(created[0]!);
}

export async function getCommentOwnerAndPost(commentId: string): Promise<{ postId: string } | null> {
  const rows = await sql`select post_id from comments where id = ${commentId} limit 1`;
  return rows[0] ? { postId: rows[0].post_id } : null;
}

/** Un commentaire de 1er niveau uniquement (une réponse ne peut pas recevoir de réponse). */
export async function isTopLevelComment(commentId: string): Promise<boolean> {
  const rows = await sql`select 1 from comments where id = ${commentId} and parent_comment_id is null limit 1`;
  return rows.length > 0;
}
