import { Fragment } from "react";
import type { PostContent, PostContentMark, PostContentNode } from "@/types";

/**
 * Rendu en lecture seule d'un document de blocs — sans dépendance à Tiptap
 * côté lecture (le feed et la page de publication n'ont pas besoin de
 * charger l'éditeur). Ne rend que les nœuds/marques listés dans
 * `postContentSchema` — tout le reste est ignoré silencieusement.
 */
export default function RenderContent({ content }: { content: PostContent }) {
  if (!content?.content?.length) return null;
  return (
    <div className="space-y-4 font-serif text-body-lg text-ink [&_a]:text-accent [&_a]:underline">
      {content.content.map((node, index) => (
        <BlockNode key={index} node={node} />
      ))}
    </div>
  );
}

function BlockNode({ node }: { node: PostContentNode }) {
  switch (node.type) {
    case "paragraph":
      return (
        <p className="leading-relaxed">
          <InlineContent nodes={node.content} />
        </p>
      );
    case "heading":
      return (
        <h2 className="font-sans text-headline font-bold text-ink">
          <InlineContent nodes={node.content} />
        </h2>
      );
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-ink pl-5 font-headline-sm text-headline-sm italic text-ink">
          {(node.content ?? []).map((child, index) => (
            <BlockNode key={index} node={child} />
          ))}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre className="overflow-x-auto rounded-md bg-ink p-3 text-body-sm text-paper">
          <code>
            <InlineContent nodes={node.content} />
          </code>
        </pre>
      );
    case "horizontalRule":
      return <hr className="border-line-strong" />;
    case "figureImage":
      return (
        <figure className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={typeof node.attrs?.src === "string" ? node.attrs.src : ""}
            alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : ""}
            className="w-full rounded-md border border-line object-cover"
          />
          {typeof node.attrs?.caption === "string" && node.attrs.caption && (
            <figcaption className="text-center font-sans text-body-sm italic text-muted">
              {node.attrs.caption}
            </figcaption>
          )}
        </figure>
      );
    case "bulletList":
      return (
        <ul className="list-disc space-y-1 pl-6">
          {(node.content ?? []).map((child, index) => (
            <BlockNode key={index} node={child} />
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol className="list-decimal space-y-1 pl-6">
          {(node.content ?? []).map((child, index) => (
            <BlockNode key={index} node={child} />
          ))}
        </ol>
      );
    case "listItem":
      return (
        <li>
          {(node.content ?? []).map((child, index) => (
            <BlockNode key={index} node={child} />
          ))}
        </li>
      );
    default:
      return null;
  }
}

function InlineContent({ nodes }: { nodes?: PostContentNode[] }) {
  if (!nodes?.length) return null;
  return (
    <>
      {nodes.map((node, index) => (
        <Fragment key={index}>
          {node.type === "hardBreak" ? <br /> : <MarkedText text={node.text ?? ""} marks={node.marks} />}
        </Fragment>
      ))}
    </>
  );
}

function MarkedText({ text, marks }: { text: string; marks?: PostContentMark[] }) {
  return marks?.reduce<React.ReactNode>((acc, mark) => {
    if (mark.type === "bold") return <strong>{acc}</strong>;
    if (mark.type === "italic") return <em>{acc}</em>;
    if (mark.type === "strike") return <s>{acc}</s>;
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      return (
        <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer nofollow">
          {acc}
        </a>
      );
    }
    return acc;
  }, text) as React.ReactElement;
}
