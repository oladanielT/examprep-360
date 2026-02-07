// Exam Types
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_IN_BLANK"
  | "ESSAY"
  | "ESSAY_WITH_SUB"
  | "SHORT_ANSWER"
  | "MATCHING"
  | "ORDERING"
  | "CALCULATION"
  | "DIAGRAM_LABELING"
  | "THEORY_WITH_OBJECTIVES";
export type AttemptStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "ABANDONED";
export type ExamTypeEnum = "MOCK" | "PRACTICE" | "BIG_MOCK";
export type ExamCategory = "PRE_DEGREE" | "SECONDARY_SCHOOL" | "POST_JAMB" | "WASSCE" | "NECO" | string;
export type GroupBy = "SUBJECT" | "TYPE" | "YEAR";

// ==================== RICH CONTENT TYPES ====================

export type RichContentType =
  | "text"
  | "markdown"
  | "latex"
  | "image"
  | "audio"
  | "video"
  | "table"
  | "diagram"
  | "list";

export interface RichContentStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: "small" | "normal" | "large";
  color?: string;
}

// Base rich content block
export interface RichContentBlockBase {
  type: RichContentType;
  style?: RichContentStyle;
}

// Text block
export interface TextBlock extends RichContentBlockBase {
  type: "text";
  value: string;
}

// Markdown block
export interface MarkdownBlock extends RichContentBlockBase {
  type: "markdown";
  content: string;
}

// LaTeX block (for math equations)
export interface LatexBlock extends RichContentBlockBase {
  type: "latex";
  value: string;
}

// Image block
export interface ImageBlock extends RichContentBlockBase {
  type: "image";
  url: string;
  alt?: string;
  publicId?: string;
}

// Audio block
export interface AudioBlock extends RichContentBlockBase {
  type: "audio";
  url: string;
}

// Video block
export interface VideoBlock extends RichContentBlockBase {
  type: "video";
  url: string;
}

// Table block
export interface TableBlock extends RichContentBlockBase {
  type: "table";
  headers: string[];
  rows: string[][];
}

// Diagram block
export interface DiagramBlock extends RichContentBlockBase {
  type: "diagram";
  imageUrl: string;
  annotations?: Array<{
    id: string;
    x: number;
    y: number;
    label: string;
  }>;
}

// List block
export interface ListBlock extends RichContentBlockBase {
  type: "list";
  items: string[];
}

// Union of all rich content blocks
export type RichContentBlock =
  | TextBlock
  | MarkdownBlock
  | LatexBlock
  | ImageBlock
  | AudioBlock
  | VideoBlock
  | TableBlock
  | DiagramBlock
  | ListBlock;

// ==================== QUESTION-TYPE SPECIFIC DATA ====================

// Choice question option (SINGLE_CHOICE, MULTIPLE_CHOICE)
export interface ChoiceOption {
  id: string;
  content: RichContentBlock[];
  isCorrect?: boolean;
}

// Fill in the blank data
export interface FillInBlankData {
  template: string;
  blanks: Array<{
    id: string;
    acceptableAnswers: string[];
    inputType?: "text" | "number";
    hint?: string;
  }>;
}

// True/False data
export interface TrueFalseData {
  correctAnswer: boolean;
  justificationRequired?: boolean;
}

// Essay data
export interface EssayData {
  minWords?: number;
  maxWords?: number;
  expectedPoints?: string[];
  rubric?: Array<{
    criterion: string;
    maxMarks: number;
  }>;
}

// Essay with sub-questions data
export interface EssayWithSubData {
  mainQuestion: RichContentBlock[];
  subQuestions: Array<{
    subId: string;
    questionText: RichContentBlock[];
    marks: number;
  }>;
}

// Short answer data
export interface ShortAnswerData {
  acceptableAnswers: string[];
  caseSensitive?: boolean;
  answerFormat?: "text" | "number";
}

// Matching data
export interface MatchingData {
  leftColumn: Array<{
    id: string;
    text: string;
  }>;
  rightColumn: Array<{
    id: string;
    text: string;
  }>;
  correctMatches: string[]; // Format: "L1-R1"
}

// Ordering data
export interface OrderingData {
  items: Array<{
    id: string;
    text: string;
  }>;
  correctOrder: string[];
}

