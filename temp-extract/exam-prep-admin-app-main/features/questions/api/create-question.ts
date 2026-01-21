import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Question } from "./get-questions";

// ========== SCHEMAS ==========
// Rich Content Block Schema
const richContentBlockSchema = z.object({
  type: z.enum([
    "text",
    "markdown",
    "latex",
    "image",
    "video",
    "audio",
    "code",
  ]),
  value: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Option Schema
const optionSchema = z.object({
  id: z.string(),
  content: z.array(richContentBlockSchema),
  isCorrect: z.boolean(),
});

// Hierarchy Schema for Non-University Exams
const nonUniversityHierarchySchema = z.object({
  examType: z.string(),
  subject: z.string(),
  subjectCode: z.string().optional(),
  topic: z
    .object({
      name: z.string(),
      id: z.string().optional(),
    })
    .optional(),
  subTopic: z
    .object({
      name: z.string(),
      id: z.string().optional(),
    })
    .optional(),
});

// Hierarchy Schema for University Exams
const universityHierarchySchema = z.object({
  examType: z.literal("UNIVERSITY_COURSE"),
  university: z.string(),
  universityCode: z.string().optional(),
  faculty: z.string(),
  department: z.string(),
  course: z.object({
    code: z.string(),
    title: z.string(),
    level: z.number(),
    unit: z.number().optional(),
    semester: z.enum(["FIRST", "SECOND"]).optional(),
    prerequisites: z.array(z.string()).optional(),
  }),
  topic: z.string().optional(),
});

// Metadata Schema
const metadataSchema = z.object({
  examType: z.string(),
  examYear: z.string().optional(),
  examPeriod: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  estimatedTimeSeconds: z.number().optional(),
  marks: z.number(),
  passingMarks: z.number().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tags: z.array(z.string()).optional(),
  cognitiveLevel: z
    .enum(["RECALL", "UNDERSTANDING", "APPLICATION", "ANALYSIS"])
    .optional(),
  skillsAssessed: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
});

// Main Create Question Input Schema
export const createQuestionInputSchema = z.object({
  questionNumber: z.number(),
  questionType: z.enum([
    "SINGLE_CHOICE",
    "MULTI_CHOICE",
    "FILL_IN_BLANK",
    "ESSAY",
  ]),
  questionText: z.array(richContentBlockSchema),
  instruction: z.string().optional(),
  hierarchy: z.union([nonUniversityHierarchySchema, universityHierarchySchema]),
  metadata: metadataSchema,
  options: z.array(optionSchema).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  explanation: z.array(richContentBlockSchema).optional(),
  marks: z.number(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  // University-specific fields (optional for non-university)
  sessionId: z.string().optional(),
  universityId: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  courseId: z.string().optional(),
  // Non-university specific fields
  topicId: z.string().optional(),
  subTopicId: z.string().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionInputSchema>;

// ========== API CALL ==========
export const createQuestion = ({
  data,
}: {
  data: CreateQuestionInput;
}): Promise<Question> => {
  return api.post(`/admin/content/questions`, data);
};

// ========== HOOK ==========
type UseCreateQuestionOptions = {
  mutationConfig?: MutationConfig<typeof createQuestion>;
};

export const useCreateQuestion = ({
  mutationConfig,
}: UseCreateQuestionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate and refetch all question queries
      await queryClient.invalidateQueries({
        queryKey: ["questions"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["questions"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createQuestion,
  });
};
