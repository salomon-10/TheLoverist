import type { PostContent, PostContentNode } from "@/types";

/** Document vide — état initial de l'éditeur et valeur par défaut en base. */
export const EMPTY_DOC: PostContent = { type: "doc", content: [] };

/**
 * Un nœud "compte" comme contenu s'il porte du texte non vide, ou si c'est
 * un bloc intrinsèquement visuel (image, séparateur) même sans texte.
 */
function nodeHasContent(node: PostContentNode): boolean {
  if (node.type === "figureImage" || node.type === "horizontalRule") return true;
  if (typeof node.text === "string" && node.text.trim().length > 0) return true;
  return (node.content ?? []).some(nodeHasContent);
}

export function isContentEmpty(doc: PostContent | null | undefined): boolean {
  if (!doc?.content?.length) return true;
  return !doc.content.some(nodeHasContent);
}

/**
 * Aplati un document en texte brut — utilisé pour l'aperçu du feed
 * (`PostCard`), le compteur de caractères et les extraits de notifications.
 * Chaque bloc est séparé par un espace pour rester lisible en une ligne.
 */
export function extractPlainText(doc: PostContent | null | undefined, maxLength = 280): string {
  if (!doc?.content?.length) return "";

  const parts: string[] = [];
  function walk(node: PostContentNode) {
    if (typeof node.text === "string") parts.push(node.text);
    if (node.type === "figureImage" && typeof node.attrs?.alt === "string" && node.attrs.alt) {
      parts.push(`[image: ${node.attrs.alt}]`);
    }
    for (const child of node.content ?? []) walk(child);
  }
  for (const node of doc.content) walk(node);

  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}
