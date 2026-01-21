"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

// Helper to convert YouTube/Vimeo URLs to embed URLs
function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "direct"; embedUrl: string } {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Direct video URL
  return {
    type: "direct",
    embedUrl: url,
  };
}

// React component for video node view
function VideoComponent({ node }: NodeViewProps) {
  const { src, title } = node.attrs as { src: string; title?: string };
  const { type, embedUrl } = getEmbedUrl(src);

  return (
    <NodeViewWrapper className="video-wrapper my-4">
      <div className="relative w-full max-w-3xl mx-auto">
        {type === "direct" ? (
          <video
            src={embedUrl}
            controls
            className="w-full rounded-lg shadow-sm"
            title={title || "Video"}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-sm">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || "Video"}
            />
          </div>
        )}
        {title && (
          <p className="text-sm text-muted-foreground mt-2 text-center">{title}</p>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Tiptap Video Extension
export const Video = Node.create({
  name: "video",

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
        tag: 'div[data-type="video"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-type": "video" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },

  addCommands() {
    return {
      setVideo:
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
    video: {
      setVideo: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}
