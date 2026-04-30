# Practice Flow — Mobile Parity Spec

This document describes the full practice / exam flow as it exists on the web app. It is meant to be paste-ready for the mobile project so the two clients behave the same. Skipping Google OAuth and any web-only details (e.g. tab `beforeunload`).

---

## 1. Big picture

There are three exam types, all of which converge on the same exam-taking screen:

1. **Practice (Jump Straight In)** — instantly start a 20-question practice session for one subject
2. **Practice (Configure)** — same as above but the user picks count / time / difficulty / type / year
3. **Mock Exam** — pre-built timed mock for a single subject (one of several available)
4. **Exam Simulation** — multi-subject mock; combines several mock exams into one session

Each of these creates an `attempt` (or, for simulation, multiple parallel attempts) which the user moves through, answers, optionally pauses, and finally completes — landing on a review screen.

### Routes
| Route | Purpose |
|-------|---------|
| `/_user/tests` | Pick the (single, focused) exam |
| `/_user/tests/exams` | Subject grid + Exam Simulation entry |
| `/_user/exam/$attemptId` | Single-subject exam-taking (practice or mock) |
| `/_user/exam/review/$attemptId` | Single-subject results + per-question review |
| `/_user/mock-exam/setup` | Build a multi-subject simulation |
| `/_user/mock-exam/$sessionId` | Run the simulation |
| `/_user/mock-exam/review/$sessionId` | Simulation results (separate flow) |

---

## 2. State stores

Two persisted Zustand stores back the practice flow:

### `examStore` — single-subject exams
```
preferences            // ExamPreferencesResponse | null (cached)
currentAttempt         // ExamAttempt | null
questions              // Question[]
responses              // Map<questionId, AttemptResponse>     - submitted
answers                // Record<questionId, AnswerValue>      - draft answers
currentQuestionIndex   // number
timeRemaining          // seconds | null
timerRunning           // boolean
```
Persistence: `localStorage` key `exam-store`. The Map needs to be serialized to/from an object (web does it manually). On mobile, use whatever map-compatible storage you have.

### `mockExamStore` — multi-subject simulation
```
sessionId               // string | null
subjects[]              // [{ subject, attempt, attemptId, questions[], answers, responses }]
currentSubjectIndex     // number
currentQuestionIndexes  // Record<subjectIndex, number>
timeRemaining           // seconds | null  (single global timer across all subjects)
timerRunning            // boolean
```

### `AnswerValue` types (must round-trip identically on mobile)
- `SINGLE_CHOICE` → `string` (option id)
- `MULTIPLE_CHOICE` → `string[]` (option ids)
- `TRUE_FALSE` → `boolean`
- `FILL_IN_BLANK` / `MATCHING` / `CALCULATION` / `ESSAY_WITH_SUB` → `Record<string, string>`
- `ESSAY` / `SHORT_ANSWER` → `string`
- `ORDERING` → `string[]`
- Unset → `null` / `undefined`

When sending to API, **objects are JSON-stringified** before being placed in the `answer` field; arrays, strings, and booleans are sent as-is.

---

## 3. Major API endpoints

| Step | Method | Endpoint | Notes |
|------|--------|----------|-------|
| Preferences | GET | `/student/exams/preferences` | Returns subjects + exam type for the focused sub |
| Available exams | GET | `/student/exams/available` | Query: `subjectId`, `examTypeEnum`, `year`, `groupBy` |
| Start practice (jump) | POST | `/student/exams/practice/start` | Body: `{ subjectId, title }` |
| Configure practice | POST | `/student/exams/practice/configure` | Body: `{ subjectId, questionCount, timeLimit?, difficulty?, questionTypes?, year?, title }` |
| Start mock | POST | `/student/exams/{id}/start` | Returns the attempt + exam |
| Submit answer (single) | POST | `/student/exams/attempts/{attemptId}/responses` | Body: `{ questionId, answer, timeSpentSeconds }` |
| Submit answers (bulk) | POST | `/student/exams/attempts/{attemptId}/responses/bulk` | Body: `{ responses[], complete: boolean }` |
| Pause | PATCH | `/student/exams/attempts/{attemptId}/pause` | |
| Resume | PATCH | `/student/exams/attempts/{attemptId}/resume` | |
| Complete | POST | `/student/exams/attempts/{attemptId}/complete` | |
| Review | GET | `/student/exams/attempts/{attemptId}/review` | Includes per-question correctness & explanations |
| Bookmarks list | GET | `/student/exams/bookmarks` | Used to hydrate bookmark icons |
| Toggle bookmark | POST | `/student/exams/bookmarks` | Body: `{ questionId }` |
| Report question | POST | `/student/exams/reports` | Body: `{ questionId, reason }` |

For the simulation, **the same per-attempt endpoints are called in parallel**, one per subject (no dedicated `/simulation/*` endpoints).

---

## 4. Screen — `/tests` (Pick an Exam)

**Header**
- Back: `/`
- Heading: `"Take a Test"`
- Sub: `"Pick an Exam"`
- Search/filter: hidden

