import { z } from "zod";
import { EMPTY_DOC, isContentEmpty } from "@/lib/content";
import type { PostContent, PostContentNode } from "@/types";

// --- Contenu riche (éditeur par blocs) -----------------------------------
// Le contenu arrive du client sous forme de document ProseMirror/Tiptap
// sérialisé en JSON. On ne fait jamais confiance à ce JSON tel quel — même
// venant d'un compte auteur authentifié — on restreint donc explicitement
// les types de nœuds et de marques à ce que l'éditeur peut réellement
// produire (voir `src/components/post/editor/BlockEditor.tsx`).

const ALLOWED_MARK_TYPES = ["bold", "italic", "strike", "link"] as const;
const ALLOWED_NODE_TYPES = [
  "paragraph",
  "text",
  "heading",
  "blockquote",
  "figureImage",
  "codeBlock",
  "horizontalRule",
  "bulletList",
  "orderedList",
  "listItem",
  "hardBreak"
] as const;

const markSchema = z.object({
  type: z.enum(ALLOWED_MARK_TYPES),
  attrs: z
    .object({ href: z.string().trim().url().max(2048).optional() })
    .partial()
    .optional()
});

// Récursif : un nœud peut contenir des nœuds enfants (paragraphe > texte,
// liste > item > paragraphe, etc.) — `z.lazy` casse la référence circulaire.
const contentNodeSchema: z.ZodType<PostContentNode> = z.lazy(() =>
  z.object({
    type: z.enum(ALLOWED_NODE_TYPES),
    attrs: z.record(z.unknown()).optional(),
    text: z.string().max(4000).optional(),
    marks: z.array(markSchema).max(8).optional(),
    content: z.array(contentNodeSchema).max(300).optional()
  })
);

export const postContentSchema: z.ZodType<PostContent> = z
  .object({
    type: z.literal("doc"),
    content: z.array(contentNodeSchema).max(300, "Publication trop longue.")
  })
  .refine((doc) => JSON.stringify(doc).length <= 20_000, {
    message: "Le contenu dépasse la taille maximale autorisée."
  });

/** Parse le JSON brut reçu du FormData ; ne lève jamais, renvoie le doc vide si invalide. */
export function parsePostContent(raw: FormDataEntryValue | null): PostContent {
  if (typeof raw !== "string" || raw.trim().length === 0) return EMPTY_DOC;
  try {
    return JSON.parse(raw) as PostContent;
  } catch {
    return EMPTY_DOC;
  }
}

export const urlSchema = z
  .string()
  .trim()
  .url("Ce lien n'est pas valide.")
  .max(2048);

const mediaUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === "" || value.startsWith("/uploads/") || urlSchema.safeParse(value).success, {
    message: "Cette image n'est pas valide."
  });

export const createPostSchema = z
  .object({
    content: postContentSchema.optional().default(EMPTY_DOC),
    type: z.enum(["text", "image", "link"]),
    linkUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
    mediaUrl: mediaUrlSchema.optional().or(z.literal("")),
    status: z.enum(["draft", "published"])
  })
  .refine((data) => !isContentEmpty(data.content) || data.mediaUrl || data.linkUrl, {
    message: "Une publication doit contenir du texte, une image ou un lien."
  });

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, "Le commentaire ne peut pas être vide.")
  .max(500, "Le commentaire ne peut pas dépasser 500 caractères.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "3 caractères minimum.")
  .max(24, "24 caractères maximum.")
  .regex(/^[a-z0-9_]+$/, "Lettres minuscules, chiffres et underscore uniquement.");

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  username: usernameSchema,
  bio: z.string().trim().max(280).optional().default(""),
  avatarUrl: z.string().trim().url().max(2048).optional().or(z.literal(""))
});
