"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDraftAction, publishDraftAction, deletePostAction } from "@/actions/posts";
import { formatRelativeTime } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { TextArea, TextInput } from "@/components/ui/Field";
import type { Post } from "@/types";

export default function DraftCard({ draft }: { draft: Post }) {
  const [content, setContent] = useState(draft.content);
  const [linkUrl, setLinkUrl] = useState(draft.linkUrl ?? "");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    const formData = new FormData();
    formData.set("content", content);
    formData.set("linkUrl", linkUrl);
    startTransition(async () => {
      const result = await updateDraftAction(draft.id, formData);
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setMessage(result.message ?? "Une erreur est survenue.");
      }
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishDraftAction(draft.id);
      if (result.ok) router.refresh();
      else setMessage(result.message ?? "Une erreur est survenue.");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePostAction(draft.id);
      if (result.ok) router.refresh();
      else setMessage(result.message ?? "Une erreur est survenue.");
    });
  }

  return (
    <div className="rounded-lg border border-line bg-paper p-5 shadow-card">
      <p className="mb-2 font-sans text-body-sm font-medium text-muted">
        Modifié {formatRelativeTime(draft.updatedAt)}
      </p>

      {editing ? (
        <div className="animate-field-in space-y-2">
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            aria-label="Contenu du brouillon"
            autoFocus
          />
          <TextInput
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Lien (optionnel)"
            aria-label="Lien du brouillon"
          />
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words font-sans text-body-lg text-ink">
          {draft.content || <span className="italic text-muted">Brouillon sans texte</span>}
        </p>
      )}

      {message && (
        <p role="alert" className="mt-2 font-sans text-body-md text-signal">
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {editing ? (
          <Button type="button" onClick={handleSave} disabled={isPending}>
            Enregistrer
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
            Modifier
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={handlePublish} disabled={isPending}>
          Publier
        </Button>
        <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
