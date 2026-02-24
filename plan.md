# Notifications Feature Implementation Plan

Based on the Notifications Documentation PDF. Skipping admin endpoints (broadcast/targeted) since this is a student-facing app. Skipping React Native/Flutter sections — web only.

## Overview

Two parts:
1. **In-app notifications** — API-driven notification center (list, read, mark-all-read)
2. **Push notifications** — Firebase Cloud Messaging (FCM token registration, foreground/background handling)

---

## Phase 1: Types & Endpoints

### Modify: `src/api/types/notification.types.ts` (NEW)
- `NotificationType` union: `"ACHIEVEMENT" | "STREAK_REMINDER" | "STREAK_LOST" | "STREAK_FROZEN" | "TASK_ASSIGNED" | "PROMOTION"`
- `Notification` interface: `id, studentId, title, message, type, data, readAt, createdAt`
- `NotificationsResponse`: `{ data: Notification[], meta: { total, page, limit, totalPages } }`

### Modify: `src/api/types/index.ts`
- Add `export * from "./notification.types"`

### Modify: `src/api/endpoints.ts`
- Add `NOTIFICATION_ENDPOINTS`: `LIST`, `MARK_READ(id)`, `MARK_ALL_READ`, `REGISTER_FCM_TOKEN`

---

## Phase 2: Hooks

### Create: `src/feature/notifications/hooks/useNotifications.ts`
- `useNotifications(page, limit, type?)` — GET paginated notifications
- `useMarkAsRead()` — PATCH mark single notification read, invalidates notifications query
- `useMarkAllAsRead()` — PATCH mark all read, invalidates notifications query
- `useRegisterFcmToken()` — PATCH register/update FCM token

### Create: `src/feature/notifications/hooks/index.ts`
- Barrel export

---

## Phase 3: Firebase Setup

### Install: `firebase` npm package

### Create: `src/lib/firebase.ts`
- Initialize Firebase app with env vars (`VITE_FIREBASE_*`)
- Export `getMessaging`, `getToken` helpers
- `requestNotificationPermission()` function: request browser permission → get FCM token → return token
- `onForegroundMessage(callback)` — listen for foreground push messages

### Create: `public/firebase-messaging-sw.js`
- Service worker for background push notification handling
- Imports Firebase messaging compat scripts
- Handles `onBackgroundMessage`

### Modify: `.env`
- Add placeholder Firebase config vars (VITE_FIREBASE_API_KEY, etc.)

---

## Phase 4: FCM Token Registration

### Create: `src/feature/notifications/components/NotificationProvider.tsx`
- Wraps the app (or placed inside authenticated layout)
- On mount (if authenticated): request permission → get FCM token → register with backend via `useRegisterFcmToken`
- Sets up foreground message listener → shows toast via sonner + invalidates notifications query
- No UI — just a side-effect provider

### Modify: `src/routes/_user.tsx` (or wherever the authenticated layout lives)
- Add `<NotificationProvider />` inside the authenticated layout

---

## Phase 5: Notifications Page

### Create: `src/routes/_user/notifications.tsx`
- Full notification center page
- Bell icon header with "Mark all as read" button
- Notification list with type-based icons (ACHIEVEMENT→trophy, STREAK_REMINDER→flame, etc.)
- Unread items highlighted (readAt is null)
- Click to mark as read
- Pagination (load more button)
- Empty state

---

## Phase 6: Nav Bell Icon with Badge

### Modify: `src/components/global/nav.tsx`
- Import `useNotifications` hook (page 1, small limit) to get unread count
- Replace static `<Bell>` icons (desktop + mobile) with a clickable Link to `/notifications`
- Show red dot/badge with unread count (count where `readAt === null`)

---

## Files Summary

| Action | File |
|--------|------|
| CREATE | `src/api/types/notification.types.ts` |
| EDIT   | `src/api/types/index.ts` |
| EDIT   | `src/api/endpoints.ts` |
| CREATE | `src/feature/notifications/hooks/useNotifications.ts` |
| CREATE | `src/feature/notifications/hooks/index.ts` |
| CREATE | `src/lib/firebase.ts` |
| CREATE | `public/firebase-messaging-sw.js` |
| CREATE | `src/feature/notifications/components/NotificationProvider.tsx` |
| CREATE | `src/routes/_user/notifications.tsx` |
| EDIT   | `src/components/global/nav.tsx` |
| EDIT   | `.env` (add Firebase placeholders) |
| EDIT   | Authenticated layout route (add NotificationProvider) |
