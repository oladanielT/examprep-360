"use client";

import React, { useState, useReducer } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  SigmaIcon,
  X,
  Loader2,
} from "lucide-react";
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
import {
  tiptapToRichContent,
  richContentToAPIFormat,
  apiFormatToTiptap,
} from "@/lib/rich-content";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useQuestions,
  useDeleteQuestion,
} from "@/features/questions/api";
import { toast } from "sonner";
import { useCourse } from "@/features/courses/api/course/get-course";
import { TrueFalseOptions } from "./true-false-options";
import { MultipleChoiceOptions } from "./multiple-choice-options";
import { FillInBlankOptions } from "./fill-in-blank-options";
import { ShortAnswerOptions } from "./short-answer-options";
import { EssayOptions } from "./essay-options";
import { EssayWithSubOptions } from "./essay-with-sub-options";
import { CalculationOptions } from "./calculation-options";
import { BulkUploadDialog } from "./bulk-upload-dialog";
import type { Course, Module, Session } from "@/features/courses/api/course/get-courses";
import type {
  Question,
  QuestionsResponse,
} from "@/features/questions/api/get-questions";
import { questionEditorSchema } from "../schemas/question-validation";
import type { QuestionEditorFormData } from "../schemas/question-validation";
import { getDefaultValues } from "../lib/default-values";
import {
  uiStateReducer,
  initialUIState,
  type UIState,
  type UIAction,
} from "../lib/ui-state-reducer";

interface CourseQuestionEditorFullProps {
  courseId: string;
}

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Single Choice" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True/False" },
  { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "ESSAY", label: "Essay" },
  { value: "ESSAY_WITH_SUB", label: "Essay with Sub-Questions" },
  { value: "CALCULATION", label: "Calculation" },
];

const SEMESTER_PERIODS = [
  { value: "FIRST", label: "First Semester" },
  { value: "SECOND", label: "Second Semester" },
];

const DIFFICULTY_LEVELS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const COGNITIVE_LEVELS = [
  { value: "RECALL", label: "Recall" },
  { value: "UNDERSTANDING", label: "Understanding" },
  { value: "APPLICATION", label: "Application" },
  { value: "ANALYSIS", label: "Analysis" },
];

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

