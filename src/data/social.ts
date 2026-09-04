import "server-only";
import { sql } from "@/lib/db";

// ---------------------------------------------------------------
// LIKES — un seul type de réaction, applicable à un post ou un commentaire.
// Les contraintes uniques (uq_like_user_post / uq_like_user_comment) côté
// base empêchent tout doublon même en cas de double clic concurrent.
// ---------------------------------------------------------------

export async function likePost(userId: string, postId: string): Promise<boolean> {
  const rows = await sql`
    insert into likes (user_id, post_id) values (${userId}, ${postId})
    on conflict (user_id, post_id) do nothing
    returning id
  `;
  if (rows.length === 0) return false;
  await sql`update posts set likes_count = likes_count + 1 where id = ${postId}`;
  return true;
}

export async function unlikePost(userId: string, postId: string): Promise<boolean> {
  const rows = await sql`delete from likes where user_id = ${userId} and post_id = ${postId} returning id`;
  if (rows.length === 0) return false;
  await sql`update posts set likes_count = greatest(0, likes_count - 1) where id = ${postId}`;
  return true;
}

export async function likeComment(userId: string, commentId: string): Promise<boolean> {
  const rows = await sql`
    insert into likes (user_id, comment_id) values (${userId}, ${commentId})
    on conflict (user_id, comment_id) do nothing
    returning id
  `;
  if (rows.length === 0) return false;
  await sql`update comments set likes_count = likes_count + 1 where id = ${commentId}`;
  return true;
}

export async function unlikeComment(userId: string, commentId: string): Promise<boolean> {
  const rows = await sql`delete from likes where user_id = ${userId} and comment_id = ${commentId} returning id`;
  if (rows.length === 0) return false;
  await sql`update comments set likes_count = greatest(0, likes_count - 1) where id = ${commentId}`;
  return true;
}

export async function getPostAuthorId(postId: string): Promise<string | null> {
  const rows = await sql`select author_id from posts where id = ${postId} limit 1`;
  return rows[0]?.author_id ?? null;
}

export async function getCommentAuthorId(commentId: string): Promise<string | null> {
  const rows = await sql`select author_id from comments where id = ${commentId} limit 1`;
  return rows[0]?.author_id ?? null;
}

// ---------------------------------------------------------------
// FOLLOWS
// ---------------------------------------------------------------

export async function followAuthor(followerId: string, authorId: string): Promise<boolean> {
  if (followerId === authorId) return false;
  const rows = await sql`
    insert into follows (follower_id, author_id) values (${followerId}, ${authorId})
    on conflict (follower_id, author_id) do nothing
    returning follower_id
  `;
  return rows.length > 0;
}

export async function unfollowAuthor(followerId: string, authorId: string): Promise<boolean> {
  const rows = await sql`
    delete from follows where follower_id = ${followerId} and author_id = ${authorId} returning follower_id
  `;
  return rows.length > 0;
}

export async function isFollowing(followerId: string, authorId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from follows where follower_id = ${followerId} and author_id = ${authorId} limit 1
  `;
  return rows.length > 0;
}

// ---------------------------------------------------------------
// SAVES (privées)
// ---------------------------------------------------------------

export async function savePost(userId: string, postId: string): Promise<boolean> {
  const rows = await sql`
    insert into saves (user_id, post_id) values (${userId}, ${postId})
    on conflict (user_id, post_id) do nothing
    returning user_id
  `;
  return rows.length > 0;
}

export async function unsavePost(userId: string, postId: string): Promise<boolean> {
  const rows = await sql`delete from saves where user_id = ${userId} and post_id = ${postId} returning user_id`;
  return rows.length > 0;
}

// ---------------------------------------------------------------
// REPOSTS — référence à l'original, jamais une copie de contenu.
// ---------------------------------------------------------------

export async function repost(userId: string, originalPostId: string): Promise<boolean> {
  const rows = await sql`
    insert into reposts (user_id, original_post_id) values (${userId}, ${originalPostId})
    on conflict (user_id, original_post_id) do nothing
    returning id
  `;
  if (rows.length === 0) return false;
  await sql`update posts set reposts_count = reposts_count + 1 where id = ${originalPostId}`;
  return true;
}

export async function unrepost(userId: string, originalPostId: string): Promise<boolean> {
  const rows = await sql`
    delete from reposts where user_id = ${userId} and original_post_id = ${originalPostId} returning id
  `;
  if (rows.length === 0) return false;
  await sql`update posts set reposts_count = greatest(0, reposts_count - 1) where id = ${originalPostId}`;
  return true;
}
