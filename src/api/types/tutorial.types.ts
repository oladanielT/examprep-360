import type { RichContentBlock } from "./exam.types";

// Tutorial Types
export type TutorialType = "VIDEO_TUTORIAL" | "TEXT_TUTORIAL" | "INTERACTIVE" | "OSCE";

// ==================== LIST TUTORIALS (GET /student/tutorials) ====================

export interface TutorialListItem {
  id: string;
  name: string;
  subjectId: string;
  topicId: string | null;
  subTopicId: string | null;
  type: TutorialType;
  chapterCount: number;
  subscriberCount: number;
  createdAt: string;
  subject: { name: string };
  topic: { name: string } | null;
  subTopic: { name: string } | null;
}

export interface TutorialListResponse {
  data: TutorialListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TutorialListParams {
  examTypeId?: string;
  professionalComponentId?: string;
  professionalDomainId?: string;
  subjectId?: string;
  topicId?: string;
  subTopicId?: string;
  type?: TutorialType;
  page?: number;
  limit?: number;
  search?: string;
}

// ==================== BOOKMARKED TUTORIALS (GET /student/tutorials/bookmarks) ====================

export interface BookmarkedTutorial {
  id: string;
  name: string;
  subjectId: string;
  type: TutorialType;
  chapterCount: number;
  subject: { name: string };
}

// ==================== TUTORIAL DETAILS (GET /student/tutorials/:id) ====================

export interface TutorialVideo {
  url: string;
  publicId: string;
  type: "video";
}

export interface TutorialDocument {
  url: string;
  type: "document";
  bytes?: number;
  publicId?: string;
}

export interface TutorialChapter {
  id: string;
  name: string;
  tutorialId: string;
  order: number;
  content: RichContentBlock[] | null;
  documents: TutorialDocument[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorialQuestionOption {
  id: string;
  content: RichContentBlock[];
  isCorrect?: boolean;
}

export interface TutorialQuestion {
  id: string;
  questionNumber: number;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  questionText: RichContentBlock[];
  instruction: string | null;
  options: TutorialQuestionOption[];
  correctAnswer: string | null;
  correctAnswers: string[];
  explanation: {
    solution: RichContentBlock[];
  } | null;
}

export interface TutorialProgress {
  lastWatchTime: number;
  lastChapterId: string | null;
  testScore: number | null;
  isCompleted: boolean;
}

// Tutorial Detail Response (unified)
export interface TutorialDetail {
  id: string;
  name: string;
  subjectId: string;
  topicId: string | null;
  subTopicId: string | null;
  type: TutorialType;
  chapterCount: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
  tutorialImages: TutorialVideo[] | null;
  tutorialVideos: TutorialVideo[] | null;
  tutorialAudios: TutorialVideo[] | null;
  subject: { id: string; name: string; examTypeId: string } | null;
  topic: { name: string } | null;
  subTopic: { name: string } | null;
  chapters: TutorialChapter[];
  testQuestions: TutorialQuestion[];
  isBookmarked: boolean;
  userProgress: TutorialProgress | null;
}

// ==================== UPDATE PROGRESS (PATCH /student/tutorials/:id/progress) ====================

export interface UpdateTutorialProgressRequest {
  lastWatchTime?: number;
  lastChapterId?: string;
  testScore?: number;
}

export interface UpdateTutorialProgressResponse {
  id: string;
  studentId: string;
  tutorialId: string;
  isCompleted: boolean;
  lastWatchTime: number;
  lastChapterId: string | null;
  testScore: number | null;
  updatedAt: string;
}

// ==================== SUBMIT QUIZ (POST /student/tutorials/:id/submit-questions) ====================

export interface TutorialQuizAnswer {
  questionId: string;
  answer: string;
}

export interface SubmitTutorialQuestionsRequest {
  answers: TutorialQuizAnswer[];
}

export interface SubmitTutorialQuestionsResponse {
  score: number;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
}

// ==================== MARK COMPLETE (POST /student/tutorials/:id/complete) ====================

export interface MarkTutorialCompleteResponse {
  id: string;
  isCompleted: boolean;
  lastWatchTime: number;
  testScore: number | null;
  updatedAt: string;
}

// ==================== TOGGLE BOOKMARK (POST /student/tutorials/:id/bookmark) ====================

export interface ToggleTutorialBookmarkResponse {
  bookmarked: boolean;
}

// ==================== LEGACY/CONVENIENCE TYPES ====================

// Combined Tutorial type for general use
export interface Tutorial {
  id: string;
  name: string;
  type: TutorialType;
  subjectId: string;
  topicId?: string | null;
  subTopicId?: string | null;
  chapterCount?: number;
  subscriberCount?: number;
  createdAt?: string;
  subject?: { name: string };
  topic?: { name: string } | null;
  subTopic?: { name: string } | null;
  // Detail fields (only present when fetching single tutorial)
  tutorialVideos?: TutorialVideo[];
  chapters?: TutorialChapter[];
  testQuestions?: TutorialQuestion[];
  isBookmarked?: boolean;
  userProgress?: TutorialProgress | null;
}

// ==================== TASK TYPES ====================

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: TaskStatus;
  dueDate?: string;
  points: number;
  subjectId?: string;
  subjectName?: string;
  submissionData?: unknown;
  completedAt?: string;
  createdAt: string;
}

export interface TaskListParams {
  status?: TaskStatus;
  limit?: number;
  offset?: number;
}

export interface SubmitTaskRequest {
  submissionData: unknown;
}
