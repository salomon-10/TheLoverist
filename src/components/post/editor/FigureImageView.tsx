"use client";

import { useRef, useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { RefreshCw, Trash2 } from "lucide-react";
import IconButton from "@/components/ui/IconButton";

export default function FigureImageView({ node, updateAttributes, deleteNode, editor }: ReactNodeViewProps) {
  const [caption, setCaption] = useState<string>(node.attrs.caption ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editable = editor.isEditable;

  async function handleReplace(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
    const result = (await response.json().catch(() => ({}))) as { url?: string };
    if (result.url) updateAttributes({ src: result.url });
  }

  return (
    <NodeViewWrapper className="group/image relative my-6 rounded-lg" data-drag-handle>
      <figure className="space-y-2">
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface-sunken">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={node.attrs.src} alt={node.attrs.alt ?? ""} className="max-h-[440px] w-full object-cover" />
          {editable && (
            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/image:opacity-100">
              <IconButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Remplacer l'image"
                className="bg-ink/75 text-white hover:bg-ink"
              >
                <RefreshCw size={15} />
              </IconButton>
              <IconButton
                type="button"
                onClick={() => deleteNode()}
                aria-label="Supprimer le bloc image"
                className="bg-ink/75 text-white hover:bg-signal"
              >
                <Trash2 size={15} />
              </IconButton>
            </div>
          )}
        </div>
        {editable ? (
          <input
            value={caption}
            onChange={(event) => {
              setCaption(event.target.value);
              updateAttributes({ caption: event.target.value });
            }}
            placeholder="Ajouter une légende (optionnel)…"
            aria-label="Légende de l'image"
            className="focus-ring w-full rounded bg-transparent text-center font-sans text-body-sm italic text-muted placeholder:text-muted/70"
          />
        ) : (
          node.attrs.caption && (
            <figcaption className="text-center font-sans text-body-sm italic text-muted">
              {node.attrs.caption}
            </figcaption>
          )
        )}
      </figure>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleReplace(file);
          event.target.value = "";
        }}
      />
    </NodeViewWrapper>
  );
}
