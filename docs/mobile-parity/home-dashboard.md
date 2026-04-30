# Home Dashboard — Mobile Parity Spec

The first authenticated screen in the app (`/_user/`). Composed of a top nav, a page header (greeting), and four stacked sections that summarize the user's state.

This doc assumes the patterns set up in `practice-flow.md` and `subscription-flow.md` are already in place.

---

## 1. Page outline

```
<UserLayout>
  <Nav />              // global, always visible except inside /exam/* and /mock-exam/*
  <main max-w-6xl mx-auto px-4 sm:px-6 lg:px-8>
    <HomePage>
      <CustomPageHeader heading="Welcome back, {firstName}" sub="Pick up quickly from where you left off" />
      <FreeTrialBanner />
      <Stat />          // streak + leaderboard rank pill + "Subscribe to New Exam" button
      <Continue />      // "Jump back in" — paused practice exams (max 4)
      <Competition />   // "Mock Exam Competition" — BIG_MOCK exams
    </HomePage>
  </main>
</UserLayout>
```

Auth guard: `isAuthenticated === true` (the `_user` layout redirects to `/sign-in` otherwise).

---

## 2. Global Nav (`<Nav />`)

Sits above every authenticated screen. Hidden on `/exam/*` (focused exam mode).

### Web layout
- Background: `bg-warning` (very pale green/yellow `#DCEFC8`-ish) — full-width strip with the inner nav constrained to `max-w-6xl`, padding `px-4 sm:px-6 lg:px-8 py-4 lg:py-5`.
- Left cluster: `<Logo />` + horizontal nav links (lg+ only).
- Right cluster (lg+): NotificationBell, Settings icon link, Avatar dropdown.
- Mobile (< lg): NotificationBell + Avatar dropdown + hamburger; tapping the hamburger reveals a vertical drawer of the same nav links.

### Nav links (in order)
| URL | Title | Active rule |
|-----|-------|-------------|
| `/` | "home" | exact match `pathname === "/"` |
| `/textbooks` | "Textbooks" | `startsWith` |
| `/tests` | "Tests" | `startsWith` |
| `/tutorials` | "Tutorials" | `startsWith` |
| `/activities` | "Activities" | `startsWith` |
| `/leaderboard` | "Leaderboard" | `startsWith` |
| `/subscription` | "Subscription" | `startsWith` |

- Active link styling: `bg-primary` (green) text-white, soft shadow, semibold.
- Inactive: `text-gray-700`, hover `bg-gray-100`.
- All labels use `capitalize` so "home" renders as "Home".

### Avatar dropdown
- Trigger: `<Avatar>` with `user.profilePictureUrl` or fallback `/img/avatar.png`. `<AvatarFallback>` is the user's initials (max 2 chars, uppercase).
- Width 56 (`w-56`) menu, aligned end. Top section shows full name + email, then a separator.
- Items: **Profile → /settings**, **Manage Subscription → /subscription**, **Referral Program → /referral**, **Wallet → /wallet**, (mobile only adds **Settings → /settings**), separator, **Logout** (red destructive). Logout disables while pending and shows "Logging out...".
- Logout calls `useLogout()` (hits **POST `/user/auth/logout`**) and on success navigates to `/sign-in`.

### Mobile drawer
- Hamburger button toggles `mobileMenuOpen`. When open the icon swaps to `X`.
- Drawer renders below the nav strip, with `border-t border-black/10` and `px-4 pb-4`. Same link list as desktop, full-width pills, padding 12, rounded-md. Tapping a link closes the drawer.

### NotificationBell
A standalone overlay popover, not a route — see section 3.

---

## 3. NotificationBell (popover)

A bell icon with red unread badge. Tapping opens a popover anchored to the right (320 px / 384 px wide).

### Data
- `useNotifications(page=1, limit=10)` — **GET `/user/notifications?page=1&limit=10`**. Returns `{ data: Notification[], pagination }`.
- `useMarkNotificationRead(id)` — **POST `/user/notifications/{id}/read`**.
- `useMarkAllNotificationsRead()` — **POST `/user/notifications/read-all`**.

### `Notification` shape (relevant fields)
```ts
{ id, type, title, message, readAt: string|null, createdAt }
type: "ACHIEVEMENT" | "STREAK_REMINDER" | "STREAK_LOST" | "STREAK_FROZEN" | "TASK_ASSIGNED" | "PROMOTION"
```

