// ===========================================
// FILE: features/media/stores/upload-history-store.ts
// Upload History Store - Keeps track of uploaded files in current session
// ===========================================

import { create } from "zustand";
import { UploadResponse } from "@/features/media/api/upload-file";

// ========== TYPES ==========
export interface UploadHistoryItem {
  id: string;
  files: UploadResponse[];
  uploadedAt: Date;
  isMultiple: boolean;
}

interface UploadHistoryState {
  history: UploadHistoryItem[];
  addUpload: (files: UploadResponse | UploadResponse[], isMultiple: boolean) => void;
  clearHistory: () => void;
  removeUpload: (id: string) => void;
}

// ========== STORE ==========
export const useUploadHistoryStore = create<UploadHistoryState>((set) => ({
  history: [],

  addUpload: (files, isMultiple) => {
    const filesArray = Array.isArray(files) ? files : [files];
    const newItem: UploadHistoryItem = {
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      files: filesArray,
      uploadedAt: new Date(),
      isMultiple,
    };

    set((state) => ({
      history: [newItem, ...state.history], // Add to beginning of array
    }));
  },

  clearHistory: () => set({ history: [] }),

  removeUpload: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    })),
}));
