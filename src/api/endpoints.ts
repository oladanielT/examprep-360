// Authentication endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: "/user/auth/register",
  LOGIN: "/user/auth/login",
  REQUEST_EMAIL_OTP: "/user/auth/request-email-otp",
  VERIFY_EMAIL: "/user/auth/verify-email",
  RESEND_VERIFICATION: "/user/auth/resend-verification",
  REFRESH: "/user/auth/refresh",
  LOGOUT: "/user/auth/logout",
  PASSWORD_RESET_REQUEST: "/user/auth/password-reset/request",
  PASSWORD_RESET_VERIFY: "/user/auth/password-reset/verify",
  PASSWORD_RESET: "/user/auth/password-reset/reset",
  PHONE_SEND_OTP: "/user/auth/phone/send-otp",
  PHONE_VERIFY_OTP: "/user/auth/phone/verify-otp",
  SESSIONS: "/user/auth/sessions",
  GOOGLE_OAUTH: "/user/auth/oauth/google",
} as const;

// Profile endpoints
export const PROFILE_ENDPOINTS = {
  GET: "/user/profile",
  UPDATE: "/user/profile",
  CHANGE_PASSWORD: "/user/profile/change-password",
  STATISTICS: "/user/profile/statistics",
  UPLOAD_PICTURE: "/user/profile/picture",
  REMOVE_PICTURE: "/user/profile/picture",
  FCM_TOKEN: "/user/profile/fcm-token",
} as const;

// Exam endpoints
export const EXAM_ENDPOINTS = {
  AVAILABLE: "/student/exams/available",
  PREFERENCES: "/student/exams/preferences",
  PRACTICE_START: "/student/exams/practice/start",
  PRACTICE_CONFIGURE: "/student/exams/practice/configure",
  START: (id: string) => `/student/exams/${id}/start`,
  QUESTIONS: (id: string) => `/student/exams/${id}/questions`,
  SUBMIT_RESPONSE: (attemptId: string) => `/student/exams/attempts/${attemptId}/responses`,
  SUBMIT_RESPONSES_BULK: (attemptId: string) => `/student/exams/attempts/${attemptId}/responses/bulk`,
  PAUSE: (attemptId: string) => `/student/exams/attempts/${attemptId}/pause`,
  RESUME: (attemptId: string) => `/student/exams/attempts/${attemptId}/resume`,
  COMPLETE: (attemptId: string) => `/student/exams/attempts/${attemptId}/complete`,
  REVIEW: (attemptId: string) => `/student/exams/attempts/${attemptId}/review`,
  HISTORY: "/student/exams/history",
  PAUSED: "/student/exams/paused",
  BOOKMARKS: "/student/exams/bookmarks",
  REPORTS: "/student/exams/reports",
} as const;

// Progress endpoints
export const PROGRESS_ENDPOINTS = {
  OVERVIEW: "/progress/overview",
  STREAKS: "/progress/streaks",
  STATISTICS: "/progress/statistics",
  BY_SUBJECT: "/progress/by-subject",
  TRENDS: "/progress/trends",
  WEAK_AREAS: "/progress/weak-areas",
} as const;

// Gamification endpoints
export const GAMIFICATION_ENDPOINTS = {
  ACHIEVEMENTS: "/gamification/achievements",
  LEADERBOARD: "/gamification/leaderboard",
  MY_RANK: "/gamification/leaderboard/my-rank",
} as const;

// Tasks endpoints
export const TASKS_ENDPOINTS = {
  LIST: "/student/tasks",
  DETAILS: (id: string) => `/student/tasks/${id}`,
  COMPLETE: (id: string) => `/student/tasks/${id}/complete`,
  SUBMIT: (id: string) => `/student/tasks/${id}/submit`,
} as const;

// Tutorials endpoints
export const TUTORIALS_ENDPOINTS = {
  LIST: "/student/tutorials",
  BOOKMARKS: "/student/tutorials/bookmarks",
  DETAILS: (id: string) => `/student/tutorials/${id}`,
  UPDATE_PROGRESS: (id: string) => `/student/tutorials/${id}/progress`,
  SUBMIT_QUESTIONS: (id: string) => `/student/tutorials/${id}/submit-questions`,
  COMPLETE: (id: string) => `/student/tutorials/${id}/complete`,
  BOOKMARK: (id: string) => `/student/tutorials/${id}/bookmark`,
} as const;

