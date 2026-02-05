# Mobile Implementation Guide - Recent Changes

This document outlines all recent changes made to the web app that need to be replicated on the mobile side.

---

## Table of Contents

1. [Onboarding Flow Changes](#1-onboarding-flow-changes)
2. [Add Subscription Flow (Existing Users)](#2-add-subscription-flow-existing-users)
3. [Payment Integration](#3-payment-integration)
4. [License Code Redemption](#4-license-code-redemption)
5. [Payment Verification](#5-payment-verification)
6. [Subscription Management](#6-subscription-management)
7. [Tests Page Fixes](#7-tests-page-fixes)
8. [KaTeX/LaTeX Rendering](#8-katexlatex-rendering)
9. [API Types Reference](#9-api-types-reference)

---

## 1. Onboarding Flow Changes

### Overview

The onboarding flow has been simplified to be less intimidating for new users. Subscription plan selection has been **removed** from the registration steps and moved to the checkout page.

### Registration Flow (3 Steps)

```
Welcome → Select Category → Select Exam & Subjects → Summary → Checkout
```

#### Step 1: Welcome Page (`/welcome`)
- User selects account type:
  - **Individual** - Regular student
  - **Institutional** - School/organization (shows student count slider)

#### Step 2: Select Category (`/select-category`)
- User selects exam category (e.g., "Secondary School", "University")
- Categories fetched from: `GET /exams/categories`

#### Step 3: Select Exam & Subjects (`/select-exam`)
- **Exam Type**: Dropdown (e.g., "WAEC", "JAMB", "IJMB")
- **Subjects**: Multi-select toggle (max 9 subjects)
- **Number of Students** (institutional only): Slider (2-500)
- **NO subscription plan selection here** (removed)

#### Step 4: Summary (`/summary`)
- Shows selected exam type and subjects
- **NO subscription plan displayed** (removed)
- "Create Account" button → Creates account → Navigates to `/checkout`
- Shows toast: "Account created successfully!"

#### Step 5: Checkout (`/checkout`)
- **Primary Option**: "Start Free Trial" (Recommended badge)
  - 7-day free trial, no payment required
  - On success: Toast "Free trial started!" → Navigate to `/sign-in`

- **Secondary Option**: "Pay Now" button
  - Expands to show subscription plan selection
  - Plans filtered by `subscriptionType`:
    - Individual users: `subscriptionType: "INDIVIDUAL"`
    - Institutional users: `subscriptionType: "BODY"`
  - Select plan → Pay button shows total amount
  - Redirects to Paystack checkout

- **Alternative**: "Have a License Code?"
  - Expandable input for license code redemption

- **Skip**: "I'll do this later" → Goes to dashboard

### Data Stored During Registration

```typescript
// Registration Store (sessionStorage)
{
  isInstitutional: boolean;
  category: string;           // e.g., "SECONDARY_SCHOOL"
  examType: string;           // e.g., "WAEC"
  examTypeId: string;         // UUID of exam type
  subjects: string[];         // Array of subject IDs
  students: number;           // Number of students (institutional)
  studentId: string;          // Set after account creation
}
```

---

## 2. Add Subscription Flow (Existing Users)

### Route: `/subscription/add`

Existing authenticated users can add new subscriptions through a 3-step wizard.

### Step 1: Category Selection
- Grid of category buttons
- Excludes "TUTORIAL" category
- On select → Move to Step 2

### Step 2: Exam Selection (TanStack Form)

```typescript
// Form Schema
{
  examType: string;           // Required
  subjects: string[];         // Min 1, Max 9
  planId: string;             // Required
  numberOfStudents: number[]; // For institutional
}
```

**Fields:**
- **Institutional Toggle**: Switch to enable institutional mode
- **Exam Type**: Dropdown
- **Subjects**: Multi-select toggle grid (max 9)
- **Number of Students** (institutional): Slider (2-500)
- **Subscription Plan**: Dropdown with pricing

**Plan Fetching:**
```typescript
// Fetch plans based on subscription type
const subscriptionType = isInstitutional ? "BODY" : "INDIVIDUAL";
GET /payment/plans?schoolType={category}&examType={examType}&subscriptionType={subscriptionType}
```

### Step 3: Checkout
- Shows plan summary card with:
  - Plan name, description
  - Exam type, subject count
  - Student count (institutional)
  - "Institutional" badge (if applicable)
  - Total price (base + per-student pricing for institutional)
  - Plan features list

**Actions:**
- **Pay Now**: Initialize payment → Redirect to Paystack
- **License Code**: Redeem institutional license
- ~~**Free Trial**~~: Removed (only available once during onboarding)

### Price Calculation (Institutional)

```typescript
const totalPrice = isInstitutional && plan.pricePerStudent
  ? plan.basePrice + (numberOfStudents * plan.pricePerStudent)
  : plan.basePrice;
```

---

## 3. Payment Integration

### Initialize Payment

**Endpoint:** `POST /payment/initialize`

**Request:**
```typescript
{
  studentId: string;
  subscriptionId: string;      // Plan ID
  amount: number;
  subscriptionType: "INDIVIDUAL" | "BODY";  // NOT "INSTITUTIONAL"
  numberOfSubjects: number;
  numberOfStudents: number;
  schoolType: string;          // Category
  examType: string;
  numberOfDays: number;        // Plan duration
  metadata: {
    callbackUrl: string;       // Where to redirect after payment
  }
}
```

**Response:**
```typescript
{
  transaction: {
    reference: string;
  },
  paymentUrl: string;          // Redirect user here
  accessCode: string;          // Alternative: Paystack access code
}
```

**Implementation:**
```typescript
const callbackUrl = `${baseUrl}/payment-verify?returnUrl=${encodeURIComponent(currentPage)}`;

const response = await initializePayment(request);

// Redirect to Paystack
if (response.paymentUrl) {
  // Preferred: Direct URL
  window.location.href = response.paymentUrl;
} else if (response.accessCode) {
  // Fallback: Build URL from access code
  window.location.href = `https://checkout.paystack.com/${response.accessCode}`;
}
```

### Important Notes

1. **subscriptionType must be "INDIVIDUAL" or "BODY"** - NOT "INSTITUTIONAL"
2. **callbackUrl** should include `returnUrl` param for proper redirect on failure
3. Save exam selection BEFORE initializing payment

---

## 4. License Code Redemption

### Endpoint: `POST /payment/redeem-license`

**Request:**
```typescript
{
  code: string;           // License code
  studentId: string;      // User's ID
  subjects: string[];     // Selected subject IDs
  courses: string[];      // Empty array for non-university
}
```

**Response (Success):**
```typescript
{
  id: string;             // Subscription ID
  // ... subscription details
}
```

**Implementation:**
```typescript
// Before redeeming, save exam selection
await saveExamSelection();

const response = await redeemLicense({
  code: licenseCode,
  studentId: user.id,
  subjects: selectedSubjects,
  courses: [],
});

// Check success (API may return different formats)
if (response.id || response.success) {
  showToast("License code redeemed!");
  navigateToSubscriptions();
}
```

---

## 5. Payment Verification

### Route: `/payment-verify`

After Paystack payment, user is redirected here with query params.

### URL Parameters
```
/payment-verify?reference=TXN_xxx&trxref=TXN_xxx&returnUrl=/subscription/add
```

- `reference` or `trxref`: Payment reference from Paystack
- `returnUrl`: Where to redirect on retry (new parameter)

### Verify Payment

**Endpoint:** `POST /payment/verify`

**Request:**
```typescript
{
  reference: string;
}
```

**Response:**
```typescript
{
  success?: boolean;
  status?: "success" | "failed" | "pending";
  message?: string;        // e.g., "Successful"
}
```

### Success Detection

The API response format varies. Check multiple indicators:

```typescript
const isSuccess =
  response.success ||
  response.status === "success" ||
  (response.message && response.message.toLowerCase().includes("success"));
```

### UI States

1. **Verifying**: Show spinner while API call in progress
2. **Success**: Green checkmark, "Payment Successful!", subscription details, "Go to Dashboard" button
3. **Failed**: Red X, error message, "Try Again" + "Go to Dashboard" buttons

### Retry Navigation

On failure, "Try Again" should navigate to the `returnUrl` parameter:

```typescript
// On retry click
const returnUrl = searchParams.returnUrl || "/checkout";
navigate(returnUrl);
```

This ensures:
- From onboarding checkout → Returns to `/checkout`
- From add subscription → Returns to `/subscription/add`

---

## 6. Subscription Management

### Route: `/subscription`

### Fetching Subscriptions

**Endpoint:** `GET /student/exams/subscriptions`

**Response:**
```typescript
[
  {
    id: string;
    studentId: string;
    subscriptionId: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    startDate: string;
    endDate: string;
    subjects: string[];
    courses: string[];
    examType: string;
    examTypeId: string;
    paymentMethod: string;
    subscription: {
      id: string;
      name: string;
      description: string;
    }
  }
]
```

### Current Focus Detection

Multiple subscriptions can be "ACTIVE". Only ONE is the "Current Focus" - the one matching the user's exam preferences.

```typescript
// Fetch current preferences
const preferences = await getExamPreferences();

// Check if subscription is the focused one
const isFocused = (sub) =>
  preferences.examTypeId
    ? sub.examTypeId === preferences.examTypeId
    : sub.examType === preferences.examSubtype;
```

### UI Logic

```typescript
{subscriptions.map(sub => (
  <SubscriptionCard>
    {/* Status badge */}
    <Badge>{sub.status}</Badge>

    {/* Focus indicator OR Switch button */}
    {isFocused(sub) ? (
      <Text>Current Focus</Text>
    ) : sub.status === "ACTIVE" ? (
      <Button onClick={() => switchSubscription(sub.id)}>Switch</Button>
    ) : null}

    {/* Delete button (always shown) */}
    <Button onClick={() => deleteSubscription(sub.id)}>Delete</Button>
  </SubscriptionCard>
))}
```

### Switch Subscription

**Endpoint:** `POST /student/exams/subscriptions/{id}/switch`

On success, invalidate:
- `subscriptions` query
- `profile` query
- `examPreferences` query

---

## 7. Tests Page Fixes

### Route: `/tests`

### Problem

`examTypeRecord` can be `null` in the API response, but `examSubtype` is still present.

### API Response Example
```typescript
{
  examTypeId: null,
  examTypeRecord: null,      // Can be null!
  examSubtype: "WAEC",       // Fallback value
  subjects: [...],
  // ...
}
```

### Solution

Use fallback chain for display:

```typescript
// Display exam name
const examName = data.examTypeRecord?.name || data.examSubtype || "Exam";

// Show content only if we have exam info
{(data.examTypeRecord || data.examSubtype) && (
  <ExamCard>
    <Title>{examName}</Title>
    <Subtitle>{data.subjects?.length || 0} Subjects</Subtitle>
  </ExamCard>
)}

// Show message if no exam preferences
{!data.examTypeRecord && !data.examSubtype && (
  <Text>No exam preferences found.</Text>
)}
```

### Exam Preferences Hook

Always fetch fresh data (don't rely solely on cache):

```typescript
const useExamPreferences = () => {
  return useQuery({
    queryKey: ["examPreferences"],
    queryFn: fetchExamPreferences,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,  // 5 minutes, not Infinity
  });
};
```

---

## 8. KaTeX/LaTeX Rendering

### Already Configured

The `RichContentRenderer` component supports KaTeX for:
- Tutorials (`/tutorials/{id}`)
- Textbooks (`/textbooks/{id}`)
- Exam questions

### LaTeX Patterns Supported

1. **Inline math**: `$x^2 + y^2 = z^2$`
2. **Display math**: `$$\frac{a}{b}$$`
3. **Dedicated latex blocks**: `{ type: "latex", value: "x^2" }`

### Content Block Types

```typescript
type RichContentBlock =
  | { type: "text"; value: string; style?: TextStyle }
  | { type: "markdown"; content: string }
  | { type: "latex"; value: string | { equation: string; displayMode: boolean } }
  | { type: "image"; url: string; alt?: string }
  | { type: "audio"; url: string }
  | { type: "video"; url: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "diagram"; imageUrl: string; annotations?: Annotation[] }
  | { type: "list"; items: string[] };
```

### Mobile Implementation

For React Native, use `react-native-katex` or `react-native-math-view`:

```tsx
import MathView from 'react-native-math-view';

// Inline
<MathView math="x^2 + y^2" />

// Display mode
<MathView math="\frac{a}{b}" display={true} />
```

---

## 9. API Types Reference

### Payment Plan

```typescript
interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerStudent: number | null;  // For institutional
  currency: string;
  duration: number;                // Days
  features: string[];
  isActive: boolean;
  subscriptionType: "INDIVIDUAL" | "INSTITUTIONAL";
  category: "FIXED" | "FLEXIBLE";
  schoolType: string;
  examType: string;
  examTypeId: string;
}
```

### Initialize Payment Request

```typescript
interface InitializePaymentRequest {
  studentId: string;
  subscriptionId: string;
  amount: number;
  subscriptionType: "INDIVIDUAL" | "BODY";  // API uses "BODY" not "INSTITUTIONAL"
  numberOfSubjects: number;
  numberOfStudents: number;
  schoolType: string;
  examType: string;
  numberOfDays: number;
  metadata: {
    callbackUrl: string;
  };
}
```

### Redeem License Request

```typescript
interface RedeemLicenseRequest {
  code: string;
  studentId: string;
  subjects: string[];
  courses: string[];
}
```

### Start Trial Request

```typescript
interface StartTrialRequest {
  studentId: string;
  subscriptionId: string;  // Plan ID
}
```

### User Subscription

```typescript
interface UserSubscription {
  id: string;
  studentId: string;
  subscriptionId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string | null;
  subjects: string[];
  courses: string[];
  examType: string;
  examTypeId: string;
  paymentMethod: string;
  autoRenew: boolean;
  subscription: {
    id: string;
    name: string;
    description: string;
  };
}
```

### Exam Preferences Response

```typescript
interface ExamPreferencesResponse {
  examTypeId: string | null;
  selectedSubjects: string[];
  selectedCourses: string[];
  examCategory: string;
  examSubtype: string;
  examTypeRecord: {
    id: string;
    name: string;
  } | null;                        // Can be null!
  subjects: Subject[];
  courses: Course[];
}
```

---

## Summary of Key Changes

| Feature | Before | After |
|---------|--------|-------|
| Subscription selection in registration | Yes | No (moved to checkout) |
| Checkout primary option | Pay | Free Trial |
| subscriptionType API value | "INSTITUTIONAL" | "BODY" |
| Payment retry redirect | Always `/checkout` | Dynamic `returnUrl` |
| Subscription focus indicator | Based on `status === "ACTIVE"` | Based on matching `examPreferences` |
| Tests page exam name | `examTypeRecord.name` | `examTypeRecord?.name \|\| examSubtype` |
| License code request | `{ licenseCode }` | `{ code, studentId, subjects, courses }` |

---

## Files Changed (Web)

```
src/routes/_auth/checkout.tsx
src/routes/_auth/summary.tsx
src/routes/_auth/payment-verify.tsx
src/routes/_user/subscription.add.tsx
src/routes/_user/subscription.index.tsx
src/routes/_user/tests/index.tsx
src/feature/auth/components/select-exam-form.tsx
src/feature/subscription/subscription-section.tsx
src/feature/payment/hooks/usePayment.ts
src/feature/exams/hooks/useExams.ts
src/feature/home/components/stat.tsx
src/api/types/payment.types.ts
src/components/questions/RichContentRenderer.tsx
```

---

*Last updated: February 2026*
