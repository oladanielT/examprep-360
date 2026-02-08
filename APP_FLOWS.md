# Exam Prep Web App — Complete User Flow Documentation

> **Purpose:** Reference document for replicating all user flows in the mobile app.
> Generated from the web app codebase (`exam-prep-web-app-v2`).

---

## Table of Contents

1. [Routing Structure & Layout Architecture](#1-routing-structure--layout-architecture)
2. [Authentication & Onboarding Flows](#2-authentication--onboarding-flows)
3. [Exam Flows](#3-exam-flows)
4. [Tutorial Flows](#4-tutorial-flows)
5. [Textbook Flows](#5-textbook-flows)
6. [Subscription & Payment Flows](#6-subscription--payment-flows)
7. [Settings & Profile Flows](#7-settings--profile-flows)
8. [Leaderboard & Progress Flows](#8-leaderboard--progress-flows)
9. [Activities Flow](#9-activities-flow)
10. [Navigation & Global UI](#10-navigation--global-ui)
11. [API Types & Data Models](#11-api-types--data-models)
12. [State Management (Stores)](#12-state-management-stores)
13. [All API Endpoints](#13-all-api-endpoints)

---

## 1. Routing Structure & Layout Architecture

**Technology:** TanStack Router with file-based routing.

### Layout Hierarchy

```
__root.tsx                        (Root layout: <Outlet />, custom 404 page)
  │
  ├── _auth.tsx                   (Auth layout: split-screen, auth guard)
  │     ├── welcome.tsx           /welcome
  │     ├── register.tsx          /register
  │     ├── verify-email.tsx      /verify-email
  │     ├── select-exam.tsx       /select-exam
  │     ├── summary.tsx           /summary
  │     ├── checkout.tsx          /checkout
  │     ├── payment-verify.tsx    /payment-verify
  │     ├── sign-in.tsx           /sign-in
  │     ├── forgot-password.tsx   /forgot-password
  │     └── reset-password.tsx    /reset-password
  │
  └── _user.tsx                   (User layout: Nav + content, auth guard)
        ├── index.tsx             / (Dashboard)
        ├── tests/
        │     ├── index.tsx       /tests
        │     └── exams.tsx       /tests/exams
        ├── exam.$attemptId.tsx   /exam/:attemptId (exam in progress)
        ├── exam.review.$attemptId.tsx  /exam/review/:attemptId
        ├── tutorials/
        │     ├── index.tsx       /tutorials
        │     └── $tutorialId.tsx /tutorials/:tutorialId
        ├── textbooks/
        │     ├── index.tsx       /textbooks
        │     └── $textbookId.tsx /textbooks/:textbookId
        ├── activities.tsx        /activities
        ├── leaderboard.tsx       /leaderboard
        ├── settings.tsx          /settings
        └── subscription.tsx      /subscription (layout with <Outlet>)
              ├── subscription.index.tsx   /subscription
              └── subscription.add.tsx     /subscription/add
```

### Route Guards

**Auth Layout (`_auth.tsx`):**
- If user **is authenticated** AND the path is NOT in the allowed list (`/verify-email`, `/select-exam`, `/summary`, `/checkout`, `/payment-verify`), **redirect to `/`**.
- Purpose: Prevents authenticated users from accessing sign-in/register pages, but allows them to complete the registration/payment wizard.
- Visual: Split-screen layout — form on the left, decorative image on the right.

**User Layout (`_user.tsx`):**
- If user **is NOT authenticated**, **redirect to `/sign-in`**.
- Visual: Top navigation bar with content below.

**Root 404:**
- Custom `NotFoundComponent` with "Go to Dashboard" and "Go Back" buttons.

---

## 2. Authentication & Onboarding Flows

### 2A. Registration / Onboarding Flow (6-Step Wizard)

The registration is a multi-step wizard tracked by `registrationStore` (persisted to `sessionStorage`).

#### Step 1: Welcome — Select Exam Category

- **Route:** `/welcome`
- **API:** `GET /user/exam-selection/categories` → `useExamCategories()`
- **User Action:** Select an exam category button (e.g., "UTME", "WAEC"). "TUTORIAL" categories are filtered out.
- **State:** Calls `registrationStore.setUserType(category)`
- **Navigation:** → `/register`
- **Error States:** Loading spinner while categories fetch

#### Step 2: Register — Basic Info

- **Route:** `/register` (progress bar at 50%)
- **Form Fields:** fullName, email, phone, password, confirmPassword, institutional license toggle (Switch)
- **Validation:** Zod schema — password must be 8+ chars with uppercase, lowercase, and number
- **API:** `POST /user/auth/request-email-otp` → `useRequestEmailOtp()` (sends OTP to email before navigating)
- **State:** Calls `registrationStore.setBasicInfo({fullName, email, phone, password, isInstitutional})`
- **Navigation:** On OTP send success → `/verify-email`
- **Error States:** Form validation errors shown inline; API error shown via toast
- **Note:** Google Sign In button exists in UI but has no handler implemented

#### Step 3: Verify Email

- **Route:** `/verify-email` (progress bar at 60%)
- **Guard:** If no email in registrationStore → redirect to `/register`
- **User Action:** Enter 6-digit OTP code
- **API:** `POST /user/auth/verify-email` → `useVerifyEmail()`
- **Resend:** "Resend Code" button → `POST /user/auth/resend-verification` → `useResendVerification()`
- **Navigation:** On success → `/select-exam`
- **Error States:** Invalid OTP shows error message; resend shows toast

#### Step 4: Select Exam

- **Route:** `/select-exam` (progress bar at 80%)
- **APIs:**
  - `GET /user/exam-selection/exam-types/:category` → `useExamTypes(category)` — fetches exam type dropdown options
  - `GET /user/exam-selection/subjects/:examType` → `useExamSubjects(examType)` — fetches available subjects
- **User Actions:**
  - Select exam type from dropdown
  - Toggle up to 9 subjects from grid
  - (If institutional) Adjust student count slider (2–500)
- **State:** Calls `registrationStore.setExamSelection({examType, examTypeId, subjects, duration})`
- **Navigation:** On submit → `/summary`
- **Validation:** Must select at least 1 subject; max 9 subjects enforced

#### Step 5: Summary / Review

- **Route:** `/summary` (progress bar at 100%)
- **Display:** Shows all registration data for review (name, email, phone, exam type, subjects, etc.)
- **API:** `POST /user/auth/register` → `useRegister()` with full payload from registrationStore
- **State:** Saves `studentId` from response to registrationStore
- **Navigation:** On success → `/checkout`
- **Error States:** Registration API error shown as alert

#### Step 6: Checkout (Payment)

- **Route:** `/checkout`
- **Three payment options:**

| Option | API | Result |
|--------|-----|--------|
| **Start Free Trial** | `POST /payment/trial` → `useStartTrial()` | Resets registration store → `/` |
| **Pay Now** | `GET /payment/plans` → `usePaymentPlans()`, then `POST /payment/initialize` → `useInitializePayment()` | Redirects to Paystack payment URL |
| **Redeem License Code** | `POST /payment/redeem-license` → `useRedeemLicense()` | On success → `/` |

- **Skip Option:** "Skip for now" button → navigates directly to `/`
- **Error States:** Alert banners for each mutation error

#### Step 6b: Payment Verification (Paystack Callback)

- **Route:** `/payment-verify`
- **Trigger:** Paystack redirects back with `reference`/`trxref` URL params
- **API:** `POST /payment/verify` → `useVerifyPayment()`
- **States:**
  - "Verifying payment..." spinner
  - Success message → resets registrationStore → `/` after delay
  - Failure message → Retry button or "Go to Dashboard" button

---

### 2B. Sign In Flow

- **Route:** `/sign-in`
- **Form:** Email + password
- **Validation:** Zod — 8+ chars, uppercase, lowercase, number
- **Features:** "Remember me" checkbox, "Forgot password?" link
- **API:** `POST /user/auth/login` → `useLogin()`
- **State:** On success → `authStore.setTokens()` + `authStore.setUser()`, invalidates profile queries
- **Navigation:** On success → `/`
- **Error States:** Form validation inline; API error via toast
- **Note:** Google Sign In button exists in UI but has no handler

---

### 2C. Forgot / Reset Password Flow

#### Forgot Password

- **Route:** `/forgot-password`
- **Form:** Email input
- **API:** `POST /user/auth/password-reset/request` → `usePasswordResetRequest()`
- **Navigation:** On success → `/reset-password?email=...`

#### Reset Password (2-Phase Page)

- **Route:** `/reset-password`
- **Phase 1 — Verify OTP:**
  - Enter OTP code
  - `POST /user/auth/password-reset/verify` → `usePasswordResetVerify()`
  - Returns a `resetToken`
- **Phase 2 — Set New Password:**
  - Enter new password + confirm
  - `POST /user/auth/password-reset/reset` → `usePasswordReset()` with `resetToken`
- **Navigation:** On success → `/sign-in`
- **Error States:** OTP validation errors; password validation errors

---

### 2D. Logout Flow

- **API:** `POST /user/auth/logout` with `refreshToken`
- **State:** On settled (success or error): `authStore.logout()` + `examStore.clearExam()` + `queryClient.clear()`
- **Navigation:** → `/sign-in`

---

### Auth API Endpoints

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/user/auth/register` | POST | `useRegister` | Create account |
| `/user/auth/login` | POST | `useLogin` | Sign in |
| `/user/auth/request-email-otp` | POST | `useRequestEmailOtp` | Send OTP |
| `/user/auth/verify-email` | POST | `useVerifyEmail` | Verify OTP |
| `/user/auth/resend-verification` | POST | `useResendVerification` | Resend OTP |
| `/user/auth/logout` | POST | `useLogout` | Sign out |
| `/user/auth/refresh` | POST | (interceptor) | Refresh access token |
| `/user/auth/password-reset/request` | POST | `usePasswordResetRequest` | Request password reset |
| `/user/auth/password-reset/verify` | POST | `usePasswordResetVerify` | Verify reset OTP |
| `/user/auth/password-reset/reset` | POST | `usePasswordReset` | Set new password |

---

## 3. Exam Flows

### 3A. Starting an Exam

#### Tests Landing Page

- **Route:** `/tests`
- **API:** `GET /student/exams/preferences` → `useExamPreferences()`
- **Display:** Shows exam type card. Links to `/tests/exams`.

#### Subject Selection

- **Route:** `/tests/exams`
- **API:** Uses `useExamPreferences()` to list subjects
- **Display:** Grid of subject cards with search filter
- **User Action:** Click a subject card → opens a DialogStack wizard

#### DialogStack Wizard (per subject)

**Step 1 — Select Test Type:**
- Options: "Practice Test" or "Mock Exam"
- Default: Practice

**Step 2a — Practice Options (if Practice selected):**

| Option | API | Navigation |
|--------|-----|------------|
| **Jump Straight In** | `POST /student/exams/practice/start` → `useStartPractice({subjectId, title})` | → `/exam/:attemptId` |
| **Configure Practice** | Opens Step 3 form | → Step 3 |

- On success: Exam store is hydrated with questions via `examStore.startExam()`
- Error: Alert banner with API error message

**Step 2b — Mock Selection (if Mock selected):**
- **API:** `GET /student/exams/available?subjectId=...&examTypeEnum=MOCK` → `useAvailableExams()`
- **Display:** List of available mock exams with question count, duration, attempt count
- **User Action:** Select a mock, click "Start Mock"
- **API:** `POST /student/exams/:id/start` → `useStartExam(selectedMockId)`
- **Navigation:** → `/exam/:attemptId`

**Step 3 — Configure Practice (optional):**
- **Form Fields:** Question count slider (10–100), time limit dropdown, difficulty dropdown, question type dropdown, year dropdown
- **API:** `POST /student/exams/practice/configure` → `useConfigurePractice()`
- **Navigation:** → `/exam/:attemptId`

---

### 3B. Exam In Progress

- **Route:** `/exam/:attemptId`
- **State Source:** Zustand `examStore` (persisted to `localStorage`)
- **Nav Behavior:** Navigation bar is hidden during exams (focused experience)

#### Features

| Feature | Description | API |
|---------|-------------|-----|
| **Question Rendering** | `RichContentRenderer` supports text, markdown, LaTeX, images, audio, video, tables, diagrams, lists | — |
| **Answer Submission** | Per-question submit | `POST /student/exams/attempts/:id/responses` |
| **Practice Mode Explanations** | Shows solution, working steps, key points, common mistakes, tips after each answer. When structured fields (workingSteps, keyPoints, etc.) are empty, the solution text is parsed for embedded section markers (see Explanation Section Parsing below) | — |
| **Timer** | Counts down from `timeRemaining`. Auto-completes when timer hits 0 | — |
| **Pause/Resume** | Toggle timer and save state | `POST .../pause` / `POST .../resume` |
| **Bookmark** | Toggle bookmark on current question | `POST` (bookmark endpoint) |
| **Report Question** | Modal with reason field | `POST` (report endpoint) |
| **Exit Confirmation** | Dialog warns about leaving. Pauses exam on confirm | — |
| **Question Navigator** | Grid of question numbers, color-coded: gray=unanswered, yellow=answered-not-submitted, green=submitted, red=current | — |
| **Complete Exam** | Bulk submits un-submitted answers, then completes | `POST .../responses/bulk` + `POST .../complete` |
| **Browser Close** | `beforeunload` handler warns user | — |

#### Question Types Supported

| Type | Component | Input Method |
|------|-----------|-------------|
| `SINGLE_CHOICE` | `SingleChoiceQuestion` | Radio-style selection |
| `MULTIPLE_CHOICE` | `MultipleChoiceQuestion` | Checkbox-style multi-select |
| `TRUE_FALSE` | `TrueFalseQuestion` | Two-option choice |
| `FILL_IN_BLANK` | `FillInBlankQuestion` | Text input |
| `ESSAY` | `EssayQuestion` | Textarea |
| Unknown | Fallback | Textarea |

#### Rich Content Block Types

The `RichContentRenderer` supports 9 block types:

1. **text** — Styled text with bold/italic/color. Preserves `\n` newlines by inserting `<br />` elements. Supports inline LaTeX combined with newlines.
2. **markdown** — Rendered markdown
3. **latex** — KaTeX rendering (inline `$...$` and display `$$...$$`)
4. **image** — Image with alt text. Handles two data shapes:
   - **Shape A (typed):** `{ type: "image", url: "https://...", alt: "..." }`
   - **Shape B (API actual):** `{ type: "image", value: '{"src":"https://...","alt":null,"title":null}' }` — the `value` JSON string is parsed to extract `src` and `alt`, with fallback to raw URL string
5. **audio** — Audio player
6. **video** — Video player (with YouTube embed detection)
7. **table** — Table with headers and rows
8. **diagram** — Image with positioned annotations
9. **list** — Ordered/unordered lists

---

### 3C. Exam Review

- **Route:** `/exam/review/:attemptId`
- **API:** `GET /student/exams/attempts/:attemptId/review` → `useExamReview(attemptId)`
- **Display:**
  - Score summary banner: pass/fail status, percentage, correct/incorrect/skipped counts, time spent
  - Question navigator sidebar (same color-coded grid)
  - Question-by-question review with correct/incorrect badges
  - Explanations for each question
  - Previous/Next navigation

#### Explanation Section Parsing

The `Explanation` component renders post-answer explanations. It operates in two modes:

**Mode 1 — Structured Data (preferred):** When `workingSteps`, `keyPoints`, `commonMistakes`, or `tips` are populated by the API, the component renders them in dedicated styled sections (step-by-step cards, checkmark lists, etc.). This is the original behavior.

**Mode 2 — Parsed Sections (fallback):** When all structured fields are empty/undefined, the API typically sends everything in a single `solution` text block containing embedded bold markers. The component extracts the plain text and splits it into named sections using regex pattern matching.

**Detected section markers:**

| Bold Marker Pattern | Section Type | Visual Style |
|---------------------|-------------|--------------|
| `**Why other options are incorrect**` / `**Why others are wrong**` | Why Incorrect | Orange bordered card |
| `**Key Terms**` / `**Key Concepts**` | Key Terms | Blue bordered card |
| `**Relatable Example**` / `**Real-world Example**` | Example | Green left-border callout |
| `**References**` | References | Gray bordered card |
| `**Common Mistakes**` | Common Mistakes | Red bordered card |
| `**Tips**` | Tips | Purple bordered card |
| Text before first marker | Main Explanation | Plain prose |

**Fallback:** If no markers are found (only a single "main" section), or if structured data is present, the original rendering path is used unchanged.

---

### 3D. Resume Paused Exam

**Two entry points:**

1. **Home "Continue" section:** Shows up to 4 paused exams with "Resume" button
2. **Activities "Paused" tab:** Full list of paused exams with clickable cards

**Resume Flow:**
1. Call `POST .../resume` → `useResumeExam(attemptId)`
2. Extract questions from response
3. Calculate remaining time: `(durationMinutes × 60 - timeSpentSeconds) / 60`
4. Hydrate exam store via `startExam()`
5. Replay saved responses into store via `submitResponse()` and `setAnswer()`
6. Navigate to `/exam/:attemptId`

---

### 3E. Big Mock / Competition Exams

- **Entry:** Home page `<Competition />` component
- **API:** `GET /student/exams/available?examTypeEnum=BIG_MOCK` → `useAvailableExams()`
- **Display:** Mock exam competition cards on the dashboard
- **User Action:** View details dialog → start exam via `useStartExam()`
- **Navigation:** → `/exam/:attemptId` (same as regular mock exams)

---

### Exam API Endpoints

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/student/exams/preferences` | GET | `useExamPreferences` | User's exam config + subjects |
| `/student/exams/available` | GET | `useAvailableExams` | List available exams |
| `/student/exams/practice/start` | POST | `useStartPractice` | Start practice with defaults |
| `/student/exams/practice/configure` | POST | `useConfigurePractice` | Start configured practice |
| `/student/exams/:id/start` | POST | `useStartExam` | Start a specific exam |
| `/student/exams/:id/questions` | GET | `useExamQuestions` | Fetch questions |
| `/student/exams/attempts/:id/responses` | POST | `useSubmitResponse` | Submit single answer |
| `/student/exams/attempts/:id/responses/bulk` | POST | `useSubmitResponsesBulk` | Bulk submit answers |
| `/student/exams/attempts/:id/pause` | POST | `usePauseExam` | Pause attempt |
| `/student/exams/attempts/:id/resume` | POST | `useResumeExam` | Resume attempt |
| `/student/exams/attempts/:id/complete` | POST | `useCompleteExam` | Complete attempt |
| `/student/exams/attempts/:id/review` | GET | `useExamReview` | Fetch review data |
| `/student/exams/history` | GET | `useExamHistory` | Completed exams |
| `/student/exams/paused` | GET | `usePausedExams` | Paused exams |
| `/student/exams/bookmarks` | GET | `useBookmarks` | Bookmarked questions |
| `/student/exams/reports` | GET | `useReports` | Reported questions |

---

## 4. Tutorial Flows

### 4A. Tutorial Listing

- **Route:** `/tutorials`
- **API:** `GET /student/tutorials?type=VIDEO_TUTORIAL` → `useTutorials({type: "VIDEO_TUTORIAL"})`
- **Display:** Grid of tutorial cards with cover image, name, subject, chapter count, subscriber count
- **Features:** Search by name (case-insensitive), subject filter dropdown (derived from loaded data)
- **Empty State:** Custom empty component with icon
- **Navigation:** Click card → `/tutorials/:tutorialId`

### 4B. Tutorial Detail

- **Route:** `/tutorials/:tutorialId`
- **API:** `GET /student/tutorials/:id` → `useTutorial(tutorialId)`

#### Three View Modes (Tabs)

**1. Lessons List:**
- Shows all chapters with titles
- Click a chapter to switch to lesson-content mode

**2. Lesson Content:**
- Video player (from chapter's video content)
- Rich text content rendered via `RichContentRenderer`
- Progress tracking: `POST /student/tutorials/:id/progress` → `useUpdateTutorialProgress()`
- Bookmark toggle: `POST /student/tutorials/:id/bookmark` → `useToggleTutorialBookmark()`
- Navigation between chapters (Previous / Next)

**3. Test (Quiz):**
- **Gate:** Must finish all chapters before accessing test tab ("finish tutorial first" message)
- Displays tutorial questions one at a time
- Per-question answer submission
- Final submit: `POST /student/tutorials/:id/submit-questions` → `useSubmitTutorialQuestions()`
- Mark complete: `POST /student/tutorials/:id/complete` → `useMarkTutorialComplete()`
- Completion modal shown on success

### Tutorial API Endpoints

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/student/tutorials` | GET | `useTutorials` | List tutorials |
| `/student/tutorials/bookmarks` | GET | `useBookmarkedTutorials` | Bookmarked tutorials |
| `/student/tutorials/:id` | GET | `useTutorial` | Tutorial detail |
| `/student/tutorials/:id/progress` | POST | `useUpdateTutorialProgress` | Track chapter progress |
| `/student/tutorials/:id/submit-questions` | POST | `useSubmitTutorialQuestions` | Submit quiz answers |
| `/student/tutorials/:id/complete` | POST | `useMarkTutorialComplete` | Mark tutorial done |
| `/student/tutorials/:id/bookmark` | POST | `useToggleTutorialBookmark` | Toggle bookmark |

---

## 5. Textbook Flows

### 5A. Textbook Listing

- **Route:** `/textbooks`
- **API:** `GET /student/tutorials?type=TEXT_TUTORIAL` → `useTutorials({type: "TEXT_TUTORIAL"})`
- **Note:** Textbooks reuse the same tutorial API but filter by `TEXT_TUTORIAL` type
- **Display:** Grid of textbook cards with cover image, name, subject, chapter count, subscriber count
- **Features:** Search by name, subject filter dropdown
- **Navigation:** Click card → `/textbooks/:textbookId`

### 5B. Textbook Detail

- **Route:** `/textbooks/:textbookId`
- **API:** Same as tutorials — `GET /student/tutorials/:id` → `useTutorial(textbookId)`
- **Difference from tutorials:** Renders text content via `RichContentRenderer` instead of video
- Same chapter navigation, progress tracking, bookmark, quiz, and completion flows as tutorials

---

## 6. Subscription & Payment Flows

### 6A. Subscription Management

- **Route:** `/subscription`
- **Entry:** From Settings page "Manage" button or Nav
- **API:** `GET /user/exam-selection/subscriptions` → `useSubscriptions()`
- **Display:** Grid of subscription cards showing exam type, subject count, plan name, status badge (ACTIVE/EXPIRED), payment method

**Actions per subscription:**

| Action | Condition | API | Result |
|--------|-----------|-----|--------|
| **Switch** | ACTIVE and not current focus | `POST /user/exam-selection/switch/:id` | Switches active subscription; invalidates queries |
| **Delete** | Any | `DELETE /user/exam-selection/subscriptions/:id` | Confirmation dialog → removes subscription |

- "Current Focus" label shown for the active subscription
- "Add Subscription" button → `/subscription/add`

### 6B. Add Subscription (3-Step Wizard)

- **Route:** `/subscription/add`

#### Step 1: Category Selection

- **API:** `GET /user/exam-selection/categories` → `useExamCategories()`
- **Display:** Grid of category buttons (excludes "TUTORIAL")
- **User Action:** Click category to proceed

#### Step 2: Exam Selection

- **Form Fields:**
  - Institutional toggle (Switch)
  - Exam type dropdown (from `useExamTypes(category)`)
  - Subject toggle grid (from `useExamSubjects(examType)`, max 9)
  - Number of students slider (2–500, only if institutional)
  - Subscription plan dropdown (from `usePaymentPlans(category, examType, subscriptionType)`)
- **Validation:** Zod — exam type required, 1–9 subjects, plan required
- **On submit:** Advances to Step 3

#### Step 3: Checkout

- **Display:** Plan summary card with price, duration, features, subject count, student count
- **Price calculation:** `basePrice + (numberOfStudents × pricePerStudent)` for institutional
- **Two payment methods:**

| Method | Flow |
|--------|------|
| **Pay Now** | Save exam selection (`POST /user/exam-selection/save`) → Initialize payment (`POST /payment/initialize`) → Redirect to Paystack |
| **Redeem License Code** | Save exam selection → `POST /payment/redeem-license` → On success → `/subscription` |

- Error States: Alert banners for save, payment init, and redeem errors
- Back button navigation between steps

### Payment API Endpoints

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/payment/plans` | GET | `usePaymentPlans` | Fetch payment plans (30min stale) |
| `/payment/pricing-preview` | GET | `usePricingPreview` | Preview pricing |
| `/payment/initialize` | POST | `useInitializePayment` | Initialize Paystack payment |
| `/payment/verify` | POST | `useVerifyPayment` | Verify payment callback |
| `/payment/redeem-license` | POST | `useRedeemLicense` | Redeem license code |
| `/payment/trial` | POST | `useStartTrial` | Start free trial |
| `/payment/institutional-codes` | GET | `useInstitutionalCodes` | Fetch institutional codes |
| `/user/exam-selection/save` | POST | (inline mutation) | Save exam selection |
| `/user/exam-selection/subscriptions` | GET | `useSubscriptions` | List subscriptions |
| `/user/exam-selection/subscriptions/:id` | DELETE | `useDeleteSubscription` | Delete subscription |
| `/user/exam-selection/switch/:id` | POST | `useSwitchSubscription` | Switch active subscription |

---

## 7. Settings & Profile Flows

### 7A. Settings Page

- **Route:** `/settings`
- **Layout:** Three-column on desktop (avatar | form | subscription card), stacked on mobile

#### Avatar Upload

- Drag-and-drop or click-to-upload
- **Max size:** 2MB, image types only
- **Upload:** `POST /user/profile/picture` → `useUploadAvatar()` (multipart/form-data)
- **Remove:** `DELETE /user/profile/picture` → `useRemoveAvatar()`
- **State:** Updates both authStore (for navbar avatar) and profile query cache
- **Error States:** File validation errors (size, type) shown as alert; API errors via toast

#### Profile Form

- **Fields:** Full Name (editable), Email (disabled, with "contact support" note), Phone (editable), Referral Code (read-only with copy button)
- **Validation:** Zod — name 2–50 chars, phone 10–15 chars
- **API:** `PATCH /user/profile` → `useUpdateProfile()` — sends `{fullName, phone}`
- **State:** On success → `authStore.updateUser()` and sets profile query cache
- **Copy referral code:** Uses `navigator.clipboard.writeText()`

#### Subscription Card

- Shows subscription count
- "Manage" button → `/subscription`

### Profile API Endpoints

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/user/profile` | GET | `useProfile` | Fetch user profile (10min stale) |
| `/user/profile` | PATCH | `useUpdateProfile` | Update name/phone |
| `/user/profile/change-password` | PATCH | `useChangePassword` | Change password |
| `/user/profile/statistics` | GET | `useProfileStatistics` | Profile stats |
| `/user/profile/picture` | POST | `useUploadAvatar` | Upload avatar |
| `/user/profile/picture` | DELETE | `useRemoveAvatar` | Remove avatar |

---

## 8. Leaderboard & Progress Flows

### 8A. Leaderboard

- **Route:** `/leaderboard`
- **APIs:**
  - `GET /gamification/leaderboard` → `useLeaderboard({period, limit: 10})`
  - `GET /gamification/leaderboard/my-rank` → `useMyRank({period})`
- **Period Filter:** Weekly / Monthly / All Time (dropdown in header)
- **Display:**
  - **Left column:** Illustration image, motivational message based on rank, rank card showing ordinal position
  - **Right column:** Top 10 leaderboard list with avatars, names (current user shown as "You" with red highlight), XP values

**Motivational Messages:**

| Condition | Message |
|-----------|---------|
| Rank 1 | "You're at the top! Keep up the great work!" |
| Rank 2–3 | "You placed Xth this {period}! Amazing performance!" |
| Rank 4+ | "You placed Xth this {period}, you can do better! Keep pushing!" |
| No rank | "Keep pushing to get on the leaderboard!" |

### 8B. Dashboard Stats

- Shown on home page
- **APIs:**
  - `GET /progress/streaks` → `useStreaks()` — streak days
  - `GET /gamification/leaderboard/my-rank?period=weekly` → `useMyRank()` — weekly rank
- **Display:** Streak days count, weekly rank position
- **CTA:** "Subscribe to New Exam" button → `/subscription/add`

### Progress API Endpoints

| Endpoint | Method | Hook | Purpose |
|----------|--------|------|---------|
| `/progress/overview` | GET | `useProgressOverview` | XP, streaks, goals |
| `/progress/streaks` | GET | `useStreaks` | Streak data |
| `/progress/trends` | GET | `useTrends` | Trend data over N days |
| `/progress/weak-areas` | GET | `useWeakAreas` | Weak areas |
| `/progress/statistics` | GET | `useStatistics` | Full stats |
| `/progress/by-subject` | GET | `useProgressBySubject` | Per-subject progress |
| `/gamification/achievements` | GET | `useAchievements` | Achievement list |
| `/gamification/leaderboard` | GET | `useLeaderboard` | Leaderboard data |
| `/gamification/leaderboard/my-rank` | GET | `useMyRank` | Current user rank |

---

## 9. Activities Flow

- **Route:** `/activities`
- **Layout:** Desktop — sidebar tabs on the left. Mobile — horizontal scrollable tabs at top.

### Four Tabs

#### Tab 1: Paused Exams

- **API:** `GET /student/exams/paused` → `usePausedExams()`
- **Display:** Grid of paused exam cards with exam name, question count, time spent, paused date, "Resume" button
- **Resume Flow:** Calls `useResumeExam(attemptId)` → hydrates exam store → navigates to `/exam/:attemptId`
- **Loading state:** Per-card "Resuming..." badge

#### Tab 2: Completed Exams

- **Sub-tabs:** "Practice Exams" / "Mock Exams"
- **API:** `GET /student/exams/history?examType=PRACTICE|MOCK` → `useExamHistory({examType})`
- **Display:** Grid of completed exam cards with subject name, question count, pass/fail icon, percentage score, score fraction, completion date
- **Navigation:** Click card → `/exam/review/:attemptId`

#### Tab 3: Bookmarked Questions

- **API:** `GET /student/exams/bookmarks` → `useBookmarkedQuestions()`
- **Display:** List of bookmarked question cards with question text (extracted from RichContent), question type badge, difficulty badge, year badge, bookmarked date
- **Text extraction:** Uses `extractTextFromRichContent()` to get plain text from `text`, `markdown`, and `latex` blocks

#### Tab 4: Reported Questions

- **API:** `GET /student/exams/reports` → `useReportedQuestions()`
- **Display:** List of reported question cards with question text, status badge (PENDING/RESOLVED/REVIEWED with color coding), reason, year, reported date

---

## 10. Navigation & Global UI

### Navigation Bar

- **Visibility:** Hidden when `pathname.startsWith('/exam/')` (focused exam experience)
- **Background:** Warm yellow/amber tone (`bg-warning`)

#### Desktop Navigation Links

1. Home (`/`)
2. Textbooks (`/textbooks`)
3. Tests (`/tests`)
4. Tutorials (`/tutorials`)
5. Activities (`/activities`)
6. Leaderboard (`/leaderboard`)

#### Right Actions (Desktop)

- Bell icon (notifications — UI only, no handler)
- Settings icon → `/settings`
- Avatar dropdown menu:
  - User name and email display
  - "Profile" → `/settings`
  - "Logout" → `useLogout()` → `/sign-in`

#### Mobile Navigation

- Hamburger menu toggle
- Avatar dropdown (same as desktop with Profile, Settings, Logout)
- Bell icon
- Collapsible nav drawer with all nav links

#### Active Link Detection

| Route | Match Rule |
|-------|-----------|
| Home | Exact match: `pathname === "/"` |
| All others | Prefix match: `pathname.startsWith(link.url)` |

Active style: white text, primary background, shadow

### Home Page / Dashboard

- **Route:** `/`
- **Components:**
  1. **Greeting:** "Good morning/afternoon/evening, {firstName}"
  2. **`<Stat />`:** Streak days and weekly rank
  3. **`<Continue />`:** Up to 4 paused exams with resume functionality
  4. **`<Competition />`:** Big mock exam competition cards

---

## 11. API Types & Data Models

### User/Auth Types

```typescript
interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  examCategory: string;
  examSubtype: string;
  examTypeId: string;
  selectedSubjects: string[];
  subscriptionPlanId: string;
  isInstitutional: boolean;
  numberOfStudents: number;
  studentId: string;
  // ... (21 fields total)
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  role: string;
  referralCode: string;
  isVerified: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

### Exam Types

```typescript
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

type ExamTypeEnum = "PRACTICE" | "MOCK" | "BIG_MOCK";

type AttemptStatus =
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "EXPIRED"
  | "ABANDONED";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

// Rich content is an array of blocks
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

interface Question {
  id: string;
  questionText: RichContentBlock[];
  questionType: QuestionType;
  options: any[];
  difficulty: Difficulty;
  explanation: ExplanationData;
  correctAnswer: any;
  year: string;
}

interface ExplanationData {
  solution: RichContentBlock[];       // Always present; may contain embedded section markers as bold text
  workingSteps?: WorkingStep[];       // Optional; when empty, solution text is parsed for sections
  keyPoints?: string[];               // Optional
  commonMistakes?: string[];          // Optional
  tips?: string[];                    // Optional
}
// Note: When workingSteps/keyPoints/commonMistakes/tips are all empty,
// the Explanation component parses the solution text for bold markers
// (e.g. **Key Terms**, **References**) and renders them as styled sections.
```

### Payment Types

```typescript
interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerStudent: number;
  currency: string;
  duration: number;
  features: string[];
}

interface InitializePaymentRequest {
  studentId: string;
  subscriptionId: string;
  amount: number;
  subscriptionType: string;
  numberOfSubjects: number;
  numberOfStudents: number;
  schoolType: string;
  examType: string;
  numberOfDays: number;
  metadata: any;
}
```

### Subscription Types

```typescript
interface UserSubscription {
  id: string;
  examType: string;
  examTypeId: string;
  status: "ACTIVE" | "EXPIRED"; // etc.
  subjects: any[];
  subscription: PaymentPlan;
  paymentMethod: string;
  // dates...
}
```

### Tutorial Types

```typescript
interface TutorialListItem {
  id: string;
  name: string;
  type: "VIDEO_TUTORIAL" | "TEXT_TUTORIAL" | "INTERACTIVE";
  subject: { name: string };
  chapterCount: number;
  subscriberCount: number;
}

interface TutorialDetail {
  // Full tutorial with chapters, videos, questions,
  // progress, bookmark status
  chapters: {
    content: RichContentBlock[];
    // ...
  }[];
}
```

### Progress Types

```typescript
interface ProgressOverview {
  totalXP: number;
  weeklyXP: number;
  monthlyXP: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
}

interface LeaderboardEntry {
  id: string;
  fullName: string;
  profilePictureUrl: string;
  xp: number;
  weeklyXP: number;
  monthlyXP: number;
}

interface LeaderboardParams {
  period?: "weekly" | "monthly" | "allTime";
  examType?: string;
  subjectId?: string;
  limit?: number;
  offset?: number;
}
```

---

## 12. State Management (Stores)

All stores use **Zustand** with `persist` middleware.

### Auth Store

- **Storage:** `localStorage` key `exprep-auth`
- **State:** `accessToken`, `refreshToken`, `user`, `isAuthenticated`
- **Actions:** `setTokens()`, `setUser()`, `updateUser()`, `logout()`, `reset()`
- **Selectors:** `useIsAuthenticated()`, `useCurrentUser()`, `useAccessToken()`
- **Used by:** API interceptors, route guards, nav, profile components

### Exam Store

- **Storage:** `localStorage` key `exam-store`
- **Custom serialization:** `responses` field is a `Map<string, any>` that gets converted to/from plain Object for JSON storage
- **State:** `preferences`, `currentAttempt`, `questions[]`, `responses` (Map), `answers` (Record), `currentQuestionIndex`, `timeRemaining`, `timerRunning`
- **Actions:** `startExam()`, `setCurrentQuestion()`, `nextQuestion()`, `previousQuestion()`, `submitResponse()`, `setAnswer()`, `updateTimeRemaining()`, `pauseTimer()`, `resumeTimer()`, `clearExam()`
- **Used by:** Exam in-progress page, resume flow, pause/complete flows

### Registration Store

- **Storage:** `sessionStorage` key `exprep-registration`
- **Purpose:** Persists multi-step registration wizard state across page refreshes within a session
- **State:** `currentStep`, `userType`, `category`, `fullName`, `email`, `phone`, `password` (excluded from persistence), `examType`, `examTypeId`, `duration`, `subjects[]`, `isInstitutional`, `students`, `studentId`
- **Actions:** `setUserType()`, `setBasicInfo()`, `setExamSelection()`, step navigation, `reset()`

### UI Store

- **Storage:** `localStorage` key `exprep-ui`
- **State:** `theme` (light/dark/system), `sidebarOpen`, `activeModal`, `modalData`, `globalLoading`, `notifications[]`
- **Used by:** Theme management, modal system, global loading state

### API Client Patterns

1. **GET Request Deduplication:** Uses a `Map<string, Promise>` to prevent duplicate concurrent GET requests to the same URL
2. **Auth Token Injection:** Request interceptor adds `Authorization: Bearer {accessToken}` header
3. **Token Refresh with Mutex:** Response interceptor catches 401 errors. Uses a mutex (`isRefreshing` flag + `failedQueue` array) to prevent concurrent refresh calls. On refresh success, replays queued requests. On refresh failure, calls `authStore.logout()` and redirects to `/sign-in`

---

## 13. All API Endpoints

### Summary by Group

| Group | Base Path | Count |
|-------|-----------|-------|
| Authentication | `/user/auth/` | 10 |
| Profile | `/user/profile/` | 6 |
| Exams | `/student/exams/` | 16 |
| Progress | `/progress/` | 6 |
| Gamification | `/gamification/` | 3 |
| Tutorials | `/student/tutorials/` | 7 |
| Exam Selection | `/user/exam-selection/` | 7 |
| Payment | `/payment/` | 7 |
| Referral | `/user/referral/` | 4 |
| **Total** | | **~66** |

### Complete Endpoint List

#### Authentication (`/user/auth/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/user/auth/register` | Create account |
| POST | `/user/auth/login` | Sign in |
| POST | `/user/auth/logout` | Sign out |
| POST | `/user/auth/refresh` | Refresh access token |
| POST | `/user/auth/request-email-otp` | Send email OTP |
| POST | `/user/auth/verify-email` | Verify email OTP |
| POST | `/user/auth/resend-verification` | Resend verification OTP |
| POST | `/user/auth/password-reset/request` | Request password reset |
| POST | `/user/auth/password-reset/verify` | Verify reset OTP |
| POST | `/user/auth/password-reset/reset` | Set new password |

#### Profile (`/user/profile/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/user/profile` | Fetch profile |
| PATCH | `/user/profile` | Update name/phone |
| PATCH | `/user/profile/change-password` | Change password |
| GET | `/user/profile/statistics` | Profile statistics |
| POST | `/user/profile/picture` | Upload avatar |
| DELETE | `/user/profile/picture` | Remove avatar |

#### Exams (`/student/exams/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/student/exams/preferences` | User's exam config + subjects |
| GET | `/student/exams/available` | List available exams |
| POST | `/student/exams/practice/start` | Start practice (defaults) |
| POST | `/student/exams/practice/configure` | Start configured practice |
| POST | `/student/exams/:id/start` | Start specific exam |
| GET | `/student/exams/:id/questions` | Fetch questions |
| POST | `/student/exams/attempts/:id/responses` | Submit single answer |
| POST | `/student/exams/attempts/:id/responses/bulk` | Bulk submit answers |
| POST | `/student/exams/attempts/:id/pause` | Pause attempt |
| POST | `/student/exams/attempts/:id/resume` | Resume attempt |
| POST | `/student/exams/attempts/:id/complete` | Complete attempt |
| GET | `/student/exams/attempts/:id/review` | Fetch review data |
| GET | `/student/exams/history` | Completed exams |
| GET | `/student/exams/paused` | Paused exams |
| GET | `/student/exams/bookmarks` | Bookmarked questions |
| GET | `/student/exams/reports` | Reported questions |

#### Tutorials (`/student/tutorials/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/student/tutorials` | List tutorials (filter by type) |
| GET | `/student/tutorials/bookmarks` | Bookmarked tutorials |
| GET | `/student/tutorials/:id` | Tutorial detail |
| POST | `/student/tutorials/:id/progress` | Track chapter progress |
| POST | `/student/tutorials/:id/submit-questions` | Submit quiz answers |
| POST | `/student/tutorials/:id/complete` | Mark tutorial complete |
| POST | `/student/tutorials/:id/bookmark` | Toggle bookmark |

#### Progress (`/progress/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/progress/overview` | XP, streaks, goals |
| GET | `/progress/streaks` | Streak data |
| GET | `/progress/trends` | Trend data |
| GET | `/progress/weak-areas` | Weak areas |
| GET | `/progress/statistics` | Full statistics |
| GET | `/progress/by-subject` | Per-subject progress |

#### Gamification (`/gamification/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/gamification/achievements` | Achievement list |
| GET | `/gamification/leaderboard` | Leaderboard data |
| GET | `/gamification/leaderboard/my-rank` | Current user rank |

#### Exam Selection (`/user/exam-selection/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/user/exam-selection/categories` | Exam categories |
| GET | `/user/exam-selection/exam-types/:category` | Exam types for category |
| GET | `/user/exam-selection/subjects/:examType` | Subjects for exam type |
| POST | `/user/exam-selection/save` | Save exam selection |
| GET | `/user/exam-selection/subscriptions` | List subscriptions |
| DELETE | `/user/exam-selection/subscriptions/:id` | Delete subscription |
| POST | `/user/exam-selection/switch/:id` | Switch active subscription |

#### Payment (`/payment/`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/payment/plans` | Fetch payment plans |
| GET | `/payment/pricing-preview` | Preview pricing |
| POST | `/payment/initialize` | Initialize Paystack payment |
| POST | `/payment/verify` | Verify payment |
| POST | `/payment/redeem-license` | Redeem license code |
| POST | `/payment/trial` | Start free trial |
| GET | `/payment/institutional-codes` | Institutional codes |