**Body** (1-col mobile / 2-col tablet / 3-col desktop, gap 12–20 px, vertical padding 24–40 px)

Single card showing the user's currently focused exam type (read from `useExamPreferences`):
- bg `#FFF0B333` (very pale yellow), `rounded-2xl` mobile / `rounded-3xl` desktop, soft shadow, 16–20 px padding, border
- Active scale `0.98`
- Left: `note.png` 40×40 mobile / 56×56 desktop, then text block with name (`examTypeRecord.name || examSubtype`) — semi-bold 14–18 px — and "{n} Subjects" sub-line (10–12 px gray-500)
- Right: 32×32 white circle (40×40 desktop) with shadow + green-400 chevron
- Tap → `/tests/exams`

**States**
- Loading: centered "Loading..." (col-span-full, 40 px padding)
- Error: red 500 "Failed to load exam preferences"
- No preferences: gray 500 "No exam preferences found. Please set up your exam preferences."

---

## 5. Screen — `/tests/exams` (Subjects Grid)

**Header**
- Back: `/tests`
- Heading: `"Take a Test"`
- Sub: `"Pick a subject and year"`
- Search input enabled, placeholder `"Search subjects..."`. Search filters subjects by `name.toLowerCase().includes(query)`.

### Exam Simulation banner (top of body, before subjects)
A horizontal card linking to `/mock-exam/setup`:
- Bg gradient `from-[#F04F54]/10 to-orange-50`, border `[#F04F54]/20`, `rounded-2xl`, 16–20 px padding
- Active scale `0.99`, hover shadow
- Left chunk:
  - Square 40×40 / 48×48 icon container, bg `#F04F54`, `rounded-xl`, with white `Layers` icon inside
  - Title (14–16 px semi-bold gray-900): **"Exam Simulation"**
  - Sub (10–12 px gray-500): *"Combine multiple subjects into one timed session — just like the real exam"*
- Right: 32×32 / 40×40 white circle + chevron in `#F04F54`

### Subjects grid
Reads from `useExamPreferences().subjects`.

- Layout: `grid-cols-2` mobile, `sm:grid-cols-3`, `md:grid-cols-4`, `lg:grid-cols-5`
- Gap-x 12–20, gap-y 24–40, vertical padding 24–40
- Empty (no preference subjects): "No subjects available"
- Empty (filtered): "No subjects match your search"

**Subject card** (`SubjectCard` component):
- Card — `rounded-2xl`, border `gray-100`, gradient `from-white to-gray-50/80`, soft shadow, hover lift -0.5px and shadow-lg
- Active scale 0.96
- Inner: vertical stack centered, padding `px-3 py-5` mobile / `px-4 py-7` desktop
  - Icon container 56×56 mobile / 72×72 desktop, `rounded-xl`, bg `amber-50`
  - `jamb.png` 40×40 / 56×56
  - Subject name: 12–14 px, semi-bold, `gray-800`, center, `line-clamp-2`
- Tap → opens DialogStack (multi-step modal, see below)

### Subject card → DialogStack (multi-step modal)
Opens stacked-modal flow `Test Type → Practice Options or Mock Selection → (optionally) Configure form`.

Each `DialogStackContent` has a small `X` close in the top-right (step 1) or a left-side back arrow (step 2/3) to go to the previous step.

#### Step 1: Select Test Type
- Header (centered semi-bold 18 px): **"Select Test Type"**
- `Choicebox` (single-select radio cards) with two options:
  - `id="practice"` → "Practice Test" / "Practice at your own pace with customizable settings."
  - `id="mock"` → "Mock Exam" / "Simulate real exam conditions with timed tests."
- Default selected: **practice**
- Bottom button (max-w-2xs centered, `bg-[#F04F54]`, white): **"Continue"** → moves to step 2

#### Step 2A: Practice Options (when practice was chosen)
- Back arrow top-left
- Header centered: **"Practice Options"**
- Choicebox with:
  - `id="jump"` → "Jump Straight In" / "Start practicing immediately with default settings."
  - `id="configure"` → "Configure Practice" / "Customize duration, question count, and difficulty."
- Default selected: **jump**
- If error: render `<TrialLimitAlert>` above the button (red alert with the error message — appears on trial-limit / payment errors)
- Button:
  - When `jump` selected: button is **"Start Practice"** (or "Starting..." while pending). Tap calls `useStartPractice` with `{ subjectId, title: "{subject.name} Practice" }`. On success → toast `"Practice exam started successfully!"`, 800 ms delay, close modal, navigate to `/exam/{data.id}`.
  - When `configure` selected: button is **"Continue"** → moves to step 3.

#### Step 2B: Select Mock Exam (when mock was chosen)
- Back arrow top-left
- Header centered: **"Select Mock Exam"**
- Loading: "Loading available mocks..."
- Error: red 500 "Failed to load mocks"
- Empty: gray 500 "No mocks available for this subject"
- Otherwise: Choicebox of available mocks:
  - Title: `mock.name`
  - Description: `"{numQuestions} questions • {durationMinutes} mins[• Attempted {attempts}/{allowed}]"`
  - First mock pre-selected (synced via effect when data loads)
