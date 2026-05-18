# WAEC / NECO Multi-Paper Exam Simulation

Extension of the existing JAMB-style simulation (`/mock-exam/setup` + `/mock-exam/$sessionId`) to support exam types whose mocks come in **multiple papers per subject**, such as WAEC and NECO.

> **JAMB recap:** one objective paper per subject, MOCK only, all subjects combined into a single timed session. State already supports this via `mockExamStore.subjects[]` where each subject contributes a single `attempt`.
>
> **WAEC / NECO change:** a single subject can have **2–3 papers** (Paper 1 objective, Paper 2 theory/essay, Paper 3 practical for sciences). The user picks subjects; all available papers for each subject are auto-included; everything runs as one combined sitting.

Scope: **MOCK only**. Practice flow is untouched.

---

## 1. Decisions baked into this spec

These are the defaults the user signed off on. Pin them here so they don't drift in implementation:

1. **One shared timer** — sum of all paper durations across all selected subjects (same model as JAMB simulation). No per-paper countdown, no sequential paper transitions, no break screens.
2. **All papers auto-included** — selecting a subject opts you into every available paper for that subject. The setup screen does **not** show a per-paper checkbox. (Users who want only Paper 1 can use the regular per-subject mock launcher on `/tests/exams`.)
3. **Free navigation** — two-level tab strip (Subject → Paper). No forced order between papers or subjects. Same "you can change answers freely until you Complete" rule as the current simulation.
4. **Re-use the existing runner shell** — `/mock-exam/$sessionId` keeps its responsibilities; the layout adds a paper-tab row beneath the subject-tab row. No new route.
5. **Auto-grading is unchanged** — `ESSAY`, `ESSAY_WITH_SUB`, `SHORT_ANSWER` are accepted but not auto-graded. The review screen flags them as "Not Auto-Graded" exactly like today.

If any of these change, this doc must be updated.

---

## 2. Data model

### 2.1 Detecting a WAEC/NECO sitting

The setup screen needs to know whether the focused exam type is multi-paper. Two signals:

| Source | Field | Use |
|--------|-------|-----|
| `useExamPreferences()` | `examSubtype` or `examTypeRecord.name` | Match `/waec|neco|wassce|ssce/i` |
| Each `AvailableExam` returned by `GET /student/exams/available?subjectId=&examTypeEnum=MOCK` | `paperNumber` (int) or `paperName` (e.g. "Paper 1", "Paper 2") | If present, the subject has multiple papers |

**Preferred detection**: trust the server. Group mocks by subject ID; if `paperNumber` exists OR there are >1 mocks per subject, treat the subject as multi-paper.