### Layout
- Bell icon (24 px, 20 px on mobile via `className="w-5 h-5"`).
- Unread badge: top-right, 16×16 min, `bg-red-500`, white bold 10 px text. Shows count or `9+` if > 9.
- Popover (when open):
  - **Header** (`border-b px-4 py-3`): "Notifications" (semibold 14 px). If `unreadCount > 0`: "Mark all as read" button on the right (CheckCheck icon, 12 px, `text-primary`, hover underline). Disabled while pending.
  - **List** (max-h 320, scrollable):
    - Loading: centered `Loader2` muted spinner, 32 px padding.
    - Empty: `BellOff` icon (32 px muted) + "No notifications yet" (gray-500).
    - Each row: 12-px gap flex; left = 32 px round `bg-gray-100` circle holding the type icon; middle = title (truncate, semibold if unread, gray-700 medium if read), message (clamp 2 lines, gray-500), time-ago (11 px, muted/70); right = 8 px round `bg-primary` dot if unread.
    - Unread row gets `bg-primary/5` background.
  - **Footer** (`border-t px-4 py-2`): centered link "See all notifications" → `/notifications`.

### Type → icon
| type | icon | color |
|------|------|-------|
| ACHIEVEMENT | Trophy | yellow-500 |
| STREAK_REMINDER | Flame | orange-500 |
| STREAK_LOST | Flame | red-500 |
| STREAK_FROZEN | Snowflake | blue-500 |
| TASK_ASSIGNED | ClipboardList | purple-500 |
| PROMOTION | Megaphone | green-500 |

### `getTimeAgo(dateStr)`
- `< 60s` → "just now"
- `< 60m` → "{N}m ago"
- `< 24h` → "{N}h ago"
- `< 7d` → "{N}d ago"
- else `new Date(dateStr).toLocaleDateString()`
- on parse failure → empty string

### Tap handlers
- Tapping a notification:
  1. If `readAt === null`, fire `markRead.mutate(id)` (optimistic OK).
  2. Close popover.
  3. Navigate by `type`:
     - ACHIEVEMENT, TASK_ASSIGNED → `/activities`
     - STREAK_* → `/`
     - PROMOTION → `/subscription`
- "Mark all as read" → `markAllRead.mutate()`.
- Outside-click closes popover.

---

## 4. Page Header (`<CustomPageHeader>`)

Used unchanged from earlier flows. On home, used with no `backLink`, no search, no filter. Heading is dynamic.

- `heading = "Welcome back, {firstName}"` where `firstName = user.fullName.split(" ")[0] || "there"`. `user` resolves to `useProfile().data` if loaded, otherwise `authStore.user` — never null on this screen.
- `subHeading = "Pick up quickly from where you left off"`.
- Style: `border-b p-6 md:py-10`. Heading 24 px semibold tracking-tight. Sub 14–16 px `muted-foreground` `opacity-60`.

Note: on web there's a 24/40 px bottom border. On mobile, drop the bottom border if you'd rather use cards stacked tightly.

---

## 5. FreeTrialBanner (`<FreeTrialBanner />`)

Sits directly under the page header. **Two states**, both rendered as a single rounded gradient card:

### Data hooks
- `useSubscriptions()` → **GET `/user/exam-selection/subscriptions`** — used to determine `hasActive`.
- `useExamPreferences()` → **GET `/student/exams/preferences`** — for `examCategory` and `examTypeRecord.name`.
- `useProfile()` → **GET `/user/profile`** — fallback for category/type when preferences missing.
- `usePaymentPlans(category, examType, "INDIVIDUAL")` → **GET `/payment/plans?...`** — used to grab `plans[0]` to start a trial.
- `useStartTrial()` → **POST `/payment/trial`**.

### Render rule
- While `loadingSubs === true` → render **nothing** (return null). Don't show a placeholder.
- `hasActive = subscriptions?.some(s => s.status === "ACTIVE")` decides which variant to show.

