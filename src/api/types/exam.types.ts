// Exam Types
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "ESSAY";
export type AttemptStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "ABANDONED";
export type ExamTypeEnum = "MOCK" | "PRACTICE" | "BIG_MOCK";
export type ExamCategory = "PRE_DEGREE" | "SECONDARY_SCHOOL" | "POST_JAMB" | "WASSCE" | "NECO" | string;
export type GroupBy = "SUBJECT" | "TYPE" | "YEAR";

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

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean; // Only shown after submission
}

// Question as returned from API (with nested structure)
export interface QuestionBlock {
  text: string;
  type?: string;
}

export interface QuestionText {
  blocks: QuestionBlock[];
}

export interface Question {
  id: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: QuestionText;
  instruction?: string;
  context?: string | null;
  options: Option[];
  difficulty: Difficulty;
  marks: number;
  year?: number;
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
  totalScore?: number;
  percentage?: number;
  passed?: boolean;
  exam: {
    name: string;
    numQuestions: number;
    examTypeEnum: ExamTypeEnum;
    subject: { name: string } | null;
  };
}

export interface ExamHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExamHistoryResponse {
  success: boolean;
  data: {
    items: ExamHistoryItem[];
    meta: ExamHistoryMeta;
  };
  timestamp: string;
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
  exam: {
    id: string;
    name: string;
    numQuestions: number;
    subject: { name: string } | null;
  };
  _count: {
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

export interface ExamSubtype {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}