// Exam selection endpoints
export const EXAM_SELECTION_ENDPOINTS = {
  CATEGORIES: "/user/exam-selection/categories",
  EXAM_TYPES: (category: string) => `/user/exam-selection/exam-types/${category}`,
  SUBTYPES: (category: string) => `/user/exam-selection/subtypes/${category}`,
  SUBJECTS: (examType: string) => `/user/exam-selection/subjects/${examType}`,
  PROFESSIONAL_HIERARCHY: (examType: string) => `/user/exam-selection/professional-hierarchy/${examType}`,
  SAVE: "/user/exam-selection/save",
  SUBSCRIPTIONS: "/user/exam-selection/subscriptions",
  DELETE_SUBSCRIPTION: (id: string) => `/user/exam-selection/subscriptions/${id}`,
  SWITCH: (id: string) => `/user/exam-selection/switch/${id}`,
} as const;

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  PLANS: "/payment/plans",
  PRICING_PREVIEW: "/payment/pricing-preview",
  INITIALIZE: "/payment/initialize",
  VERIFY: "/payment/verify",
  REDEEM_LICENSE: "/payment/redeem-license",
  START_TRIAL: "/payment/trial",
  INSTITUTIONAL_CODES: "/payment/institutional-codes",
  CODE_REDEMPTIONS: (id: string) => `/payment/institutional-codes/${id}/redemptions`,
  ASSIGN_CODE: (id: string) => `/payment/institutional-codes/${id}/assign`,
  CHANGE_SUBJECTS: (id: string) => `/payment/subscriptions/${id}/subjects`,
  VALIDATE_PROMO: "/payment/promo/validate",
  VALIDATE_ACCESS_GRANT: "/student/promos/validate",
  REDEEM_ACCESS_GRANT: "/student/promos/redeem",
} as const;

// Trial endpoints
export const TRIAL_ENDPOINTS = {
  CHECK: (examTypeId: string) => `/student/exam-types/${examTypeId}/trial`,
  ACTIVATE: (examTypeId: string) => `/student/exam-types/${examTypeId}/trial`,
  QUESTIONS: (entitlementId: string) => `/student/trials/${entitlementId}/questions`,
  START_ATTEMPT: (entitlementId: string) => `/student/trials/${entitlementId}/attempts`,
  PAUSE: (entitlementId: string, attemptId: string) => `/student/trials/${entitlementId}/attempts/${attemptId}/pause`,
  RESUME: (entitlementId: string, attemptId: string) => `/student/trials/${entitlementId}/attempts/${attemptId}/resume`,
  SAVE_RESPONSE: (entitlementId: string, attemptId: string) => `/student/trials/${entitlementId}/attempts/${attemptId}/responses`,
  SUBMIT: (entitlementId: string, attemptId: string) => `/student/trials/${entitlementId}/attempts/${attemptId}/submit`,
  LIST_ATTEMPTS: (entitlementId: string) => `/student/trials/${entitlementId}/attempts`,
  REVIEW_ATTEMPT: (entitlementId: string, attemptId: string) => `/student/trials/${entitlementId}/attempts/${attemptId}/review`,
} as const;


// Referral endpoints
export const REFERRAL_ENDPOINTS = {
  MY_CODE: "/user/referral/my-code",
  VALIDATE: "/user/referral/validate",
  STATS: "/user/referral/stats",
  CLAIM_REWARD: (rewardId: string) => `/user/referral/rewards/${rewardId}/claim`,
} as const;

// Wallet endpoints
export const WALLET_ENDPOINTS = {
  BALANCE: "/user/wallet/balance",
  TRANSACTIONS: "/user/wallet/transactions",
  WITHDRAW: "/user/wallet/withdraw",
  WITHDRAWALS: "/user/wallet/withdrawals",
} as const;

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST: "/user/notifications",
  MARK_READ: (id: string) => `/user/notifications/${id}/read`,
  MARK_ALL_READ: "/user/notifications/read-all",
} as const;
