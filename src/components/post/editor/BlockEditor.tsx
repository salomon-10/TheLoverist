"use client";

import { useEffect, useRef, useState } from "react";
import { BubbleMenu, EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link2,
  Minus,
  Quote,
  Strikethrough
} from "lucide-react";
import { FigureImage } from "./figureImageExtension";
import { EMPTY_DOC } from "@/lib/content";
import { cx } from "@/lib/utils";
import type { PostContent } from "@/types";

const MAX_CHARACTERS = 8000;

type SlashCommandId = "paragraph" | "heading2" | "quote" | "image" | "code" | "divider";

const SLASH_COMMANDS: { id: SlashCommandId; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: "paragraph", label: "Texte brut", hint: "Paragraphe classique et simple", icon: <span className="text-sm font-bold">T</span> },
  { id: "heading2", label: "Titre moyen", hint: "Grande section de chapitre", icon: <span className="text-sm font-bold">H2</span> },
  { id: "quote", label: "Citation mise en valeur", hint: "Mettre en exergue une formule clé", icon: <Quote size={16} /> },
  { id: "image", label: "Image panoramique", hint: "Téléversement depuis votre appareil", icon: <ImageIcon size={16} /> },
  { id: "code", label: "Bloc de code", hint: "Extrait avec coloration syntaxique", icon: <Code size={16} /> },
  { id: "divider", label: "Séparateur fin", hint: "Ligne de rupture discrète", icon: <Minus size={16} /> }
];

export default function BlockEditor({
  initialContent = EMPTY_DOC,
  placeholder = "Racontez quelque chose…",
  onEditorReady
}: {
  initialContent?: PostContent;
  placeholder?: string;
  onEditorReady?: (editor: Editor) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashRange, setSlashRange] = useState<{ from: number; to: number } | null>(null);
  const [slashCoords, setSlashCoords] = useState<{ top: number; left: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        // Le mockup ne montre pas de blocs code/citation imbriqués complexes —
        // on garde les valeurs par défaut de StarterKit pour le reste.
      }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "underline decoration-1 underline-offset-2" } }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: MAX_CHARACTERS }),
      FigureImage
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-editor focus:outline-none font-serif text-body-lg text-ink min-h-[10rem] [&_p]:leading-relaxed [&_h2]:font-sans [&_h2]:text-headline [&_h2]:font-bold [&_h2]:text-ink [&_blockquote]:border-l-2 [&_blockquote]:border-ink [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-headline-sm [&_blockquote]:text-ink [&_pre]:rounded-md [&_pre]:bg-ink [&_pre]:text-paper [&_pre]:p-3 [&_pre]:text-body-sm [&_hr]:border-line-strong"
      }
    },
    onCreate: ({ editor: created }) => onEditorReady?.(created),
    onUpdate: ({ editor: current }) => updateSlashState(current)
  });

  function updateSlashState(current: Editor) {
    const { state } = current;
    const { $from } = state.selection;
    if (!state.selection.empty) {
      setSlashQuery(null);
      return;
    }
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, "\u0000");
    const match = /(?:^|\s)\/(\w*)$/.exec(textBefore);
    if (!match) {
      setSlashQuery(null);
      return;
    }
    const slashText = match[1] ?? "";
    const slashLength = slashText.length + 1; // "/" + la requête tapée
    const from = $from.pos - slashLength;
    const coords = current.view.coordsAtPos(from);
    setSlashQuery(slashText);
    setSlashRange({ from, to: $from.pos });
    setSlashCoords({ top: coords.bottom + window.scrollY + 6, left: coords.left + window.scrollX });
  }

  useEffect(() => {
    if (!editor) return;
    const handler = () => updateSlashState(editor);
    editor.on("selectionUpdate", handler);
    return () => {
      editor.off("selectionUpdate", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function uploadAndInsertImage(file: File) {
    if (!editor || !slashRange) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      const result = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
      if (result.url) {
        editor.chain().focus().deleteRange(slashRange).insertFigureImage({ src: result.url, alt: "", caption: "" }).run();
      }
    } finally {
      setIsUploading(false);
      setSlashQuery(null);
    }
  }

  function runSlashCommand(id: SlashCommandId) {
    if (!editor || !slashRange) return;
    const chain = editor.chain().focus().deleteRange(slashRange);
    switch (id) {
      case "paragraph":
        chain.setParagraph().run();
        setSlashQuery(null);
        break;
      case "heading2":
        chain.setNode("heading", { level: 2 }).run();
        setSlashQuery(null);
        break;
      case "quote":
        chain.setBlockquote().run();
        setSlashQuery(null);
        break;
      case "code":
        chain.setCodeBlock().run();
        setSlashQuery(null);
        break;
      case "divider":
        chain.setHorizontalRule().run();
        setSlashQuery(null);
        break;
      case "image":
        chain.run();
        fileInputRef.current?.click();
        break;
    }
  }

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes((slashQuery ?? "").toLowerCase())
  );

  return (
    <div className="relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 120 }}
          shouldShow={({ state }) => !state.selection.empty}
          className="flex items-center gap-0.5 rounded-lg border border-ink bg-ink px-1 py-1 shadow-float"
        >
          <BubbleButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Gras">
            <Bold size={14} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italique">
            <Italic size={14} />
          </BubbleButton>
          <BubbleButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="Barré">
            <Strikethrough size={14} />
          </BubbleButton>
          <span className="mx-1 h-4 w-px bg-white/20" />
          <BubbleButton
            active={editor.isActive("link")}
            onClick={() => {
              const url = window.prompt("URL du lien");
              if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
              else editor.chain().focus().unsetLink().run();
            }}
            label="Lien"
          >
            <Link2 size={14} />
          </BubbleButton>
          <BubbleButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            label="Titre H2"
          >
            <span className="text-[11px] font-semibold">H2</span>
          </BubbleButton>
          <BubbleButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Citation">
            <Quote size={14} />
          </BubbleButton>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {slashQuery !== null && slashCoords && filteredCommands.length > 0 && (
        <div
          className="fixed z-30 w-72 rounded-lg border border-line-strong bg-paper p-1.5 shadow-float"
          style={{ top: slashCoords.top, left: slashCoords.left }}
        >
          <div className="px-2 py-1.5 font-sans text-label-caps uppercase tracking-wider text-muted">Éléments de contenu</div>
          <div className="space-y-0.5">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                disabled={isUploading}
                onMouseDown={(event) => {
                  event.preventDefault();
                  runSlashCommand(cmd.id);
                }}
                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-surface-sunken disabled:opacity-50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-surface-sunken text-ink">
                  {cmd.icon}
                </span>
                <span>
                  <span className="block font-sans text-body-sm font-semibold text-ink">{cmd.label}</span>
                  <span className="block font-sans text-[11px] text-muted">{cmd.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadAndInsertImage(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function BubbleButton({
  active,
  onClick,
  label,
  children
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cx(
        "flex h-7 w-7 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/10 hover:text-white",
        active && "bg-white/15 text-white"
      )}
    >
      {children}
    </button>
  );
}
