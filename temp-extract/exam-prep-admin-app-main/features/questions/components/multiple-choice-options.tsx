"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, ImageIcon, SigmaIcon } from "lucide-react";
import { toast } from "sonner";
import type { JSONContent } from "@/components/kibo-ui/editor";
import { EditorProvider, useCurrentEditor } from "@/components/kibo-ui/editor";
import {
  EditorBubbleMenu,
  EditorFormatBold,
  EditorFormatItalic,
  EditorFormatUnderline,
  EditorFormatStrike,
  EditorFormatCode,
  EditorFormatSubscript,
  EditorFormatSuperscript,
  EditorLinkSelector,
  EditorSelector,
  EditorNodeText,
  EditorNodeBulletList,
  EditorNodeOrderedList,
  EditorClearFormatting,
} from "@/components/kibo-ui/editor";
import { EditorWithImageDialog } from "@/components/kibo-ui/editor/editor-with-image-dialog";
import { ImageDialog } from "@/components/kibo-ui/editor/image-dialog";
import { MathDialog } from "@/components/kibo-ui/editor/math-dialog";

// Helper components for editor toolbars
function ImageButton() {
  const { editor } = useCurrentEditor();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!editor) return null;

  const handleInsert = (data: {
    src: string;
    alt?: string;
    title?: string;
  }) => {
    editor.chain().focus().setImage(data).run();
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <ImageIcon className="h-4 w-4" />
        Image
      </Button>
      <ImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInsert={handleInsert}
      />
    </>
  );
}

function MathButton() {
  const { editor } = useCurrentEditor();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!editor) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <SigmaIcon className="h-4 w-4" />
        Math
      </Button>
      <MathDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInsert={(latex, displayMode) => {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "mathematics",
              attrs: { latex, displayMode },
            })
            .run();
          setDialogOpen(false);
        }}
      />
    </>
  );
}

interface MultipleChoiceOptionsProps {
  totalOptions: number;
  optionsContent: Map<string, JSONContent | null>;
  correctAnswers: string[]; // Array of correct answer labels ["A", "C", "D"]
  selectedQuestion: number | null;
  getOptionLabel: (index: number) => string;
  updateOptionContent: (label: string, content: JSONContent | null) => void;
  onCorrectAnswersChange: (answers: string[]) => void;
  onAddOption: () => void;
  onDeleteOption: (label: string) => void;
  getOpenNodeOption: (label: string) => boolean;
  setOpenNodeOption: (label: string, value: boolean) => void;
  getOpenLinkOption: (label: string) => boolean;
  setOpenLinkOption: (label: string, value: boolean) => void;
}

export function MultipleChoiceOptions({
  totalOptions,
  optionsContent,
  correctAnswers,
  selectedQuestion,
  getOptionLabel,
  updateOptionContent,
  onCorrectAnswersChange,
  onAddOption,
  onDeleteOption,
  getOpenNodeOption,
  setOpenNodeOption,
  getOpenLinkOption,
  setOpenLinkOption,
}: MultipleChoiceOptionsProps) {
  const handleCheckboxChange = (label: string, checked: boolean) => {
    if (checked) {
      // Add to correct answers
      onCorrectAnswersChange([...correctAnswers, label]);
    } else {
      // Remove from correct answers
      onCorrectAnswersChange(correctAnswers.filter((ans) => ans !== label));
    }
  };

  const handleDeleteOption = (label: string) => {
    if (totalOptions <= 4) {
      toast.error("Minimum of 4 options required");
      return;
    }
    onDeleteOption(label);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Options (Select all correct answers)</Label>
        <p className="text-sm text-muted-foreground">
          {correctAnswers.length} correct answer{correctAnswers.length !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Dynamically render options based on totalOptions */}
      {Array.from({ length: totalOptions }, (_, index) => {
        const label = getOptionLabel(index);
        const isChecked = correctAnswers.includes(label);

        return (
          <div key={label} className="flex items-start gap-3">
            <div className="flex items-center gap-2 pt-3">
              <input
                type="checkbox"
                name="correct-answers"
                id={`option-${label}`}
                className="h-4 w-4 accent-[#BEE74C]"
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(label, e.target.checked)}
              />
              <Label htmlFor={`option-${label}`} className="text-lg font-semibold">
                {label}
              </Label>
              {/* Delete button - only show when more than 4 options */}
              {totalOptions > 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteOption(label)}
                  title="Delete option"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="border rounded-lg min-h-[150px] flex flex-col overflow-visible">
                <EditorWithImageDialog>
                  <EditorProvider
                    key={`option-${label}-${selectedQuestion}`}
                    content={optionsContent.get(label) || undefined}
                    placeholder={`Option ${label}...`}
                    onUpdate={({ editor }) => {
                      updateOptionContent(label, editor.getJSON());
                    }}
                  >
                    {/* --- TOP TOOLBAR --- */}
                    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
                      <ImageButton />
                      <MathButton />
                      <EditorSelector
                        open={getOpenNodeOption(label)}
                        onOpenChange={(value) => setOpenNodeOption(label, value)}
                        title="Node"
                      >
                        <EditorNodeText />
                        <EditorNodeBulletList />
                        <EditorNodeOrderedList />
                      </EditorSelector>
                      <EditorFormatBold hideName />
                      <EditorFormatItalic hideName />
                      <EditorFormatUnderline hideName />
                      <EditorFormatStrike hideName />
                      <EditorFormatCode hideName />
                      <EditorFormatSubscript hideName />
                      <EditorFormatSuperscript hideName />
                      <EditorLinkSelector
                        open={getOpenLinkOption(label)}
                        onOpenChange={(value) => setOpenLinkOption(label, value)}
                      />
                      <EditorClearFormatting />
                    </div>
                    {/* --- EDITOR CONTENT --- */}
                    <div className="flex-1 overflow-visible">
                      <EditorBubbleMenu />
                    </div>
                  </EditorProvider>
                </EditorWithImageDialog>
              </div>
            </div>
          </div>
        );
      })}

      <Button
        variant="ghost"
        className="w-full hover:bg-[#BEE74C]/10 hover:text-[#BEE74C]"
        onClick={onAddOption}
      >
        + Add Option
      </Button>
    </div>
  );
}