- Button: **"Start Mock"** (or "Starting...") — calls `useStartExam(mock.id)`. On success → close modal, navigate to `/exam/{data.id}`. On error → toast with API message or "Failed to start mock exam".
- API: data comes from **`GET /student/exams/available?subjectId={id}&examTypeEnum=MOCK`**.
  - Response can be either an array OR a `Record<group, AvailableExam[]>` (grouped). Code flattens via `Object.values(grouped).flat()` if grouped.

#### Step 3: Configure Practice form
Shown only after picking `configure` in step 2A. Subject name printed as "Subject: {name}" near the top.

Fields (TanStack Form, Zod schema):
- **questionCount** — range slider 10–100, step 1, default **20**. Right-aligned accent label "{n} Questions".
- **timeLimit** — select with `["", "15", "30", "45", "60"]`, labels "No Limit", "15 mins", "30 mins", "45 mins", "60 mins"
- **difficulty** — select `["", "EASY", "MEDIUM", "HARD"]`, labels "All Difficulties" / "Easy" / "Medium" / "Hard"
- **questionType** — select with options:
  - `""` "All Types"
  - `"SINGLE_CHOICE"` "Single Choice"
  - `"MULTIPLE_CHOICE"` "Multiple Choice"
  - `"TRUE_FALSE"` "True/False"
  - `"FILL_IN_BLANK"` "Fill in the Blank"
  - `"ESSAY"` "Essay"
  - `"ESSAY_WITH_SUB"` "Essay with Sub-questions"
- **year** — select with `""` "All Years" + every year from `currentYear` down to **2000**, descending

Style for selects: `h-12` mobile / `h-14` desktop, `rounded-full`, gray border, gray-30 input bg, embedded chevron-down SVG on the right via background image.

Submit:
- Calls `useConfigurePractice` with payload:
  ```json
  {
    "subjectId": "...",
    "questionCount": 20,
    "timeLimit": 30,                 // omit if blank
    "difficulty": "EASY",            // omit if blank
    "questionTypes": ["MULTIPLE_CHOICE"],   // single-element array, omit if blank
    "year": 2024,                    // omit if blank
    "title": "{subject.name} Practice"
  }
  ```
- On success: close dialog, navigate `/exam/{data.id}`
- On error: render `<TrialLimitAlert>` with API message

---

## 6. Screen — `/exam/$attemptId` (Single-subject Exam Taking)

This is the **most state-heavy screen** and the one that needs the closest mobile parity. Used for both **practice** and **mock** attempts.

**On mount**
1. Read URL param `attemptId`.
2. Compare with `examStore.currentAttempt.id`. If they don't match → show "Exam Not Found" empty state. There is no auto-fetch fallback; the user must start the exam from `/tests` to populate the store.
3. Hydrate bookmarks: query `useBookmarks()` (`GET /student/exams/bookmarks`) and union the question IDs that match the current exam into `bookmarkedQuestions: Set<string>`.
4. Initialize `questionStartTime` ref to `Date.now()` for tracking time-spent-per-question.

**Determine `isPracticeExam`** from `currentAttempt.exam.examTypeEnum === "PRACTICE"`. This branches behavior:

| Behavior | Practice | Mock |
|----------|----------|------|
| After Submit Answer, lock the question | **Yes** | **No** (user can change) |
| Show explanation card after submit | **Yes** (if `question.explanation` exists) | No |
| Show option-coloring (correct=green, wrong=red) after submit | **Yes** | No |
| Navigator coloring per question | green=correct / red=wrong / yellow=answered / gray=unanswered | blue=current / yellow=answered / gray=unanswered |
| "Unanswered" warning is based on | unsubmitted | unanswered (draft) |
| Bulk submit on Complete: include only | unsubmitted answers | every answered question |

### Header
- Top row: **Exit / Exit Exam** button (left arrow + label, "Exit" on mobile / "Exit Exam" on desktop). Tap → opens **Exit confirmation** dialog.
- Below: page title `currentAttempt.exam.name || "Practice Exam"` (18–24 px, bold).

### Error message banner
Renders `<TrialLimitAlert>` when any operation throws. Source: error mutations (submit, pause, resume, bookmark, report, complete).

### Layout
- **Desktop:** two-column flex; question on the left (flex-1), navigator card on the right (`w-72`, `lg:order-2`, sticky-top behavior up to `calc(100vh-2rem)`)
- **Mobile:** single column, **navigator on TOP**, question below

### Question Navigator (`<QuestionNavigator>`)
A `Card`, padding 12–16, `lg:sticky lg:top-4`, max-h `80vh`, vertical column with three regions:

