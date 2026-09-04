"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCommentAction } from "@/actions/comments";
import Button from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";

export default function CommentForm({
  postId,
  parentCommentId,
  isAuthenticated,
  placeholder = "Écrire un commentaire…",
  autoFocus = false,
  onDone
}: {
  postId: string;
  parentCommentId?: string;
  isAuthenticated: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  if (!isAuthenticated) {
    return <p className="py-2 font-sans text-body-md text-muted">Connectez-vous pour continuer</p>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);

    const formData = new FormData();
    formData.set("content", content);
    if (parentCommentId) formData.set("parentCommentId", parentCommentId);

    startTransition(async () => {
      const result = await createCommentAction(postId, formData);
      if (!result.ok) {
        setError(result.message ?? "Une erreur est survenue.");
        return;
      }
      setContent("");
      onDone?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <TextArea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={2}
        maxLength={500}
        autoFocus={autoFocus}
      />
      {error && (
        <p role="alert" className="font-sans text-body-md text-signal">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          Envoyer
        </Button>
      </div>
    </form>
  );
}
