"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/react";
import { updateDraftAction, publishDraftAction, deletePostAction } from "@/actions/posts";
import { formatRelativeTime } from "@/lib/utils";
import { isContentEmpty } from "@/lib/content";
import Button from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import BlockEditor from "@/components/post/editor/BlockEditor";
import RenderContent from "@/components/post/editor/RenderContent";
import type { Post, PostContent } from "@/types";

export default function DraftCard({ draft }: { draft: Post }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [linkUrl, setLinkUrl] = useState(draft.linkUrl ?? "");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    const content: PostContent = editor ? (editor.getJSON() as PostContent) : draft.content;
    const formData = new FormData();
    formData.set("content", JSON.stringify(content));
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
          <div className="rounded-md border border-line bg-surface px-3 py-2">
            <BlockEditor initialContent={draft.content} placeholder="Contenu du brouillon…" onEditorReady={setEditor} />
          </div>
          <TextInput
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Lien (optionnel)"
            aria-label="Lien du brouillon"
          />
        </div>
      ) : isContentEmpty(draft.content) ? (
        <p className="italic text-muted">Brouillon sans texte</p>
      ) : (
        <RenderContent content={draft.content} />
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
