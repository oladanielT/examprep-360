/**
 * Default values for question editor form
 * Used by React Hook Form for initialization and reset
 */

import type { QuestionEditorFormData } from "../schemas/question-validation";

export const getDefaultValues = (questionType: string): Partial<QuestionEditorFormData> => {
  const baseDefaults = {
    questionType,
    instruction: "",
    difficulty: "EASY" as const,
    cognitiveLevel: "RECALL" as const,
    marks: "1",
    passingMarks: "1",
    estimatedTime: "60",
    tags: "",
  };

  switch (questionType) {
    case "SINGLE_CHOICE":
      return {
        ...baseDefaults,
        questionType: "SINGLE_CHOICE" as const,
        singleChoiceData: {
          correctAnswer: "",
        },
      };

    case "MULTIPLE_CHOICE":
      return {
        ...baseDefaults,
        questionType: "MULTIPLE_CHOICE" as const,
        multipleChoiceData: {
          correctAnswers: [],
        },
      };

    case "TRUE_FALSE":
      return {
        ...baseDefaults,
        questionType: "TRUE_FALSE" as const,
        trueFalseData: {
          correctAnswer: "true" as const,
        },
      };

    case "FILL_IN_BLANK":
      return {
        ...baseDefaults,
        questionType: "FILL_IN_BLANK" as const,
        fillInBlankData: {
          template: "",
          blanks: [
            {
              id: "blank1",
              acceptableAnswers: [],
              caseSensitive: false,
              marks: 1,
              hint: "",
              inputType: "text" as const,
            },
          ],
        },
      };

    case "SHORT_ANSWER":
      return {
        ...baseDefaults,
        questionType: "SHORT_ANSWER" as const,
        shortAnswerData: {
          acceptableAnswers: [],
          caseSensitive: false,
          maxCharacters: 10,
        },
      };

    case "ESSAY":
      return {
        ...baseDefaults,
        questionType: "ESSAY" as const,
        essayData: {
          minWords: 500,
          maxWords: 1000,
          expectedPoints: [],
          sampleAnswer: "",
          allowDrafts: true,
          spellCheckEnabled: true,
        },
      };

    case "ESSAY_WITH_SUB":
      return {
        ...baseDefaults,
        questionType: "ESSAY_WITH_SUB" as const,
        essayWithSubData: {
          mainQuestion: null,
          subQuestions: [
            {
              subId: "a",
              questionTextContent: null,
              marks: 5,
              minWords: 50,
              expectedPoints: [],
            },
          ],
        },
      };

    case "CALCULATION":
      return {
        ...baseDefaults,
        questionType: "CALCULATION" as const,
        calculationData: {
          problem: "",
          steps: [
            {
              step: "",
              explanation: "",
              formula: "",
              result: "",
            },
          ],
          finalAnswer: "",
          units: "",
          precision: 0,
          showSteps: true,
        },
      };

    default:
      // Default to SINGLE_CHOICE
      return {
        ...baseDefaults,
        questionType: "SINGLE_CHOICE" as const,
        singleChoiceData: {
          correctAnswer: "",
        },
      };
  }
};

/**
 * Get initial values when loading an existing question
 * This converts the API question format to the form format
 */
export const getQuestionFormValues = (question: any): Partial<QuestionEditorFormData> => {
  const baseValues = {
    questionType: question.questionType,
    instruction: question.instruction || "",
    difficulty: question.difficulty || "EASY",
    cognitiveLevel: question.cognitiveLevel || "RECALL",
    marks: question.marks?.toString() || "1",
    passingMarks: question.passingMarks?.toString() || "1",
    estimatedTime: question.estimatedTimeSeconds?.toString() || "60",
    tags: question.tags?.join(", ") || "",
  };

  switch (question.questionType) {
    case "SINGLE_CHOICE":
      return {
        ...baseValues,
        questionType: "SINGLE_CHOICE" as const,
        singleChoiceData: {
          correctAnswer: question.correctAnswer || "",
        },
      };

    case "MULTIPLE_CHOICE":
      return {
        ...baseValues,
        questionType: "MULTIPLE_CHOICE" as const,
        multipleChoiceData: {
          correctAnswers: question.correctAnswers || [],
        },
      };

    case "TRUE_FALSE":
      return {
        ...baseValues,
        questionType: "TRUE_FALSE" as const,
        trueFalseData: {
          correctAnswer: question.trueFalseData?.correctAnswer ? "true" as const : "false" as const,
        },
      };

    case "FILL_IN_BLANK":
      return {
        ...baseValues,
        questionType: "FILL_IN_BLANK" as const,
        fillInBlankData: question.fillInBlankData || {
          template: "",
          blanks: [],
        },
      };

    case "SHORT_ANSWER":
      return {
        ...baseValues,
        questionType: "SHORT_ANSWER" as const,
        shortAnswerData: question.shortAnswerData || {
          acceptableAnswers: [],
          caseSensitive: false,
          maxCharacters: 10,
        },
      };

    case "ESSAY":
      return {
        ...baseValues,
        questionType: "ESSAY" as const,
        essayData: question.essayData || {
          minWords: 500,
          maxWords: 1000,
          expectedPoints: [],
          sampleAnswer: "",
          allowDrafts: true,
          spellCheckEnabled: true,
        },
      };

    case "ESSAY_WITH_SUB":
      return {
        ...baseValues,
        questionType: "ESSAY_WITH_SUB" as const,
        essayWithSubData: question.essayWithSubData || {
          mainQuestion: null,
          subQuestions: [],
        },
      };

    case "CALCULATION":
      return {
        ...baseValues,
        questionType: "CALCULATION" as const,
        calculationData: question.calculationData || {
          problem: "",
          steps: [],
          finalAnswer: "",
          units: "",
          precision: 0,
          showSteps: true,
        },
      };

    default:
      return {
        ...baseValues,
        questionType: "SINGLE_CHOICE" as const,
        singleChoiceData: {
          correctAnswer: "",
        },
      };
  }
};