**Fallback detection** (if backend hasn't shipped a `paperNumber` field yet): parse the paper number from `mock.name` with `/paper\s*(\d+)/i`. If no match, assign it Paper 1.

Either way, the runner must be able to display "Paper 1 / Paper 2 / Paper 3" labels for each entry.

### 2.2 Extended `AvailableExam` shape (additive — does not break JAMB flow)

```ts
interface AvailableExam {
  id: string;
  name: string;
  description?: string;
  numQuestions: number;
  durationMinutes: number;
  passingScore: number;
  allowedAttempts: number;
  _count: { attempts: number };
  endDate?: string;          // for BIG_MOCK
  examTypeEnum: ExamTypeEnum;

  // NEW (optional — only populated for WAEC/NECO mocks)
  paperNumber?: number;      // 1 | 2 | 3 | ...
  paperName?: string;        // "Paper 1: Objective", etc. Falls back to "Paper {n}"
  paperType?: "OBJECTIVE" | "THEORY" | "PRACTICAL" | "ESSAY"; // optional, drives icons/copy
}
```

If `paperNumber` is missing, the client computes `paperNumber = 1` so JAMB and any single-paper exam keep working unchanged.

### 2.3 New `mockExamStore` shape (subjects-with-papers)

Replace the flat `subjects: SubjectSession[]` shape with a nested form. Each subject holds an array of paper sessions:

```ts
interface PaperSession {
  paperNumber: number;
  paperName: string;          // "Paper 1", "Paper 2: Theory", etc.
  paperType?: "OBJECTIVE" | "THEORY" | "PRACTICAL" | "ESSAY";
  attemptId: string;
  attempt: ExamAttempt;
  questions: Question[];
  responses: Map<string, AttemptResponse>;
  answers: Record<string, any>;
  durationMinutes: number;
  numQuestions: number;
}

interface SubjectSession {
  subject: Subject;
  papers: PaperSession[];     // length 1 for JAMB, 2–3 for WAEC/NECO
}

interface MockExamState {
  sessionId: string | null;
  subjects: SubjectSession[];                                  // CHANGED — papers nested
  currentSubjectIndex: number;
  currentPaperIndex: number;                                   // NEW
  currentQuestionIndexes: Record<string, number>;              // CHANGED key — `${subjectIdx}:${paperIdx}` → questionIdx
  timeRemaining: number | null;                                // shared, sum of every paper.durationMinutes * 60
  timerRunning: boolean;
}
```

**Migration note for existing JAMB sessions**: any persisted session in the old flat shape should be migrated (or invalidated and cleared) on store rehydrate. Easiest: bump the persist `version` and write a `migrate()` that wraps each old `SubjectSession` into `{ subject, papers: [oldSession asPaperSession] }`.

### 2.4 Store actions (additions / changes)

| Action | Change |
|--------|--------|
| `startMockExam(sessionId, sessions)` | `sessions` now contains nested papers. Compute `timeRemaining` as `Σ paper.durationMinutes * 60` across every paper of every subject. |
| `setCurrentSubject(idx)` | Sets `currentSubjectIndex = idx`, also resets `currentPaperIndex = 0`. |
| `setCurrentPaper(idx)` (**NEW**) | Sets `currentPaperIndex` within the current subject. |
| `setCurrentQuestion(qIdx)` | Now keyed by `${currentSubjectIndex}:${currentPaperIndex}` in `currentQuestionIndexes`. |
| `nextQuestion()` / `previousQuestion()` | Operate within the current `(subject, paper)` pair only — no cross-paper auto-advance. |
| `submitResponse(subjectIdx, paperIdx, questionId, response)` | New `paperIdx` arg. |
| `setAnswer(subjectIdx, paperIdx, questionId, answer)` | Same. |
| `getCurrentPaper()` (**NEW**) | Returns `subjects[curr].papers[currentPaperIndex]` or null. |
| `getSubjectProgress(subjectIdx)` | Sums answered/total across **all** papers in the subject. |
| `getPaperProgress(subjectIdx, paperIdx)` (**NEW**) | Single-paper answered/total. |
| `getOverallProgress()` | Unchanged contract — sums across every paper of every subject. |

---

## 3. Setup screen — `/mock-exam/setup`

Only **additive** changes; JAMB flow remains identical.

### 3.1 Subject card additions

When `mocks.length > 1` for a subject **or** any mock has `paperNumber > 1`, the subject card switches to a slightly different layout:

- Title row stays the same (subject name).
- Below the icon: a horizontal pill stack of papers:
  - One pill per `paperNumber`, label `"P1"`, `"P2"`, `"P3"` (or `paperName` if short).
  - Pill style: 10–11 px, `rounded-full`, neutral border, padding 6/2. Color tint by `paperType`:
    - OBJECTIVE → gray border
    - THEORY / ESSAY → amber border
    - PRACTICAL → blue border
  - When the subject is selected, all paper pills get the accent border `border-[#F04F54]`.
- Replace the single `📖 {numQuestions} ⏱ {durationMinutes}m` line with **summed totals across all papers**:
  - `📖 {sum of numQuestions}` (all papers combined)
  - `⏱ {sum of durationMinutes}m`
  - Optional tiny line: `"{n} papers"`.

For JAMB (single mock), the card renders unchanged — no pill stack appears.

### 3.2 Selection logic change

When a user taps a subject:
- **JAMB**: pick the random / pre-selected single mock → stored as one entry in `selectedSubjects`.
- **WAEC/NECO**: include **every** mock with `subjectId === subject.id` returned by `useAvailableExams`. Store them all together, e.g.:

```ts
selectedSubjects: Map<subjectId, {
  subject: Subject;
  papers: Array<{ examId: string; exam: AvailableExam }>;
}>
```

Deselecting clears all papers for that subject.

### 3.3 Sticky summary bar additions

Update the three stat columns to use **paper-aware totals**:

| Column | Value | Source |
|--------|-------|--------|
| Subjects | count | size of `selectedSubjects` |
| Papers (**NEW pill, only if any subject has >1 paper**) | Σ papers across all selected subjects | sum |
| Questions | Σ `numQuestions` across every paper | sum |
| Total Time | `Σ durationMinutes` formatted via existing `{h}hr {m}m` rule | sum |

If no selected subject has >1 paper, the "Papers" column is hidden (keeps the JAMB UI clean).

### 3.4 Info banner copy

When the focused exam type is detected as multi-paper, swap the info-banner copy:

> *"Select 2 or more subjects to simulate real exam conditions. All papers (1, 2, and 3 where applicable) will be included — just like the actual WAEC/NECO sitting."*

Keep the JAMB copy when not.

### 3.5 Start Simulation handler

Update `useStartMockExams` so the mutation input contains paper arrays:

```ts
StartMockExamInput {
  subjects: Array<{
    subject: Subject;
    papers: Array<{ examId: string; meta: AvailableExam }>;
  }>;
}
```

Inside the hook:
1. **Fire `POST /student/exams/{examId}/start` for every paper in parallel** (`Promise.all` over `subjects.flatMap(s => s.papers)`).
2. Generate `sessionId = crypto.randomUUID()`.
3. Re-shape results back into the nested form:
   ```
   subjects: [
     {
       subject,
       papers: [
         { paperNumber, paperName, paperType, attempt: response, attemptId: response.id, questions, durationMinutes, numQuestions },
         ...
       ]
     },
     ...
   ]
   ```
   Sort each subject's `papers` by `paperNumber` ascending so the tab order is `P1 → P2 → P3`.
4. Call `mockExamStore.startMockExam(sessionId, subjects)`.
5. Resolve with `{ sessionId }`. Navigate to `/mock-exam/{sessionId}` as before.

Validation rule remains: must have **≥2 subjects selected** before starting. (Don't gate on paper count; a 2-subject WAEC sitting still simulates real exam conditions even if only Paper 1 exists for both.)

---

## 4. Runner — `/mock-exam/$sessionId`

Only the navigation strip and the navigator-feed change. Everything else (timer, pause/resume, submit per question, complete, exit dialog, question card, report dialog) keeps working as-is because each paper is just another `attemptId`.

### 4.1 Two-level tab strip

Above the question area, replace the single subject-tabs row with **two stacked rows**:

#### Row 1 — Subject tabs
Identical to today (horizontal scroll pill row, gap-2). State source: `currentSubjectIndex`.
- Counter pill now shows **subject totals across all papers**, e.g. `"45/60"` = answered-across-papers / total-across-papers for that subject.
- The green CheckCircle2 "all done" indicator only shows when every question in **every paper** of that subject is answered.

#### Row 2 — Paper tabs
Visible only when the active subject has `papers.length > 1`. Style is slimmer than subject tabs:
- Pill row, gap 6, padding 8/2, `rounded-full`, `border`, 12 px text.
- Active: `bg-[#F04F54]/10 text-[#F04F54] border-[#F04F54]` (lighter than subject tabs to keep the hierarchy).
- Inactive: `bg-white text-gray-600 border-gray-200`.
- Label: `paperName` or `"Paper {n}"`. Counter inside pill: `{answered}/{total}` for that paper.
- Optional small dot to the left of the label tinted by `paperType` (gray / amber / blue).
- Order: by `paperNumber` ascending.

If the active subject has exactly one paper (JAMB case), **don't render row 2 at all** — same screen as today.

### 4.2 Question Navigator

The navigator is fed by **the currently active paper**, not the subject:

```ts
const currentPaper = subjects[currentSubjectIndex].papers[currentPaperIndex];
<QuestionNavigator
  totalQuestions={currentPaper.questions.length}
  currentQuestion={currentQuestionIndexes[`${currentSubjectIndex}:${currentPaperIndex}`] ?? 0}
  answeredQuestions={/* compute from currentPaper.answers */}
  submittedQuestions={/* empty Set, like today */}
  correctQuestions={/* empty Set, like today */}
  ...
/>
```

The legend, action buttons, timer, bookmark, and report behaviors are identical to the existing simulation. The timer remains a single shared countdown.

### 4.3 Question card

Same `<QuestionCard>` and renderer set. The question type still drives the renderer choice — `ESSAY` / `ESSAY_WITH_SUB` / `SHORT_ANSWER` will appear for Paper 2 / 3 and render as today (textareas, no auto-grading, no post-submit feedback panel).

`isLocked = false`, `showCorrectAnswer = false` — same as today.

### 4.4 Per-question Submit Answer

The Submit Answer mutation must now carry both indexes:

```ts
useMockSubmitResponse({
  subjectIndex,
  paperIndex,                       // NEW
  attemptId: currentPaper.attemptId,
  request: { questionId, answer, timeSpentSeconds }
})
```

Server endpoint unchanged: `POST /student/exams/attempts/{attemptId}/responses`. The hook just writes the response into `subjects[subjectIndex].papers[paperIndex].responses` and that paper's `answers` map.

### 4.5 Pause / Resume

`PATCH /student/exams/attempts/{attemptId}/pause` and `/resume` must now fan out to **every paper attempt of every subject** (`Promise.all` over `subjects.flatMap(s => s.papers).map(p => p.attemptId)`).

The local timer freezes / resumes immediately on success, same as today.

### 4.6 Complete Simulation

The complete-confirmation copy stays the same. Internally, `useCompleteMockExam` fans out across every paper:

For each `paper` in every subject:
1. Build `unsubmittedResponses` from that paper's `answers + responses`.
2. If `unsubmittedResponses.length > 0`: `POST /student/exams/attempts/{attemptId}/responses/bulk` with `{ responses, complete: true }`.
3. Else: `POST /student/exams/attempts/{attemptId}/complete`.

Run them in parallel. On success → navigate to `/mock-exam/review/{sessionId}` (review screen is out of scope here — it should iterate every paper attempt the same way).

The "you have N unanswered" count in the confirmation dialog sums across every paper.

### 4.7 Exit Simulation

Same dialog. On confirm, pause every paper attempt in parallel, then `navigate("/tests")` regardless of pause result. Local store keeps state for next time.

### 4.8 Auto-complete on timer zero

Unchanged: when `timeRemaining === 0 && timerRunning`, call `confirmCompleteExam()` (fans out across every paper).

### 4.9 Empty / invalid session

When the URL `sessionId` doesn't match `storedSessionId` or `subjects` is empty: same "Session Not Found" empty state.

---

## 5. API additions / contract requirements

The frontend changes don't require new endpoints, but they **do require** the backend to:

1. Return one mock per paper from `GET /student/exams/available?subjectId=&examTypeEnum=MOCK` when the focused exam type is WAEC/NECO. So a WAEC English subject would return 2 entries (Paper 1, Paper 2) and a WAEC Chemistry subject would return 3 (Paper 1, 2, 3).
2. Include `paperNumber` (int) on each `AvailableExam`. `paperName` and `paperType` are optional but recommended for clean labels and color tints.
3. Treat each paper as its own attempt — i.e. `POST /student/exams/{examId}/start` continues to create a per-paper `attemptId`, and all `attempts/{id}/...` endpoints work paper-by-paper. No multi-paper grouping endpoint needed.

If the backend hasn't shipped `paperNumber` yet, the client falls back to parsing `name` with `/paper\s*(\d+)/i`; this is good enough to ship the UI but should be replaced with the server field as soon as it lands.

---

## 6. Mobile parity checklist

Things the mobile client must mirror exactly:

1. **Detection rule**: same regex (`/waec|neco|wassce|ssce/i`) against `examPreferences.examTypeRecord.name` (or `examSubtype`). If the rule matches OR any subject returns >1 mock, treat as multi-paper.
2. **Auto-include all papers** on subject tap. No per-paper checkbox.
3. **Summary bar shows Papers column** only when at least one subject has >1 paper.
4. **Setup info banner copy switches** based on detected exam type.
5. **Start fires one POST per paper in parallel**, generates a single client-side `sessionId`, stores nested `subjects → papers`.
6. **Runner renders two-level tabs** only when the active subject has multiple papers; otherwise behaves identically to JAMB simulation.
7. **Single shared timer** = sum of every paper duration.
8. **Pause/Resume/Complete/Exit fan out across every paper attempt in parallel** (`Promise.all`). Local state updates only after the API resolves.
9. **Bookmark / Report still target a single questionId** — paper-agnostic, same endpoints as today.
10. **Submitted answers are written into the correct paper's slot** (`subjects[subjectIdx].papers[paperIdx].responses`). Cross-paper bleed will break the navigator color states.
11. **`currentQuestionIndexes` keyed by `"${subjectIdx}:${paperIdx}"`**. Don't store per-subject-only or per-paper-only — both are needed because the same paper index can mean different things across subjects.
12. **Sort papers by `paperNumber` ascending** on insert; never reorder afterwards.
13. **Persisted session migration**: if a pre-existing JAMB session is in the old flat shape, either migrate by wrapping each entry in `{ papers: [it] }` or clear the store on load and toast "Your previous simulation was cleared due to an app update." Don't crash on the old shape.
14. **JAMB simulation continues to work**: in single-paper sessions, the paper-tab row is hidden, the summary "Papers" column is hidden, and the runner behaves identically to before. The internal shape is still nested (`papers: [one]`).

---

## 7. Mapping summary (one-pager)

```
/tests/exams
  └─ "Exam Simulation" banner → /mock-exam/setup

/mock-exam/setup  (detects multi-paper from preferences + mock list)
  ├─ Subject card
  │    ├─ JAMB-style → single mock pre-picked
  │    └─ WAEC/NECO  → all papers auto-included (P1/P2/P3 pills shown)
  ├─ Sticky summary bar: Subjects · [Papers] · Questions · Total Time
  ├─ Info banner copy swaps for multi-paper
  └─ Start (≥2 subjects)
       → useStartMockExams: POST /exams/{examId}/start  ×  ΣpapersAcrossSubjects   (parallel)
       → store as { subjects: [{ subject, papers: [PaperSession, ...] }] }
       → /mock-exam/{sessionId}

/mock-exam/{sessionId}
  ├─ Row 1: Subject tabs (counter = answered/total across subject's papers)
  ├─ Row 2: Paper tabs (only when subject.papers.length > 1)
  ├─ Question navigator (scoped to active paper)
  ├─ Question card (re-uses every renderer; essay types not auto-graded)
  ├─ Submit answer  → POST /attempts/{currentPaper.attemptId}/responses
  ├─ Pause/Resume   → PATCH .../pause | .../resume  × every paper attempt   (parallel)
  ├─ Exit           → pause × every paper + /tests
  └─ Complete       → bulk-submit + complete × every paper → /mock-exam/review/{sessionId}
```

---

## 8. Open follow-ups (not in this spec)

- **Review screen** (`/mock-exam/review/$sessionId`) needs to display results paper-by-paper, per subject. ESSAY/THEORY answers should be flagged "Not Auto-Graded" (consistent with the single-subject review). Spec separately.
- **Server-side paper metadata** (`paperNumber`, `paperName`, `paperType`) — if not yet implemented, schedule it before relying on `paperType` for color tints. The text-parse fallback is a stopgap, not a long-term contract.
- **WAEC practical considerations** — Paper 3 sometimes requires specimen-handling instructions or images. The current `QuestionCard` already renders a top instruction banner if `question.instruction` is set; keep that contract.
- **Per-paper time hints** — out of scope today (we said one shared timer). If users complain, the next iteration could show "Suggested time for this paper: 50 min" as a non-blocking helper line inside the question card.
