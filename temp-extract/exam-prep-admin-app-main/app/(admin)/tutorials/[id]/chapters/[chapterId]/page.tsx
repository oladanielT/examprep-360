"use client";

import { useState, useEffect } from "react";
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
  Trash,
  Download,
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
  apiFormatToTiptap,
  type APIRichContentBlock,
} from "@/lib/rich-content";
import { useChapter } from "@/features/tutorials/api/chapter/get-chapter";
import { useUpdateChapter } from "@/features/tutorials/api/chapter/update-chapter";
import { useUploadDocuments } from "@/features/tutorials/api/chapter/upload-documents";
import { useRemoveDocument } from "@/features/tutorials/api/chapter/remove-document";
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

const EditChapterPage = () => {
  const params = useParams();
  const router = useRouter();
  const tutorialId = params.id as string;
  const chapterId = params.chapterId as string;

  const [editorContent, setEditorContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: tutorial, isLoading: isLoadingTutorial } = useTutorial({
    id: tutorialId,
  });

  const {
    data: chapter,
    isLoading: isLoadingChapter,
    refetch: refetchChapter,
  } = useChapter({
    id: chapterId,
  });

  const { mutate: updateChapter, isPending } = useUpdateChapter({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Chapter updated successfully");
        router.push(`/tutorials/${tutorialId}`);
      },
      onError: (error: Error) => {
        const apiError = error as ApiError;
        toast.error(apiError?.message || "Failed to update chapter");
      },
    },
  });

  const { mutate: uploadDocuments, isPending: isUploading } =
    useUploadDocuments({
      mutationConfig: {
        onSuccess: () => {
          toast.success("Documents uploaded successfully");
          setSelectedFiles([]);
          refetchChapter();
        },
        onError: (error: Error) => {
          const apiError = error as ApiError;
          toast.error(apiError?.message || "Failed to upload documents");
        },
      },
    });

  const { mutate: removeDocument, isPending: isRemoving } = useRemoveDocument({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Document removed successfully");
        refetchChapter();
      },
      onError: (error: Error) => {
        const apiError = error as ApiError;
        toast.error(apiError?.message || "Failed to remove document");
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

  // Initialize form and editor when chapter data loads
  useEffect(() => {
    if (chapter && !isInitialized) {
      form.reset({
        name: chapter.name,
        order: chapter.order,
      });

      // Convert API content to TipTap format
      if (
        chapter.content &&
        Array.isArray(chapter.content) &&
        chapter.content.length > 0
      ) {
        const tiptapContent = apiFormatToTiptap(
          chapter.content as APIRichContentBlock[]
        );
        setEditorContent(tiptapContent);
      }

      setIsInitialized(true);
    }
  }, [chapter, form, isInitialized]);

  const onSubmit = (data: FormData) => {
    // Convert editor content to API format
    const richContent = tiptapToRichContent(editorContent);
    const apiContent = richContentToAPIFormat(richContent);

    if (apiContent.length === 0) {
      toast.error("Please add some content to the chapter");
      return;
    }

    updateChapter({
      data: {
        name: data.name,
        content: apiContent,
      },
      chapterId,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadDocuments = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select documents to upload");
      return;
    }
    uploadDocuments({ chapterId, documents: selectedFiles });
  };

  const handleRemoveDocument = (index: number) => {
    removeDocument({ chapterId, documentIndex: index });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoadingTutorial || isLoadingChapter) {
    return (
      <AppSidebarContent>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppSidebarContent>
    );
  }

  if (!chapter) {
    return (
      <AppSidebarContent>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Chapter not found</p>
          <Button
            variant="outline"
            onClick={() => router.push(`/tutorials/${tutorialId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorial
          </Button>
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
            name="Edit Chapter"
            desc={`Editing: ${chapter.name} | Tutorial: ${
              tutorial?.name || "Tutorial"
            }`}
          />
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
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
                  key={isInitialized ? `chapter-${chapterId}` : "loading"}
                  content={editorContent}
                  placeholder="Start writing your chapter content here..."
                  onUpdate={({ editor }) => {
                    setEditorContent(editor.getJSON());
                  }}
                >
                  {/* Toolbar */}
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
              Supporting Documents ({chapter?.documents?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Section */}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="documents"
                  className="text-sm font-medium mb-2 block"
                >
                  Upload PDFs, DOCs, or other documents
                </label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFiles.length} file(s) selected
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={handleUploadDocuments}
                disabled={isUploading || selectedFiles.length === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>

            {/* Documents List */}
            {chapter?.documents && chapter.documents.length > 0 ? (
              <div className="space-y-2">
                {chapter.documents.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.url, "_blank")}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
                        disabled={isRemoving}
                        className="text-destructive hover:text-destructive"
                        title="Remove"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </AppSidebarContent>
  );
};

export default EditChapterPage;
