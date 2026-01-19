// Exam Types
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "ESSAY";
export type AttemptStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "ABANDONED";

export interface StartPracticeRequest {
  subjectId: string;
  topicIds?: string[];
  title?: string;
}

export interface ConfigurePracticeRequest {
  subjectId: string;
  timeLimit?: number;
  questionCount?: number;
  difficulty?: Difficulty;
  questionTypes?: QuestionType[];
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

// Available Exams
export type ExamTypeEnum = "PRACTICE" | "MOCK" | "BIG_MOCK";
export type GroupBy = "subject" | "type" | "year";

export interface AvailableExamsParams {
  subjectId?: string;
  courseId?: string;
  examTypeEnum?: ExamTypeEnum;
  year?: number;
  groupBy?: GroupBy;
}

export interface AvailableExam {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subjectName?: string;
  courseId?: string;
  courseName?: string;
  examType: ExamTypeEnum;
  year: number;
  questionCount: number;
  duration?: number;
  difficulty?: Difficulty;
  createdAt?: string;
}

export interface AvailableExamsResponse {
  exams: AvailableExam[];
  total: number;
  grouped?: Record<string, AvailableExam[]>;
}

// Student Preferences
export interface StudentPreferences {
  selectedSubjects: string[];
  selectedCourses: string[];
  examCategory: string;
  examSubtype: string | null;
  examTypeId: string;
}