### Variant A — Active (green)
- Container: `mt-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-5`.
- Layout: row on `sm+`, column on mobile.
- Left: 40×40 `rounded-xl bg-green-100` square, centered `CheckCircle2` (20 px, green-600).
- Body: title (semibold 14–16 `#101828`) "Your subscription is active". Sub (12–14 gray-500 truncate) "You have full access to all features. Start practicing now!"
- Right: button "Go to Tests" — `bg-green-600` hover `green-700`, white text, semibold 14, `rounded-full`, padding 12/20. Tap → navigate `/tests/exams`.

### Variant B — No active sub (accent/amber)
- Container: `mt-4 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-orange-50 to-amber-50 p-4 sm:p-5`.
- Left icon block: 40×40 `rounded-xl bg-accent/10`, `Sparkles` (20 px, accent).
- Body: title "Try all features for free". Sub: "Start your free trial — no payment required."
- Right: button "Start Free Trial" — `bg-accent` (red), white, semibold, `rounded-full`. Disabled while `startTrialMutation.isPending` or `loadingPlans`. Pending label: spinner + "Starting...".

### Trial start handler
1. If no `user.id`: toast "Please sign in to start a free trial.".
2. If `plans` not yet loaded (`plans?.[0]` missing): toast "Plans are still loading. Please try again in a moment.".
3. **POST `/payment/trial`** with `{ studentId: user.id, subscriptionId: plans[0].id }`.
4. Success when response has `success` OR `trialEndDate` OR `id`. Toast: "Free trial started!" — sub "You now have access to all features." Navigate to `/tests/exams`.
5. Error toast: API message or "Failed to start free trial. Please try again.".

> **Mobile note:** `loadingSubs === true` returns null deliberately — avoid blank-flash by reserving the same space if you need a deterministic layout.

---

## 6. Stat row (`<Stat />`) — Streak + Leaderboard pill

Container: `flex flex-col gap-4 py-6 sm:py-10 sm:flex-row sm:justify-between sm:items-center`.

### Data
- `useStreaks()` → **GET `/progress/streaks`**. Returns `{ currentStreak, ... }`.
- `useMyRank({ period: "weekly" })` → **GET `/gamification/leaderboard/my-rank?period=weekly`**. Returns `{ rank, ... }`.

### Compute `hasData`
- `currentStreak = streaks?.currentStreak || 0`
- `hasData = currentStreak > 0 || (myRank && myRank.rank > 0)`

### Variant A — `hasData === true` (rich pill)
A `<Link to="/leaderboard">` wrapping a card:
- Container: `border-2 border-green-500 rounded-2xl sm:rounded-full py-4 px-5 sm:py-5 sm:px-8 bg-white flex items-center gap-3 sm:gap-6 hover:shadow-lg transition-all overflow-hidden`.
- **Streak section**: lightning-bolt SVG (20×20, current color, stroke 2) + currentStreak (24 px bold gray-900) + "Days" (14 px gray-500).
- **Stair chart icon** (lg+ only): 32×32 green-500, three rectangles (small → medium → tall) representing growth.
- **Rank text** (min-w-0):
  - line 1 (12–14 px gray-500): "This week, you came in"
  - line 2 (16–18 px bold gray-900): `"{ordinal} place"` where `ordinal = "1st" | "2nd" | "3rd" | "{n}th"` or `"—"` if no rank.
- **Trailing chevron** (gray-400, ml-auto).

### Variant B — empty
Render `<EmptyStat />`:
- Border 1 px, `rounded-full`, `h-16`, `max-w-80`. Inside: "No data" (semibold).

### Right-side CTA: "+ Subscribe to New Exam"
- Always rendered (in both variants).
- Wrapped `<Link to="/subscription/add">`.
- Style: outline button — `text-base font-semibold text-accent bg-transparent border rounded-full px-8 sm:px-20 py-6 sm:py-8 hover:bg-accent/10`, full-width on mobile, auto on `sm+`.

---

## 7. Continue section (`<Continue />`)

Renders a list of paused **practice** exams (mocks excluded) so the user can resume.

### Data
- `usePausedExams()` → **GET `/student/exams/paused`**. Response can be `T[]`, `{ data: T[] }`, or `{ exams: T[] }` — handle all three. Returns `[]` otherwise.
- `useResumeExam()` → **PATCH `/student/exams/attempts/{attemptId}/resume`**.

### Filter
```ts
practiceExams = pausedExams.filter(e => e.exam?.examTypeEnum !== "MOCK")
```
Render at most **4** items.

