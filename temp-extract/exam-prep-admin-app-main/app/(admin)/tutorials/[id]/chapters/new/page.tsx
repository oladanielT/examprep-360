"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppSidebarContent, PageHeader } from "@/components/globals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  ArrowLeft,
  Save,
  Loader2,
  ImageIcon,
  SigmaIcon,
  VideoIcon,
  MusicIcon,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  EditorProvider,
  EditorBubbleMenu,
  EditorFormatBold,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorFormatCode,
  EditorFormatSubscript,
  EditorFormatSuperscript,
  EditorFormatUnderline,
  EditorLinkSelector,
  EditorSelector,
  EditorNodeText,
  EditorNodeHeading1,
  EditorNodeHeading2,
  EditorNodeHeading3,
  EditorNodeBulletList,
  EditorNodeOrderedList,
  EditorNodeQuote,
  EditorNodeCode,
  EditorClearFormatting,
  useCurrentEditor,
  type JSONContent,
} from "@/components/kibo-ui/editor";
import { EditorWithImageDialog } from "@/components/kibo-ui/editor/editor-with-image-dialog";
import { ImageDialog } from "@/components/kibo-ui/editor/image-dialog";
import { MathDialog } from "@/components/kibo-ui/editor/math-dialog";
import { VideoDialog } from "@/components/kibo-ui/editor/video-dialog";
import { AudioDialog } from "@/components/kibo-ui/editor/audio-dialog";
import {
  tiptapToRichContent,
  richContentToAPIFormat,
} from "@/lib/rich-content";
import { useCreateChapter } from "@/features/tutorials/api/chapter/create-chapter";
import { useTutorial } from "@/features/tutorials/api/tutorial/get-tutorial";

const formSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
  order: z.number().min(1, "Order must be at least 1"),
});

type FormData = z.infer<typeof formSchema>;

interface ApiError {
  message?: string;
}

// Helper components for editor toolbar
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

  const handleInsert = (latex: string, displayMode: boolean) => {
    if (displayMode) {
      editor.chain().focus().insertContent(`$$${latex}$$`).run();
    } else {
      editor.chain().focus().insertContent(`$${latex}$`).run();
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Button
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
        onInsert={handleInsert}
      />
    </>
  );
}

function VideoButton() {
  const { editor } = useCurrentEditor();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!editor) return null;

  const handleInsert = (data: { src: string; title?: string }) => {
    editor.chain().focus().setVideo(data).run();
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <VideoIcon className="h-4 w-4" />
        Video
      </Button>
      <VideoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInsert={handleInsert}
      />
    </>
  );
}

function AudioButton() {
  const { editor } = useCurrentEditor();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!editor) return null;

  const handleInsert = (data: { src: string; title?: string }) => {
    editor.chain().focus().setAudio(data).run();
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <MusicIcon className="h-4 w-4" />
        Audio
      </Button>
      <AudioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onInsert={handleInsert}
      />
    </>
  );
}

const NewChapterPage = () => {
  const params = useParams();
  const router = useRouter();
  const tutorialId = params.id as string;

  const [editorContent, setEditorContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: tutorial, isLoading: isLoadingTutorial } = useTutorial({
    id: tutorialId,
  });

  const { mutate: createChapter, isPending } = useCreateChapter({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Chapter created successfully");
        router.push(`/tutorials/${tutorialId}`);
      },
      onError: (error: Error) => {
        const apiError = error as ApiError;
        toast.error(apiError?.message || "Failed to create chapter");
      },
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      order: 1,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const onSubmit = (data: FormData) => {
    // Convert editor content to API format
    const richContent = tiptapToRichContent(editorContent);
    const apiContent = richContentToAPIFormat(richContent);

    if (apiContent.length === 0) {
      toast.error("Please add some content to the chapter");
      return;
    }

    createChapter({
      name: data.name,
      tutorialId,
      content: apiContent,
      order: data.order,
      // documents: selectedFiles.length > 0 ? selectedFiles : undefined,
    });
  };

  if (isLoadingTutorial) {
    return (
      <AppSidebarContent>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppSidebarContent>
    );
  }

  return (
    <AppSidebarContent>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/tutorials/${tutorialId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <PageHeader
            name="New Chapter"
            desc={`Creating chapter for: ${tutorial?.name || "Tutorial"}`}
          />
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Creating..." : "Create Chapter"}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Chapter Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Chapter Name *</FieldLabel>
                    <Input
                      id="name"
                      placeholder="e.g., Chapter 1: Introduction"
                      {...field}
                      disabled={isPending}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="order"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="order">Chapter Order *</FieldLabel>
                    <Input
                      id="order"
                      type="number"
                      min={1}
                      placeholder="e.g., 1, 2, 3"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isPending}
                    />
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chapter Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Chapter Content *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] border rounded-lg flex flex-col overflow-visible">
              <EditorWithImageDialog>
                <EditorProvider
                  content={editorContent}
                  placeholder="Start writing your chapter content here..."
                  onUpdate={({ editor }) => {
                    setEditorContent(editor.getJSON());
                  }}
                >
                  {/* Fixed Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
                    <ImageButton />
                    <VideoButton />
                    <AudioButton />
                    <MathButton />
                    <EditorSelector title="Node">
                      <EditorNodeText />
                      <EditorNodeHeading1 />
                      <EditorNodeHeading2 />
                      <EditorNodeHeading3 />
                      <EditorNodeBulletList />
                      <EditorNodeOrderedList />
                      <EditorNodeQuote />
                      <EditorNodeCode />
                    </EditorSelector>
                    <EditorFormatBold hideName />
                    <EditorFormatItalic hideName />
                    <EditorFormatUnderline hideName />
                    <EditorFormatStrike hideName />
                    <EditorFormatCode hideName />
                    <EditorFormatSubscript hideName />
                    <EditorFormatSuperscript hideName />
                    <EditorLinkSelector />
                    <EditorClearFormatting />
                  </div>

                  {/* Editor content area with bubble menu */}
                  <div className="flex-1 overflow-visible">
                    <EditorBubbleMenu>
                      <EditorFormatBold hideName />
                      <EditorFormatItalic hideName />
                      <EditorFormatUnderline hideName />
                      <EditorFormatStrike hideName />
                      <EditorFormatCode hideName />
                      <EditorLinkSelector />
                    </EditorBubbleMenu>
                  </div>
                </EditorProvider>
              </EditorWithImageDialog>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supporting Documents (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Section */}
            <div className="space-y-2">
              <label htmlFor="documents" className="text-sm font-medium block">
                Upload PDFs, DOCs, or other documents
              </label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
                disabled={isPending}
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No documents selected</p>
                <p className="text-sm">
                  Upload supporting documents for this chapter
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </AppSidebarContent>
  );
};

export default NewChapterPage;
