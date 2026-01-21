"use client";

import React, { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, ImageIcon, SigmaIcon } from "lucide-react";
import { toast } from "sonner";
import type { JSONContent } from "@/components/kibo-ui/editor";
import type { QuestionEditorFormData } from "../schemas/question-validation";
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

interface EssayWithSubOptionsProps {
  selectedQuestion: number | null;
  getOpenNodeSub: (subId: string) => boolean;
  setOpenNodeSub: (subId: string, value: boolean) => void;
  getOpenLinkSub: (subId: string) => boolean;
  setOpenLinkSub: (subId: string, value: boolean) => void;
}

export function EssayWithSubOptions({
  selectedQuestion,
  getOpenNodeSub,
  setOpenNodeSub,
  getOpenLinkSub,
  setOpenLinkSub,
}: EssayWithSubOptionsProps) {
  const { control, watch, setValue } = useFormContext<QuestionEditorFormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "essayWithSubData.subQuestions",
  });
  const [newPoint, setNewPoint] = useState<{ [key: string]: string }>({});
  const [openNodeMain, setOpenNodeMain] = useState(false);
  const [openLinkMain, setOpenLinkMain] = useState(false);

  const mainQuestionContent = watch("essayWithSubData.mainQuestion");

  const getSubLabel = (index: number): string => {
    return String.fromCharCode(97 + index); // 97 is 'a' in ASCII
  };

  const handleAddSubQuestion = () => {
    append({
      subId: getSubLabel(fields.length),
      questionTextContent: null,
      marks: 5,
      minWords: 50,
      expectedPoints: [],
    });
  };

  const handleDeleteSubQuestion = (index: number) => {
    if (fields.length <= 1) {
      toast.error("At least one sub-question is required");
      return;
    }
    remove(index);
  };

  const handleUpdateSubQuestion = (index: number, subQuestion: any) => {
    update(index, subQuestion);
  };

  const handleAddExpectedPoint = (index: number, subId: string) => {
    const point = newPoint[subId]?.trim();
    if (!point) {
      toast.error("Please enter an expected point");
      return;
    }

    const subQuestion = fields[index];
    if (subQuestion.expectedPoints.includes(point)) {
      toast.error("This point already exists");
      return;
    }

    update(index, {
      ...subQuestion,
      expectedPoints: [...subQuestion.expectedPoints, point],
    });

    setNewPoint({ ...newPoint, [subId]: "" });
  };

  const handleRemoveExpectedPoint = (index: number, point: string) => {
    const subQuestion = fields[index];
    update(index, {
      ...subQuestion,
      expectedPoints: subQuestion.expectedPoints.filter((p) => p !== point),
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Question */}
      <div className="space-y-2">
        <Label>Main Question</Label>
        <div className="border rounded-lg min-h-[150px] flex flex-col overflow-visible">
          <EditorWithImageDialog>
            <EditorProvider
              key={`main-question-${selectedQuestion}`}
              content={mainQuestionContent || undefined}
              placeholder="Enter the main question context..."
              onUpdate={({ editor }) => {
                setValue("essayWithSubData.mainQuestion", editor.getJSON());
              }}
            >
              <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
                <ImageButton />
                <MathButton />
                <EditorSelector
                  open={openNodeMain}
                  onOpenChange={setOpenNodeMain}
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
                  open={openLinkMain}
                  onOpenChange={setOpenLinkMain}
                />
                <EditorClearFormatting />
              </div>
              <div className="flex-1 overflow-visible">
                <EditorBubbleMenu />
              </div>
            </EditorProvider>
          </EditorWithImageDialog>
        </div>
      </div>

      {/* Sub Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Sub-Questions</Label>
          <p className="text-sm text-muted-foreground">
            {fields.length} sub-question{fields.length !== 1 ? "s" : ""}
          </p>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">
                ({field.subId})
              </h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteSubQuestion(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sub-Question Text */}
            <div className="space-y-2">
              <Label>Question Text</Label>
              <div className="border rounded-lg min-h-[120px] flex flex-col overflow-visible">
                <EditorWithImageDialog>
                  <EditorProvider
                    key={`sub-${field.subId}-${selectedQuestion}`}
                    content={field.questionTextContent || undefined}
                    placeholder={`Sub-question ${field.subId}...`}
                    onUpdate={({ editor }) => {
                      const updated = { ...field, questionTextContent: editor.getJSON() };
                      handleUpdateSubQuestion(index, updated);
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
                      <ImageButton />
                      <MathButton />
                      <EditorSelector
                        open={getOpenNodeSub(field.subId)}
                        onOpenChange={(value) =>
                          setOpenNodeSub(field.subId, value)
                        }
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
                        open={getOpenLinkSub(field.subId)}
                        onOpenChange={(value) =>
                          setOpenLinkSub(field.subId, value)
                        }
                      />
                      <EditorClearFormatting />
                    </div>
                    <div className="flex-1 overflow-visible">
                      <EditorBubbleMenu />
                    </div>
                  </EditorProvider>
                </EditorWithImageDialog>
              </div>
            </div>

            {/* Marks and Min Words */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`marks-${field.subId}`}>Marks</Label>
                <Input
                  id={`marks-${field.subId}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={field.marks}
                  onChange={(e) => {
                    const updated = { ...field, marks: parseFloat(e.target.value) || 0 };
                    handleUpdateSubQuestion(index, updated);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`min-words-${field.subId}`}>
                  Min Words
                </Label>
                <Input
                  id={`min-words-${field.subId}`}
                  type="number"
                  min="0"
                  value={field.minWords}
                  onChange={(e) => {
                    const updated = { ...field, minWords: parseInt(e.target.value) || 0 };
                    handleUpdateSubQuestion(index, updated);
                  }}
                />
              </div>
            </div>

            {/* Expected Points */}
            <div className="space-y-2">
              <Label>Expected Points (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={newPoint[field.subId] || ""}
                  onChange={(e) =>
                    setNewPoint({ ...newPoint, [field.subId]: e.target.value })
                  }
                  placeholder="Add expected point..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExpectedPoint(index, field.subId);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddExpectedPoint(index, field.subId)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {field.expectedPoints.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.expectedPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-[#BEE74C]/10 border border-[#BEE74C]/30 rounded-md px-2 py-1"
                    >
                      <span className="text-sm">{point}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveExpectedPoint(index, point)
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}

        <Button
          type="button"
          variant="ghost"
          className="w-full hover:bg-[#BEE74C]/10 hover:text-[#BEE74C]"
          onClick={handleAddSubQuestion}
        >
          + Add Sub-Question
        </Button>
      </div>
    </div>
  );
}
