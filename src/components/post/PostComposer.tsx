"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Link2, Loader2, Upload, X } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setIsDragging(false);
  }

  async function uploadImage(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Sélectionnez une image JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo.");
      return;
    }

    setShowImageField(true);
    setIsUploading(true);
    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = (await response.json()) as { url?: string; message?: string };
      if (!response.ok || !result.url) {
        setError(result.message ?? "L'image n'a pas pu être envoyée.");
        return;
      }
      setMediaUrl(result.url);
    } catch {
      setError("L'envoi de l'image a échoué. Vérifiez votre connexion.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void uploadImage(file);
    event.target.value = "";
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/"));
    if (file) {
      event.preventDefault();
      void uploadImage(file);
    }
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
        <IconButton
          onClick={() => {
            setExpanded(true);
            fileInputRef.current?.click();
          }}
          aria-label="Téléverser une image"
        >
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
            onPaste={handlePaste}
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
            <div
              className={cx(
                "animate-field-in mt-2 overflow-hidden rounded border border-dashed border-line-strong bg-surface-sunken",
                isDragging && "border-accent bg-accent-soft"
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) void uploadImage(file);
              }}
            >
              {mediaUrl ? (
                <div className="relative">
                  <img src={mediaUrl} alt="Aperçu de l'image à publier" className="max-h-72 w-full object-cover" />
                  <div className="absolute right-2 top-2 flex gap-1 rounded bg-ink/70 p-1">
                    <IconButton onClick={() => fileInputRef.current?.click()} aria-label="Remplacer l'image">
                      <Upload size={16} />
                    </IconButton>
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
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="focus-ring flex min-h-24 w-full flex-col items-center justify-center gap-2 px-4 py-5 font-sans text-body-sm text-muted"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin text-accent" /> : <Upload size={20} />}
                  <span>{isUploading ? "Envoi de l'image…" : "Choisir une image ou la déposer ici"}</span>
                  <span className="text-body-xs">JPG, PNG, WebP ou GIF · 10 Mo maximum</span>
                </button>
              )}
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
                  onClick={() => {
                    setShowImageField(true);
                    fileInputRef.current?.click();
                  }}
                  active={showImageField}
                  aria-label="Téléverser une image"
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}
