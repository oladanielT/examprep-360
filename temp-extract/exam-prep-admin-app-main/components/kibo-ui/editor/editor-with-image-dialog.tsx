"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { ImageDialog } from "./image-dialog";
import type { Editor } from "@tiptap/react";

interface EditorWithImageDialogProps {
  children: ReactNode;
}

// Custom event for opening image dialog
const IMAGE_DIALOG_EVENT = "tiptap:open-image-dialog";

// Helper to dispatch the event (called from slash command)
export function openImageDialogEvent(editor: Editor) {
  const event = new CustomEvent(IMAGE_DIALOG_EVENT, { detail: { editor } });
  window.dispatchEvent(event);
}

export function EditorWithImageDialog({ children }: EditorWithImageDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const handleOpenDialog = (event: Event) => {
      const customEvent = event as CustomEvent<{ editor: Editor }>;
      editorRef.current = customEvent.detail.editor;
      setDialogOpen(true);
    };

    window.addEventListener(IMAGE_DIALOG_EVENT, handleOpenDialog);

    return () => {
      window.removeEventListener(IMAGE_DIALOG_EVENT, handleOpenDialog);
    };
  }, []);

  const handleInsert = (data: { src: string; alt?: string; title?: string }) => {
    if (editorRef.current) {
      editorRef.current.chain().focus().setImage(data).run();
    }
    setDialogOpen(false);
  };

  return (
    <>
      {children}
      <ImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInsert={handleInsert}
      />
    </>
  );
}
