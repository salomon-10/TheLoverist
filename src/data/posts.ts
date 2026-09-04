import "server-only";
import { sql } from "@/lib/db";
import type { Post, PostMedia, Profile } from "@/types";

function rowToAuthor(row: any): Profile {
  return {
    id: row.author_id,
    username: row.author_username,
    displayName: row.author_display_name,
    avatarUrl: row.author_avatar_url,
    bio: "",
    isAuthor: row.author_is_author,
    createdAt: ""
  };
}

function rowToPost(row: any, media: PostMedia[]): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    author: rowToAuthor(row),
    type: row.type,
    content: row.content,
    linkUrl: row.link_url,
    media,
    status: row.status,
    likesCount: Number(row.likes_count),
    commentsCount: Number(row.comments_count),
    repostsCount: Number(row.reposts_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    viewerHasLiked: Boolean(row.viewer_has_liked),
    viewerHasSaved: Boolean(row.viewer_has_saved),
    viewerHasReposted: Boolean(row.viewer_has_reposted)
  };
}

async function attachMedia(postIds: string[]): Promise<Map<string, PostMedia[]>> {
  const map = new Map<string, PostMedia[]>();
  if (postIds.length === 0) return map;
  const rows = await sql`
    select id, post_id, url, alt_text, position
    from post_media
    where post_id = any(${postIds})
    order by position asc
  `;
  for (const row of rows as any[]) {
    const list = map.get(row.post_id) ?? [];
    list.push({ id: row.id, url: row.url, altText: row.alt_text ?? "", position: row.position });
    map.set(row.post_id, list);
  }
  return map;
}

/**
 * Feed principal : publications publiées. Les auteurs suivis par le viewer
 * remontent en premier, le reste sert de section découverte par récence.
 * Stratégie volontairement simple (section 33 du cahier des charges) —
 * facile à remplacer par un scoring plus riche en V2 sans changer l'appelant.
 */
export async function getFeed(viewerId: string | null, limit = 20, offset = 0): Promise<Post[]> {
  const rows = await sql`
    select
      p.id, p.author_id, p.type, p.content, p.link_url, p.status,
      p.likes_count, p.comments_count, p.reposts_count,
      p.created_at, p.updated_at, p.published_at,
      pr.username as author_username, pr.display_name as author_display_name,
      pr.avatar_url as author_avatar_url, pr.is_author as author_is_author,
      exists(select 1 from likes l where l.post_id = p.id and l.user_id = ${viewerId}) as viewer_has_liked,
      exists(select 1 from saves s where s.post_id = p.id and s.user_id = ${viewerId}) as viewer_has_saved,
      exists(select 1 from reposts r where r.original_post_id = p.id and r.user_id = ${viewerId}) as viewer_has_reposted,
      (${viewerId}::text is not null and exists(
        select 1 from follows f where f.follower_id = ${viewerId} and f.author_id = p.author_id
      )) as is_followed
    from posts p
    join profiles pr on pr.id = p.author_id
    where p.status = 'published'
    order by is_followed desc, p.published_at desc
    limit ${limit} offset ${offset}
  `;
  const media = await attachMedia((rows as any[]).map((r) => r.id));
  return (rows as any[]).map((r) => rowToPost(r, media.get(r.id) ?? []));
}

export async function getPostById(postId: string, viewerId: string | null): Promise<Post | null> {
  const rows = await sql`
    select
      p.id, p.author_id, p.type, p.content, p.link_url, p.status,
      p.likes_count, p.comments_count, p.reposts_count,
      p.created_at, p.updated_at, p.published_at,
      pr.username as author_username, pr.display_name as author_display_name,
      pr.avatar_url as author_avatar_url, pr.is_author as author_is_author,
      exists(select 1 from likes l where l.post_id = p.id and l.user_id = ${viewerId}) as viewer_has_liked,
      exists(select 1 from saves s where s.post_id = p.id and s.user_id = ${viewerId}) as viewer_has_saved,
      exists(select 1 from reposts r where r.original_post_id = p.id and r.user_id = ${viewerId}) as viewer_has_reposted
    from posts p
    join profiles pr on pr.id = p.author_id
    where p.id = ${postId}
    limit 1
  `;
  if (rows.length === 0) return null;
  const media = await attachMedia([postId]);
  return rowToPost(rows[0], media.get(postId) ?? []);
}

