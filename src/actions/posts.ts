"use server";

import { revalidatePath } from "next/cache";
import { requireAuthor } from "@/lib/session";
import { createPostSchema, parsePostContent, postContentSchema } from "@/lib/validation";
import { isContentEmpty } from "@/lib/content";
import * as postsData from "@/data/posts";
import type { ActionResult } from "@/types";

/**
 * Toutes les actions ci-dessous vérifient le rôle et la propriété
 * côté serveur (jamais uniquement dans l'UI) — voir section 24 du
 * cahier des charges.
 */

export async function createPostAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireAuthor();
  } catch {
    return { ok: false, message: "Connectez-vous en tant qu'auteur pour publier." };
  }

  const parsed = createPostSchema.safeParse({
    content: parsePostContent(formData.get("content")),
    type: formData.get("type")?.toString() ?? "text",
    linkUrl: formData.get("linkUrl")?.toString() ?? "",
    mediaUrl: formData.get("mediaUrl")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "published"
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Publication invalide." };
  }

  const post = await postsData.createPost({
    authorId: user.id,
    type: parsed.data.type,
    content: parsed.data.content,
    linkUrl: parsed.data.linkUrl || null,
    mediaUrl: parsed.data.mediaUrl || null,
    status: parsed.data.status
  });

  revalidatePath("/");
  revalidatePath("/drafts");
  return { ok: true, data: { id: post.id } };
}

export async function updatePostAction(postId: string, formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuthor();
  } catch {
    return { ok: false, message: "Action réservée aux auteurs." };
  }

  const owns = await postsData.isPostOwner(postId, user.id);
  if (!owns) return { ok: false, message: "Vous ne pouvez modifier que vos propres publications." };

  const contentResult = postContentSchema.safeParse(parsePostContent(formData.get("content")));
  const linkUrl = formData.get("linkUrl")?.toString().trim() || null;
  if (!contentResult.success) return { ok: false, message: "Contenu de publication invalide." };
  if (isContentEmpty(contentResult.data) && !linkUrl) {
    return { ok: false, message: "La publication ne peut pas être vide." };
  }

  await postsData.updatePublishedPost(postId, user.id, { content: contentResult.data, linkUrl });
  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuthor();
  } catch {
    return { ok: false, message: "Action réservée aux auteurs." };
  }

  const owns = await postsData.isPostOwner(postId, user.id);
  if (!owns) return { ok: false, message: "Vous ne pouvez supprimer que vos propres publications." };

  await postsData.deletePost(postId, user.id);
  revalidatePath("/");
  revalidatePath("/drafts");
  return { ok: true };
}

export async function saveDraftAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireAuthor();
  } catch {
    return { ok: false, message: "Connectez-vous en tant qu'auteur pour créer un brouillon." };
  }

  const contentResult = postContentSchema.safeParse(parsePostContent(formData.get("content")));
  const linkUrl = formData.get("linkUrl")?.toString().trim() || null;
  const mediaUrl = formData.get("mediaUrl")?.toString().trim() || null;
  if (!contentResult.success) return { ok: false, message: "Contenu de publication invalide." };
  if (isContentEmpty(contentResult.data) && !linkUrl && !mediaUrl) {
    return { ok: false, message: "Un brouillon doit contenir au moins du texte, un lien ou une image." };
  }

  const post = await postsData.createPost({
    authorId: user.id,
    type: mediaUrl ? "image" : linkUrl ? "link" : "text",
    content: contentResult.data,
    linkUrl,
    mediaUrl,
    status: "draft"
  });

  revalidatePath("/drafts");
  return { ok: true, data: { id: post.id } };
}

export async function updateDraftAction(postId: string, formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuthor();
  } catch {
    return { ok: false, message: "Action réservée aux auteurs." };
  }

  const contentResult = postContentSchema.safeParse(parsePostContent(formData.get("content")));
  const linkUrl = formData.get("linkUrl")?.toString().trim() || null;
  if (!contentResult.success) return { ok: false, message: "Contenu de publication invalide." };

  await postsData.updateDraftContent(postId, user.id, { content: contentResult.data, linkUrl });
  revalidatePath("/drafts");
  return { ok: true };
}

export async function publishDraftAction(postId: string): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuthor();
  } catch {
    return { ok: false, message: "Action réservée aux auteurs." };
  }

  const owns = await postsData.isPostOwner(postId, user.id);
  if (!owns) return { ok: false, message: "Ce brouillon ne vous appartient pas." };

  await postsData.publishDraft(postId, user.id);
  revalidatePath("/drafts");
  revalidatePath("/");
  return { ok: true };
}
