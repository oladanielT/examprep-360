"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

// React component for audio node view
function AudioComponent({ node }: NodeViewProps) {
  const { src, title } = node.attrs as { src: string; title?: string };

  return (
    <NodeViewWrapper className="audio-wrapper my-4">
      <div className="relative w-full max-w-2xl mx-auto bg-muted/30 rounded-lg p-4">
        <audio
          src={src}
          controls
          className="w-full"
          title={title || "Audio"}
        >
          Your browser does not support the audio element.
        </audio>
        {title && (
          <p className="text-sm text-muted-foreground mt-2 text-center">{title}</p>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Tiptap Audio Extension
export const Audio = Node.create({
  name: "audio",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="audio"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-type": "audio" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioComponent);
  },

  addCommands() {
    return {
      setAudio:
        (options: { src: string; title?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Type augmentation for Tiptap
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}