export async function getPostsByAuthor(
  authorId: string,
  viewerId: string | null,
  status: "published" | "draft" = "published"
): Promise<Post[]> {
  const rows = await sql`
    select
      p.id, p.author_id, p.type, p.content, p.link_url, p.status,
      p.likes_count, p.comments_count, p.reposts_count,
      p.created_at, p.updated_at, p.published_at,
      pr.username as author_username, pr.display_name as author_display_name,
      pr.avatar_url as author_avatar_url, pr.is_author as author_is_author,
      exists(select 1 from likes l where l.post_id = p.id and l.user_id = ${viewerId}) as viewer_has_liked,
      exists(select 1 from saves s where s.post_id = p.id and s.user_id = ${viewerId}) as viewer_has_saved,
      exists(select 1 from reposts r where r.original_post_id = p.id and r.user_id = ${viewerId}) as viewer_has_reposted
    from posts p
    join profiles pr on pr.id = p.author_id
    where p.author_id = ${authorId} and p.status = ${status}
    order by p.created_at desc
  `;
  const media = await attachMedia((rows as any[]).map((r) => r.id));
  return (rows as any[]).map((r) => rowToPost(r, media.get(r.id) ?? []));
}

export async function getSavedPosts(viewerId: string): Promise<Post[]> {
  const rows = await sql`
    select
      p.id, p.author_id, p.type, p.content, p.link_url, p.status,
      p.likes_count, p.comments_count, p.reposts_count,
      p.created_at, p.updated_at, p.published_at,
      pr.username as author_username, pr.display_name as author_display_name,
      pr.avatar_url as author_avatar_url, pr.is_author as author_is_author,
      exists(select 1 from likes l where l.post_id = p.id and l.user_id = ${viewerId}) as viewer_has_liked,
      true as viewer_has_saved,
      exists(select 1 from reposts r where r.original_post_id = p.id and r.user_id = ${viewerId}) as viewer_has_reposted
    from saves s
    join posts p on p.id = s.post_id
    join profiles pr on pr.id = p.author_id
    where s.user_id = ${viewerId}
    order by s.created_at desc
  `;
  const media = await attachMedia((rows as any[]).map((r) => r.id));
  return (rows as any[]).map((r) => rowToPost(r, media.get(r.id) ?? []));
}

export async function createPost(input: {
  authorId: string;
  type: "text" | "image" | "link";
  content: string;
  linkUrl?: string | null;
  mediaUrl?: string | null;
  status: "draft" | "published";
}): Promise<Post> {
  const rows =
    input.status === "published"
      ? await sql`
          insert into posts (author_id, type, content, link_url, status, published_at)
          values (${input.authorId}, ${input.type}, ${input.content}, ${input.linkUrl ?? null}, 'published', now())
          returning id
        `
      : await sql`
          insert into posts (author_id, type, content, link_url, status)
          values (${input.authorId}, ${input.type}, ${input.content}, ${input.linkUrl ?? null}, 'draft')
          returning id
        `;
  const postId = rows[0]!.id as string;

  if (input.mediaUrl) {
    await sql`insert into post_media (post_id, url, position) values (${postId}, ${input.mediaUrl}, 0)`;
  }

  const created = await getPostById(postId, input.authorId);
  if (!created) throw new Error("La publication n'a pas pu être créée.");
  return created;
}

export async function updateDraftContent(
  postId: string,
  authorId: string,
  input: { content: string; linkUrl?: string | null }
): Promise<void> {
  await sql`
    update posts
    set content = ${input.content}, link_url = ${input.linkUrl ?? null}
    where id = ${postId} and author_id = ${authorId} and status = 'draft'
  `;
}

export async function publishDraft(postId: string, authorId: string): Promise<void> {
  await sql`
    update posts
    set status = 'published', published_at = now()
    where id = ${postId} and author_id = ${authorId} and status = 'draft'
  `;
}

export async function updatePublishedPost(
  postId: string,
  authorId: string,
  input: { content: string; linkUrl?: string | null }
): Promise<void> {
  await sql`
    update posts
    set content = ${input.content}, link_url = ${input.linkUrl ?? null}
    where id = ${postId} and author_id = ${authorId} and status = 'published'
  `;
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  await sql`delete from posts where id = ${postId} and author_id = ${authorId}`;
}

export async function isPostOwner(postId: string, authorId: string): Promise<boolean> {
  const rows = await sql`select 1 from posts where id = ${postId} and author_id = ${authorId} limit 1`;
  return rows.length > 0;
}

export async function getAuthorStats(authorId: string) {
  const rows = await sql`
    select
      (select count(*) from posts where author_id = ${authorId} and status = 'published') as posts_count,
      (select coalesce(sum(likes_count), 0) from posts where author_id = ${authorId}) as total_likes,
      (select count(*) from follows where author_id = ${authorId}) as followers_count
  `;
  const r = rows[0]!;
  return {
    postsCount: Number(r.posts_count),
    totalLikes: Number(r.total_likes),
    followersCount: Number(r.followers_count)
  };
}
