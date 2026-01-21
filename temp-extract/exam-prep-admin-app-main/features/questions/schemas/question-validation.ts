import { z } from "zod";

// ============ Base Schema ============
export const baseQuestionSchema = z.object({
  questionType: z.string().min(1, "Question type is required"),
  instruction: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    message: "Difficulty must be EASY, MEDIUM, or HARD",
  }),
  cognitiveLevel: z.enum(["RECALL", "UNDERSTANDING", "APPLICATION", "ANALYSIS"]).optional(),
  marks: z.string().min(1, "Marks is required"),
  passingMarks: z.string().optional(),
  estimatedTime: z.string().optional(),
  tags: z.string().optional(),
});

// ============ Single Choice Schema ============
export const singleChoiceDataSchema = z.object({
  correctAnswer: z.string().min(1, "Please select the correct answer"),
});

// ============ Multiple Choice Schema ============
export const multipleChoiceDataSchema = z.object({
  correctAnswers: z.array(z.string()).min(1, "Please select at least one correct answer"),
});

// ============ True/False Schema ============
export const trueFalseDataSchema = z.object({
  correctAnswer: z.enum(["true", "false"], {
    message: "Please select True or False",
  }),
});

// ============ Fill in the Blank Schema ============
export const fillInBlankDataSchema = z.object({
  template: z.string().min(1, "Please enter a template for the fill-in-blank question"),
  blanks: z
    .array(
      z.object({
        id: z.string(),
        acceptableAnswers: z
          .array(z.string())
          .min(1, "At least one acceptable answer is required"),
        caseSensitive: z.boolean(),
        marks: z.number().min(0, "Marks must be positive"),
        hint: z.string().optional(),
        inputType: z.literal("text"),
      })
    )
    .min(1, "At least one blank is required"),
});

// ============ Short Answer Schema ============
export const shortAnswerDataSchema = z.object({
  acceptableAnswers: z
    .array(z.string())
    .min(1, "Please add at least one acceptable answer"),
  caseSensitive: z.boolean(),
  maxCharacters: z.number().min(1, "Max characters must be at least 1"),
});

// ============ Essay Schema ============
export const essayDataSchema = z
  .object({
    minWords: z.number().min(0, "Min words must be positive"),
    maxWords: z.number().min(0, "Max words must be positive"),
    expectedPoints: z.array(z.string()),
    sampleAnswer: z.string(),
    allowDrafts: z.boolean(),
    spellCheckEnabled: z.boolean(),
  })
  .refine((data) => data.maxWords >= data.minWords, {
    message: "Max words must be greater than or equal to min words",
    path: ["maxWords"],
  });

// ============ Essay with Sub-Questions Schema ============
export const essayWithSubDataSchema = z.object({
  mainQuestion: z.any().nullable(), // JSONContent
  subQuestions: z
    .array(
      z.object({
        subId: z.string(),
        questionTextContent: z.any().nullable(), // JSONContent
        marks: z.number().min(0, "Marks must be positive"),
        minWords: z.number().min(0, "Min words must be positive"),
        expectedPoints: z.array(z.string()),
      })
    )
    .min(1, "At least one sub-question is required")
    .refine(
      (subQuestions) => subQuestions.every((sq) => sq.questionTextContent !== null),
      {
        message: "All sub-questions must have content",
      }
    ),
});

// ============ Calculation Schema ============
export const calculationDataSchema = z.object({
  problem: z.string().min(1, "Please enter a problem description"),
  steps: z
    .array(
      z.object({
        step: z.string().min(1, "Step description is required"),
        explanation: z.string().min(1, "Explanation is required"),
        formula: z.string().optional(),
        result: z.union([z.number(), z.string()]).optional(),
      })
    )
    .min(1, "At least one solution step is required"),
  finalAnswer: z.union([z.number(), z.string(), z.literal("")]).refine(
    (val) => val !== "",
    { message: "Please enter the final answer" }
  ),
  units: z.string(),
  precision: z.number().min(0).max(10, "Precision must be between 0 and 10"),
  showSteps: z.boolean(),
});

// ============ Complete Question Schema (Discriminated Union) ============
export const questionEditorSchema = z.discriminatedUnion("questionType", [
  // SINGLE_CHOICE
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("SINGLE_CHOICE"),
    singleChoiceData: singleChoiceDataSchema,
  }),
  // MULTIPLE_CHOICE
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("MULTIPLE_CHOICE"),
    multipleChoiceData: multipleChoiceDataSchema,
  }),
  // TRUE_FALSE
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("TRUE_FALSE"),
    trueFalseData: trueFalseDataSchema,
  }),
  // FILL_IN_BLANK
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("FILL_IN_BLANK"),
    fillInBlankData: fillInBlankDataSchema,
  }),
  // SHORT_ANSWER
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("SHORT_ANSWER"),
    shortAnswerData: shortAnswerDataSchema,
  }),
  // ESSAY
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("ESSAY"),
    essayData: essayDataSchema,
  }),
  // ESSAY_WITH_SUB
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("ESSAY_WITH_SUB"),
    essayWithSubData: essayWithSubDataSchema,
  }),
  // CALCULATION
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("CALCULATION"),
    calculationData: calculationDataSchema,
  }),
]);

// ============ Type Inference ============
export type QuestionEditorFormData = z.infer<typeof questionEditorSchema>;
export type EssayData = z.infer<typeof essayDataSchema>;
export type CalculationData = z.infer<typeof calculationDataSchema>;
export type FillInBlankData = z.infer<typeof fillInBlankDataSchema>;
export type ShortAnswerData = z.infer<typeof shortAnswerDataSchema>;
export type EssayWithSubData = z.infer<typeof essayWithSubDataSchema>;
export type SingleChoiceData = z.infer<typeof singleChoiceDataSchema>;
export type MultipleChoiceData = z.infer<typeof multipleChoiceDataSchema>;
export type TrueFalseData = z.infer<typeof trueFalseDataSchema>;
