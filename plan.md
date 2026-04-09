```
Project Changes Log - Backend Optimization (April 2026)
```

1. Dynamic Configuration System (SystemConfig)
2. Payment & Wallet Service Enhancements
3. Administrative Tools
4. Business Logic Refinement
5. Type Safety & Infrastructure
6. Verification & Test Coverage
7. Postman Collection Suite Updates

# Project Changes Log - Backend

# Optimization (April 2026)

This document details the optimizations and new features implemented in the
ExamPrep 360 backend during the recent development cycle.

# 1. Dynamic Configuration System

# (SystemConfig)

Introduced a centralized configuration module to manage business rules at runtime
without redeployment.

```
Service: SystemConfigService
Key Features:
getNumber(key) / getString(key): Retrieve typed configuration values.
Managed Keys:
REFERRAL_REWARD_AMOUNT: Dynamic referral commission.
FREE_TRIAL_VIDEO_LIMIT: Max videos for trial users (Default: 1).
FREE_TRIAL_TUTORIAL_LIMIT: Max text tutorials for trial users
(Default: 1).
FREE_TRIAL_QUESTION_LIMIT: Max practice questions (Default: 50).
SUBJECT_CHANGE_LIMIT: Allowed subject modifications (Increased to
3).
```

# 2. Payment & Wallet Service

# Enhancements

Major refactor of the payment flow to support flexible payment methods and
institutional efficiency.

```
Wallet Integration:
initializePayment now supports useWallet: boolean.
Automatically handles partial or full balance deduction before generating
Paystack links.
Promo Code Validation:
Added GET /payment/promo/validate endpoint for customer-side
validation.
Institutional License Optimization:
Transitioned from individual create calls to Prisma.createMany for license
generation.
Fix: Resolved the "20 license code limit" issue; now handles hundreds of
codes in a single transaction.
Deferred Assignment: Added PATCH /payment/institutional-
codes/:id/assign to allow school owners to assign students to codes after
purchase.
```

# 3. Administrative Tools

Enhanced the admin dashboard capabilities for student management and
communication.

```
Bulk Email Communication:
Added POST /admin/student/bulk-email to send targeted HTML emails
to student cohorts based on filters (Exam Type, Level, etc.).
Student Status Controls:
Implemented banStudent and unbanStudent with reason tracking and
cache invalidation.
High-Fidelity Export:
Updated Student Export to include department, faculty, university, and
subscription details.
```

# 4. Business Logic Refinement

```
Subject Constraints: Corrected the modification limit from 2 to 3 subjects.
Mock Exam Validation: Implemented multi-subject mock exam validation to
ensure students are enrolled in all required subjects for a specific exam type.
Trial Restrictions: Enforced granular limits on tutorials and videos for users with
TRIAL subscriptions.
```

# 5. Type Safety & Infrastructure

```
Prisma Transactions: Resolved unsafe any casts in PaymentService by
introducing the TransactionWithRelations type.
Prisma Extensions: Optimized database interactions using custom logic for
license distribution (each institutional code now defaults to maxRedemptions: 1).
```

# 6. Verification & Test Coverage

Passed **104 Unit Tests** ensuring 100% stability for new and modified logic.

```
Payment Service: 14 tests (added wallet/batch logic coverage).
Referral Service: Integrated SystemConfig mocks for dynamic rewards.
Students Service: Added bulk email and ban/unban tests.
Controllers: Full coverage for new endpoints in StudentsController and
PaymentController.
Tutorials: Validated dynamic trial limits.
```

# 7. Postman Collection Suite Updates

Synced the entire Postman suite (15 collections) with the optimized backend
architecture.

```
Unified User Collection (user-postman-collection.json):
Wallet Payments: Added useWallet parameter to all initializePayment
requests.
```

```
Promo Validation: Integrated the new Validate Promo Code request
before checkout.
Institutional Management: Added Assign Email to Institutional
Code for deferred license distribution.
Payment Module (ExPrep_Payment_Module_Postman_Collection.json):
Updated initialization payloads and documented the removed 20-code batch
limit.
Student Module (ExPrep_Student_Module_Postman_Collection.json):
Added Bulk Email Students and administrative Ban/Unban student
requests.
System Config (Exprep_system-config.postman_collection.json):
[NEW] Created to manage runtime business logic (Referral rewards, trial
limits, etc.).
```

**Date:** April 4, 2026 **Status:** All Features & Documentation Verified & Passing
