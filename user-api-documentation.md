# ExPrep User API - Developer Documentation (Detailed)

This documentation provides an exhaustive guide to integrate the ExPrep User Logic.

## Base Configuration

- **Base URL**: `{{baseUrl}}` (Local: `http://localhost:3000`)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}` (Required for protected endpoints)

---

## 1. Authentication & Security

### 1.1 Standard Authentication (`/user/auth`)

#### [POST] /register
+-
Create a new student account.

- **Request Body**:| Field                | Type         | Required | Description                      |
  | -------------------- | ------------ | -------- | -------------------------------- |
  | `email`            | `string`   | Yes      | Valid email address.             |
  | `password`         | `string`   | Yes      | Min 8 characters.                |
  | `fullName`         | `string`   | Yes      | User's full name.                |
  | `phone`            | `string`   | No       | Optional phone number.           |
  | `gender`           | `enum`     | No       | `MALE`, `FEMALE`, `OTHER`. |
  | `examType`         | `enum`     | No       | e.g.,`O_LEVEL`, `A_LEVEL`.   |
  | `examCategory`     | `string`   | No       | e.g.,`POST_JAMB`.              |
  | `selectedSubjects` | `string[]` | No       | Array of subject UUIDs.          |

#### [POST] /login

Authenticate and retrieve session tokens.

- **Request Body**:| Field          | Type        | Required |
  | -------------- | ----------- | -------- |
  | `email`      | `string`  | Yes      |
  | `password`   | `string`  | Yes      |
  | `rememberMe` | `boolean` | No       |
- **Response**: Returns `accessToken`, `refreshToken`, and user object.

#### [POST] /verify-email

Verify email with OTP sent during registration.

- **Request Body**:| Field     | Type       | Required       |
  | --------- | ---------- | -------------- |
  | `email` | `string` | Yes            |
  | `otp`   | `string` | Yes (6 digits) |

#### [POST] /refresh

Get a new `accessToken` using `refreshToken`.

- **Request Body**: `{ "refreshToken": "string" }`

#### [POST] /logout

Invalidate the current session.

- **Request Body**: `{ "refreshToken": "string" }`

### 1.2 Password Reset Flow

1. **Request Code**: `POST /password-reset/request` -> Body: `{ "email": "string" }`
2. **Verify Code**: `POST /password-reset/verify` -> Body: `{ "email": "string", "otp": "string" }` -> Returns `resetToken`.
3. **Reset**: `POST /password-reset/reset` -> Body: `{ "email": "string", "resetToken": "string", "newPassword": "string" }`

### 1.3 Phone Authentication (`/user/auth/phone`)

- **Send OTP**: `POST /send-otp` (Auth Req) -> Body: `{ "phone": "string" }`
- **Verify OTP**: `POST /verify-otp` (Auth Req) -> Body: `{ "phone": "string", "otp": "string" }`
- **Login Request OTP**: `POST /user/auth/login/phone/request-otp` -> Body: `{ "phone": "string" }`
- **Login Verify**: `POST /user/auth/login/phone` -> Body: `{ "phone": "string", "otp": "string" }`

### 1.4 Session Management (`/user/auth/sessions`)

*Authentication Required*

- **Get Sessions**: `GET /` -> Returns list of active devices/tokens.
- **Revoke Session**: `DELETE /:tokenId` -> Invalidates a specific session.
- **Revoke All**: `DELETE /all` -> Logout from all devices except current.

---

## 2. Profile Management (`/user/profile`)

*Authentication Required*

- **Get Profile**: `GET /` -> Returns full user object.
- **Update Profile**: `PATCH /`
  - Body: `fullName`, `phone`, `gender`, `country`, `dateOfBirth`, `academicLevel`, `examType`, etc. (All Optional).
- **Change Password**: `PATCH /change-password`
  - Body: `{ "oldPassword": "...", "newPassword": "..." }`
- **Statistics**: `GET /statistics` -> Returns performance and activity metrics.

---

## 3. Student Exams & Practice (`/student/exams`)

*Authentication Required*

### 3.1 Attempt Lifecycle

- **Start Practice**: `POST /practice/start`
  - Body: `{ "subjectId": "UUID", "topicIds": ["UUID"], "title": "string" }`
- **Start Exam**: `POST /:id/start` -> `:id` is the Exam UUID.
- **Submit Response**: `POST /attempts/:attemptId/responses`
  - Body: `{ "questionId": "UUID", "answer": "any", "timeSpentSeconds": number }`
- **Pause/Resume**: `PATCH /attempts/:attemptId/pause` or `/resume`.
- **Complete**: `POST /attempts/:attemptId/complete`.

### 3.2 Configuration & History

- **Configure Practice**: `POST /practice/configure`
  - Body: `subjectId`, `timeLimit`, `questionCount`, `difficulty` (Enum), `questionTypes` (Enum[]).
- **History**: `GET /history` -> Returns list of previous attempts.
- **Paused Exams**: `GET /paused` -> Returns currently active but paused attempts.

### 3.3 Bookmarks & Reports

- **Get Bookmarks**: `GET /bookmarks` -> Returns bookmarked questions.
- **Toggle Bookmark**: `POST /bookmarks` -> Body: `{ "questionId": "UUID" }`.
- **Get Reports**: `GET /reports` -> Returns user-reported questions.
- **Report Question**: `POST /reports` -> Body: `{ "questionId": "UUID", "reason": "string", "details": "string" }`.

---

## 4. Progress & Gamification

### 4.1 Progress (`/progress`)

- **Overview**: `GET /overview` -> High-level progress data.
- **Streaks**: `GET /streaks` -> Current/Longest streaks.
- **Trends**: `GET /trends?days=7` -> Daily progress chart data.
- **Weak Areas**: `GET /weak-areas` -> Identifies subjects needing work.

### 4.2 Gamification (`/gamification`)

- **Achievements**: `GET /achievements` -> Unlocked and locked achievements.
- **Leaderboard**: `GET /leaderboard`
  - Query: `period` (weekly/monthly/allTime), `examType`, `subjectId`.
- **My Rank**: `GET /leaderboard/my-rank` -> User's standing.

---

## 5. Learning: Tasks & Tutorials

### 5.1 Tasks (`/student/tasks`)

- **List**: `GET /?status=PENDING`
- **Details**: `GET /:id` -> Full task information.
- **Complete**: `PATCH /:id/complete`
- **Submit**: `POST /:id/submit` -> Body: `{ "submissionData": any }`

### 5.2 Tutorials (`/student/tutorials`)

- **List**: `GET /` (Support query params: `subjectId`, `topicId`, `type`, `search`)
- **Details**: `GET /:id` -> Specific tutorial content/video link.
- **Update Progress**: `PATCH /:id/progress`
  - Body: `{ "lastWatchTime": number, "lastChapterId": "string", "testScore": number }`
- **Submit Questions**: `POST /:id/submit-questions` -> Body: `{ "answers": any[] }`
- **Toggle Bookmark**: `POST /:id/bookmark`

---

## 6. System: Exam Selection & Referrals

### 6.1 Exam Selection (`/user/exam-selection`)

- **Metadata**: `GET /categories`, `GET /subtypes/:category`, `GET /subjects/:examType`.
- **Save**: `POST /save` (Auth Req)
  - Body: `{ "examCategory": "Enum", "examSubtype": "string", "selectedSubjects": "UUID[]" }`

### 6.2 Referrals (`/user/referral`)

- **My Code**: `GET /my-code` (Auth Req) -> Returns code and `shareUrl`.
- **Validate**: `POST /validate` -> Body: `{ "referralCode": "string" }`.
- **Stats**: `GET /stats` (Auth Req) -> Returns referral count and successful conversions.
- **Claim Reward**: `POST /rewards/:rewardId/claim`.
