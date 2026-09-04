import "server-only";
import { sql } from "@/lib/db";
import type { Profile, ProfileStats } from "@/types";

function rowToProfile(row: any): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio ?? "",
    isAuthor: row.is_author,
    createdAt: row.created_at
  };
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const rows = await sql`select * from profiles where username = ${username} limit 1`;
  return rows[0] ? rowToProfile(rows[0]) : null;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const rows = await sql`select * from profiles where id = ${id} limit 1`;
  return rows[0] ? rowToProfile(rows[0]) : null;
}

export async function getProfileStats(profileId: string): Promise<ProfileStats> {
  const rows = await sql`
    select
      (select count(*) from posts where author_id = ${profileId} and status = 'published') as posts_count,
      (select count(*) from follows where author_id = ${profileId}) as followers_count,
      (select count(*) from follows where follower_id = ${profileId}) as following_count,
      (select coalesce(sum(likes_count), 0) from posts where author_id = ${profileId}) as total_likes_received,
      (select count(*) from saves where user_id = ${profileId}) as saved_count
  `;
  const r = rows[0]!;
  return {
    postsCount: Number(r.posts_count),
    followersCount: Number(r.followers_count),
    followingCount: Number(r.following_count),
    totalLikesReceived: Number(r.total_likes_received),
    savedCount: Number(r.saved_count)
  };
}

export async function isUsernameTaken(username: string, excludingId?: string): Promise<boolean> {
  const rows = excludingId
    ? await sql`select 1 from profiles where username = ${username} and id <> ${excludingId} limit 1`
    : await sql`select 1 from profiles where username = ${username} limit 1`;
  return rows.length > 0;
}

export async function updateProfile(
  id: string,
  data: { displayName: string; username: string; bio: string; avatarUrl: string }
): Promise<Profile> {
  const rows = await sql`
    update profiles
    set display_name = ${data.displayName},
        username = ${data.username},
        bio = ${data.bio},
        avatar_url = ${data.avatarUrl || null}
    where id = ${id}
    returning *
  `;
  return rowToProfile(rows[0]);
}

/** Bascule un profil vers le rôle auteur. Réservé aux flux d'admin/onboarding. */
export async function promoteToAuthor(id: string): Promise<void> {
  await sql`update profiles set is_author = true where id = ${id}`;
}
