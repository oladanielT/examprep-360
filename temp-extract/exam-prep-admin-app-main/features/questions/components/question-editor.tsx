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
import { useSubject } from "@/features/subjects/api/subject/get-subject";
import { TrueFalseOptions } from "./true-false-options";
import { MultipleChoiceOptions } from "./multiple-choice-options";
import { FillInBlankOptions } from "./fill-in-blank-options";
import { ShortAnswerOptions } from "./short-answer-options";
import { EssayOptions } from "./essay-options";
import { EssayWithSubOptions } from "./essay-with-sub-options";
import { CalculationOptions } from "./calculation-options";
import { BulkUploadDialog } from "./bulk-upload-dialog";
import type {
  Subject,
  Topic,
  SubTopic,
} from "@/features/subjects/api/subject/get-subjects";
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

interface QuestionEditorProps {
  subjectId: string;
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

const EXAM_PERIODS = [
  { value: "MAY/JUNE", label: "May/June" },
  { value: "NOV/DEC", label: "Nov/Dec" },
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

const QuestionEditor = ({ subjectId }: QuestionEditorProps) => {
  const currentYear = new Date().getFullYear();
  const [totalQuestionSlots, setTotalQuestionSlots] = useState(50); // Dynamic question slots
  const [totalOptions, setTotalOptions] = useState(4); // Default 4 options (A, B, C, D)

  // ========== NEW: React Hook Form Setup ==========
  const form = useForm<QuestionEditorFormData>({
    resolver: zodResolver(questionEditorSchema),
    mode: "onChange",
    defaultValues: getDefaultValues("SINGLE_CHOICE") as QuestionEditorFormData,
  });

  // ========== NEW: UI State Reducer (for dialogs, menus, etc.) ==========
  const [uiState, dispatchUI] = useReducer(uiStateReducer, initialUIState);

  // ========== EXISTING STATE (will gradually migrate to form/reducer) ==========
  const [questionType, setQuestionType] = useState("SINGLE_CHOICE");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedPeriod, setSelectedPeriod] = useState("MAY/JUNE");
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [existingQuestionId, setExistingQuestionId] = useState<string | null>(null); // Track if editing existing question
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);

  // Hierarchy selections (only topic and subtopic are editable)
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string>("");

  // Editor state for bubble menus
  const [openNodeQuestion, setOpenNodeQuestion] = useState(false);
  const [openLinkQuestion, setOpenLinkQuestion] = useState(false);
  const [openNodeExplanation, setOpenNodeExplanation] = useState(false);
  const [openLinkExplanation, setOpenLinkExplanation] = useState(false);
  // Dynamic option bubble menus
  const [openNodeOptions, setOpenNodeOptions] = useState<Map<string, boolean>>(
    new Map()
  );
  const [openLinkOptions, setOpenLinkOptions] = useState<Map<string, boolean>>(
    new Map()
  );
  // Dynamic sub-question bubble menus (for ESSAY_WITH_SUB)
  const [openNodeSub, setOpenNodeSub] = useState<Map<string, boolean>>(
    new Map()
  );
  const [openLinkSub, setOpenLinkSub] = useState<Map<string, boolean>>(
    new Map()
  );

