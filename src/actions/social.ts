"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import * as social from "@/data/social";
import * as notificationsData from "@/data/notifications";
import type { ActionResult } from "@/types";

export async function toggleLikePostAction(postId: string, nextLiked: boolean): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Connectez-vous pour continuer" };
  }

  if (nextLiked) {
    const applied = await social.likePost(user.id, postId);
    if (applied) {
      const authorId = await social.getPostAuthorId(postId);
      if (authorId) {
        await notificationsData.notify({ recipientId: authorId, actorId: user.id, type: "like", postId });
      }
    }
  } else {
    await social.unlikePost(user.id, postId);
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function toggleLikeCommentAction(
  commentId: string,
  postId: string,
  nextLiked: boolean
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Connectez-vous pour continuer" };
  }

  if (nextLiked) {
    await social.likeComment(user.id, commentId);
  } else {
    await social.unlikeComment(user.id, commentId);
  }

  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function toggleFollowAction(authorId: string, nextFollowing: boolean): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Connectez-vous pour continuer" };
  }

  if (user.id === authorId) {
    return { ok: false, message: "Vous ne pouvez pas vous suivre vous-même." };
  }

  if (nextFollowing) {
    const applied = await social.followAuthor(user.id, authorId);
    if (applied) {
      await notificationsData.notify({ recipientId: authorId, actorId: user.id, type: "follow" });
    }
  } else {
    await social.unfollowAuthor(user.id, authorId);
  }

  revalidatePath("/");
  return { ok: true };
}

export async function toggleSaveAction(postId: string, nextSaved: boolean): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Connectez-vous pour continuer" };
  }

  if (nextSaved) {
    await social.savePost(user.id, postId);
  } else {
    await social.unsavePost(user.id, postId);
  }

  revalidatePath("/bookmarks");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

/**
 * Republier : crée une entrée liée à l'original dans le feed du viewer et
 * notifie l'auteur d'origine. Ne duplique jamais le contenu (section 17).
 */
export async function toggleRepostAction(postId: string, nextReposted: boolean): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Connectez-vous pour continuer" };
  }

  if (nextReposted) {
    const applied = await social.repost(user.id, postId);
    if (applied) {
      const authorId = await social.getPostAuthorId(postId);
      if (authorId) {
        await notificationsData.notify({ recipientId: authorId, actorId: user.id, type: "repost", postId });
      }
    }
  } else {
    await social.unrepost(user.id, postId);
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}