// Calculation data
export interface CalculationData {
  problem: string;
  steps: Array<{
    step: string;
    formula: string;
  }>;
  finalAnswer: number;
  precision?: number;
}

// Diagram labeling data
export interface DiagramLabelingData {
  diagramUrl: string;
  labels: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
  }>;
}

// Theory with objectives data
export interface TheoryWithObjectivesData {
  theoryPart: {
    content: RichContentBlock[];
    responseType: "SHORT_ANSWER" | "ESSAY";
    marks: number;
  };
  objectivesPart: {
    content: RichContentBlock[];
    options: ChoiceOption[];
    correctAnswer: string;
    marks: number;
  };
}

// ==================== EXPLANATION TYPES ====================

export interface WorkingStep {
  step: string;
  formula?: string;
  explanation?: string;
}

export interface ExplanationData {
  solution: RichContentBlock[];
  workingSteps?: WorkingStep[];
  keyPoints?: string[];
  commonMistakes?: string[];
  tips?: string[];
}

// ==================== REQUEST TYPES ====================

export interface StartPracticeRequest {
  subjectId: string;
  courseId?: string;
  topicIds?: string[];
  year?: number;
  examYear?: string;
  title?: string;
}

export interface ConfigurePracticeRequest {
  subjectId: string;
  courseId?: string;
  questionCount?: number;
  timeLimit?: number;
  difficulty?: Difficulty;
  questionTypes?: QuestionType[];
  year?: number;
  examYear?: string;
  title?: string;
}

export interface SubmitResponseRequest {
  questionId: string;
  answer: string | string[] | boolean;
  timeSpentSeconds: number;
}

export interface BulkResponseItem {
  questionId: string;
  answer: string | string[] | boolean;
  timeSpentSeconds: number;
}

export interface SubmitResponsesBulkRequest {
  responses: BulkResponseItem[];
  complete?: boolean;
}

export interface SubmitResponsesBulkResponse {
  responses: AttemptResponse[];
  completed?: boolean;
}

export interface ReportQuestionRequest {
  questionId: string;
  reason: string;
  details?: string;
}

export interface ToggleBookmarkRequest {
  questionId: string;
}

// ==================== CORE TYPES ====================

export interface ExamType {
  id: string;
  name: string;
  category: ExamCategory;
  imageUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  year?: number;
  examTypeId?: string;
}

export interface Course {
  id: string;
  name: string;
}

// Legacy Option type (simple text-based)
export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

// Full Question interface with all question-type data
export interface Question {
  id: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: RichContentBlock[];
  instruction?: string;
  context?: RichContentBlock[] | null;
  difficulty: Difficulty;
  marks: number;
  year?: number;

  // Choice questions (SINGLE_CHOICE, MULTIPLE_CHOICE)
  options?: ChoiceOption[];
  correctAnswer?: string; // For SINGLE_CHOICE
  correctAnswers?: string[]; // For MULTIPLE_CHOICE

  // Question-type specific data
  fillInBlankData?: FillInBlankData;
  trueFalseData?: TrueFalseData;
  essayData?: EssayData;
  essayWithSubData?: EssayWithSubData;
  shortAnswerData?: ShortAnswerData;
  matchingData?: MatchingData;
  orderingData?: OrderingData;
  calculationData?: CalculationData;
  diagramLabelingData?: DiagramLabelingData;
  theoryWithObjectivesData?: TheoryWithObjectivesData;

  // Explanation (shown after submission)
  explanation?: ExplanationData;
}

// ExamQuestion is the wrapper that includes order
export interface ExamQuestion {
  id: string;
  order: number;
  question: Question;
}

// ==================== AVAILABLE EXAMS (GET /student/exams/available) ====================

export interface AvailableExam {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  numQuestions: number;
  allowedAttempts: number;
  passingScore: number;
  examTypeEnum: ExamTypeEnum;
  examTypeId: string;
  subjectId: string | null;
  courseId: string | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  examType: ExamType;
  subject: Subject | null;
  _count: {
    attempts: number;
  };
}

export type AvailableExamsUngrouped = AvailableExam[];
export type AvailableExamsGrouped = Record<string, AvailableExam[]>;
export type AvailableExamsResponse = AvailableExamsUngrouped | AvailableExamsGrouped;

