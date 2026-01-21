import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface RichContentBlock {
  type: "text" | "markdown" | "latex" | "image" | "video" | "audio" | "code";
  value: string;
  metadata?: Record<string, any>;
}

export interface QuestionOption {
  id: string;
  content: RichContentBlock[];
  isCorrect: boolean;
}

// Subject-based hierarchy (JAMB, WAEC, etc.)
export interface SubjectQuestionHierarchy {
  examType: string;
  subject: string;
  subjectCode?: string;
  topic?: {
    name: string;
    id?: string;
  };
  subTopic?: {
    name: string;
    id?: string;
  };
}

// Course-based hierarchy (University courses)
export interface CourseQuestionHierarchy {
  examType: "UNIVERSITY_COURSE";
  university: string;
  universityCode: string;
  faculty: string;
  department: string;
  course: {
    code: string;
    title: string;
    level: number;
    unit: number;
    semester: "FIRST" | "SECOND";
    prerequisites?: string[];
  };
  topic?: string; // Module/Topic name
}

export type QuestionHierarchy = SubjectQuestionHierarchy | CourseQuestionHierarchy;

export interface QuestionMetadata {
  tags: string[];
  marks: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  examType: string;
  examYear?: string;
  examPeriod?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  passingMarks?: number | null;
  cognitiveLevel?:
    | "RECALL"
    | "UNDERSTANDING"
    | "APPLICATION"
    | "ANALYSIS"
    | null;
  estimatedTimeSeconds?: number | null;
  skillsAssessed?: string[];
  learningOutcomes?: string[];
  year?: number; // Academic year for course questions
}

export interface Question {
  id: string;
  questionNumber: number;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "SHORT_ANSWER" | "ESSAY" | "ESSAY_WITH_SUB" | "CALCULATION";
  questionText: RichContentBlock[];
  instruction?: string | null;
  context?: any | null;
  options: QuestionOption[];
  correctAnswer: string;
  correctAnswers: string[];
  explanation: RichContentBlock[] | null;
  marks: number;
  passingMarks: number | null;
  estimatedTimeSeconds: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  cognitiveLevel:
    | "RECALL"
    | "UNDERSTANDING"
    | "APPLICATION"
    | "ANALYSIS"
    | null;
  skillsAssessed: string[];
  learningOutcomes: string[];
  averageScore: number | null;
  attemptCount: number;
  successRate: number | null;
  createdAt: string;
  updatedAt: string;
  hierarchy: QuestionHierarchy;
  metadata: QuestionMetadata;
  crossExamRef: any | null;
  tutorialInfo: any | null;
  pastQuestionReference: any | null;
  accessibility: any | null;
  adaptiveSettings: any | null;
  trueFalseData: any | null;
  fillInBlankData: any | null;
  essayData: any | null;
  essayWithSubData: any | null;
  shortAnswerData: any | null;
  matchingData: any | null;
  orderingData: any | null;
  calculationData: any | null;
  diagramLabelingData: any | null;
  theoryWithObjectivesData: any | null;
  questionVideoUrls: string[];
  optionVideoUrls: string[];
  explanationVideoUrls: string[];
  topicId: string | null;
  subTopicId: string | null;
  sessionId: string | null;
  universityId: string | null;
  facultyId: string | null;
  departmentId: string | null;
  courseId: string | null;
  tutorialId: string | null;
  topic: any | null;
  subTopic: any | null;
  session: any | null;
}

export interface QuestionsResponse {
  data: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetQuestionsParams {
  topicId?: string;
  subTopicId?: string;
  sessionId?: string;
  questionType?: "SINGLE_CHOICE" | "MULTI_CHOICE" | "FILL_IN_BLANK" | "ESSAY";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  examType?: string;
  examYear?: number;
  subject?: string;
  tags?: string;
  cognitiveLevel?: "RECALL" | "UNDERSTANDING" | "APPLICATION" | "ANALYSIS";
  skillsAssessed?: string;
  learningOutcomes?: string;
  universityId?: string;
  facultyId?: string;
  departmentId?: string;
  courseId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ========== API CALL ==========
export const getQuestions = (
  params: GetQuestionsParams = {}
): Promise<QuestionsResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    limit: params.limit || 10,
    sortBy: params.sortBy || "createdAt",
    sortOrder: params.sortOrder || "desc",
  };

  // Only add optional params if provided
  if (params.topicId) queryParams.topicId = params.topicId;
  if (params.subTopicId) queryParams.subTopicId = params.subTopicId;
  if (params.sessionId) queryParams.sessionId = params.sessionId;
  if (params.questionType) queryParams.questionType = params.questionType;
  if (params.difficulty) queryParams.difficulty = params.difficulty;
  if (params.status) queryParams.status = params.status;
  if (params.examType) queryParams.examType = params.examType;
  if (params.examYear) queryParams.examYear = params.examYear;
  if (params.subject) queryParams.subject = params.subject;
  if (params.tags) queryParams.tags = params.tags;
  if (params.cognitiveLevel) queryParams.cognitiveLevel = params.cognitiveLevel;
  if (params.skillsAssessed) queryParams.skillsAssessed = params.skillsAssessed;
  if (params.learningOutcomes)
    queryParams.learningOutcomes = params.learningOutcomes;
  if (params.universityId) queryParams.universityId = params.universityId;
  if (params.facultyId) queryParams.facultyId = params.facultyId;
  if (params.departmentId) queryParams.departmentId = params.departmentId;
  if (params.courseId) queryParams.courseId = params.courseId;

  return api.get(`/admin/content/questions`, { params: queryParams });
};

// ========== QUERY OPTIONS ==========
export const getQuestionsQueryOptions = (params: GetQuestionsParams = {}) => {
  return queryOptions({
    queryKey: ["questions", params],
    queryFn: () => getQuestions(params),
  });
};

// ========== HOOK ==========
type UseQuestionsOptions = {
  params?: GetQuestionsParams;
  queryConfig?: QueryConfig<typeof getQuestionsQueryOptions>;
};

export const useQuestions = ({
  params = {},
  queryConfig,
}: UseQuestionsOptions = {}) => {
  return useQuery({
    ...getQuestionsQueryOptions(params),
    ...(queryConfig as any),
  });
};
