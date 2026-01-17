// Exam Types
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "ESSAY";
export type AttemptStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "ABANDONED";

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

// Response Types
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  difficulty: Difficulty;
  points: number;
  subjectId: string;
  topicId?: string;
  explanation?: string;
  imageUrl?: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean; // Only shown after submission
}

export interface ExamAttempt {
  id: string;
  examId?: string;
  userId: string;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  totalQuestions: number;
  answeredQuestions: number;
  score?: number;
  timeSpentSeconds: number;
  title?: string;
}

export interface AttemptResponse {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string | string[] | boolean;
  isCorrect?: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
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

// Start Exam Response
export interface StartExamResponse {
  attempt: ExamAttempt;
  questions: Question[];
  timeLimit?: number;
}

// Exam Selection Types
export type ExamTypeEnum = "MOCK" | "PRACTICE" | "BIG_MOCK";
export type ExamCategory = "POST_JAMB" | "WASSCE" | "NECO" | string;
export type GroupBy = "SUBJECT" | "TYPE" | "YEAR";

export interface ExamSubtype {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  year?: number;
  examTypeId: string;
}

export interface Course {
  id: string;
  name: string;
}

// Available Exams Query Params
export interface AvailableExamsParams {
  subjectId?: string;
  courseId?: string;
  examTypeEnum?: ExamTypeEnum;
  year?: number;
  groupBy?: GroupBy;
}

// Available Exam Object
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
  rules: {
    randomizeQuestions: boolean;
    allowReview: boolean;
  };
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  examTypeId: string;
  subjectId: string | null;
  courseId: string | null;
  departmentId: string | null;
  examTypeEnum: ExamTypeEnum;
  createdAt: string;
  updatedAt: string;
  examType: {
    id: string;
    name: string;
    category: ExamCategory;
    imageUrl?: string;
  };
  subject: {
    id: string;
    name: string;
    year: number;
    examTypeId: string;
  } | null;
  _count: {
    attempts: number;
  };
}

// Response types for available exams
export type AvailableExamsUngrouped = AvailableExam[];
export type AvailableExamsGrouped = Record<string, AvailableExam[]>;
export type AvailableExamsResponse = AvailableExamsUngrouped | AvailableExamsGrouped;

// Exam Preferences Response (user's selected exams from onboarding)
export interface ExamPreferencesResponse {
  selectedSubjects: string[];
  selectedCourses: string[];
  examCategory: ExamCategory;
  examSubtype: string;
  examTypeId: string;
  examTypeRecord: {
    id: string;
    name: string;
  };
  subjects: Subject[];
  courses: Course[];
}
