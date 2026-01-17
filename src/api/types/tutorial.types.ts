// Tutorial Types
export type TutorialType = "VIDEO_TUTORIAL" | "TEXT_TUTORIAL" | "INTERACTIVE";

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
  format: string; // e.g., "pdf"
}

export interface ContentBlock {
  text: string;
  type?: string;
}

export interface ChapterContent {
  blocks: ContentBlock[];
}

export interface TutorialChapter {
  id: string;
  name: string;
  order: number;
  content: ChapterContent;
  documents: TutorialDocument[];
}

export interface TutorialQuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface TutorialQuestion {
  id: string;
  questionText: string;
  options: TutorialQuestionOption[];
}

export interface TutorialProgress {
  lastWatchTime: number;
  lastChapterId: string | null;
  testScore: number | null;
  isCompleted: boolean;
}

// Video Tutorial Detail Response
export interface VideoTutorialDetail {
  id: string;
  name: string;
  type: "VIDEO_TUTORIAL";
  subjectId: string;
  tutorialVideos: TutorialVideo[];
  chapters: TutorialChapter[];
  testQuestions: TutorialQuestion[];
  isBookmarked: boolean;
  userProgress: TutorialProgress | null;
}

// Text Tutorial Detail Response
export interface TextTutorialDetail {
  id: string;
  name: string;
  type: "TEXT_TUTORIAL";
  subjectId?: string;
  chapters: TutorialChapter[];
  testQuestions: TutorialQuestion[];
  isBookmarked: boolean;
  userProgress: TutorialProgress | null;
}

export type TutorialDetail = VideoTutorialDetail | TextTutorialDetail;

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
