"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { commentContentSchema } from "@/lib/validation";
import * as commentsData from "@/data/comments";
import * as socialData from "@/data/social";
import * as notificationsData from "@/data/notifications";
import type { ActionResult } from "@/types";

export async function createCommentAction(
  postId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Connectez-vous pour commenter." };
  }

  const parsed = commentContentSchema.safeParse(formData.get("content")?.toString() ?? "");
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Commentaire invalide." };
  }

  const parentCommentId = formData.get("parentCommentId")?.toString() || null;

  // Profondeur limitée à 2 niveaux : une réponse ne peut cibler qu'un commentaire principal.
  if (parentCommentId) {
    const isTopLevel = await commentsData.isTopLevelComment(parentCommentId);
    if (!isTopLevel) {
      return { ok: false, message: "Impossible de répondre à une réponse." };
    }
  }

  const comment = await commentsData.createComment({
    postId,
    authorId: user.id,
    parentCommentId,
    content: parsed.data
  });

  const postAuthorId = await socialData.getPostAuthorId(postId);
  if (postAuthorId) {
    await notificationsData.notify({
      recipientId: postAuthorId,
      actorId: user.id,
      type: parentCommentId ? "reply" : "comment",
      postId,
      commentId: comment.id
    });
  }

  // Si c'est une réponse, notifier aussi l'auteur du commentaire parent.
  if (parentCommentId) {
    const parentAuthorId = await socialData.getCommentAuthorId(parentCommentId);
    if (parentAuthorId && parentAuthorId !== postAuthorId) {
      await notificationsData.notify({
        recipientId: parentAuthorId,
        actorId: user.id,
        type: "reply",
        postId,
        commentId: comment.id
      });
    }
  }

  revalidatePath(`/post/${postId}`);
  return { ok: true, data: { id: comment.id } };
}