export interface AvailableExamsParams {
  subjectId?: string;
  courseId?: string;
  examTypeEnum?: ExamTypeEnum;
  year?: number;
  groupBy?: GroupBy;
}

// ==================== EXAM PREFERENCES (GET /student/exams/preferences) ====================

export interface ExamPreferencesResponse {
  examTypeId: string;
  selectedSubjects: string[];
  selectedCourses: string[];
  examCategory: ExamCategory;
  examSubtype: string;
  examTypeRecord: {
    id: string;
    name: string;
  };
  subjects: Subject[];
  courses: Course[];
}

// ==================== START EXAM / PRACTICE (POST /student/exams/:id/start or /practice/start) ====================

export interface ExamDetails {
  id: string;
  name: string;
  durationMinutes: number;
  numQuestions: number;
  passingScore: number;
  examTypeEnum: ExamTypeEnum;
  questions: ExamQuestion[];
}

export interface StartExamResponse {
  id: string;
  studentId: string;
  examId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  exam: ExamDetails;
}

// ==================== EXAM HISTORY (GET /student/exams/history) ====================

export interface ExamHistoryItem {
  id: string;
  examId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  totalScore?: number;
  percentage?: number;
  passed?: boolean;
  exam: {
    name: string;
    numQuestions: number;
    examTypeEnum: ExamTypeEnum;
    subject: { name: string } | null;
    examType?: { name: string };
  };
}

export interface ExamHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExamHistoryResponse {
  items: ExamHistoryItem[];
  meta: ExamHistoryMeta;
}

export interface ExamHistoryParams {
  page?: number;
  limit?: number;
  examType?: ExamTypeEnum;
  subjectId?: string;
}

// ==================== PAUSED EXAMS (GET /student/exams/paused) ====================

export interface PausedExam {
  id: string;
  status: "PAUSED";
  startedAt?: string;
  pausedAt?: string;
  updatedAt?: string;
  timeSpentSeconds?: number;
  answeredQuestions?: number;
  exam: {
    id: string;
    name: string;
    numQuestions: number;
    subjectId?: string;
    examTypeEnum?: ExamTypeEnum;
    subject?: { name: string } | null;
  };
  _count?: {
    responses: number;
  };
}

// ==================== GET EXAM QUESTIONS (GET /student/exams/:id/questions) ====================

export interface ExamQuestionsResponse {
  exam: {
    id: string;
    name: string;
    durationMinutes: number;
    numQuestions: number;
  };
  questions: Question[];
}

// ==================== ATTEMPT RESPONSE ====================

export interface AttemptResponse {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string | string[] | boolean;
  isCorrect?: boolean;
  marksAwarded?: number;
  timeSpentSeconds: number;
  submittedAt: string;
}

// ==================== LEGACY TYPES (keeping for backward compatibility) ====================

export interface ExamAttempt {
  id: string;
  examId?: string;
  userId?: string;
  studentId?: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  submittedAt?: string;
  pausedAt?: string;
  totalQuestions?: number;
  answeredQuestions?: number;
  score?: number;
  totalScore?: number;
  percentage?: number;
  passed?: boolean;
  timeSpentSeconds?: number;
  title?: string;
  attemptNumber?: number;
  exam?: ExamDetails;
}

export interface ExamHistory {
  attempts: ExamAttempt[];
  totalAttempts: number;
  averageScore: number;
}

export interface Bookmark {
  id: string;
  questionId: string;
  question: Question;
  createdAt: string;
}

export interface QuestionReport {
  id: string;
  questionId: string;
  question: Question;
  reason: string;
  details?: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: string;
}

// ==================== EXAM REVIEW (GET /student/exams/attempts/:id/review) ====================

export interface ExamReviewResponse {
  id: string;
  totalScore: number;
  percentage?: number;
  passed?: boolean;
  timeSpentSeconds?: number;
  exam?: {
    name: string;
    numQuestions: number;
    subject?: { name: string } | null;
    examType?: { name: string };
  };
  responses: {
    id: string;
    questionId: string;
    answer: string | string[] | boolean | Record<string, string>;
    isCorrect: boolean;
    marksAwarded: number;
    timeSpentSeconds?: number;
    question: Question;
  }[];
}

export interface ExamSubtype {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}