const CourseQuestionEditorFull = ({ courseId }: CourseQuestionEditorFullProps) => {
  const currentYear = new Date().getFullYear();
  const [totalQuestionSlots, setTotalQuestionSlots] = useState(50);
  const [totalOptions, setTotalOptions] = useState(4);

  // React Hook Form Setup
  const form = useForm<QuestionEditorFormData>({
    resolver: zodResolver(questionEditorSchema),
    mode: "onChange",
    defaultValues: getDefaultValues("SINGLE_CHOICE") as QuestionEditorFormData,
  });

  // UI State Reducer
  const [uiState, dispatchUI] = useReducer(uiStateReducer, initialUIState);

  // State
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedSemester, setSelectedSemester] = useState<"FIRST" | "SECOND">("FIRST");
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [existingQuestionId, setExistingQuestionId] = useState<string | null>(null); // Track if editing existing question
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);

  // Hierarchy selections
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Editor state for bubble menus
  const [openNodeQuestion, setOpenNodeQuestion] = useState(false);
  const [openLinkQuestion, setOpenLinkQuestion] = useState(false);
  const [openNodeExplanation, setOpenNodeExplanation] = useState(false);
  const [openLinkExplanation, setOpenLinkExplanation] = useState(false);
  const [openNodeOptions, setOpenNodeOptions] = useState<Map<string, boolean>>(new Map());
  const [openLinkOptions, setOpenLinkOptions] = useState<Map<string, boolean>>(new Map());
  const [openNodeSub, setOpenNodeSub] = useState<Map<string, boolean>>(new Map());
  const [openLinkSub, setOpenLinkSub] = useState<Map<string, boolean>>(new Map());

  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  // Helper functions for option editor state
  const getOpenNodeOption = (label: string) =>
    openNodeOptions.get(label) || false;
  const setOpenNodeOption = (label: string, value: boolean) => {
    setOpenNodeOptions((prev) => new Map(prev).set(label, value));
  };
  const getOpenLinkOption = (label: string) =>
    openLinkOptions.get(label) || false;
  const setOpenLinkOption = (label: string, value: boolean) => {
    setOpenLinkOptions((prev) => new Map(prev).set(label, value));
  };

  // Helper functions for sub-question editor state
  const getOpenNodeSub = (subId: string) => openNodeSub.get(subId) || false;
  const setOpenNodeSubHelper = (subId: string, value: boolean) => {
    setOpenNodeSub((prev) => new Map(prev).set(subId, value));
  };
  const getOpenLinkSub = (subId: string) => openLinkSub.get(subId) || false;
  const setOpenLinkSubHelper = (subId: string, value: boolean) => {
    setOpenLinkSub((prev) => new Map(prev).set(subId, value));
  };

  // Editor content state
  const [questionTextContent, setQuestionTextContent] = useState<JSONContent | null>(null);
  const [optionsContent, setOptionsContent] = useState<Map<string, JSONContent | null>>(
    new Map([
      ["A", null],
      ["B", null],
      ["C", null],
      ["D", null],
    ])
  );
  const [explanationContent, setExplanationContent] = useState<JSONContent | null>(null);

  // Helper to get option label from index
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  // Helper to update option content
  const updateOptionContent = (label: string, content: JSONContent | null) => {
    setOptionsContent((prev) => new Map(prev).set(label, content));
  };

  // Helper to delete option
  const handleDeleteOption = (labelToDelete: string) => {
    if (totalOptions <= 4) {
      toast.error("Minimum of 4 options required");
      return;
    }

    setOptionsContent((prev) => {
      const newMap = new Map(prev);
      newMap.delete(labelToDelete);
      return newMap;
    });

    setTotalOptions((prev) => prev - 1);

    if (correctAnswer === labelToDelete) {
      setCorrectAnswer("");
    }
    if (correctAnswers.includes(labelToDelete)) {
      setCorrectAnswers((prev) => prev.filter((ans) => ans !== labelToDelete));
    }
  };

  // Helper to add option
  const handleAddOption = () => {
    const newLabel = getOptionLabel(totalOptions);
    setOptionsContent((prev) => new Map(prev).set(newLabel, null));
    setTotalOptions((prev) => prev + 1);
  };

  // Fetch course data
  const { data: course, isLoading: isLoadingCourse } = useCourse({
    courseId,
  }) as {
    data: Course | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Get modules and sessions from the course
  const modules: Module[] = course?.modules || [];
  const selectedModule = modules.find((m: Module) => m.id === selectedModuleId);
  const sessions: Session[] = selectedModule?.sessions || [];

  // Fetch questions for the selected session
  const { data: questionsData, isLoading: isLoadingQuestions, refetch } = useQuestions({
    params: {
      courseId,
      ...(selectedSessionId && { sessionId: selectedSessionId }),
      limit: 100,
    },
    queryConfig: {
      enabled: !!course,
    },
  }) as {
    data: QuestionsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const existingQuestions: Question[] = questionsData?.data || [];

  // Generate years from 2020 to current year + 5
  const years = Array.from(
    { length: (currentYear + 5) - 2020 + 1 },
    (_, i) => (currentYear + 5) - i
  );

  // Generate question numbers
  const questionNumbers = Array.from(
    { length: totalQuestionSlots },
    (_, i) => i + 1
  );

  // Helper to check if a question exists
  const getExistingQuestion = (questionNumber: number): Question | undefined => {
    return existingQuestions.find((q) => q.questionNumber === questionNumber);
  };

  // Create question mutation
  const { mutate: createQuestion, isPending: isCreating } = useCreateQuestion({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Question created successfully");
        refetch();
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create question");
      },
    },
  });

  // Update question mutation
  const { mutate: updateQuestion, isPending: isUpdating } = useUpdateQuestion({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Question updated successfully");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update question");
      },
    },
  });

  const isPending = isCreating || isUpdating;

  // Delete question mutation
  const { mutate: deleteQuestion, isPending: isDeleting } = useDeleteQuestion({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Question deleted successfully");
        setShowDeleteDialog(false);
        refetch();
        resetForm();
        setSelectedQuestion(null);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete question");
      },
    },
  });

  const handleQuestionClick = (num: number) => {
    setSelectedQuestion(num);

    const existingQuestion = getExistingQuestion(num);
    if (existingQuestion) {
      // Set existing question ID for update mode
      setExistingQuestionId(existingQuestion.id);

      // Load existing question data
      setQuestionType(existingQuestion.questionType);

      // Load basic fields
      form.setValue("instruction", existingQuestion.instruction || "");
      form.setValue("difficulty", existingQuestion.difficulty);
      form.setValue("marks", existingQuestion.marks.toString());
      form.setValue("passingMarks", (existingQuestion.passingMarks || 0).toString());
      form.setValue("estimatedTime", (existingQuestion.estimatedTimeSeconds || 60).toString());
      form.setValue("tags", existingQuestion.tags?.join(", ") || "");
      form.setValue("cognitiveLevel", existingQuestion.cognitiveLevel || "RECALL");

      // Load question text
      if (existingQuestion.questionText && existingQuestion.questionText.length > 0) {
        const questionContent = apiFormatToTiptap(existingQuestion.questionText);
        setQuestionTextContent(questionContent);
      }

      // Load options
      if (existingQuestion.options && existingQuestion.options.length > 0) {
        setTotalOptions(existingQuestion.options.length);
        const newOptionsMap = new Map<string, JSONContent | null>();
        existingQuestion.options.forEach((option) => {
          const optionContent = option.content && option.content.length > 0
            ? apiFormatToTiptap(option.content)
            : null;
          newOptionsMap.set(option.id, optionContent);
        });
        setOptionsContent(newOptionsMap);

        // Set correct answer(s)
        if (existingQuestion.questionType === "SINGLE_CHOICE") {
          const correct = existingQuestion.options.find(o => o.isCorrect);
          if (correct) setCorrectAnswer(correct.id);
        } else if (existingQuestion.questionType === "MULTIPLE_CHOICE") {
          const corrects = existingQuestion.options.filter(o => o.isCorrect).map(o => o.id);
          setCorrectAnswers(corrects);
        }
      }

      // Load explanation
      if (existingQuestion.explanation && existingQuestion.explanation.length > 0) {
        const explanationContent = apiFormatToTiptap(existingQuestion.explanation);
        setExplanationContent(explanationContent);
      }

      toast.success(`Question ${num} loaded successfully`);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setExistingQuestionId(null); // Reset to create mode
    setQuestionType("SINGLE_CHOICE");
    form.setValue("instruction", "");
    form.setValue("difficulty", "EASY");
    form.setValue("cognitiveLevel", "RECALL");
    form.setValue("marks", "1");
    form.setValue("passingMarks", "1");
    form.setValue("estimatedTime", "60");
    form.setValue("tags", "");
    setCorrectAnswer("");
    setCorrectAnswers([]);
    setQuestionTextContent(null);
    setOptionsContent(new Map([
      ["A", null],
      ["B", null],
      ["C", null],
      ["D", null],
    ]));
    setExplanationContent(null);
    setTotalOptions(4);
  };

  const handleSave = () => {
    if (!selectedQuestion) {
      toast.error("Please select a question number");
      return;
    }

    if (!selectedSessionId) {
      toast.error("Please select a session");
      return;
    }

    if (!questionTextContent) {
      toast.error("Please add question text");
      return;
    }

    if (!course) {
      toast.error("Course data not loaded");
      return;
    }

    // Validate based on question type
    if (questionType === "SINGLE_CHOICE" && !correctAnswer) {
      toast.error("Please select the correct answer");
      return;
    }

    if (questionType === "MULTIPLE_CHOICE" && correctAnswers.length === 0) {
      toast.error("Please select at least one correct answer");
      return;
    }

    // Convert editor content to API format
    const questionText = questionTextContent
      ? richContentToAPIFormat(tiptapToRichContent(questionTextContent))
      : [];

    // Build options for SINGLE_CHOICE and MULTIPLE_CHOICE
    const options = (questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE")
      ? Array.from({ length: totalOptions }, (_, index) => {
          const label = getOptionLabel(index);
          const content = optionsContent.get(label);
          return {
            id: label,
            content: content
              ? richContentToAPIFormat(tiptapToRichContent(content))
              : [],
            isCorrect: questionType === "MULTIPLE_CHOICE"
              ? correctAnswers.includes(label)
              : correctAnswer === label,
          };
        })
      : undefined;

    // Get selected session data
    const selectedSession = sessions.find((s: Session) => s.id === selectedSessionId);

    // Build hierarchy object for university course
    const hierarchy: any = {
      examType: "UNIVERSITY_COURSE",
      university: course.department.university.name,
      universityCode: course.department.university.acronym || course.department.university.name,
      faculty: course.department.faculty.name,
      department: course.department.name,
      course: {
        code: course.code,
        title: course.name,
        level: course.level,
        unit: 3, // Default, you might want to add this to course model
        semester: selectedSemester,
        prerequisites: [],
      },
      topic: selectedModule?.name || "",
    };

    const questionData: any = {
      questionNumber: selectedQuestion,
      questionType: questionType as any,
      questionText,
      instruction: form.getValues("instruction") || undefined,
      hierarchy,
      metadata: {
        examType: "UNIVERSITY_COURSE",
        examYear: `${selectedYear}/${parseInt(selectedYear) + 1}`,
        examPeriod: `${selectedSemester}_SEMESTER`,
        difficulty: form.getValues("difficulty") as "EASY" | "MEDIUM" | "HARD",
        estimatedTimeSeconds: parseInt(form.getValues("estimatedTime") || "60") || 60,
        marks: parseInt(form.getValues("marks")) || 1,
        passingMarks: parseInt(form.getValues("passingMarks") || "1") || 1,
        status: "DRAFT" as const,
        tags: form.getValues("tags")
          ? form.getValues("tags")!.split(",").map((t: string) => t.trim())
          : [],
        cognitiveLevel: (form.getValues("cognitiveLevel") || "RECALL") as any,
        year: parseInt(selectedYear),
      },
      marks: parseInt(form.getValues("marks")) || 1,
      difficulty: form.getValues("difficulty") as "EASY" | "MEDIUM" | "HARD",
      status: "DRAFT" as const,
      // Add IDs for the backend
      sessionId: selectedSessionId,
      courseId: course.id,
      universityId: course.department.university.id,
      facultyId: course.department.faculty.id,
      departmentId: course.departmentId,
    };

    // Add type-specific fields
    if (questionType === "MULTIPLE_CHOICE") {
      questionData.correctAnswers = correctAnswers;
    } else if (questionType === "SINGLE_CHOICE") {
      questionData.correctAnswer = correctAnswer;
    } else if (questionType === "TRUE_FALSE") {
      questionData.trueFalseData = {
        correctAnswer: form.getValues("trueFalseData.correctAnswer") === "true",
      };
    } else if (questionType === "FILL_IN_BLANK") {
      questionData.fillInBlankData = {
        template: form.getValues("fillInBlankData.template") || "",
        blanks: form.getValues("fillInBlankData.blanks") || [],
      };
    } else if (questionType === "SHORT_ANSWER") {
      questionData.shortAnswerData = {
        acceptableAnswers: form.getValues("shortAnswerData.acceptableAnswers") || [],
        caseSensitive: form.getValues("shortAnswerData.caseSensitive") || false,
        maxCharacters: form.getValues("shortAnswerData.maxCharacters") || 500,
      };
    } else if (questionType === "ESSAY") {
      questionData.essayData = {
        minWords: form.getValues("essayData.minWords") || 500,
        maxWords: form.getValues("essayData.maxWords") || 1000,
        expectedPoints: form.getValues("essayData.expectedPoints") || [],
        sampleAnswer: form.getValues("essayData.sampleAnswer") || "",
        allowDrafts: form.getValues("essayData.allowDrafts") ?? true,
        spellCheckEnabled: form.getValues("essayData.spellCheckEnabled") ?? true,
      };
    } else if (questionType === "ESSAY_WITH_SUB") {
      const mainQuestion = form.getValues("essayWithSubData.mainQuestion")
        ? richContentToAPIFormat(tiptapToRichContent(form.getValues("essayWithSubData.mainQuestion")!))
        : [];

      const subQuestions = (form.getValues("essayWithSubData.subQuestions") || []).map((subQ: any) => ({
        subId: subQ.subId,
        questionText: subQ.questionTextContent
          ? richContentToAPIFormat(tiptapToRichContent(subQ.questionTextContent))
          : [],
        marks: subQ.marks,
        minWords: subQ.minWords,
        expectedPoints: subQ.expectedPoints,
      }));

      questionData.essayWithSubData = {
        mainQuestion,
        subQuestions,
      };
    } else if (questionType === "CALCULATION") {
      questionData.calculationData = {
        problem: form.getValues("calculationData.problem") || "",
        steps: form.getValues("calculationData.steps") || [],
        finalAnswer: form.getValues("calculationData.finalAnswer") || "",
        units: form.getValues("calculationData.units") || "",
        precision: form.getValues("calculationData.precision") || 0,
        showSteps: form.getValues("calculationData.showSteps") ?? true,
      };
    }

    // Only add options array for SINGLE_CHOICE and MULTIPLE_CHOICE
    if (options) {
      questionData.options = options;
    }

    // Use update or create based on whether we have an existing question ID
    if (existingQuestionId) {
      updateQuestion({ questionId: existingQuestionId, data: questionData });
    } else {
      createQuestion({ data: questionData });
    }
  };

  const handleDelete = () => {
    if (!selectedQuestion) {
      toast.error("Please select a question to delete");
      return;
    }

    const existingQuestion = getExistingQuestion(selectedQuestion);
    if (!existingQuestion) {
      toast.error("No question exists at this number");
      return;
    }

    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    const existingQuestion = getExistingQuestion(selectedQuestion!);
    if (existingQuestion) {
      deleteQuestion({ questionId: existingQuestion.id });
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Course not found</p>
      </Card>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-5 py-5">
        {/* Course Info */}
        <Card className="p-6 space-y-4 bg-[#FCFFF5]">
          <div>
            <h6 className="font-semibold text-xl">{course.name}</h6>
            <p className="text-sm text-muted-foreground mt-1">
              {course.code} • Level {course.level} • {course.department.university.name}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          {/* Top Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Module Selector */}
              <div>
                <Label>Module</Label>
                <Select
                  value={selectedModuleId}
                  onValueChange={(value) => {
                    setSelectedModuleId(value);
                    setSelectedSessionId("");
                    setSelectedQuestion(null);
                  }}
                >
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue placeholder="Select Module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Selector */}
              <div>
                <Label>Session/Year</Label>
                <Select
                  value={selectedSessionId}
                  onValueChange={(value) => {
                    setSelectedSessionId(value);
                    setSelectedQuestion(null);
                  }}
                  disabled={!selectedModuleId}
                >
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Selector */}
              <div>
                <Label>Semester</Label>
                <Select
                  value={selectedSemester}
                  onValueChange={(value: "FIRST" | "SECOND") => setSelectedSemester(value)}
                >
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Year Selector */}
            <div>
              <Label>Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="max-w-xl w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}/{year + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedSessionId && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a module and session to begin adding questions
            </div>
          )}

          {selectedSessionId && (
            <>
              {/* Question Number Grid */}
              <div className="space-y-3 mb-6">
                <Label>Question Number</Label>
                <div className="grid grid-cols-10 gap-2">
                  {questionNumbers.map((num) => {
                    const exists = getExistingQuestion(num);
                    return (
                      <Button
                        key={num}
                        variant={selectedQuestion === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleQuestionClick(num)}
                        className={exists ? "border-green-500" : ""}
                      >
                        {num}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {selectedQuestion && (
                <>
                  {/* Question Type Selector */}
                  <div className="mb-6">
                    <Label>Question Type</Label>
                    <Select value={questionType} onValueChange={setQuestionType}>
                      <SelectTrigger className="max-w-xl w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question Text Editor */}
                  <div className="space-y-2 mb-6">
                    <Label>Question Text</Label>
                    <div className="border rounded-lg min-h-[300px] flex flex-col overflow-visible">
                      <EditorWithImageDialog>
                        <EditorProvider
                          key={`question-${selectedQuestion}`}
                          content={questionTextContent || undefined}
                          placeholder="Type your question or use / for blocks..."
                          onUpdate={({ editor }) => {
                            setQuestionTextContent(editor.getJSON());
                          }}
                        >
                          {/* --- TOP TOOLBAR --- */}
                          <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
                            <ImageButton />
                            <MathButton />
                            <EditorSelector
                              open={openNodeQuestion}
                              onOpenChange={setOpenNodeQuestion}
                              title="Node"
                            >
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
                            <EditorLinkSelector
                              open={openLinkQuestion}
                              onOpenChange={setOpenLinkQuestion}
                            />
                            <EditorClearFormatting />
                          </div>

                          {/* --- EDITOR CONTENT --- */}
                          <div className="flex-1 overflow-visible">
                            <EditorBubbleMenu>
                              <EditorFormatBold hideName />
                              <EditorFormatItalic hideName />
                              <EditorLinkSelector
                                open={openLinkQuestion}
                                onOpenChange={setOpenLinkQuestion}
                              />
                            </EditorBubbleMenu>
                          </div>
                        </EditorProvider>
                      </EditorWithImageDialog>
                    </div>
                  </div>

                  {/* Instruction (Optional) */}
                  <Field>
                    <FieldLabel htmlFor="instruction">Instruction (Optional)</FieldLabel>
                    <Input
                      id="instruction"
                      placeholder="e.g., Choose the correct answer"
                      {...form.register("instruction")}
                    />
                    <FieldError>{form.formState.errors.instruction?.message}</FieldError>
                  </Field>

                  {/* Question Type Specific Options */}
                  {questionType === "SINGLE_CHOICE" && (
                    <div className="space-y-4 mt-6">
                      <Label>Options</Label>

                      {/* Dynamically render options based on totalOptions */}
                      {Array.from({ length: totalOptions }, (_, index) => {
                        const label = getOptionLabel(index);
                        return (
                          <div key={label} className="flex items-start gap-3">
                            <div className="flex items-center gap-2 pt-3">
                              <input
                                type="radio"
                                name="correct-answer"
                                id={`option-${label}`}
                                className="h-4 w-4 accent-[#BEE74C]"
                                checked={correctAnswer === label}
                                onChange={() => setCorrectAnswer(label)}
                              />
                              <Label
                                htmlFor={`option-${label}`}
                                className="text-lg font-semibold"
                              >
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
                                        onOpenChange={(value) =>
                                          setOpenNodeOption(label, value)
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
                                        open={getOpenLinkOption(label)}
                                        onOpenChange={(value) =>
                                          setOpenLinkOption(label, value)
                                        }
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
                        onClick={handleAddOption}
                      >
                        + Add Option
                      </Button>
                    </div>
                  )}

                  {questionType === "MULTIPLE_CHOICE" && (
                    <MultipleChoiceOptions
                      totalOptions={totalOptions}
                      optionsContent={optionsContent}
                      correctAnswers={correctAnswers}
                      selectedQuestion={selectedQuestion}
                      getOptionLabel={getOptionLabel}
                      updateOptionContent={updateOptionContent}
                      onCorrectAnswersChange={setCorrectAnswers}
                      onAddOption={handleAddOption}
                      onDeleteOption={handleDeleteOption}
                      getOpenNodeOption={getOpenNodeOption}
                      setOpenNodeOption={setOpenNodeOption}
                      getOpenLinkOption={getOpenLinkOption}
                      setOpenLinkOption={setOpenLinkOption}
                    />
                  )}

                  {questionType === "TRUE_FALSE" && <TrueFalseOptions />}
                  {questionType === "FILL_IN_BLANK" && <FillInBlankOptions />}
                  {questionType === "SHORT_ANSWER" && <ShortAnswerOptions />}
                  {questionType === "ESSAY" && <EssayOptions />}
                  {questionType === "ESSAY_WITH_SUB" && (
                    <EssayWithSubOptions
                      selectedQuestion={selectedQuestion}
                      getOpenNodeSub={getOpenNodeSub}
                      setOpenNodeSub={setOpenNodeSubHelper}
                      getOpenLinkSub={getOpenLinkSub}
                      setOpenLinkSub={setOpenLinkSubHelper}
                    />
                  )}
                  {questionType === "CALCULATION" && <CalculationOptions />}

                  {/* Metadata Section (Collapsible) */}
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowMetadata(!showMetadata)}
                      className="w-full justify-between"
                    >
                      <span>Question Metadata</span>
                      {showMetadata ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {showMetadata && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Field>
                          <FieldLabel htmlFor="difficulty">Difficulty</FieldLabel>
                          <Controller
                            name="difficulty"
                            control={form.control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="max-w-xl w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIFFICULTY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="cognitiveLevel">Cognitive Level</FieldLabel>
                          <Controller
                            name="cognitiveLevel"
                            control={form.control}
                            render={({ field }) => (
                              <Select value={field.value || "RECALL"} onValueChange={field.onChange}>
                                <SelectTrigger className="max-w-xl w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COGNITIVE_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="marks">Marks</FieldLabel>
                          <Input id="marks" type="number" {...form.register("marks")} />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="passingMarks">Passing Marks</FieldLabel>
                          <Input id="passingMarks" type="number" {...form.register("passingMarks")} />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="estimatedTime">Estimated Time (seconds)</FieldLabel>
                          <Input id="estimatedTime" type="number" {...form.register("estimatedTime")} />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="tags">Tags (comma separated)</FieldLabel>
                          <Input id="tags" placeholder="e.g., algorithms, arrays" {...form.register("tags")} />
                        </Field>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button type="button" onClick={handleSave} disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {existingQuestionId ? "Updating..." : "Saving..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {existingQuestionId ? "Update Question" : "Save Question"}
                        </>
                      )}
                    </Button>
                    {getExistingQuestion(selectedQuestion) && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete question #{selectedQuestion}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Upload Dialog */}
        <BulkUploadDialog
          open={showBulkUploadDialog}
          onOpenChange={setShowBulkUploadDialog}
          onSuccess={() => {
            toast.success("Questions uploaded successfully");
            refetch();
          }}
        />
      </div>
    </FormProvider>
  );
};

export default CourseQuestionEditorFull;
