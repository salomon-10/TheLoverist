import "server-only";
import { stackServerApp } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Profile, SessionUser, ViewerRole } from "@/types";

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

/**
 * Résout l'utilisateur courant à partir du cookie de session Stack Auth,
 * puis charge (ou crée) son profil applicatif.
 *
 * C'est la SEULE fonction dont les Server Actions et Server Components
 * doivent se servir pour connaître l'identité du viewer. Ne jamais faire
 * confiance à un id/rôle envoyé depuis le client.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const authUser = await stackServerApp.getUser();
  if (!authUser) return null;

  const rows = await sql`select * from profiles where id = ${authUser.id} limit 1`;

  if (rows.length === 0) {
    // Premier login : on crée le profil applicatif à partir des infos Stack Auth.
    const baseUsername = (authUser.displayName ?? authUser.primaryEmail ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || `user${authUser.id.slice(0, 6)}`;

    const created = await sql`
      insert into profiles (id, username, display_name, avatar_url)
      values (${authUser.id}, ${baseUsername}, ${authUser.displayName ?? baseUsername}, ${authUser.profileImageUrl ?? null})
      on conflict (id) do update set id = excluded.id
      returning *
    `;
    return {
      id: authUser.id,
      email: authUser.primaryEmail ?? "",
      profile: rowToProfile(created[0])
    };
  }

  return {
    id: authUser.id,
    email: authUser.primaryEmail ?? "",
    profile: rowToProfile(rows[0])
  };
}

/** Détermine le rôle effectif du viewer courant. Toujours calculé côté serveur. */
export async function getViewerRole(): Promise<ViewerRole> {
  const user = await getCurrentUser();
  if (!user || !user.profile) return "visitor";
  return user.profile.isAuthor ? "author" : "member";
}

/** À utiliser en tête d'une Server Action qui exige une session active. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

/** À utiliser en tête d'une Server Action réservée aux auteurs. */
export async function requireAuthor(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.profile?.isAuthor) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
