"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { ImageDialog } from "./image-dialog";

interface ImageDialogContextType {
  openImageDialog: (onInsert: (data: { src: string; alt?: string; title?: string }) => void) => void;
}

const ImageDialogContext = createContext<ImageDialogContextType | null>(null);

export function useImageDialog() {
  const context = useContext(ImageDialogContext);
  if (!context) {
    throw new Error("useImageDialog must be used within ImageDialogProvider");
  }
  return context;
}

interface ImageDialogProviderProps {
  children: ReactNode;
}

export function ImageDialogProvider({ children }: ImageDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [onInsertCallback, setOnInsertCallback] = useState<
    ((data: { src: string; alt?: string; title?: string }) => void) | null
  >(null);

  const openImageDialog = useCallback(
    (onInsert: (data: { src: string; alt?: string; title?: string }) => void) => {
      setOnInsertCallback(() => onInsert);
      setOpen(true);
    },
    []
  );

  const handleInsert = useCallback(
    (data: { src: string; alt?: string; title?: string }) => {
      if (onInsertCallback) {
        onInsertCallback(data);
      }
      setOpen(false);
      setOnInsertCallback(null);
    },
    [onInsertCallback]
  );

  return (
    <ImageDialogContext.Provider value={{ openImageDialog }}>
      {children}
      <ImageDialog open={open} onOpenChange={setOpen} onInsert={handleInsert} />
    </ImageDialogContext.Provider>
  );
}