  const [correctAnswer, setCorrectAnswer] = useState(""); // For SINGLE_CHOICE and TRUE_FALSE
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]); // For MULTIPLE_CHOICE

  // Editor content state
  const [questionTextContent, setQuestionTextContent] =
    useState<JSONContent | null>(null);
  const [optionsContent, setOptionsContent] = useState<
    Map<string, JSONContent | null>
  >(
    new Map([
      ["A", null],
      ["B", null],
      ["C", null],
      ["D", null],
    ])
  );
  const [explanationContent, setExplanationContent] =
    useState<JSONContent | null>(null);

  // Helper to get option label from index (0 = A, 1 = B, etc.)
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // 65 is 'A' in ASCII
  };

  // Helper to update option content
  const updateOptionContent = (label: string, content: JSONContent | null) => {
    setOptionsContent((prev) => new Map(prev).set(label, content));
  };

  // Helper to delete option (minimum 4 options required)
  const handleDeleteOption = (labelToDelete: string) => {
    if (totalOptions <= 4) {
      toast.error("Minimum of 4 options required");
      return;
    }

    // Remove from map
    setOptionsContent((prev) => {
      const newMap = new Map(prev);
      newMap.delete(labelToDelete);
      return newMap;
    });

    // Decrease total count
    setTotalOptions((prev) => prev - 1);

    // Clear correct answer if the deleted option was selected
    if (correctAnswer === labelToDelete) {
      setCorrectAnswer("");
    }
  };

  // Helpers for bubble menu states
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
  // Helpers for sub-question bubble menu states
  const getOpenNodeSub = (subId: string) => openNodeSub.get(subId) || false;
  const setOpenNodeSubHelper = (subId: string, value: boolean) => {
    setOpenNodeSub((prev) => new Map(prev).set(subId, value));
  };
  const getOpenLinkSub = (subId: string) => openLinkSub.get(subId) || false;
  const setOpenLinkSubHelper = (subId: string, value: boolean) => {
    setOpenLinkSub((prev) => new Map(prev).set(subId, value));
  };

  // Fetch the subject data (includes examType, topics, and subtopics)
  const { data: subject, isLoading: isLoadingSubject } = useSubject({
    subjectId,
  }) as {
    data: Subject | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Get topics from the subject
  const topics: Topic[] = subject?.topics || [];

  // Get subtopics from the selected topic
  const selectedTopic = topics.find((t: Topic) => t.id === selectedTopicId);
  const subTopics: SubTopic[] = selectedTopic?.subTopics || [];

  // Fetch questions for the selected year
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuestions({
    params: {
      subject: subject?.name,
      examType: subject?.examType?.name,
      // examYear: parseInt(selectedYear),
      limit: 100, // Get all questions for the year
    },
    queryConfig: {
      enabled: !!subject,
    },
  }) as {
    data: QuestionsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const existingQuestions: Question[] = questionsData?.data || [];

  // Generate years from 1980 to current year
  const years = Array.from(
    { length: currentYear - 1980 + 1 },
    (_, i) => currentYear - i
  );

  // Generate question numbers dynamically based on totalQuestionSlots
  const questionNumbers = Array.from(
    { length: totalQuestionSlots },
    (_, i) => i + 1
  );

  // Helper to check if a question exists
  const getExistingQuestion = (
    questionNumber: number
  ): Question | undefined => {
    return existingQuestions.find((q) => q.questionNumber === questionNumber);
  };

  // Create question mutation
  const { mutate: createQuestion, isPending: isCreating } = useCreateQuestion({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Question created successfully");
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

    // Load question data if question exists
    const existingQuestion = getExistingQuestion(num);

    if (existingQuestion) {
      // Set existing question ID for update mode
      setExistingQuestionId(existingQuestion.id);

      // Load the existing question data into the editor
      setQuestionType(existingQuestion.questionType);
      form.setValue("instruction", existingQuestion.instruction || "");
      form.setValue("difficulty", existingQuestion.difficulty);
      form.setValue(
        "cognitiveLevel",
        existingQuestion.cognitiveLevel || "RECALL"
      );
      form.setValue("marks", existingQuestion.marks.toString());
      form.setValue(
        "passingMarks",
        existingQuestion.passingMarks?.toString() || ""
      );
      form.setValue(
        "estimatedTime",
        existingQuestion.estimatedTimeSeconds?.toString() || "60"
      );
      form.setValue("tags", existingQuestion.tags.join(", "));

      // For TRUE_FALSE, extract from trueFalseData
      if (
        existingQuestion.questionType === "TRUE_FALSE" &&
        existingQuestion.trueFalseData
      ) {
        form.setValue(
          "trueFalseData.correctAnswer",
          existingQuestion.trueFalseData.correctAnswer ? "true" : "false"
        );
      } else {
        setCorrectAnswer(existingQuestion.correctAnswer);
      }

      // For MULTIPLE_CHOICE, extract correct answers from options
      if (
        existingQuestion.questionType === "MULTIPLE_CHOICE" &&
        existingQuestion.options
      ) {
        const multiCorrectAnswers = existingQuestion.options
          .filter((opt) => opt.isCorrect)
          .map((opt) => opt.id);
        setCorrectAnswers(multiCorrectAnswers);
      }

      // For FILL_IN_BLANK, extract template and blanks
      if (
        existingQuestion.questionType === "FILL_IN_BLANK" &&
        existingQuestion.fillInBlankData
      ) {
        form.setValue(
          "fillInBlankData.template",
          existingQuestion.fillInBlankData.template || ""
        );
        form.setValue(
          "fillInBlankData.blanks",
          existingQuestion.fillInBlankData.blanks || []
        );
      }

      // For SHORT_ANSWER, extract acceptable answers and settings
      if (
        existingQuestion.questionType === "SHORT_ANSWER" &&
        existingQuestion.shortAnswerData
      ) {
        form.setValue(
          "shortAnswerData.acceptableAnswers",
          existingQuestion.shortAnswerData.acceptableAnswers || []
        );
        form.setValue(
          "shortAnswerData.caseSensitive",
          existingQuestion.shortAnswerData.caseSensitive || false
        );
        form.setValue(
          "shortAnswerData.maxCharacters",
          existingQuestion.shortAnswerData.maxCharacters || 10
        );
      }

      // For ESSAY, extract essay settings
      if (
        existingQuestion.questionType === "ESSAY" &&
        existingQuestion.essayData
      ) {
        form.setValue(
          "essayData.minWords",
          existingQuestion.essayData.minWords || 500
        );
        form.setValue(
          "essayData.maxWords",
          existingQuestion.essayData.maxWords || 1000
        );
        form.setValue(
          "essayData.expectedPoints",
          existingQuestion.essayData.expectedPoints || []
        );
        form.setValue(
          "essayData.sampleAnswer",
          existingQuestion.essayData.sampleAnswer || ""
        );
        form.setValue(
          "essayData.allowDrafts",
          existingQuestion.essayData.allowDrafts ?? true
        );
        form.setValue(
          "essayData.spellCheckEnabled",
          existingQuestion.essayData.spellCheckEnabled ?? true
        );
      }

      // For ESSAY_WITH_SUB, extract main question and sub-questions
      if (
        existingQuestion.questionType === "ESSAY_WITH_SUB" &&
        existingQuestion.essayWithSubData
      ) {
        // Load main question
        if (existingQuestion.essayWithSubData.mainQuestion) {
          const mainQuestionContent = apiFormatToTiptap(
            existingQuestion.essayWithSubData.mainQuestion
          );
          form.setValue("essayWithSubData.mainQuestion", mainQuestionContent);
        }

        // Load sub-questions
        if (existingQuestion.essayWithSubData.subQuestions) {
          const loadedSubQuestions =
            existingQuestion.essayWithSubData.subQuestions.map((subQ: any) => ({
              subId: subQ.subId,
              questionTextContent: subQ.questionText
                ? apiFormatToTiptap(subQ.questionText)
                : null,
              marks: subQ.marks || 5,
              minWords: subQ.minWords || 50,
              expectedPoints: subQ.expectedPoints || [],
            }));
          form.setValue("essayWithSubData.subQuestions", loadedSubQuestions);
        }
      }

      // For CALCULATION, extract calculation data
      if (
        existingQuestion.questionType === "CALCULATION" &&
        existingQuestion.calculationData
      ) {
        form.setValue(
          "calculationData.problem",
          existingQuestion.calculationData.problem || ""
        );
        form.setValue(
          "calculationData.steps",
          existingQuestion.calculationData.steps || []
        );
        form.setValue(
          "calculationData.finalAnswer",
          existingQuestion.calculationData.finalAnswer || ""
        );
        form.setValue(
          "calculationData.units",
          existingQuestion.calculationData.units || ""
        );
        form.setValue(
          "calculationData.precision",
          existingQuestion.calculationData.precision || 0
        );
        form.setValue(
          "calculationData.showSteps",
          existingQuestion.calculationData.showSteps ?? true
        );
      }

      // Set topic and subtopic if available
      if (existingQuestion.topicId) {
        setSelectedTopicId(existingQuestion.topicId);
      }
      if (existingQuestion.subTopicId) {
        setSelectedSubTopicId(existingQuestion.subTopicId);
      }

      // Convert rich content blocks to Tiptap format
      // Question text
      if (
        existingQuestion.questionText &&
        existingQuestion.questionText.length > 0
      ) {
        const questionContent = apiFormatToTiptap(
          existingQuestion.questionText
        );
        setQuestionTextContent(questionContent);
      }

      // Options - set count and load content
      if (existingQuestion.options && existingQuestion.options.length > 0) {
        setTotalOptions(existingQuestion.options.length);
        const newOptionsMap = new Map<string, JSONContent | null>();
        existingQuestion.options.forEach((option) => {
          const optionContent =
            option.content && option.content.length > 0
              ? apiFormatToTiptap(option.content)
              : null;
          newOptionsMap.set(option.id, optionContent);
        });
        setOptionsContent(newOptionsMap);
      }

      // Explanation
      if (
        existingQuestion.explanation &&
        existingQuestion.explanation.length > 0
      ) {
        const explanationContent = apiFormatToTiptap(
          existingQuestion.explanation
        );
        setExplanationContent(explanationContent);
      }

      toast.success(`Question ${num} loaded successfully`);
    } else {
      // Clear the form for a new question
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
    // Reset TRUE_FALSE data
    form.setValue("trueFalseData.correctAnswer", "true");
    setCorrectAnswer("");
    setCorrectAnswers([]); // Reset multi-choice correct answers
    // Reset fill-in-blank data
    form.setValue("fillInBlankData.template", "");
    form.setValue("fillInBlankData.blanks", [
      {
        id: "blank1",
        acceptableAnswers: [],
        caseSensitive: false,
        marks: 1,
        hint: "",
        inputType: "text" as const,
      },
    ]);
    // Reset short-answer data
    form.setValue("shortAnswerData.acceptableAnswers", []);
    form.setValue("shortAnswerData.caseSensitive", false);
    form.setValue("shortAnswerData.maxCharacters", 10);
    // Reset essay data
    form.setValue("essayData.minWords", 500);
    form.setValue("essayData.maxWords", 1000);
    form.setValue("essayData.expectedPoints", []);
    form.setValue("essayData.sampleAnswer", "");
    form.setValue("essayData.allowDrafts", true);
    form.setValue("essayData.spellCheckEnabled", true);
    // Reset essay-with-sub data
    form.setValue("essayWithSubData.mainQuestion", null);
    form.setValue("essayWithSubData.subQuestions", [
      {
        subId: "a",
        questionTextContent: null,
        marks: 5,
        minWords: 50,
        expectedPoints: [],
      },
    ]);
    // Reset calculation data
    form.setValue("calculationData.problem", "");
    form.setValue("calculationData.steps", [
      {
        step: "",
        explanation: "",
        formula: "",
        result: "",
      },
    ]);
    form.setValue("calculationData.finalAnswer", "");
    form.setValue("calculationData.units", "");
    form.setValue("calculationData.precision", 0);
    form.setValue("calculationData.showSteps", true);
    setSelectedTopicId("");
    setSelectedSubTopicId("");
    setQuestionTextContent(null);
    setTotalOptions(4); // Reset to default 4 options
    // Initialize options content for default 4 options
    const initialOptions = new Map<string, JSONContent | null>();
    for (let i = 0; i < 4; i++) {
      initialOptions.set(getOptionLabel(i), null);
    }
    setOptionsContent(initialOptions);
    setExplanationContent(null);
  };

  const handleSave = () => {
    if (!selectedQuestion) {
      toast.error("Please select a question number");
      return;
    }

    // Validation for correct answer(s)
    if (questionType === "MULTIPLE_CHOICE") {
      if (correctAnswers.length === 0) {
        toast.error("Please select at least one correct answer");
        return;
      }
    } else if (questionType === "FILL_IN_BLANK") {
      const template = form.getValues("fillInBlankData.template") || "";
      const blanks = form.getValues("fillInBlankData.blanks") || [];
      if (!template.trim()) {
        toast.error("Please enter a template for the fill-in-blank question");
        return;
      }
      if (blanks.length === 0) {
        toast.error("Please add at least one blank");
        return;
      }
      // Validate each blank has at least one acceptable answer
      for (const blank of blanks) {
        if (blank.acceptableAnswers.length === 0) {
          toast.error(
            `Please add at least one acceptable answer for ${blank.id}`
          );
          return;
        }
      }
    } else if (questionType === "SHORT_ANSWER") {
      const acceptableAnswers =
        form.getValues("shortAnswerData.acceptableAnswers") || [];
      if (acceptableAnswers.length === 0) {
        toast.error("Please add at least one acceptable answer");
        return;
      }
    } else if (questionType === "ESSAY_WITH_SUB") {
      const subQuestions =
        form.getValues("essayWithSubData.subQuestions") || [];
      if (subQuestions.length === 0) {
        toast.error("Please add at least one sub-question");
        return;
      }
      // Validate each sub-question has content
      for (const subQ of subQuestions) {
        if (!subQ.questionTextContent) {
          toast.error(`Please add content for sub-question ${subQ.subId}`);
          return;
        }
      }
    } else if (questionType === "CALCULATION") {
      const problem = form.getValues("calculationData.problem") || "";
      const steps = form.getValues("calculationData.steps") || [];
      const finalAnswer = form.getValues("calculationData.finalAnswer") || "";
      if (!problem.trim()) {
        toast.error("Please enter a problem description");
        return;
      }
      if (steps.length === 0) {
        toast.error("Please add at least one solution step");
        return;
      }
      // Validate each step has description and explanation
      for (let i = 0; i < steps.length; i++) {
        if (!steps[i].step.trim()) {
          toast.error(`Please add description for step ${i + 1}`);
          return;
        }
        if (!steps[i].explanation.trim()) {
          toast.error(`Please add explanation for step ${i + 1}`);
          return;
        }
      }
      if (!finalAnswer) {
        toast.error("Please enter the final answer");
        return;
      }
    } else if (questionType !== "ESSAY" && !correctAnswer) {
      toast.error("Please select the correct answer");
      return;
    }

    if (!subject) {
      toast.error("Subject data not loaded");
      return;
    }

    // Convert editor content to API-compatible format
    const questionText = questionTextContent
      ? richContentToAPIFormat(tiptapToRichContent(questionTextContent))
      : [];
    // const explanation = explanationContent ? richContentToAPIFormat(tiptapToRichContent(explanationContent)) : [];

    // Build options dynamically based on totalOptions (only for SINGLE_CHOICE and MULTIPLE_CHOICE)
    const options =
      questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE"
        ? Array.from({ length: totalOptions }, (_, index) => {
            const label = getOptionLabel(index);
            const content = optionsContent.get(label);
            return {
              id: label,
              content: content
                ? richContentToAPIFormat(tiptapToRichContent(content))
                : [],
              isCorrect:
                questionType === "MULTIPLE_CHOICE"
                  ? correctAnswers.includes(label) // Check if label is in correctAnswers array
                  : correctAnswer === label, // Single choice - check exact match
            };
          })
        : undefined;

    // Get selected topic and subtopic
    const topic = topics.find((t: Topic) => t.id === selectedTopicId);
    const subTopic = subTopics.find(
      (st: SubTopic) => st.id === selectedSubTopicId
    );

    // Build hierarchy object
    const hierarchy: any = {
      examType: subject.examType?.name || "",
      subject: subject.name,
      subjectCode: subject.name,
    };

    if (topic) {
      hierarchy.topic = {
        name: topic.name,
        //  id: topic.id
      };
    }

    // if (subTopic) {
    //   hierarchy.subTopic = { name: subTopic.name, id: subTopic.id };
    // }

    const questionData: any = {
      questionNumber: selectedQuestion,
      questionType: questionType as
        | "SINGLE_CHOICE"
        | "MULTIPLE_CHOICE"
        | "TRUE_FALSE"
        | "FILL_IN_BLANK"
        | "SHORT_ANSWER"
        | "ESSAY"
        | "ESSAY_WITH_SUB"
        | "CALCULATION",
      questionText,
      instruction: form.getValues("instruction") || undefined,
      hierarchy,
      metadata: {
        examType: subject.examType?.name || "",
        examYear: selectedYear,
        examPeriod: selectedPeriod,
        difficulty: form.getValues("difficulty") as "EASY" | "MEDIUM" | "HARD",
        estimatedTimeSeconds:
          parseInt(form.getValues("estimatedTime") || "60") || 60,
        marks: parseInt(form.getValues("marks")) || 1,
        passingMarks: parseInt(form.getValues("passingMarks") || "1") || 1,
        status: "DRAFT" as const,
        tags: form.getValues("tags")
          ? form
              .getValues("tags")!
              .split(",")
              .map((t: string) => t.trim())
          : [],
        cognitiveLevel: (form.getValues("cognitiveLevel") || "RECALL") as
          | "RECALL"
          | "UNDERSTANDING"
          | "APPLICATION"
          | "ANALYSIS",
      },
      // explanation, // Will add later
      marks: parseInt(form.getValues("marks")) || 1,
      difficulty: form.getValues("difficulty") as "EASY" | "MEDIUM" | "HARD",
      status: "DRAFT" as const,
      // Add IDs for the backend
      topicId: selectedTopicId || undefined,
      subTopicId: selectedSubTopicId || undefined,
    };

    // Add type-specific fields
    if (questionType === "MULTIPLE_CHOICE") {
      // MULTIPLE_CHOICE specific fields
      questionData.correctAnswers = correctAnswers;
      // Note: marksPerCorrect, negativeMarking, partialCreditAllowed not yet supported by backend
    } else if (questionType === "TRUE_FALSE") {
      // TRUE_FALSE specific fields
      questionData.trueFalseData = {
        correctAnswer: form.getValues("trueFalseData.correctAnswer") === "true",
      };
    } else if (questionType === "FILL_IN_BLANK") {
      // FILL_IN_BLANK specific fields
      questionData.fillInBlankData = {
        template: form.getValues("fillInBlankData.template") || "",
        blanks: form.getValues("fillInBlankData.blanks") || [],
      };
    } else if (questionType === "SHORT_ANSWER") {
      // SHORT_ANSWER specific fields
      questionData.shortAnswerData = {
        acceptableAnswers:
          form.getValues("shortAnswerData.acceptableAnswers") || [],
        caseSensitive: form.getValues("shortAnswerData.caseSensitive") || false,
        maxCharacters: form.getValues("shortAnswerData.maxCharacters") || 10,
      };
    } else if (questionType === "ESSAY") {
      // ESSAY specific fields
      questionData.essayData = {
        minWords: form.getValues("essayData.minWords") || 500,
        maxWords: form.getValues("essayData.maxWords") || 1000,
        expectedPoints: form.getValues("essayData.expectedPoints") || [],
        sampleAnswer: form.getValues("essayData.sampleAnswer") || "",
        allowDrafts: form.getValues("essayData.allowDrafts") ?? true,
        spellCheckEnabled:
          form.getValues("essayData.spellCheckEnabled") ?? true,
      };
    } else if (questionType === "ESSAY_WITH_SUB") {
      // ESSAY_WITH_SUB specific fields
      const mainQuestionContent = form.getValues(
        "essayWithSubData.mainQuestion"
      );
      const mainQuestion = mainQuestionContent
        ? richContentToAPIFormat(tiptapToRichContent(mainQuestionContent))
        : [];

      const subQuestionsData =
        form.getValues("essayWithSubData.subQuestions") || [];
      const subQuestions = subQuestionsData.map((subQ: any) => ({
        subId: subQ.subId,
        questionText: subQ.questionTextContent
          ? richContentToAPIFormat(
              tiptapToRichContent(subQ.questionTextContent)
            )
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
      // CALCULATION specific fields
      questionData.calculationData = {
        problem: form.getValues("calculationData.problem") || "",
        steps: form.getValues("calculationData.steps") || [],
        finalAnswer: form.getValues("calculationData.finalAnswer") || "",
        units: form.getValues("calculationData.units") || "",
        precision: form.getValues("calculationData.precision") || 0,
        showSteps: form.getValues("calculationData.showSteps") ?? true,
      };
    } else if (questionType === "SINGLE_CHOICE") {
      // SINGLE_CHOICE uses correctAnswer
      questionData.correctAnswer = correctAnswer;
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

    // Open confirmation dialog
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    const existingQuestion = getExistingQuestion(selectedQuestion!);
    if (existingQuestion) {
      deleteQuestion({ questionId: existingQuestion.id });
    }
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-5 py-5">
        <Card className="p-6">
          {/* Top Filters */}
          <div className="space-y-4">
            {/* Hierarchy Information - Exam Type and Subject are read-only */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Input
                  value={subject?.examType?.name || "Loading..."}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject?.name || "Loading..."}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Topic (Optional)</Label>
                <Select
                  value={selectedTopicId}
                  onValueChange={(value) => {
                    setSelectedTopicId(value);
                    setSelectedSubTopicId("");
                  }}
                  disabled={isLoadingSubject || topics.length === 0}
                >
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic: Topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subtopic (Optional)</Label>
                <Select
                  value={selectedSubTopicId}
                  onValueChange={setSelectedSubTopicId}
                  disabled={!selectedTopicId || subTopics.length === 0}
                >
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue placeholder="Select subtopic" />
                  </SelectTrigger>
                  <SelectContent>
                    {subTopics.map((subTopic) => (
                      <SelectItem key={subTopic.id} value={subTopic.id}>
                        {subTopic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question Settings */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="max-w-xl w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full hover:bg-[#BEE74C]/10 hover:text-[#BEE74C] hover:border-[#BEE74C]"
                  onClick={() => setShowBulkUploadDialog(true)}
                >
                  Bulk Upload Questions
                </Button>
              </div>
            </div>

            {/* Question Count with Stepper Control */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  Question count
                </Badge>
                <span className="text-lg font-semibold">
                  {existingQuestions.length} / {questionNumbers.length}{" "}
                  Questions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTotalQuestionSlots((prev) => Math.max(10, prev - 10))
                  }
                  disabled={totalQuestionSlots <= 10}
                >
                  -10
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Slots: {totalQuestionSlots}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTotalQuestionSlots((prev) => prev + 10)}
                >
                  +10
                </Button>
              </div>
            </div>

            {/* Question Number Grid */}
            <div className="space-y-2">
              <Label>Select Question Number</Label>
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">
                    Loading questions...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-2">
                  {questionNumbers.map((num) => {
                    const hasQuestion = !!getExistingQuestion(num);
                    return (
                      <Button
                        key={num}
                        variant={
                          selectedQuestion === num ? "default" : "outline"
                        }
                        className={
                          selectedQuestion === num
                            ? "h-10 bg-[#BEE74C] hover:bg-[#B0D945] text-black font-semibold"
                            : hasQuestion
                            ? "h-10 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                            : "h-10 hover:bg-[#BEE74C]/10 hover:text-[#BEE74C] hover:border-[#BEE74C]"
                        }
                        onClick={() => handleQuestionClick(num)}
                      >
                        {num}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Question Form */}
        <Card className="p-6 space-y-6">
          {/* Instruction */}
          <Controller
            name="instruction"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Instruction (Optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Choose the correct answer"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Question Text */}
          <div className="space-y-2">
            <Label>Question Text</Label>
            <div className="space-y-2">
              {/* --- FIXED TOOLBAR --- */}
              {/* The toolbar is now INSIDE the EditorProvider */}
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
                        {/* You can keep a minimal bubble menu or remove it */}
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
          </div>

          {/* Options (Single Choice) */}
          {questionType === "SINGLE_CHOICE" && (
            <div className="space-y-4">
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
                onClick={() => {
                  setTotalOptions((prev) => prev + 1);
                  // Initialize the new option in the map
                  const newLabel = getOptionLabel(totalOptions);
                  setOptionsContent((prev) =>
                    new Map(prev).set(newLabel, null)
                  );
                }}
              >
                + Add Option
              </Button>
            </div>
          )}

          {/* Options (True/False) */}
          {questionType === "TRUE_FALSE" && <TrueFalseOptions />}

          {/* Options (Multiple Choice) */}
          {questionType === "MULTIPLE_CHOICE" && (
            <MultipleChoiceOptions
              totalOptions={totalOptions}
              optionsContent={optionsContent}
              correctAnswers={correctAnswers}
              selectedQuestion={selectedQuestion}
              getOptionLabel={getOptionLabel}
              updateOptionContent={updateOptionContent}
              onCorrectAnswersChange={setCorrectAnswers}
              onAddOption={() => {
                setTotalOptions((prev) => prev + 1);
                const newLabel = getOptionLabel(totalOptions);
                setOptionsContent((prev) => new Map(prev).set(newLabel, null));
              }}
              onDeleteOption={handleDeleteOption}
              getOpenNodeOption={getOpenNodeOption}
              setOpenNodeOption={setOpenNodeOption}
              getOpenLinkOption={getOpenLinkOption}
              setOpenLinkOption={setOpenLinkOption}
            />
          )}

          {/* Options (Fill in the Blank) */}
          {questionType === "FILL_IN_BLANK" && <FillInBlankOptions />}

          {/* Options (Short Answer) */}
          {questionType === "SHORT_ANSWER" && <ShortAnswerOptions />}

          {/* Options (Essay) */}
          {questionType === "ESSAY" && <EssayOptions />}

          {/* Options (Essay with Sub-Questions) */}
          {questionType === "ESSAY_WITH_SUB" && (
            <EssayWithSubOptions
              selectedQuestion={uiState.selectedQuestion}
              getOpenNodeSub={getOpenNodeSub}
              setOpenNodeSub={setOpenNodeSubHelper}
              getOpenLinkSub={getOpenLinkSub}
              setOpenLinkSub={setOpenLinkSubHelper}
            />
          )}

          {/* Options (Calculation) */}
          {questionType === "CALCULATION" && <CalculationOptions />}

          {/* Explanation (This was also already correct) */}
          <div className="space-y-2">
            <Label>Explanation</Label>
            <div className="border rounded-lg min-h-[250px] flex flex-col overflow-visible">
              <EditorWithImageDialog>
                <EditorProvider
                  key={`explanation-${selectedQuestion}`}
                  content={explanationContent || undefined}
                  placeholder="Explain the correct answer..."
                  onUpdate={({ editor }) => {
                    setExplanationContent(editor.getJSON());
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30">
                    <ImageButton />
                    <MathButton />
                    <EditorSelector
                      open={openNodeExplanation}
                      onOpenChange={setOpenNodeExplanation}
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
                      open={openLinkExplanation}
                      onOpenChange={setOpenLinkExplanation}
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

          {/* Metadata Section */}
          <div className="border rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between p-4"
              onClick={() => setShowMetadata(!showMetadata)}
            >
              <span className="font-semibold">Metadata</span>
              {showMetadata ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showMetadata && (
              <div className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="difficulty"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="difficulty-select">
                          Difficulty
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="difficulty-select"
                            className="max-w-xl w-full"
                            aria-invalid={fieldState.invalid}
                          >
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="cognitiveLevel"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="cognitive-level-select">
                          Cognitive Level (Optional)
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="cognitive-level-select"
                            className="max-w-xl w-full"
                            aria-invalid={fieldState.invalid}
                          >
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
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="marks"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Marks</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="number"
                          min="1"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="passingMarks"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Passing Marks (Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="number"
                          min="1"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="estimatedTime"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Estimated Time (seconds, Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="number"
                          min="1"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="tags"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Tags (Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="Add tags (comma separated)"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              size="lg"
              className="gap-2 bg-[#BEE74C] hover:bg-[#B0D945] text-black font-semibold"
              onClick={handleSave}
              disabled={isPending}
            >
              <Save className="h-4 w-4" />
              {isPending
                ? (existingQuestionId ? "Updating..." : "Saving...")
                : (existingQuestionId ? "Update Question" : "Save Question")
              }
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="gap-2"
              onClick={handleDelete}
              disabled={
                !selectedQuestion || !getExistingQuestion(selectedQuestion)
              }
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Question</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete Question #{selectedQuestion}?
                This action cannot be undone. The question slot will remain
                available for creating a new question.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Upload Dialog */}
        <BulkUploadDialog
          open={showBulkUploadDialog}
          onOpenChange={setShowBulkUploadDialog}
        />
      </div>
    </FormProvider>
  );
};

export default QuestionEditor;