### Layout
Title row: `<h2>Jump back in</h2>` (semibold 24 px, mb 20).

States:
1. **Loading** — title + centered `Loader2` `#F04F54` spinner (32 px), 32 px vertical padding.
2. **Empty** — title + `<Empty>` card (`border rounded-xl py-8`):
   - "No paused exams" + sub "You don't have any exams in progress. Start a new exam to see it here."
3. **List** — grid: 1 col mobile, 2 col `lg+`, gap 16–20.

### Card per paused exam
- Button (whole card is tappable). `rounded-2xl`, `border-gray-100`, gradient `from-white to-gray-50/80`, soft shadow, hover shadow-lg + border-gray-200, active scale 0.97. `disabled:cursor-wait disabled:opacity-70`.
- Layout: 2-column flex, items stretch.
  - **Left** (icon block): `bg-amber-50/60`, padding 16–20, centered `/img/jamb.png` 48×48 / 56×56.
  - **Right** (content): padding 16–20, `flex-col justify-center min-w-0`:
    - Title (14–16 px semibold gray-900, `line-clamp-1`): `exam.exam?.name || "Practice Exam"`.
    - Meta row (mt 1.5, gap 12, 12 px gray-500):
      - 📖 BookOpen 12 px + `"{numQuestions} Qs"`.
      - 🕐 Clock 12 px + `formatTimeSpent(timeSpentSeconds)` (only when present).
    - **CTA pill** (mt 3):
      - Default: `bg-[#F04F54]` white, semibold 12, `rounded-full`, `px-3.5 py-1.5`, label **"Continue"**.
      - Pending (for the card being resumed): `bg-[#F04F54]/10 text-[#F04F54]`, spinner 12 px + "Resuming...".

### `formatTimeSpent(seconds)`
- `< 0 / undefined` → `null` (omit row).
- `< 3600s` → `"{m}m"`.
- `≥ 3600s`: `hrs = floor/3600`, `mins = mins % 60`. Render `"{hrs}h {mins}m"` if mins>0 else `"{hrs}h"`.

### Resume handler
1. Track `resumingId` (string or null). If something is already resuming, ignore taps.
2. Call `resumeExam.mutate(attemptId)`:
   - Server returns the full attempt + `exam.questions`, `responses`, `timeSpentSeconds`, `exam.durationMinutes`.
   - Compute `remainingTimeMinutes = max(0, (durationSeconds - timeSpent) / 60)`.
   - **Hydrate the local exam store**:
     - `examStore.startExam(data, examQuestions, remainingTimeMinutes)`.
     - For each `response` in `data.responses`: `submitResponse(qid, response)` AND `setAnswer(qid, response.answer)`.
   - Navigate to `/exam/{attemptId}`.
3. On error: clear `resumingId`, toast `error.response?.data?.message` or "This exam is no longer available.", and `queryClient.invalidateQueries(["paused-exams"])` to drop stale rows.

> **Mobile note:** the store hydration is the load-bearing step here. `/exam/$attemptId` does NOT re-fetch — it expects the store populated. Mirror this exactly.

---

## 8. Competition section (`<Competition />`) — Mock Exam Competitions

Lists active "Big Mock" competitions and lets the user start one.

### Data
- `useAvailableExams({ examTypeEnum: "BIG_MOCK" })` → **GET `/student/exams/available?examTypeEnum=BIG_MOCK`**.
- `useStartExam()` → **POST `/student/exams/{id}/start`**.

The response can be a flat array OR a grouped object — this section uses array form only:
```ts
exams = Array.isArray(examsResponse) ? examsResponse : []
```
(Mobile note: be defensive — if the backend ever returns grouped data here, flatten via `Object.values(grouped).flat()`.)

### Layout
Title: `<h2>Mock Exam Competition</h2>` (semibold 24 px, mb 20).

States:
1. **Loading** — title + centered `Loader2 #F04F54` spinner (32 px), 32 px padding.
2. **Empty** — `<Empty>` card:
   - "No competitions available" + sub "There are no mock exam competitions at the moment. Check back later."
3. **List** — grid: 1 / 2 / 3 col, gap 20.

