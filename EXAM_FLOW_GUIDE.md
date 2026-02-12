# Exam Flow Implementation Guide

Complete documentation for implementing the exam system in the mobile app.

---

## Table of Contents

1. [API Endpoints](#1-api-endpoints)
2. [Type Definitions](#2-type-definitions)
3. [Exam Flow Overview](#3-exam-flow-overview)
4. [API Requests & Responses](#4-api-requests--responses)
5. [Question Types](#5-question-types)
6. [Bookmark & Report](#6-bookmark--report)
7. [State Management](#7-state-management)
8. [Timer Logic](#8-timer-logic)

---

## 1. API Endpoints

All endpoints are prefixed with your base API URL.

```typescript
const EXAM_ENDPOINTS = {
  // Discovery
  AVAILABLE: "/student/exams/available",
  PREFERENCES: "/student/exams/preferences",

  // Start Exam
  PRACTICE_START: "/student/exams/practice/start",
  PRACTICE_CONFIGURE: "/student/exams/practice/configure",
  START: (examId: string) => `/student/exams/${examId}/start`,
  QUESTIONS: (examId: string) => `/student/exams/${examId}/questions`,

  // During Exam
  SUBMIT_RESPONSE: (attemptId: string) => `/student/exams/attempts/${attemptId}/responses`,
  SUBMIT_RESPONSES_BULK: (attemptId: string) => `/student/exams/attempts/${attemptId}/responses/bulk`,
  PAUSE: (attemptId: string) => `/student/exams/attempts/${attemptId}/pause`,
  RESUME: (attemptId: string) => `/student/exams/attempts/${attemptId}/resume`,

  // Complete & Review
  COMPLETE: (attemptId: string) => `/student/exams/attempts/${attemptId}/complete`,
  REVIEW: (attemptId: string) => `/student/exams/attempts/${attemptId}/review`,

  // History
  HISTORY: "/student/exams/history",
  PAUSED: "/student/exams/paused",

  // Bookmarks & Reports
  BOOKMARKS: "/student/exams/bookmarks",
  REPORTS: "/student/exams/reports",
};
```

---

## 2. Type Definitions

### Enums

```typescript
type Difficulty = "EASY" | "MEDIUM" | "HARD";

type QuestionType =
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

type AttemptStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "ABANDONED";

type ExamTypeEnum = "MOCK" | "PRACTICE" | "BIG_MOCK";

type GroupBy = "SUBJECT" | "TYPE" | "YEAR";
```

### Rich Content Types

```typescript
type RichContentType =
  | "text"
  | "markdown"
  | "latex"
  | "image"
  | "audio"
  | "video"
  | "table"
  | "diagram"
  | "list";

interface RichContentStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: "small" | "normal" | "large";
  color?: string;
}

interface TextBlock {
  type: "text";
  value: string;  // May contain $...$ or $$...$$ LaTeX
  style?: RichContentStyle;
}

interface MarkdownBlock {
  type: "markdown";
  content: string;
}

interface LatexBlock {
  type: "latex";
  value: string;  // Raw LaTeX or JSON string
}

interface ImageBlock {
  type: "image";
  url: string;
  alt?: string;
  publicId?: string;  // Cloudinary public ID
}

interface AudioBlock {
  type: "audio";
  url: string;
}

interface VideoBlock {
  type: "video";
  url: string;
}

interface TableBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

interface DiagramBlock {
  type: "diagram";
  imageUrl: string;
  annotations?: Array<{
    id: string;
    x: number;  // percentage 0-100
    y: number;  // percentage 0-100
    label: string;
  }>;
}

interface ListBlock {
  type: "list";
  items: string[];
}

type RichContentBlock =
  | TextBlock
  | MarkdownBlock
  | LatexBlock
  | ImageBlock
  | AudioBlock
  | VideoBlock
  | TableBlock
  | DiagramBlock
  | ListBlock;
```

### Question Option Types

```typescript
// For SINGLE_CHOICE and MULTIPLE_CHOICE
interface ChoiceOption {
  id: string;
  content: RichContentBlock[];  // Rich content for option text
  isCorrect?: boolean;  // Only revealed after submission
}

// For FILL_IN_BLANK
interface FillInBlankData {
  template: string;  // Text with placeholders like "The capital of France is ___"
  blanks: Array<{
    id: string;
    acceptableAnswers: string[];  // Multiple correct answers
    inputType?: "text" | "number";
    hint?: string;
  }>;
}

// For TRUE_FALSE
interface TrueFalseData {
  correctAnswer: boolean;
  justificationRequired?: boolean;
}

// For ESSAY
interface EssayData {
  minWords?: number;
  maxWords?: number;
  expectedPoints?: string[];
  rubric?: Array<{
    criterion: string;
    maxMarks: number;
  }>;
}

// For SHORT_ANSWER
interface ShortAnswerData {
  acceptableAnswers: string[];
  caseSensitive?: boolean;
  answerFormat?: "text" | "number";
}

// For MATCHING
interface MatchingData {
  leftColumn: Array<{ id: string; text: string }>;
  rightColumn: Array<{ id: string; text: string }>;
  correctMatches: string[];  // Format: ["L1-R2", "L2-R1", ...]
}

// For ORDERING
interface OrderingData {
  items: Array<{ id: string; text: string }>;
  correctOrder: string[];  // Array of item IDs in correct order
}
```

### Question Interface

```typescript
interface Question {
  id: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: RichContentBlock[];  // The main question content
  instruction?: string;
  context?: RichContentBlock[] | null;  // Additional context/passage
  difficulty: Difficulty;
  marks: number;
  year?: number;

  // For SINGLE_CHOICE / MULTIPLE_CHOICE
  options?: ChoiceOption[];
  correctAnswer?: string;      // Single correct option ID
  correctAnswers?: string[];   // Multiple correct option IDs

  // Question-type specific data
  fillInBlankData?: FillInBlankData;
  trueFalseData?: TrueFalseData;
  essayData?: EssayData;
  shortAnswerData?: ShortAnswerData;
  matchingData?: MatchingData;
  orderingData?: OrderingData;

  // Explanation (shown after submission in practice mode)
  explanation?: ExplanationData;
}

interface ExplanationData {
  solution: RichContentBlock[];
  workingSteps?: Array<{
    step: string;
    formula?: string;
    explanation?: string;
  }>;
  keyPoints?: string[];
  commonMistakes?: string[];
  tips?: string[];
}

// Wrapper with ordering info
interface ExamQuestion {
  id: string;
  order: number;
  question: Question;
}
```

---

## 3. Exam Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXAM FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DISCOVERY                                                    │
│     └─> GET /student/exams/preferences                          │
│     └─> GET /student/exams/available                            │
│                                                                  │
│  2. START EXAM                                                   │
│     └─> POST /student/exams/practice/start (practice)           │
│     └─> POST /student/exams/practice/configure (configured)     │
│     └─> POST /student/exams/{examId}/start (regular exam)       │
│                                                                  │
│  3. EXAM SESSION                                                 │
│     ├─> Answer questions (local state)                          │
│     ├─> POST .../responses (submit individual answer)           │
│     ├─> POST .../bookmarks (toggle bookmark)                    │
│     ├─> POST .../reports (report question)                      │
│     ├─> PATCH .../pause (pause exam)                            │
│     └─> PATCH .../resume (resume exam)                          │
│                                                                  │
│  4. COMPLETE EXAM                                                │
│     └─> POST .../responses/bulk (bulk submit + complete)        │
│     └─> POST .../complete (complete without new answers)        │
│                                                                  │
│  5. REVIEW                                                       │
│     └─> GET .../review (get full results)                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. API Requests & Responses

### 4.1 Get Exam Preferences

**Endpoint**: `GET /student/exams/preferences`

**Response**:
```typescript
interface ExamPreferencesResponse {
  examTypeId: string;
  selectedSubjects: string[];      // Subject IDs
  selectedCourses: string[];       // Course IDs
  examCategory: string;            // "SECONDARY_SCHOOL", "PRE_DEGREE", etc.
  examSubtype: string;             // "WAEC", "JAMB", etc.
  examTypeRecord: {
    id: string;
    name: string;
  };
  subjects: Array<{
    id: string;
    name: string;
    year?: number;
    examTypeId?: string;
  }>;
  courses: Array<{
    id: string;
    name: string;
  }>;
}
```

**Example Response**:
```json
{
  "examTypeId": "clx123abc",
  "selectedSubjects": ["sub_math_001", "sub_eng_001"],
  "selectedCourses": [],
  "examCategory": "SECONDARY_SCHOOL",
  "examSubtype": "WAEC",
  "examTypeRecord": {
    "id": "clx123abc",
    "name": "WAEC"
  },
  "subjects": [
    { "id": "sub_math_001", "name": "Mathematics" },
    { "id": "sub_eng_001", "name": "English Language" }
  ],
  "courses": []
}
```

---

### 4.2 Get Available Exams

**Endpoint**: `GET /student/exams/available`

**Query Parameters**:
```typescript
interface AvailableExamsParams {
  subjectId?: string;
  courseId?: string;
  examTypeEnum?: "MOCK" | "PRACTICE" | "BIG_MOCK";
  year?: number;
  groupBy?: "SUBJECT" | "TYPE" | "YEAR";  // Groups results
}
```

**Response** (ungrouped):
```typescript
type AvailableExamsResponse = AvailableExam[];

interface AvailableExam {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  numQuestions: number;
  allowedAttempts: number;
  passingScore: number;
  examTypeEnum: "MOCK" | "PRACTICE" | "BIG_MOCK";
  examTypeId: string;
  subjectId: string | null;
  courseId: string | null;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  examType: {
    id: string;
    name: string;
    category: string;
    imageUrl?: string;
  };
  subject: {
    id: string;
    name: string;
  } | null;
  _count: {
    attempts: number;  // How many times user attempted this
  };
}
```

**Response** (grouped by subject):
```json
{
  "Mathematics": [
    { "id": "exam1", "name": "Math Practice 1", ... },
    { "id": "exam2", "name": "Math Practice 2", ... }
  ],
  "English": [
    { "id": "exam3", "name": "English Practice 1", ... }
  ]
}
```

---

### 4.3 Start Practice Exam

**Endpoint**: `POST /student/exams/practice/start`

**Request**:
```typescript
interface StartPracticeRequest {
  subjectId: string;
  courseId?: string;
  topicIds?: string[];
  year?: number;
  examYear?: string;
  title?: string;
}
```

**Example Request**:
```json
{
  "subjectId": "sub_math_001",
  "title": "Mathematics Practice"
}
```

**Response**:
```typescript
interface StartExamResponse {
  id: string;              // Attempt ID (use this for all subsequent calls)
  studentId: string;
  examId: string;
  attemptNumber: number;
  status: "IN_PROGRESS";
  startedAt: string;       // ISO date
  exam: {
    id: string;
    name: string;
    durationMinutes: number;
    numQuestions: number;
    passingScore: number;
    examTypeEnum: "PRACTICE";
    questions: ExamQuestion[];  // Array of questions with order
  };
}
```

**Example Response**:
```json
{
  "id": "att_abc123",
  "studentId": "stu_xyz789",
  "examId": "exam_456",
  "attemptNumber": 1,
  "status": "IN_PROGRESS",
  "startedAt": "2024-01-15T10:30:00.000Z",
  "exam": {
    "id": "exam_456",
    "name": "Mathematics Practice",
    "durationMinutes": 60,
    "numQuestions": 20,
    "passingScore": 50,
    "examTypeEnum": "PRACTICE",
    "questions": [
      {
        "id": "eq_001",
        "order": 1,
        "question": {
          "id": "q_001",
          "questionNumber": 1,
          "questionType": "SINGLE_CHOICE",
          "questionText": [
            { "type": "text", "value": "What is 2 + 2?" }
          ],
          "difficulty": "EASY",
          "marks": 2,
          "options": [
            { "id": "opt_a", "content": [{ "type": "text", "value": "3" }] },
            { "id": "opt_b", "content": [{ "type": "text", "value": "4" }] },
            { "id": "opt_c", "content": [{ "type": "text", "value": "5" }] },
            { "id": "opt_d", "content": [{ "type": "text", "value": "6" }] }
          ]
        }
      }
    ]
  }
}
```

---

### 4.4 Configure Practice Exam (with options)

**Endpoint**: `POST /student/exams/practice/configure`

**Request**:
```typescript
interface ConfigurePracticeRequest {
  subjectId: string;
  courseId?: string;
  questionCount?: number;        // Default: 20
  timeLimit?: number;            // Minutes, optional (no limit if not set)
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  questionTypes?: QuestionType[];  // Filter by types
  year?: number;
  examYear?: string;
  title?: string;
}
```

**Example Request**:
```json
{
  "subjectId": "sub_math_001",
  "questionCount": 30,
  "timeLimit": 45,
  "difficulty": "MEDIUM",
  "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
  "title": "Custom Math Practice"
}
```

**Response**: Same as `StartExamResponse`

---

### 4.5 Submit Single Response

**Endpoint**: `POST /student/exams/attempts/{attemptId}/responses`

**Request**:
```typescript
interface SubmitResponseRequest {
  questionId: string;
  answer: string | string[] | boolean;  // Format depends on question type
  timeSpentSeconds: number;
}
```

**Answer Formats by Question Type**:

| Question Type | Answer Format | Example |
|---------------|---------------|---------|
| SINGLE_CHOICE | `string` (option ID) | `"opt_b"` |
| MULTIPLE_CHOICE | `string[]` (option IDs) | `["opt_a", "opt_c"]` |
| TRUE_FALSE | `boolean` | `true` |
| FILL_IN_BLANK | `string` (JSON) | `'{"blank_1":"Paris","blank_2":"France"}'` |
| SHORT_ANSWER | `string` | `"photosynthesis"` |
| ESSAY | `string` | `"The essay content..."` |
| MATCHING | `string` (JSON) | `'{"L1":"R2","L2":"R1"}'` |
| ORDERING | `string[]` (item IDs) | `["item_3","item_1","item_2"]` |

**Example Request**:
```json
{
  "questionId": "q_001",
  "answer": "opt_b",
  "timeSpentSeconds": 45
}
```

**Response**:
```typescript
interface AttemptResponse {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string | string[] | boolean;
  isCorrect?: boolean;          // Only for objective questions
  marksAwarded?: number;
  timeSpentSeconds: number;
  submittedAt: string;
}
```

**Example Response**:
```json
{
  "id": "resp_123",
  "attemptId": "att_abc123",
  "questionId": "q_001",
  "answer": "opt_b",
  "isCorrect": true,
  "marksAwarded": 2,
  "timeSpentSeconds": 45,
  "submittedAt": "2024-01-15T10:31:00.000Z"
}
```

---

### 4.6 Submit Bulk Responses

**Endpoint**: `POST /student/exams/attempts/{attemptId}/responses/bulk`

**Request**:
```typescript
interface SubmitResponsesBulkRequest {
  responses: Array<{
    questionId: string;
    answer: string | string[] | boolean;
    timeSpentSeconds: number;
  }>;
  complete?: boolean;  // If true, also completes the exam
}
```

**Example Request**:
```json
{
  "responses": [
    { "questionId": "q_001", "answer": "opt_b", "timeSpentSeconds": 45 },
    { "questionId": "q_002", "answer": ["opt_a", "opt_c"], "timeSpentSeconds": 60 },
    { "questionId": "q_003", "answer": true, "timeSpentSeconds": 20 }
  ],
  "complete": true
}
```

**Response**:
```typescript
interface SubmitResponsesBulkResponse {
  responses: AttemptResponse[];
  completed?: boolean;
}
```

---

### 4.7 Pause Exam

**Endpoint**: `PATCH /student/exams/attempts/{attemptId}/pause`

**Request**: No body required

**Response**:
```json
{
  "id": "att_abc123",
  "status": "PAUSED",
  "pausedAt": "2024-01-15T10:45:00.000Z",
  "timeSpentSeconds": 900
}
```

---

### 4.8 Resume Exam

**Endpoint**: `PATCH /student/exams/attempts/{attemptId}/resume`

**Request**: No body required

**Response**:
```typescript
interface ResumeExamResponse {
  id: string;
  status: "IN_PROGRESS";
  resumedAt: string;
  timeRemainingSeconds: number;  // Calculated remaining time
  exam: ExamDetails;             // Full exam with questions
  responses: AttemptResponse[];  // Previously submitted responses
}
```

**Example Response**:
```json
{
  "id": "att_abc123",
  "status": "IN_PROGRESS",
  "resumedAt": "2024-01-15T11:00:00.000Z",
  "timeRemainingSeconds": 2700,
  "exam": {
    "id": "exam_456",
    "name": "Mathematics Practice",
    "durationMinutes": 60,
    "numQuestions": 20,
    "questions": [...]
  },
  "responses": [
    {
      "id": "resp_123",
      "questionId": "q_001",
      "answer": "opt_b",
      "isCorrect": true,
      "marksAwarded": 2
    }
  ]
}
```

---

### 4.9 Complete Exam

**Endpoint**: `POST /student/exams/attempts/{attemptId}/complete`

**Request**: No body required

**Response**:
```json
{
  "id": "att_abc123",
  "status": "COMPLETED",
  "completedAt": "2024-01-15T11:30:00.000Z",
  "totalScore": 35,
  "percentage": 70,
  "passed": true
}
```

---

### 4.10 Get Exam Review

**Endpoint**: `GET /student/exams/attempts/{attemptId}/review`

**Response**:
```typescript
interface ExamReviewResponse {
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
  responses: Array<{
    id: string;
    questionId: string;
    answer: string | string[] | boolean | Record<string, string>;
    isCorrect: boolean;
    marksAwarded: number;
    timeSpentSeconds?: number;
    question: Question;  // Full question with explanation
  }>;
}
```

**Example Response**:
```json
{
  "id": "att_abc123",
  "totalScore": 35,
  "percentage": 70,
  "passed": true,
  "timeSpentSeconds": 2850,
  "exam": {
    "name": "Mathematics Practice",
    "numQuestions": 20,
    "subject": { "name": "Mathematics" }
  },
  "responses": [
    {
      "id": "resp_123",
      "questionId": "q_001",
      "answer": "opt_b",
      "isCorrect": true,
      "marksAwarded": 2,
      "timeSpentSeconds": 45,
      "question": {
        "id": "q_001",
        "questionNumber": 1,
        "questionType": "SINGLE_CHOICE",
        "questionText": [{ "type": "text", "value": "What is 2 + 2?" }],
        "options": [
          { "id": "opt_a", "content": [{ "type": "text", "value": "3" }] },
          { "id": "opt_b", "content": [{ "type": "text", "value": "4" }], "isCorrect": true },
          { "id": "opt_c", "content": [{ "type": "text", "value": "5" }] },
          { "id": "opt_d", "content": [{ "type": "text", "value": "6" }] }
        ],
        "correctAnswer": "opt_b",
        "explanation": {
          "solution": [{ "type": "text", "value": "2 + 2 = 4" }],
          "keyPoints": ["Basic addition"],
          "tips": ["Count on fingers if needed"]
        }
      }
    }
  ]
}
```

---

### 4.11 Get Exam History

**Endpoint**: `GET /student/exams/history`

**Query Parameters**:
```typescript
interface ExamHistoryParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 10
  examType?: "MOCK" | "PRACTICE" | "BIG_MOCK";
  subjectId?: string;
}
```

**Response**:
```typescript
interface ExamHistoryResponse {
  items: Array<{
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
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

### 4.12 Get Paused Exams

**Endpoint**: `GET /student/exams/paused`

**Response**:
```typescript
type PausedExamsResponse = Array<{
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
}>;
```

---

## 5. Question Types

### 5.1 SINGLE_CHOICE

User selects one option from multiple choices.

```typescript
// Question data
{
  questionType: "SINGLE_CHOICE",
  options: ChoiceOption[],
  correctAnswer: string  // Option ID (revealed after submit)
}

// Answer format
answer: "opt_b"  // Selected option ID
```

### 5.2 MULTIPLE_CHOICE

User selects multiple options.

```typescript
// Question data
{
  questionType: "MULTIPLE_CHOICE",
  options: ChoiceOption[],
  correctAnswers: string[]  // Option IDs (revealed after submit)
}

// Answer format
answer: ["opt_a", "opt_c"]  // Array of selected option IDs
```

### 5.3 TRUE_FALSE

User selects true or false.

```typescript
// Question data
{
  questionType: "TRUE_FALSE",
  trueFalseData: {
    correctAnswer: boolean,
    justificationRequired?: boolean
  }
}

// Answer format
answer: true  // or false
```

### 5.4 FILL_IN_BLANK

User fills in blanks in a template.

```typescript
// Question data
{
  questionType: "FILL_IN_BLANK",
  fillInBlankData: {
    template: "The capital of ___ is ___.",
    blanks: [
      { id: "blank_1", acceptableAnswers: ["France"], hint: "European country" },
      { id: "blank_2", acceptableAnswers: ["Paris", "paris"] }
    ]
  }
}

// Answer format (JSON string)
answer: '{"blank_1":"France","blank_2":"Paris"}'
```

### 5.5 ESSAY / SHORT_ANSWER

User writes text response.

```typescript
// Question data
{
  questionType: "ESSAY",
  essayData: {
    minWords: 100,
    maxWords: 500,
    expectedPoints: ["Point 1", "Point 2"]
  }
}

// Answer format
answer: "The essay response text..."
```

### 5.6 MATCHING

User matches items from two columns.

```typescript
// Question data
{
  questionType: "MATCHING",
  matchingData: {
    leftColumn: [
      { id: "L1", text: "Apple" },
      { id: "L2", text: "Carrot" }
    ],
    rightColumn: [
      { id: "R1", text: "Vegetable" },
      { id: "R2", text: "Fruit" }
    ],
    correctMatches: ["L1-R2", "L2-R1"]
  }
}

// Answer format (JSON string)
answer: '{"L1":"R2","L2":"R1"}'
```

---

## 6. Bookmark & Report

### 6.1 Toggle Bookmark

**Endpoint**: `POST /student/exams/bookmarks`

**Request**:
```json
{
  "questionId": "q_001"
}
```

**Response**:
```json
{
  "bookmarked": true
}
```

### 6.2 Get Bookmarks

**Endpoint**: `GET /student/exams/bookmarks`

**Response**:
```typescript
type BookmarksResponse = Array<{
  id: string;
  questionId: string;
  question: Question;
  createdAt: string;
}>;
```

### 6.3 Report Question

**Endpoint**: `POST /student/exams/reports`

**Request**:
```typescript
interface ReportQuestionRequest {
  questionId: string;
  reason: "INCORRECT_ANSWER" | "UNCLEAR_QUESTION" | "TYPO" |
          "INCORRECT_EXPLANATION" | "IMAGE_ISSUE" | "OTHER";
  details?: string;
}
```

**Example Request**:
```json
{
  "questionId": "q_001",
  "reason": "INCORRECT_ANSWER",
  "details": "Option B should be the correct answer, not option C"
}
```

**Response**:
```json
{
  "message": "Report submitted successfully"
}
```

### 6.4 Get Reports

**Endpoint**: `GET /student/exams/reports`

**Response**:
```typescript
type ReportsResponse = Array<{
  id: string;
  questionId: string;
  question: Question;
  reason: string;
  details?: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: string;
}>;
```

---

## 7. State Management

### Recommended State Structure

```typescript
interface ExamState {
  // Current session
  currentAttempt: ExamAttempt | null;
  questions: Question[];

  // User answers (draft, not yet submitted)
  answers: Record<string, any>;  // questionId -> answer value

  // Submitted responses
  responses: Map<string, AttemptResponse>;  // questionId -> response

  // Navigation
  currentQuestionIndex: number;

  // Timer
  timeRemaining: number | null;  // seconds
  timerRunning: boolean;

  // Preferences (cached)
  preferences: ExamPreferencesResponse | null;
}

// Actions
interface ExamActions {
  startExam(attempt: StartExamResponse): void;
  setAnswer(questionId: string, answer: any): void;
  submitResponse(questionId: string, response: AttemptResponse): void;
  setCurrentQuestion(index: number): void;
  nextQuestion(): void;
  previousQuestion(): void;
  pauseTimer(): void;
  resumeTimer(): void;
  updateTimeRemaining(seconds: number): void;
  clearExam(): void;
}
```

### Persistence

Save to local storage:
- `currentAttempt`
- `questions`
- `answers` (draft answers)
- `responses` (submitted)
- `currentQuestionIndex`
- `timeRemaining`

Restore on app launch to allow resuming interrupted exams.

---

## 8. Timer Logic

### Timer Implementation

```typescript
// Start timer when exam starts
const startTimer = (durationMinutes: number) => {
  const totalSeconds = durationMinutes * 60;
  setTimeRemaining(totalSeconds);
  setTimerRunning(true);
};

// Timer tick (every second)
useEffect(() => {
  if (!timerRunning || timeRemaining === null) return;

  const interval = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev === null || prev <= 0) {
        // Time's up - auto complete exam
        handleAutoComplete();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [timerRunning, timeRemaining]);

// Format time display
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Timer States

| State | Timer Running | Actions |
|-------|---------------|---------|
| IN_PROGRESS | Yes | Decrement every second |
| PAUSED | No | Stop countdown |
| COMPLETED | No | Clear timer |
| App Background | No | Save time, pause |
| App Foreground | Yes | Resume from saved time |

---

## 9. Detailed Flow: Pause, Resume & Continue

### 9.1 Pause Flow (Exit Exam Mid-Session)

When user clicks "Exit Exam" during an active exam session:

```
User taps "Exit Exam"
    │
    ▼
Show confirmation dialog:
  "Your progress will be saved and you can resume later"
    │
    ├── Cancel → Close dialog, stay in exam
    │
    └── Confirm Exit
         │
         ▼
    PATCH /student/exams/attempts/{attemptId}/pause
         │
         ├── onSuccess → pauseTimer() in store → Navigate to /tests
         │
         └── onError → Navigate to /tests anyway (store has local state)
```

**What happens on pause**:
1. API call: `PATCH /student/exams/attempts/{attemptId}/pause`
2. No request body needed
3. Server records pause time and calculates `timeSpentSeconds`
4. Store action: `pauseTimer()` sets `timerRunning = false`
5. All state remains in localStorage (questions, answers, responses, timeRemaining)
6. Navigate away from exam page

**API Response**:
```json
{
  "id": "att_abc123",
  "status": "PAUSED",
  "pausedAt": "2024-01-15T10:45:00.000Z",
  "timeSpentSeconds": 900
}
```

### 9.2 Pause/Resume Toggle (Stay on Exam Page)

When user clicks pause button during the exam (not exit, just pause timer):

```typescript
// If timer is running → pause
if (timerRunning) {
  PATCH /student/exams/attempts/{attemptId}/pause
  → pauseTimer() in store
}

// If timer is paused → resume
else {
  PATCH /student/exams/attempts/{attemptId}/resume
  → resumeTimer() in store
}
```

### 9.3 Resume Flow (From Activities Page)

The Activities page has a "Paused" tab that lists all paused exams.

**Step 1: Fetch Paused Exams**

```
GET /student/exams/paused
```

**Response** (API may return various structures — handle all):
```typescript
// Direct array
PausedExam[]

// Or wrapped in data
{ data: PausedExam[] }

// Or wrapped in exams
{ exams: PausedExam[] }
```

**PausedExam object**:
```json
{
  "id": "att_abc123",
  "status": "PAUSED",
  "startedAt": "2024-01-15T10:30:00.000Z",
  "pausedAt": "2024-01-15T10:45:00.000Z",
  "updatedAt": "2024-01-15T10:45:00.000Z",
  "timeSpentSeconds": 900,
  "answeredQuestions": 5,
  "exam": {
    "id": "exam_456",
    "name": "Mathematics Practice",
    "numQuestions": 20,
    "subjectId": "sub_math_001",
    "examTypeEnum": "PRACTICE",
    "subject": { "name": "Mathematics" }
  },
  "_count": {
    "responses": 5
  }
}
```

**Step 2: User taps "Resume" on a paused exam card**

```
User taps Resume on paused exam card
    │
    ▼
PATCH /student/exams/attempts/{attemptId}/resume
    │
    ▼
Response contains FULL exam data:
  - exam with questions
  - previously submitted responses
  - time info
    │
    ▼
Restore exam state in store:
  1. startExam(data, questions, remainingTimeMinutes)
  2. Loop through data.responses:
     - submitResponse(questionId, response)  ← mark as submitted
     - setAnswer(questionId, response.answer) ← restore answer selection
    │
    ▼
Navigate to /exam/{attemptId}
```

**Resume API Response**:
```json
{
  "id": "att_abc123",
  "status": "IN_PROGRESS",
  "startedAt": "2024-01-15T10:30:00.000Z",
  "resumedAt": "2024-01-15T11:00:00.000Z",
  "timeSpentSeconds": 900,
  "exam": {
    "id": "exam_456",
    "name": "Mathematics Practice",
    "durationMinutes": 60,
    "numQuestions": 20,
    "passingScore": 50,
    "examTypeEnum": "PRACTICE",
    "questions": [
      {
        "id": "eq_001",
        "order": 1,
        "question": {
          "id": "q_001",
          "questionNumber": 1,
          "questionType": "SINGLE_CHOICE",
          "questionText": [{ "type": "text", "value": "What is 2 + 2?" }],
          "options": [...]
        }
      }
    ]
  },
  "responses": [
    {
      "id": "resp_001",
      "questionId": "q_001",
      "answer": "opt_b",
      "isCorrect": true,
      "marksAwarded": 2,
      "timeSpentSeconds": 45,
      "submittedAt": "2024-01-15T10:32:00.000Z"
    }
  ]
}
```

**Critical: Remaining Time Calculation**:
```typescript
const totalTimeSeconds = (data.exam.durationMinutes ?? 0) * 60;
const timeSpent = data.timeSpentSeconds || 0;
const remainingTimeMinutes = Math.max(0, (totalTimeSeconds - timeSpent) / 60);

// Pass to startExam — it converts minutes to seconds internally
startExam(data, examQuestions, remainingTimeMinutes);
```

### 9.4 Session Recovery (Page Refresh / App Restart)

The exam store persists to localStorage. On page reload:

```
App launches / Page refreshes
    │
    ▼
Zustand hydrates from localStorage:
  - currentAttempt (with attemptId)
  - questions[]
  - answers{} (draft answers)
  - responses Map (previously submitted)
  - currentQuestionIndex
  - timeRemaining (in seconds)
  - timerRunning
    │
    ▼
Exam page checks: currentAttempt?.id === attemptId from URL?
    │
    ├── YES → Resume exam from persisted state
    │         Timer resumes counting down
    │
    └── NO → Show error: "Exam session not found"
             Link back to /tests
```

**Store Persistence (localStorage)**:
```typescript
// Serialization: Map → Object
setItem: (name, newValue) => {
  const str = JSON.stringify({
    state: {
      ...newValue.state,
      responses: Object.fromEntries(newValue.state.responses)  // Map → {}
    }
  });
  localStorage.setItem(name, str);
}

// Deserialization: Object → Map
getItem: (name) => {
  const { state } = JSON.parse(str);
  return {
    state: {
      ...state,
      responses: new Map(Object.entries(state.responses))  // {} → Map
    }
  };
}
```

---

## 10. Detailed Flow: Complete Exam & Review

### 10.1 Complete Exam Flow

```
User clicks "Complete Exam"
    │
    ▼
Are there unanswered/unsubmitted questions?
    │
    ├── YES → Show confirmation dialog:
    │         "You have X unanswered question(s).
    │          Once you complete, you can't return."
    │         │
    │         ├── "Go Back" → Close dialog
    │         └── "Complete Exam" → Continue below
    │
    └── NO → Continue directly
         │
         ▼
    Collect unsubmitted answers from store
    (answers that exist in `answers{}` but NOT in `responses` Map)
         │
         ▼
    Any unsubmitted answers?
         │
         ├── YES (Path A: Bulk Submit + Complete)
         │    │
         │    ▼
         │    POST /student/exams/attempts/{attemptId}/responses/bulk
         │    Body: { responses: [...], complete: true }
         │    │
         │    ├── onSuccess:
         │    │     - Update responses in store
         │    │     - clearExam() resets store
         │    │     - Invalidate examHistory + progress caches
         │    │     - Navigate to /exam/review/{attemptId}
         │    │
         │    └── onError: Show error message
         │
         └── NO (Path B: Just Complete)
              │
              ▼
              POST /student/exams/attempts/{attemptId}/complete
              │
              ├── onSuccess:
              │     - clearExam() resets store
              │     - Invalidate examHistory + progress caches
              │     - Navigate to /exam/review/{attemptId}
              │
              └── onError: Show error message
```

**Bulk Submit + Complete Request**:
```json
{
  "responses": [
    { "questionId": "q_005", "answer": "opt_a", "timeSpentSeconds": 0 },
    { "questionId": "q_008", "answer": ["opt_b", "opt_d"], "timeSpentSeconds": 0 },
    { "questionId": "q_012", "answer": true, "timeSpentSeconds": 0 }
  ],
  "complete": true
}
```

**Bulk Submit Response**:
```json
{
  "responses": [
    { "id": "resp_005", "questionId": "q_005", "answer": "opt_a", "isCorrect": true, "marksAwarded": 2 },
    { "id": "resp_008", "questionId": "q_008", "answer": ["opt_b", "opt_d"], "isCorrect": false, "marksAwarded": 0 },
    { "id": "resp_012", "questionId": "q_012", "answer": true, "isCorrect": true, "marksAwarded": 1 }
  ],
  "completed": true
}
```

**Complete Request** (no unsubmitted answers):
```
POST /student/exams/attempts/{attemptId}/complete
// No body needed
```

**Complete Response**:
```json
{
  "id": "att_abc123",
  "status": "COMPLETED",
  "completedAt": "2024-01-15T11:30:00.000Z",
  "totalScore": 35,
  "percentage": 70,
  "passed": true
}
```

### 10.2 Auto-Complete (Timer Expires)

```
timeRemaining reaches 0
    │
    ▼
Automatically calls confirmCompleteExam()
  (same flow as manual complete — collects unsubmitted, bulk submits, etc.)
```

### 10.3 Review Page Flow

```
Navigate to /exam/review/{attemptId}
    │
    ▼
GET /student/exams/attempts/{attemptId}/review
    │
    ▼
Display:
  1. Score Summary Banner
     - Percentage circle (green if passed, red if failed)
     - Exam name + subject
     - Pass/Fail badge
     - Stats pills: score, correct, wrong, skipped, time spent

  2. Question Navigator (sidebar/horizontal scroll)
     - Numbered buttons, color-coded:
       - Green circle = correct
       - Red circle = incorrect
     - Click to jump to question

  3. Question Detail (main area)
     - Result badge: "Correct" or "Incorrect" with marks
     - Time spent on this question
     - Question text (rendered with RichContentRenderer)
     - Answer options with visual feedback:
       - User's answer highlighted
       - Correct answer highlighted (green)
       - Wrong answer highlighted (red)
     - Explanation section (if available):
       - Solution text
       - Working steps
       - Key points
       - Common mistakes
       - Tips
     - Previous/Next navigation
```

**Review API Response** (full example):
```json
{
  "id": "att_abc123",
  "totalScore": 15,
  "percentage": 75,
  "passed": true,
  "timeSpentSeconds": 2850,
  "exam": {
    "name": "Mathematics Practice",
    "numQuestions": 20,
    "subject": { "name": "Mathematics" },
    "examType": { "name": "WAEC" }
  },
  "responses": [
    {
      "id": "resp_001",
      "questionId": "q_001",
      "answer": "opt_b",
      "isCorrect": true,
      "marksAwarded": 2,
      "timeSpentSeconds": 45,
      "question": {
        "id": "q_001",
        "questionNumber": 1,
        "questionType": "SINGLE_CHOICE",
        "questionText": [
          { "type": "text", "value": "Simplify $\\frac{3x^2 + 6x}{3x}$" }
        ],
        "difficulty": "MEDIUM",
        "marks": 2,
        "options": [
          { "id": "opt_a", "content": [{ "type": "text", "value": "$x + 2$" }], "isCorrect": true },
          { "id": "opt_b", "content": [{ "type": "text", "value": "$x + 6$" }] },
          { "id": "opt_c", "content": [{ "type": "text", "value": "$x^2 + 2$" }] },
          { "id": "opt_d", "content": [{ "type": "text", "value": "$3x + 2$" }] }
        ],
        "correctAnswer": "opt_a",
        "explanation": {
          "solution": [
            { "type": "text", "value": "Factor out 3x from the numerator:\n$$\\frac{3x(x + 2)}{3x} = x + 2$$" }
          ],
          "workingSteps": [
            { "step": "Factor numerator", "formula": "3x^2 + 6x = 3x(x + 2)" },
            { "step": "Cancel common factor", "formula": "\\frac{3x(x + 2)}{3x} = x + 2" }
          ],
          "keyPoints": ["Always look for common factors first"],
          "commonMistakes": ["Forgetting to factor completely"],
          "tips": ["Check your answer by substituting a value for x"]
        }
      }
    },
    {
      "id": "resp_002",
      "questionId": "q_002",
      "answer": "",
      "isCorrect": false,
      "marksAwarded": 0,
      "timeSpentSeconds": 0,
      "question": {
        "id": "q_002",
        "questionNumber": 2,
        "questionType": "SINGLE_CHOICE",
        "questionText": [{ "type": "text", "value": "What is the square root of 144?" }],
        "options": [...],
        "correctAnswer": "opt_b",
        "explanation": { ... }
      }
    }
  ]
}
```

**Review Computed Values**:
```typescript
const responses = review.responses || [];
const totalQuestions = responses.length;
const correctCount = responses.filter(r => r.isCorrect).length;
const skippedCount = responses.filter(r =>
  r.answer === null || r.answer === undefined || r.answer === ""
).length;
const incorrectCount = totalQuestions - correctCount - skippedCount;
```

**Question Rendering in Review** (all questions are disabled / read-only):
```typescript
// Pass these props to all question components in review mode:
{
  isSubmitted: true,     // Always true — shows submitted state
  disabled: true,        // Prevents interaction
  showCorrectAnswer: true,  // Highlights correct answer
  onAnswerChange: () => {},  // No-op — can't change answers
  selectedAnswer: currentResponse.answer  // Show what user picked
}
```

---

## 11. Activities Page: Tabs & Data

The Activities page (`/activities`) has 4 tabs:

### 11.1 Paused Exams Tab

**API**: `GET /student/exams/paused`
**Hook**: `usePausedExams()`
**Data Handling**: Handles `[]`, `{ data: [] }`, and `{ exams: [] }` response shapes

**Card displays**:
- Exam name
- Total questions count
- Time spent so far
- Paused date
- "Resume" button

**Action**: Tap card → calls resume flow (Section 9.3)

### 11.2 Completed Exams Tab

**API**: `GET /student/exams/history?examType=PRACTICE|MOCK`
**Hook**: `useExamHistory({ examType })`

**Sub-tabs**: "Practice Exams" and "Mock Exams"

**Card displays**:
- Exam/subject name
- Question count
- Pass/fail icon
- Score percentage
- Score fraction (e.g., 15/20)
- Completed date

**Action**: Tap card → navigates to `/exam/review/{attemptId}`

**Response structure**:
```json
{
  "items": [
    {
      "id": "att_abc123",
      "examId": "exam_456",
      "status": "COMPLETED",
      "startedAt": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T11:30:00.000Z",
      "totalScore": 15,
      "percentage": 75,
      "passed": true,
      "exam": {
        "name": "Mathematics Practice",
        "numQuestions": 20,
        "examTypeEnum": "PRACTICE",
        "subject": { "name": "Mathematics" },
        "examType": { "name": "WAEC" }
      }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 11.3 Bookmarked Questions Tab

**API**: `GET /student/exams/bookmarks`
**Hook**: `useBookmarkedQuestions()`
**Data Handling**: Handles `[]` and `{ items: [] }` response shapes

**Card displays**:
- Question text (extracted from RichContentBlock[] → plain text)
- Question type badge (e.g., "SINGLE CHOICE")
- Difficulty badge
- Year (if available)
- Bookmarked date

**Text extraction helper**:
```typescript
function extractTextFromRichContent(blocks: RichContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "text") return block.value;
      if (block.type === "markdown") return block.content;
      if (block.type === "latex") return block.value;
      return "";
    })
    .join(" ")
    .trim();
}
```

**Bookmark item structure**:
```json
{
  "id": "bm_001",
  "questionId": "q_001",
  "question": {
    "id": "q_001",
    "questionNumber": 1,
    "questionType": "SINGLE_CHOICE",
    "questionText": [{ "type": "text", "value": "What is 2+2?" }],
    "difficulty": "EASY",
    "marks": 2,
    "year": 2023
  },
  "createdAt": "2024-01-15T10:32:00.000Z"
}
```

### 11.4 Reported Questions Tab

**API**: `GET /student/exams/reports`
**Hook**: `useReportedQuestions()`
**Data Handling**: Handles `[]` and `{ data: [] }` response shapes

**Card displays**:
- Question text (extracted from RichContentBlock[])
- Status badge (color-coded):
  - PENDING → amber/yellow
  - REVIEWED → blue
  - RESOLVED → green
- Reason badge (e.g., "INCORRECT_ANSWER")
- Year (if available)
- Reported date

**Report item structure**:
```json
{
  "id": "rpt_001",
  "questionId": "q_001",
  "question": {
    "id": "q_001",
    "questionNumber": 1,
    "questionType": "SINGLE_CHOICE",
    "questionText": [{ "type": "text", "value": "What is 2+2?" }],
    "difficulty": "EASY"
  },
  "reason": "INCORRECT_ANSWER",
  "details": "Option B should be correct not C",
  "status": "PENDING",
  "createdAt": "2024-01-15T10:32:00.000Z"
}
```

---

## 12. Explanation Rendering

After a question is submitted (practice mode) or in review mode, explanations are shown.

### Explanation Data Structure

```typescript
interface ExplanationData {
  solution: RichContentBlock[];    // Main solution text (rich content)
  workingSteps?: Array<{
    step: string;                  // Step description
    formula?: string;              // LaTeX formula for this step
    explanation?: string;          // Additional explanation
  }>;
  keyPoints?: string[];            // Bullet points
  commonMistakes?: string[];       // Bullet points
  tips?: string[];                 // Bullet points
}
```

### Rendering Sections

The explanation is rendered in collapsible/expandable sections:

1. **Solution** — Main answer explanation (rendered with RichContentRenderer, supports LaTeX)
2. **Working Steps** — Step-by-step breakdown with formulas
3. **Key Points** — Bulleted list of important takeaways
4. **Common Mistakes** — Bulleted list of what students often get wrong
5. **Tips** — Bulleted list of helpful hints

### Legacy Explanation Format

Some explanations come as a single text/markdown block instead of structured `ExplanationData`. Handle both:

```typescript
// Structured explanation (preferred)
if (question.explanation) {
  renderExplanationSections(question.explanation);
}

// Legacy text explanation fallback
else if (question.textExplanation) {
  renderPlainText(question.textExplanation);
}
```

---

## Summary Checklist for Mobile

### API Integration
- [ ] Implement all endpoints with proper error handling
- [ ] Handle authentication headers
- [ ] Implement retry logic for failed requests

### State Management
- [ ] Set up exam state store
- [ ] Implement persistence to local storage
- [ ] Handle state restoration on app launch

### Timer
- [ ] Countdown timer with 1-second precision
- [ ] Auto-complete when time expires
- [ ] Pause/resume functionality
- [ ] Background/foreground handling

### Question Rendering
- [ ] Render all question types
- [ ] Support rich content (text, LaTeX, images, etc.)
- [ ] Show correct/incorrect feedback after submission

### Navigation
- [ ] Question grid/list navigator
- [ ] Previous/Next buttons
- [ ] Jump to specific question
- [ ] Show question status (answered, submitted, bookmarked)

### Features
- [ ] Bookmark questions
- [ ] Report questions
- [ ] View explanations after submission
- [ ] Review completed exams

### Edge Cases
- [ ] Handle network errors
- [ ] Recover from app crashes
- [ ] Handle session expiration
- [ ] Sync local answers with server
