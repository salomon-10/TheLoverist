import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FigureImageView from "./FigureImageView";

export interface FigureImageOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figureImage: {
      insertFigureImage: (attrs: { src: string; alt?: string; caption?: string }) => ReturnType;
    };
  }
}

/**
 * Bloc "image panoramique" du mockup : une figure avec légende éditable,
 * rendue en lecture seule comme un <figure><img/><figcaption/></figure>.
 * Node "atom" : un seul bloc indivisible dans le document, comme l'image
 * d'exemple de la maquette (Figure 1.2 — Villa E-1027…).
 */
export const FigureImage = Node.create<FigureImageOptions>({
  name: "figureImage",
  group: "block",
  atom: true,
  draggable: true,
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" }
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-figure-image]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "figure",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-figure-image": "" }),
      ["img", { src: node.attrs.src, alt: node.attrs.alt }],
      ["figcaption", {}, node.attrs.caption || ""]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureImageView);
  },

  addCommands() {
    return {
      insertFigureImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs })
    };
  }
});

export default FigureImage;