### Card per exam
- `<Card flex-row p-5>`. Two-column row.
  - Left: `/img/mock.png` (full-width image inside its column).
  - Right column:
    - Title (mb 3, 14 px medium): `exam.name`.
    - Description (12 px, opacity 60): `exam.description || "Participate in the exam competition for a chance to win a cash prize"`.
    - Time-remaining line (only when `isActive`): 12 px `text-orange-500 mt-2`, `"{hours}h remaining"`.
    - **CTA**: black `<PrimaryButton>` "Take Mock Exam":
      - `bg-black h-10 mt-4 hover:bg-black/50 text-white`.
      - Disabled when `!isActive` (i.e. `endDate <= now`).
      - Tap: `setSelectedExam(exam); setOpen(true)` — opens dialog.

### Active calculation
- `timeRemaining = new Date(exam.endDate) - now`
- `hoursRemaining = max(0, floor(timeRemaining / 3_600_000))`
- `isActive = timeRemaining > 0`

### Confirmation dialog (`<CustomDialog size="xl">`)
- Body centered, `max-w-sm space-y-3`.
- Header image: `/img/mock.png`, 112×112 centered.
- Title: 18 px medium, `selectedExam.name`.
- Description: opacity 60: `selectedExam.description || "Participate in the exam competition for a chance to win a cash prize. This is available for a limited time, take time out to prepare for the exam before taking it or take it now."`
- Meta block (mt-4, 14 px gray-600, vertical):
  - "Duration: {durationMinutes} minutes"
  - "Questions: {numQuestions}"
  - "Passing Score: {passingScore}%"
- Primary CTA: `bg-[#F04F54] hover:bg-[#F04F54]/60 h-12 text-white`. Label "Start Mock Exam" / "Starting..." while pending. Disabled while pending.
- On Start: `startExam.mutate(selectedExam.id)`:
  - Success: close dialog, navigate to `/exam/{data.id}`.
  - Error toast: API message or "Failed to start exam".

---

## 9. Push notifications (background hook)

The `_user` layout calls `usePushNotifications()` once. On web it asks for browser permission and registers an FCM token via **POST `/user/profile/fcm-token`**. On mobile this should be replaced by your platform's push registration (APNs/FCM on RN/Expo) but the same endpoint is hit to upload the token.

---

## 10. API summary for the home dashboard

| Section | Method | Endpoint | Notes |
|---------|--------|----------|-------|
| Header (greeting) | GET | `/user/profile` | Used to derive `firstName`; cached 10 min. Falls back to `authStore.user`. |
| Free trial banner | GET | `/user/exam-selection/subscriptions` | `hasActive` check. |
| Free trial banner | GET | `/student/exams/preferences` | Source of `examCategory` + `examType`. |
| Free trial banner | GET | `/payment/plans?schoolType=&examType=&subscriptionType=INDIVIDUAL` | Plans list; `plans[0]` used as the trial subscription target. |
| Free trial banner | POST | `/payment/trial` | Body `{ studentId, subscriptionId }`. |
| Stat row | GET | `/progress/streaks` | Returns `{ currentStreak, ... }`. |
| Stat row | GET | `/gamification/leaderboard/my-rank?period=weekly` | Returns `{ rank, ... }`. |
| Continue | GET | `/student/exams/paused` | Multi-shape response. |
| Continue | PATCH | `/student/exams/attempts/{id}/resume` | Returns full attempt incl. questions, responses, timing. |
| Competition | GET | `/student/exams/available?examTypeEnum=BIG_MOCK` | Array (or grouped). |
| Competition | POST | `/student/exams/{id}/start` | Same hook used in tests flow. |
| NotificationBell | GET | `/user/notifications?page=1&limit=10` | `{ data, pagination }`. |
| NotificationBell | POST | `/user/notifications/{id}/read` | Single read. |
| NotificationBell | POST | `/user/notifications/read-all` | Bulk read. |
| Avatar dropdown / Logout | POST | `/user/auth/logout` | Logs out, then navigate `/sign-in`. |
| Background | POST | `/user/profile/fcm-token` | Upload push token. |

---

## 11. Cross-section UI tokens