**Region 1 — Timer header** (always visible, dashed border, `rounded-lg`, padding 10–12)
- Left: Pause / Play button (8×8, gray-100 circle). Toggles `timerRunning` and calls **`PATCH .../pause`** or **`PATCH .../resume`**.
- Center: monospace bold time
  - `formatTime(seconds)` → `H:MM:SS` if `≥1h`, else `M:SS`
  - When `timeRemaining < 300`: red color
- Right: Bookmark button (8×8 circle). When bookmarked: `bg-[#F04F54]` white icon (filled). Otherwise gray-100 (regular icon).
  - Tap toggles local `bookmarkedQuestions` instantly + calls `POST /student/exams/bookmarks`. On error: revert + toast "Failed to update bookmark."

**Region 2 — Question grid (scrollable)**
- Grid: 8 cols mobile, 10 cols sm, 6 cols lg, gap 6–8 px
- Each cell: 32×32 / 36×36 round button with the question number
- States (top to bottom precedence):
  - **Current** — bg `blue-600`, white text, ring-2 `blue-400/50`
  - **Submitted + correct** (practice only) — bg `green-500`, white text
  - **Submitted + wrong** (practice only) — bg `red-500`, white text
  - **Answered (draft)** — bg `yellow-100`, text `yellow-700`, border `yellow-300`
  - **Unanswered** — bg `gray-100`, text `gray-600`, hover `gray-200`
- Below the grid: **Legend** (10–12 px gray-500) — flex wrap with five small dots:
  - Current (blue-600), Correct (green-500), Wrong (red-500), Answered (yellow-100/300), Unanswered (gray-200)

**Region 3 — Action buttons (always visible at bottom)**
1. **Submit Answer** — full-width pill button. States:
   - Default: `bg-[#F04F54]`, "Submit Answer"
   - Pending: "Submitting..."
   - Already submitted (`isCurrentSubmitted`): green, "Submitted ✓", non-clickable
   - Disabled when no answer drafted
2. **Previous / Next row** — two outline pill buttons in a 2-col grid. Disabled at bounds.
3. **Report + Complete row** — 2-col grid:
   - **Report** — outline pill, red text + red border, hover bg red-50
   - **Complete Exam** — bg `blue-600`, white text, semi-bold. Pending label "Completing...".
   - If only one of these is wired, the wired one spans `col-span-2`.

### Question card (`<QuestionCard>`)
- If `question.instruction` is set, render an **Instruction Banner** above the card:
  - Bar style: bg `gray-800`, white text, `rounded-xl`, 12–16 px padding, info icon in a 5×5 white-translucent circle, instruction body 12–14 px
- The card itself: `Card`, padding 16–24

The card content is determined by `question.questionType`. All of these renderers receive `(question, questionNumber, answer/answers/selected, onAnswerChange, isSubmitted, showCorrectAnswer)`.

### Question type renderers

All choice-style cards share the structure:
- Question header: "Question N" (12–14 px gray-600, font-medium) + question text (rich content, 16–18 px semi-bold gray-900, break-words)
- Multiple-choice gets an extra small uppercase line: "Select all that apply"
- Options as full-width pills, 16–20 px horizontal / 12–16 px vertical, `rounded-full`, border, transition

