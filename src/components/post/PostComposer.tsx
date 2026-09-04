"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Link2, X } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { createPostAction, saveDraftAction } from "@/actions/posts";
import { cx } from "@/lib/utils";
import type { Profile } from "@/types";

const MAX_LENGTH = 2000;

export default function PostComposer({ author }: { author: Profile }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [showLinkField, setShowLinkField] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const hasContent = content.trim().length > 0 || mediaUrl.trim().length > 0 || linkUrl.trim().length > 0;
  const remaining = MAX_LENGTH - content.length;

  function reset() {
    setContent("");
    setMediaUrl("");
    setLinkUrl("");
    setShowImageField(false);
    setShowLinkField(false);
    setExpanded(false);
    setError(null);
  }

  function submit(status: "draft" | "published") {
    setError(null);
    const formData = new FormData();
    formData.set("content", content);
    formData.set("linkUrl", linkUrl);
    formData.set("mediaUrl", mediaUrl);
    formData.set("status", status);
    formData.set("type", mediaUrl ? "image" : linkUrl ? "link" : "text");

    startTransition(async () => {
      const action = status === "draft" ? saveDraftAction : createPostAction;
      const result = await action(formData);
      if (!result.ok) {
        setError(result.message ?? "Une erreur est survenue.");
        return;
      }
      reset();
      router.refresh();
    });
  }

  return (
    <div className="border-b border-line pb-stack-sm">
      <div className={cx("flex items-center gap-2.5 sm:hidden", expanded && "hidden")}>
        <UserAvatar src={author.avatarUrl} name={author.displayName} size="sm" className="shrink-0" />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="focus-ring min-w-0 flex-1 rounded px-1 text-left font-sans text-body-md text-muted"
        >
          Quoi de neuf ?
        </button>
        <IconButton onClick={() => setExpanded(true)} aria-label="Ajouter une image">
          <ImageIcon size={19} strokeWidth={1.75} />
        </IconButton>
      </div>

      <div className={cx("gap-4 sm:flex", expanded ? "flex" : "hidden sm:flex")}>
        <UserAvatar src={author.avatarUrl} name={author.displayName} size="md" className="mt-1 shrink-0" />

        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Quoi de neuf ?"
            aria-label="Contenu de la publication"
            rows={expanded ? 3 : 1}
            maxLength={MAX_LENGTH}
            autoFocus={expanded}
            className="focus-ring transition-editorial w-full resize-none rounded bg-transparent font-serif text-headline-sm text-ink placeholder:text-muted"
          />

          {showLinkField && (
            <div className="animate-field-in mt-2 flex items-center gap-2">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
                aria-label="Lien à joindre"
                className="focus-ring transition-editorial w-full rounded border border-line bg-surface-sunken px-3.5 py-2.5 font-sans text-body-md text-ink placeholder:text-muted"
              />
              <IconButton
                onClick={() => {
                  setShowLinkField(false);
                  setLinkUrl("");
                }}
                aria-label="Retirer le lien"
              >
                <X size={16} />
              </IconButton>
            </div>
          )}

          {showImageField && (
            <div className="animate-field-in mt-2 flex items-center gap-2">
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL de l'image…"
                aria-label="URL de l'image à joindre"
                className="focus-ring transition-editorial w-full rounded border border-line bg-surface-sunken px-3.5 py-2.5 font-sans text-body-md text-ink placeholder:text-muted"
              />
              <IconButton
                onClick={() => {
                  setShowImageField(false);
                  setMediaUrl("");
                }}
                aria-label="Retirer l'image"
              >
                <X size={16} />
              </IconButton>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-2 font-sans text-body-md text-signal">
              {error}
            </p>
          )}

          {expanded && (
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <div className="flex items-center gap-1">
                <IconButton
                  onClick={() => setShowImageField((v) => !v)}
                  active={showImageField}
                  aria-label="Ajouter une image"
                  aria-pressed={showImageField}
                >
                  <ImageIcon size={18} strokeWidth={1.75} />
                </IconButton>
                <IconButton
                  onClick={() => setShowLinkField((v) => !v)}
                  active={showLinkField}
                  aria-label="Ajouter un lien"
                  aria-pressed={showLinkField}
                >
                  <Link2 size={18} strokeWidth={1.75} />
                </IconButton>
                {content.length > MAX_LENGTH - 200 && (
                  <span
                    className={cx(
                      "font-sans text-body-sm tabular-nums",
                      remaining < 0 ? "text-signal" : "text-muted"
                    )}
                  >
                    {remaining}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <IconButton onClick={reset} aria-label="Fermer l'éditeur" className="sm:hidden">
                  <X size={18} />
                </IconButton>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => submit("draft")}
                  disabled={isPending || !hasContent}
                >
                  Brouillon
                </Button>
                <Button type="button" onClick={() => submit("published")} disabled={isPending || !hasContent}>
                  {isPending ? "Publication…" : "Publier"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