| Token | Value |
|-------|-------|
| Page wrapper | `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` |
| Nav strip bg | `bg-warning` (pale green/yellow) |
| Active link | `bg-primary` (green) white text, semibold, rounded-md |
| Streak card | `border-2 border-green-500` white bg, rounded-2xl mobile / rounded-full desktop |
| Trial active banner | `from-green-50 to-emerald-50` border `green-200` |
| Trial inactive banner | `from-accent/5 via-orange-50 to-amber-50` border `accent/20` |
| Continue card | `from-white to-gray-50/80` border `gray-100`, hover shadow-lg, active scale 0.97 |
| Continue CTA | `bg-[#F04F54]` red pill on idle, `bg-[#F04F54]/10` red text on resuming |
| Competition card | plain `<Card>` row layout, `flex-row p-5` |
| Competition CTA | `bg-black` (default), `#F04F54` confirm dialog |
| Subscribe CTA | outline, `text-accent`, `border`, hover `bg-accent/10` |
| Notification badge | `bg-red-500` 16×16 round, white 10 px bold |

### Spinners
- Continue + Competition use `Loader2` with `text-[#F04F54]`.
- NotificationBell uses muted `Loader2`.

### Empty states
- `<Empty>` shadcn-style component with title + optional description, wrapped in a soft border (rounded-full or rounded-xl depending on context).

---

## 12. Critical invariants

1. **Greeting falls back gracefully.** `firstName = user.fullName.split(" ")[0] || "there"`. Don't render "undefined" — also accept profile fetching late, since the auth store carries the same shape.
2. **Avatar always has initials fallback.** Compute via `name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)`. Default to "U" if no name.
3. **`/exam/*` and `/mock-exam/*` hide the nav.** Replicate this on mobile (immersive exam mode).
4. **Free-trial banner returns `null` while `loadingSubs`** — don't show a skeleton or it'll flash. Render only after the subscription list is known.
5. **Trial activation hits `plans?.[0]`** — must wait for plans to load before allowing the tap. Same logic mirrors the onboarding checkout's "Start Free Trial".
6. **Continue filters out MOCK** — only `examTypeEnum !== "MOCK"` is resumable individually. Mock simulations have their own multi-attempt resume flow which lives elsewhere.
7. **Resume hydrates the exam store before navigating.** Without this, `/exam/$attemptId` will show "Exam Not Found". The hydration includes `responses` AND `setAnswer` for each response, so the UI knows both "what's submitted" and "what the user previously typed".
8. **Resume failure invalidates the paused-exams query** so the stale entry disappears from the list.
9. **Only first 4 paused exams are shown.** A "View all" link is NOT in the spec — direct users to `/activities` for the full list.
10. **Competition "active" gating uses `endDate`.** Disable the CTA when expired but still render the card; show the orange "{n}h remaining" line only while active.
11. **Notification routing is type-driven.** No deep-linking via `notification.url`; mobile should mirror the explicit type → route table.
12. **Mark-read happens on tap before navigation.** Optimistic local state is fine but the API call must fire — the unread badge depends on `readAt`.
13. **Logout always navigates to `/sign-in`** even if the API call already succeeded (the mutation's `onSuccess` does the navigate). Don't rely on layout guard auto-redirect.
14. **Web's `_user` layout calls `usePushNotifications()` once** — replicate on mobile by registering the platform's push token on the same endpoint.
15. **Layouts are wide containers.** The whole authenticated app is constrained to `max-w-6xl` with horizontal padding — keep the mobile design within native safe areas but mirror the visual hierarchy.

---

## 13. Mapping summary (one-pager)

```
/  (Home)
├─ Nav (always visible except inside /exam/*)
│   ├─ Logo
│   ├─ Links: home, Textbooks, Tests, Tutorials, Activities, Leaderboard, Subscription
│   ├─ NotificationBell (popover) → /notifications "see all"
│   └─ Avatar dropdown → Profile, Manage Subscription, Referral, Wallet, (Settings), Logout
├─ Page header  "Welcome back, {firstName}"
├─ FreeTrialBanner
│   ├─ Active → CTA "Go to Tests"   → /tests/exams
│   └─ Inactive → CTA "Start Free Trial" → POST /payment/trial → /tests/exams
├─ Stat
│   ├─ Streak + weekly rank pill   → /leaderboard
│   └─ "+ Subscribe to New Exam"   → /subscription/add
├─ Continue (Jump back in)
│   └─ Resume card → PATCH /attempts/{id}/resume → hydrate examStore → /exam/{id}
└─ Competition (BIG_MOCK)
    └─ "Take Mock Exam" → CustomDialog → POST /exams/{id}/start → /exam/{id}
```