**Per-option color states**
| State | Border | Background | Text |
|-------|--------|------------|------|
| default | gray-200 | white (hover gray-50) | gray-700 |
| selected | `#F04F54` | `#F04F54` | white |
| correct | green-500 | green-500 | white |
| incorrect | red-500 | red-500 | white |
| missed (multi-correct option you didn't pick) | yellow-500 | yellow-100 | yellow-800 |

**Selection rules**
- `SINGLE_CHOICE` and `TRUE_FALSE` are **toggle-able**: tapping the selected option again unselects it (sets `null`).
- `MULTIPLE_CHOICE`: toggle adds/removes from a `string[]`.

**Post-submit feedback panel** (visible only when `showCorrectAnswer && submitted && answer != null`):
- bg `green-50` if correct, `red-50` if wrong; padding 12–16; `rounded-lg`
- Left: ✨ + "Correct!" / "Incorrect" (semi-bold green-700 / red-700)
- Right (correct only): "+{XP_PER_CORRECT_ANSWER}XP" (green-600 semi-bold)

**Empty options** (`options.length === 0`): "No options available for this question." (centered gray-500)

**Other renderers** (same wrapper pattern, with their own input UIs):
- `FILL_IN_BLANK` — multi-blank inputs. `answers: Record<blankId, value>`. Shows correct/incorrect per blank with check/X icons after submit.
- `ESSAY` — textarea, single string answer. No auto-grading.
- `ESSAY_WITH_SUB` — multiple textareas keyed by sub-question id. Object answer.
- `SHORT_ANSWER` — short text input.
- `CALCULATION` — guided multi-step calculation; object answer.
- `ORDERING` — drag-to-order list; array answer.
- `MATCHING` — left-to-right matching pairs; object answer.

For **unsupported types**, render a fallback: question number + question text + yellow note "Question type \"{type}\" is not yet supported."

### Explanation card (practice only, after submit)
Below the question, when `isPracticeExam && submitted && question.explanation`:

The `<Explanation>` parser splits the solution text into sections by markdown bold markers (`**Explanation**`, `**Why other options are incorrect**`, `**Key Terms**`, `**Relatable Example**`, `**References**`, `**Common Mistakes**`, `**Tips**`). Each section gets a colored block:
- main / generic — plain
- why-incorrect — orange (`bg-orange-50` border)
- key-terms — blue
- example — green left-border accent
- references — gray
- common-mistakes — red
- tips — purple

If structured `explanation` data fields are present (`workingSteps`, `keyPoints`, `commonMistakes`, `tips`), render them in styled lists instead. Working steps render as a left-border-blue stack with optional formula codeblock and italic explanation per step.

### Timer behavior
- `timeRemaining` is in seconds; `timerRunning` controls the tick.
- An interval ticks every 1000 ms, decrementing via functional `prev → prev - 1`.
- Reaching `0` while `timerRunning` triggers `confirmCompleteExam()` (auto-submit).
- Pausing calls the API; resuming the same. State is mirrored locally so the timer freezes immediately.

### Submit Answer handler
1. Read `currentQuestion`, draft `answer`. Bail if no answer.
2. `timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000)`
3. Format answer:
   - `boolean` → as-is
   - `array` → as-is
   - `object` (fill-in-blank, essay-with-sub, etc.) → `JSON.stringify`
   - `string` → as-is
4. **`POST /student/exams/attempts/{attemptId}/responses`** with `{ questionId, answer, timeSpentSeconds }`
5. Hook adds the returned `AttemptResponse` to `responses` Map.
6. On error: set local `errorMessage` for `<TrialLimitAlert>`.

### Question change effect
Whenever `currentQuestionIndex` changes, reset `questionStartTime.current = Date.now()`.

### Bookmark handler
Optimistic local toggle, then `POST /student/exams/bookmarks` with `{ questionId }`. On error → revert local state.

### Report handler
Opens **Report Question** dialog:
- Title: "Report Question"
- Body: "Please describe the issue with this question."
- Select with options:
  - `INCORRECT_ANSWER` — "Incorrect answer marked as correct"
  - `UNCLEAR_QUESTION` — "Question is unclear"
  - `TYPO` — "Typo or grammatical error"
  - `INCORRECT_EXPLANATION` — "Incorrect explanation"
  - `IMAGE_ISSUE` — "Image issue"
  - `OTHER` — "Other"
- Footer: outline "Cancel" / accent (`#F04F54`) "Submit Report" (pending: "Submitting...")
- On submit: **`POST /student/exams/reports`** with `{ questionId, reason }`. Close + clear on success.

### Complete Exam handler
1. Compute "has unanswered":
   - **Practice**: any question whose ID is NOT in `submittedQuestions`
   - **Mock**: any question without a draft answer
2. If unanswered → open **Complete confirmation** dialog
3. Otherwise, run `confirmCompleteExam` directly

**Confirmation dialog** (Complete Exam?)
- Title: "Complete Exam?"
- Body:
  - Practice: `"You have ${total - submitted} unsubmitted question(s). Once you complete the exam, you won't be able to return."`
  - Mock: `"You have ${total - answered} unanswered question(s). Once you complete the exam, you won't be able to return."`
- Buttons: outline "Go Back" / accent "Complete Exam" (pending: "Submitting...")

**`confirmCompleteExam` logic**:
1. Build `unsubmittedResponses[]`:
   - Practice: only questions not in `submittedQuestions` AND with a non-empty answer
   - Mock: every question with a non-empty answer (even if previously submitted, since user may have changed it)
2. Format each answer the same way as Submit Answer.
3. If `unsubmittedResponses.length > 0`: **`POST /student/exams/attempts/{id}/responses/bulk`** with `{ responses, complete: true }`.
4. Else: **`POST /student/exams/attempts/{id}/complete`**.
5. On success → navigate to `/exam/review/{attemptId}`.
6. On error → set `errorMessage`.

### Exit Exam handler
Opens **Exit confirmation** dialog:
- Title: "Exit Exam?"
- Body: "Your progress will be saved and you can resume this exam later from the Activities page."
- Buttons: outline "Cancel" / accent "Exit Exam" (pending: "Saving...")
- On confirm: `PATCH .../pause`. **Always navigate to `/tests` afterwards**, even if the pause API fails (progress is already in the persisted store).

### "Exam Not Found" state
When `loadError || !currentAttempt || questions.length === 0`:
- Inline back link → `/tests`
- `h1` "Exam Not Found"
- Body: error or "This exam session has expired or is no longer available."
- Sub-line: "Please start a new exam from the tests page."
- Accent button "Go to Tests" → `/tests`

---

## 7. Screen — `/exam/review/$attemptId`

Read-only review of a completed attempt. Fetches **`GET /student/exams/attempts/{attemptId}/review`**.

### Header
Inline back link → `/activities` ("← Back").

### Score summary banner
Wrapping card with conditional styling:
- Pass: bg `emerald-50/80`, border `emerald-200`
- Fail: bg `red-50/80`, border `red-200`
- `rounded-2xl`, padding 20–28

Layout: row (column on mobile, row on desktop):

**Score circle** (left)
- 64×64 / 80×80 round, border 4 px (emerald-400 or red-400), bg emerald-100 / red-100
- Centered: percentage or JAMB score (24 px bold, emerald-700 / red-700)

**Title block** (next to circle)
- Exam name (18–20 px bold gray-900)
- Sub-line: `[examType.name, subject.name]` joined with `" · "`. JAMB exception: `"JAMB Score: {score}/100 · {subjectName}"`.
- Row: Trophy (passed) or XCircle (failed) icon + bold "Passed" / "Failed" in matching color

**Stat pills** (right side / wrap below on mobile)
- All have `bg-white/80`, border gray-200, `rounded-full`, padding 12 px, text 12–14 px:
  - 🎯 `correct/total`
  - ✓ green check + "{n} correct"
  - ✗ red x + "{n} wrong"
  - − minus circle gray + "{n} skipped" (only if > 0)
  - ⏱ + `formatTime(timeSpent)` (e.g. "12m 34s" or "45s")

**Score math**:
- `correctCount = responses.filter(r => r.isCorrect).length`
- `essayResponseCount = responses where questionType ∈ {ESSAY, ESSAY_WITH_SUB, SHORT_ANSWER}`
- `answeredWrongCount = responses where !isCorrect && !essay && answer present`
- `skippedCount = totalQuestions - correctCount - answeredWrongCount - essayResponseCount`
- `percentage = round((correctCount / totalQuestions) * 100)`
- `passed = percentage >= passingScore (default 50)`
- **JAMB detection**: matches `/jamb|utme/i` in either exam name or exam type name. JAMB shows raw score out of 100; non-JAMB shows percentage.

### Question navigator
- **Mobile:** horizontal scroll row (gap-2)
- **Desktop:** vertical sidebar `w-56`
- Section label "QUESTIONS" (uppercase 12 px gray-500)

Each item is a pill button:
- Active: bg `gray-900`, white text
- Inactive: bg white, gray-200 border, hover gray-50
- Inside: 20×20 numbered indicator with state-based bg+text:
  - Skipped → gray-100 / gray-400
  - Essay → amber-100 / amber-700
  - Practice + correct → emerald-100 / emerald-700
  - Practice + wrong → red-100 / red-600
  - Mock + answered → blue-100 / blue-700
- On desktop only, append the icon next to "Q{n}" label

### Question card body
For the currently selected question:

**Result badge** (top of card):
- "Not Attempted" (gray pill) — if no response
- "Not Auto-Graded" (amber pill, clock icon) — if essay-style
- Practice + correct → green pill "Correct"; wrong → red pill "Incorrect"
- Mock + answered → blue pill "Answered"
- Suffix: `({marksAwarded}/{question.marks} marks)` (smaller, lighter)
- Right side (when present): time spent pill `clock + formatTime`

**Question render**: same renderers as in the exam-taking screen, with `isSubmitted={true}`, `disabled={true}`, `showCorrectAnswer={true}`, and `onAnswerChange={() => {}}` (no-op).

**Explanation**: render `<Explanation>` if `question.explanation` is set; else fall back to plain `textExplanation` field.

**Prev/Next bar** (below the card):
- Left: chevron-left + "Previous" (disabled at index 0)
- Center: `{currentIndex+1} / {total}` (12 px gray-400)
- Right: "Next" + chevron-right (disabled at last index)

### Loading / error
- Loading: centered accent spinner
- Error: back link "Back to Activities" + centered XCircle gray + "Could not load exam review."

---

## 8. Exam Simulation flow

### 8.1 `/mock-exam/setup`

**Header**
- Back: `/tests/exams`
- Heading: "Exam Simulation"
- Sub: "Select subjects for a combined mock exam"
- Search: enabled, placeholder "Search subjects..."

**Loading state**: centered accent spinner (40+ px padding).

**Sticky summary bar** (visible once `selectedSubjects.size > 0`)
- Sticky top, z-10, 24 px bottom margin
- Card: gradient `from-red-50 to-orange-50`, border `[#F04F54]/20`, `rounded-2xl`, padding 16–20, soft shadow
- Layout: 3 stat columns separated by 1 px vertical dividers + button on the right (or wrapped on mobile)
  - Subjects: `count` (24–30 px bold accent) + "Subjects" (10–12 px uppercase gray-500)
  - Questions: `totalQuestions` (24–30 px bold gray-800) + "Questions"
  - Total Time: `timeLabel` (e.g. `1hr 30m` or `45m`) + "Total Time"
- Right: **Start Simulation** button — accent, `rounded-full`, `h-12`, font-semibold, shadow.
  - Disabled if `count < 2` or pending. Pending: spinner + "Starting...".
  - Time formula: `hours = floor(minutes/60)`; if hours > 0: `"{h}hr {m>0 ? m+'m' : ''}"`, else `"{m}m"`.

**Error alert (destructive)**: shown when start fails. Body: API message or "Failed to start exam simulation. Please try again."

**Info banner** (always visible at top of body)
- Bg blue-50, border blue-100, `rounded-xl`, padding 12–16
- Icon `AlertCircle` blue-500 + text blue-700: *"Select 2 or more subjects to simulate real exam conditions. Questions from all subjects will be combined into a single timed session — just like the actual exam."*

**Subject grid**
- 2/3/4/5-col responsive
- Each card is the same as the regular subject card, but with selection state:
  - Selected: border 2 px `#F04F54`, bg `red-50/50`, shadow-md, **CheckCircle2** in `#F04F54` at top-right (10×10 px from edge, 20×20 px icon)
  - Selected icon container: `bg-red-100` (instead of `amber-50`)
- Below subject name: per-mock info row (10–12 px gray-500)
  - 📖 + numQuestions
  - ⏱ + durationMinutes + "m"
  - Loading: "Loading..."
  - No mocks: "No mocks available"
- **Mock auto-pick**: when the user taps a card to select it, the picker's stored "active mock" is the one shown — chosen at random from `mocks` once on data load (memoized by `mocks.length`). The selected mock is then frozen into the selection map.

**Mobile sticky CTA bar** (when `count >= 2`)
- Fixed bottom, full-width, blurred white bg, top border, padding 16, z-20
- Same Start Simulation button, label `"Start Simulation ({count} subjects)"`
- Hidden on `sm:` screens (which already show the top sticky bar).

**Start Simulation logic**
- Validation: must have ≥ 2 subjects, otherwise set error and bail
- Calls `useStartMockExams({ subjects: [{ subject, examId }, ...] })`
- Hook fires `POST /student/exams/{examId}/start` for **each** subject in **parallel** (`Promise.all`), generates a `crypto.randomUUID()` `sessionId`, stores all sessions in the mock store, returns `{ sessionId }`
- Navigate to `/mock-exam/{sessionId}`

### 8.2 `/mock-exam/$sessionId` (Simulation runner)

Same shell as `/exam/$attemptId` but adds a **subject tab strip** above the main content. All other behavior (navigator, question card, dialogs) reuses the same components.

**Header**
- Exit / Exit Simulation button + title "Exam Simulation"

**Subject tabs** (horizontal scroll, gap-2, padding-bottom 12, no scrollbar)
Each subject tab:
- Pill button, `rounded-full`, padding 16/10, text 14, font-medium, border
- Active: bg `#F04F54`, white text, accent border, shadow-md
- Inactive: bg white, gray-700 text, gray-200 border, hover gray-50
- Inside: optional **CheckCircle2 green-500 3.5×3.5** when ALL of that subject's questions are answered AND tab is not active
- Subject name (truncated, max-w 120)
- Counter pill on the right: `"{answeredCount}/{total}"`
  - Active: bg `white/20`, white text
  - Inactive: bg gray-100, gray-500 text

**Error message banner**: same `<Alert variant="destructive">` style as setup screen.

**Main layout / Navigator**: identical to `/exam/$attemptId` — but the navigator is fed only the **current subject's** questions. `submittedQuestions` and `correctQuestions` are passed as empty Sets (mock simulations never lock or color by correctness mid-exam).

**Question rendering**: same as exam-taking. **Always unlocked** (`isLocked = false`, `showCorrectAnswer = false`) — users can change answers freely until they Complete.

**Timer**: shared across all subjects (single `timeRemaining` in the mock store). Same auto-complete-on-zero behavior.

**Pause**: the **`PATCH .../pause`** call fires for **every** subject's `attemptId` in parallel; same for resume. Local timer toggled on success.

**Submit Answer** per question: **`POST .../responses`** for the current `subjectIndex`'s `attemptId`. Response is recorded in the per-subject `responses` Map, but the question is **not** locked.

**Complete Simulation**:
- Confirmation dialog title "Complete Simulation?", body `"You have {totalUnanswered} unanswered question(s) across all subjects..."`
- Cancel "Go Back" / accent "Complete Simulation" (pending: "Completing...")
- `useCompleteMockExam`: for each subject, build `unsubmittedResponses` (questions not yet submitted but with a non-empty draft), then either bulk-submit with `complete: true` OR plain-`POST .../complete` if all are already submitted.
- On success → navigate to `/mock-exam/review/{sessionId}`.
- Invalidates `examHistory` and `progress` queries.

**Exit Simulation**:
- Same dialog as exam-taking but title/body say "Simulation". On confirm: pause every subject in parallel, then navigate to `/tests` (regardless of pause result).

**Invalid session state**:
- When `storedSessionId !== sessionId` or no subjects: render the same "Session Not Found" empty state with back link to `/tests` and "Go to Tests" button.

### 8.3 `/mock-exam/review/$sessionId`
Multi-subject review. Out of scope for this doc — render combined results.

---

## 9. Cross-screen UI tokens

| Token | Value |
|-------|-------|
| Brand red | `#F04F54` |
| Primary action button (exam) | `#F04F54` bg, white text, `rounded-full`, semibold, h-12, soft shadow |
| Outline pill button | gray-200 border, gray-700 text, hover gray-50, `rounded-full` |
| Card | `rounded-2xl` (24 px), gray-100 border, soft shadow |
| Question option pill | `rounded-full`, full-width, padding 16/12 mobile / 20/16 desktop |
| Result green | `green-500`/`emerald-500` foreground, `green-50`/`emerald-50` bg |
| Result red | `red-500` foreground, `red-50` bg |
| Missed (multi-correct, not selected) | yellow-500 border, yellow-100 bg, yellow-800 text |
| Skipped indicator | minus-circle gray-300/400 |
| Timer warning threshold | red text when `timeRemaining < 300` (5 min) |
| Bookmark active | `#F04F54` bg, filled icon |
| Subject card icon container | 56×56 amber-50 (or red-100 when selected in simulation) |

### Loading / error idioms
- Centered `Loader2` (lucide) with `animate-spin`. Color usually `#F04F54` for exam-y screens, `accent` (red) for review screens.
- Error alerts use `<TrialLimitAlert>` for trial/payment errors, `<Alert variant="destructive">` for inline form errors.

### Toasts
- "Practice exam started successfully!" (success, on jump-in)
- API messages (with fallback strings) for any mutation failure

### XP
- `XP_PER_CORRECT_ANSWER` import from `@/lib/utils` — show "+{XP}XP" right side of result panel when answer is fully correct (single, multi, true/false).

---

## 10. Critical invariants for mobile parity

1. **The store, not the URL, is the source of truth for an in-progress exam.** Loading `/exam/{attemptId}` does NOT re-fetch the questions — it expects the store to have them. The store should be persisted across app restarts.
2. **`questionStartTime` resets on every question change** so the per-question `timeSpentSeconds` is accurate.
3. **Practice locks submitted questions; mock does not.** This branches both the option rendering (no green/red after submit on mock) and the navigator coloring.
4. **Bulk submission semantics differ between practice and mock.** Practice only sends what hasn't been submitted; mock sends every answered question (because the user could have changed answers).
5. **Auto-complete on timer zero** uses the same `confirmCompleteExam` path as the manual completion (dialog skipped).
6. **Bookmarks are hydrated from server once on mount** (`GET /student/exams/bookmarks`) and then maintained optimistically locally. Errors revert.
7. **Pause API failure ≠ navigation failure.** When exiting an exam, navigate even if pause fails — local store keeps progress.
8. **Mocks list endpoint can be grouped or flat.** Always check `Array.isArray` before flattening.
9. **Configure form normalizes empty selects to omitted fields** in the API request (so `""` for difficulty becomes "no filter").
10. **Question types not in the supported set** render as a yellow warning, not a crash.
11. **Multiple Choice "missed" state** is shown only after submit-with-correct-answer-shown (yellow), distinguishing "you missed picking this correct option" from "you picked a wrong option" (red).
12. **JAMB scoring is detected by string match** (`/jamb|utme/i`) and shown as raw `/100`, not as a percentage label.
13. **Simulation has one shared timer** but each subject has its own `attemptId`. The session ID is **client-generated** (not server-issued).
14. **The simulation summary bar is sticky** — keep it visible while the user keeps selecting subjects. Use a fixed bottom bar on mobile when 2+ subjects are selected.
15. **Subject auto-pick mock is random and stable** — picked once when mocks load, kept for the lifetime of the screen unless user explicitly switches.
16. **Toggle behavior on single-choice / true-false** — tapping the already-selected option deselects it (sets `null`), allowing the user to clear an answer.

---

## 11. Mapping summary (one-pager)

```
/tests
  └─ Subjects card → /tests/exams
       ├─ Banner → /mock-exam/setup
       │    └─ Start (≥2 subjects) → POST /exams/{id}/start ×N → /mock-exam/{sessionId}
       │         ├─ Submit answer (per subject attempt)
       │         ├─ Pause/Resume (×N parallel)
       │         ├─ Exit → pause ×N + /tests
       │         └─ Complete → bulk-submit ×N → /mock-exam/review/{sessionId}
       └─ Subject card → DialogStack
            ├─ Practice ▸ Jump → POST /practice/start → /exam/{attemptId}
            ├─ Practice ▸ Configure → POST /practice/configure → /exam/{attemptId}
            └─ Mock → POST /exams/{mockId}/start → /exam/{attemptId}

/exam/{attemptId}
  ├─ Submit answer → POST /attempts/{id}/responses
  ├─ Bookmark → POST /bookmarks
  ├─ Report → POST /reports
  ├─ Pause/Resume → PATCH /attempts/{id}/(pause|resume)
  ├─ Exit → PATCH .../pause + /tests
  └─ Complete → bulk + complete → /exam/review/{attemptId}

/exam/review/{attemptId}
  └─ GET /attempts/{id}/review (read-only)
```
