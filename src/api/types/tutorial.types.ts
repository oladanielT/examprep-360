// Tutorial Types
export type TutorialType = "VIDEO" | "TEXT" | "INTERACTIVE";

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: TutorialType;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  duration?: number;
  videoUrl?: string;
  content?: string;
  thumbnailUrl?: string;
  chapters?: TutorialChapter[];
  questions?: TutorialQuestion[];
  isBookmarked: boolean;
  progress?: TutorialProgress;
  createdAt: string;
}

export interface TutorialChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
}

export interface TutorialQuestion {
  id: string;
  text: string;
  options: TutorialOption[];
}

export interface TutorialOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TutorialProgress {
  lastWatchTime: number;
  lastChapterId?: string;
  testScore?: number;
  completed: boolean;
  completedAt?: string;
}

export interface UpdateTutorialProgressRequest {
  lastWatchTime: number;
  lastChapterId?: string;
  testScore?: number;
}

export interface SubmitTutorialQuestionsRequest {
  answers: TutorialAnswer[];
}

export interface TutorialAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface TutorialListParams {
  subjectId?: string;
  topicId?: string;
  type?: TutorialType;
  search?: string;
  limit?: number;
  offset?: number;
}

// Task Types
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
