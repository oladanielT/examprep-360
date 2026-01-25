# Progress API Implementation Plan

## Overview

This document outlines the comprehensive plan to utilize the new progress APIs (`useStatistics`, `useProgressBySubject`) along with existing unused hooks (`useProgressOverview`, `useTrends`, `useWeakAreas`, `useAchievements`) across the application.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Available APIs & Data Structures](#2-available-apis--data-structures)
3. [Implementation Plan](#3-implementation-plan)
   - [3.1 Home Page Enhancement](#31-home-page-enhancement)
   - [3.2 Settings/Profile Page Enhancement](#32-settingsprofile-page-enhancement)
   - [3.3 New Progress Dashboard Page](#33-new-progress-dashboard-page)
   - [3.4 Activities Page Enhancement](#34-activities-page-enhancement)
4. [Component Specifications](#4-component-specifications)
5. [File Structure](#5-file-structure)
6. [Implementation Priority](#6-implementation-priority)

---

## 1. Current State Analysis

### 1.1 Hook Usage Status

| Hook | Endpoint | Currently Used | Location |
|------|----------|----------------|----------|
| `useStreaks()` | `/progress/streaks` | Yes | `src/feature/home/components/stat.tsx` |
| `useMyRank()` | `/gamification/leaderboard/my-rank` | Yes | Home page, Leaderboard page |
| `useLeaderboard()` | `/gamification/leaderboard` | Yes | `src/routes/_user/leaderboard.tsx` |
| `useProgressOverview()` | `/progress/overview` | **No** | - |
| `useTrends()` | `/progress/trends` | **No** | - |
| `useWeakAreas()` | `/progress/weak-areas` | **No** | - |
| `useStatistics()` | `/progress/statistics` | **No** | - |
| `useProgressBySubject()` | `/progress/by-subject` | **No** | - |
| `useAchievements()` | `/gamification/achievements` | **No** | - |

### 1.2 Current Pages Structure

```
src/routes/_user/
├── index.tsx          # Home/Dashboard - uses useStreaks, useMyRank
├── leaderboard.tsx    # Leaderboard - uses useLeaderboard, useMyRank
├── activities.tsx     # Activities - NO progress hooks
├── settings.tsx       # Settings/Profile - NO progress hooks
└── tests/             # Exams - NO progress hooks
```

---

## 2. Available APIs & Data Structures

### 2.1 API Endpoints

```typescript
// src/api/endpoints.ts
PROGRESS_ENDPOINTS = {
  OVERVIEW: "/progress/overview",
  STREAKS: "/progress/streaks",
  STATISTICS: "/progress/statistics",
  BY_SUBJECT: "/progress/by-subject",
  TRENDS: "/progress/trends",
  WEAK_AREAS: "/progress/weak-areas",
}

GAMIFICATION_ENDPOINTS = {
  ACHIEVEMENTS: "/gamification/achievements",
  LEADERBOARD: "/gamification/leaderboard",
  MY_RANK: "/gamification/leaderboard/my-rank",
}
```

### 2.2 Data Types

```typescript
// ProgressOverview & ProgressStatistics (same structure)
{
  xp: number;                    // Total XP earned
  weeklyXP: number;              // XP earned this week
  currentStreak: number;         // Current streak days
  longestStreak: number;         // Longest streak achieved
  weeklyRank: number;            // Rank on weekly leaderboard
  xpToNextRank: number;          // XP needed for next rank
  totalExams: number;            // Total exams completed
  totalQuestions: number;        // Total questions answered
  totalCorrect: number;          // Total correct answers
  averageScore: number;          // Average score percentage
  totalTimeSpent: number;        // Total time in milliseconds
  activeGoals: Goal[];           // Active goals array
}

// Streaks
{
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;      // ISO date string
  streakFreezeCount: number;     // Available streak freezes
}

// TrendData (array)
{
  date: string;                  // ISO date string
  averageScore: number;          // Score for that day
  xpEarned: number;              // XP earned that day
  examsCompleted: number;        // Exams completed that day
}

// SubjectProgressMap
{
  [subjectId: string]: {
    correct: number;
    total: number;
  }
}

// WeakArea
{
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  accuracy: number;
  questionsAttempted: number;
  suggestedFocus: boolean;
}

// Achievement
{
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}
```

---

## 3. Implementation Plan

### 3.1 Home Page Enhancement

**File:** `src/routes/_user/index.tsx`

**Current State:**
- Displays: Stat (streaks, rank), Continue (paused exams), Competition (mock exams)

**Proposed Changes:**
Add a new `ProgressOverviewCard` component below the existing Stat component.

#### 3.1.1 New Component: `ProgressOverviewCard`

**Location:** `src/feature/home/components/progress-overview-card.tsx`

**Purpose:** Display key statistics at a glance on the home page.

**Data Source:** `useProgressOverview()` or `useStatistics()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  Your Progress                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │    86    │  │    5     │  │   100%   │  │    3     │    │
│  │   Total  │  │ Questions│  │ Average  │  │  Exams   │    │
│  │    XP    │  │ Answered │  │  Score   │  │ Completed│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│  [View Full Progress →]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/home/components/progress-overview-card.tsx

import { useProgressOverview } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export function ProgressOverviewCard() {
  const { data: progress, isLoading } = useProgressOverview();

  if (isLoading) return <ProgressOverviewSkeleton />;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Your Progress</h3>

      <div className="grid grid-cols-4 gap-4">
        <StatItem
          value={progress?.xp ?? 0}
          label="Total XP"
          icon={<XPIcon />}
        />
        <StatItem
          value={progress?.totalQuestions ?? 0}
          label="Questions"
          icon={<QuestionIcon />}
        />
        <StatItem
          value={`${progress?.averageScore ?? 0}%`}
          label="Avg Score"
          icon={<ScoreIcon />}
        />
        <StatItem
          value={progress?.totalExams ?? 0}
          label="Exams"
          icon={<ExamIcon />}
        />
      </div>

      <Link to="/progress" className="text-primary text-sm mt-4 block">
        View Full Progress →
      </Link>
    </Card>
  );
}
```

#### 3.1.2 New Component: `SubjectProgressMini`

**Location:** `src/feature/home/components/subject-progress-mini.tsx`

**Purpose:** Show a compact view of subject-wise progress.

**Data Source:** `useProgressBySubject()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  Subject Performance                                        │
├─────────────────────────────────────────────────────────────┤
│  Mathematics          ████████████░░░░  75% (15/20)        │
│  English              ██████████████░░  90% (18/20)        │
│  Physics              ██████░░░░░░░░░░  40% (8/20)         │
│                                                             │
│  [See All Subjects →]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/home/components/subject-progress-mini.tsx

import { useProgressBySubject } from "@/feature/progress/hooks";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

export function SubjectProgressMini() {
  const { data: subjectProgress, isLoading } = useProgressBySubject();

  if (isLoading) return <SubjectProgressSkeleton />;

  // Convert map to array and sort by accuracy
  const subjects = Object.entries(subjectProgress ?? {})
    .map(([id, data]) => ({
      id,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      correct: data.correct,
      total: data.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3); // Show top 3

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Subject Performance</h3>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <SubjectProgressItem
            key={subject.id}
            subjectId={subject.id}
            accuracy={subject.accuracy}
            correct={subject.correct}
            total={subject.total}
          />
        ))}
      </div>

      <Link to="/progress" className="text-primary text-sm mt-4 block">
        See All Subjects →
      </Link>
    </Card>
  );
}
```

#### 3.1.3 Home Page Integration

**File to modify:** `src/routes/_user/index.tsx`

```typescript
// Add imports
import { ProgressOverviewCard } from "@/feature/home/components/progress-overview-card";
import { SubjectProgressMini } from "@/feature/home/components/subject-progress-mini";

// In the component JSX, add after Stat component:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <ProgressOverviewCard />
  <SubjectProgressMini />
</div>
```

---

### 3.2 Settings/Profile Page Enhancement

**File:** `src/routes/_user/settings.tsx`

**Current State:**
- Only displays profile settings section

**Proposed Changes:**
Add a comprehensive statistics section to the settings page.

#### 3.2.1 New Component: `ProfileStatistics`

**Location:** `src/feature/profile/components/profile-statistics.tsx`

**Purpose:** Display comprehensive user statistics in profile/settings.

**Data Source:** `useStatistics()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Your Statistics                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Learning Progress                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │      86        │  │       3        │  │       5        ││
│  │   Total XP     │  │ Exams Taken    │  │   Questions    ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│                                                             │
│  Performance Metrics                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │     100%       │  │    5/5         │  │    2h 5m       ││
│  │  Avg Score     │  │ Correct Ans    │  │  Study Time    ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│                                                             │
│  Streaks & Ranking                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │    0 days      │  │    2 days      │  │     #1         ││
│  │ Current Streak │  │ Longest Streak │  │  Weekly Rank   ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/profile/components/profile-statistics.tsx

import { useStatistics } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

export function ProfileStatistics() {
  const { data: stats, isLoading } = useStatistics();

  if (isLoading) return <ProfileStatisticsSkeleton />;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <ChartIcon /> Your Statistics
      </h2>

      {/* Learning Progress Section */}
      <section className="mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Learning Progress</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={stats?.xp ?? 0} label="Total XP" />
          <StatCard value={stats?.totalExams ?? 0} label="Exams Taken" />
          <StatCard value={stats?.totalQuestions ?? 0} label="Questions" />
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section className="mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={`${stats?.averageScore ?? 0}%`} label="Avg Score" />
          <StatCard
            value={`${stats?.totalCorrect ?? 0}/${stats?.totalQuestions ?? 0}`}
            label="Correct Answers"
          />
          <StatCard
            value={formatTime(stats?.totalTimeSpent ?? 0)}
            label="Study Time"
          />
        </div>
      </section>

      {/* Streaks & Ranking Section */}
      <section>
        <h3 className="text-sm text-muted-foreground mb-3">Streaks & Ranking</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            value={`${stats?.currentStreak ?? 0} days`}
            label="Current Streak"
          />
          <StatCard
            value={`${stats?.longestStreak ?? 0} days`}
            label="Longest Streak"
          />
          <StatCard
            value={`#${stats?.weeklyRank ?? '-'}`}
            label="Weekly Rank"
          />
        </div>
      </section>
    </Card>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
```

#### 3.2.2 Settings Page Integration

**File to modify:** `src/routes/_user/settings.tsx`

```typescript
// Add import
import { ProfileStatistics } from "@/feature/profile/components/profile-statistics";

// In the component JSX, add the statistics section:
<div className="space-y-6">
  <ProfileStatistics />
  {/* Existing profile settings content */}
</div>
```

---

### 3.3 New Progress Dashboard Page

**File:** `src/routes/_user/progress.tsx` (NEW FILE)

**Purpose:** Comprehensive progress dashboard with all analytics.

#### 3.3.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  📈 Progress Dashboard                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    STATISTICS OVERVIEW                       │   │
│  │  (Same as ProfileStatistics component)                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐   │
│  │     TRENDS CHART         │  │     SUBJECT BREAKDOWN        │   │
│  │                          │  │                              │   │
│  │   📊 Line chart showing  │  │   📊 Bar chart or list      │   │
│  │   - XP over time         │  │   showing accuracy per      │   │
│  │   - Score trends         │  │   subject                   │   │
│  │   - Exams completed      │  │                              │   │
│  │                          │  │                              │   │
│  └──────────────────────────┘  └──────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐   │
│  │     WEAK AREAS           │  │     ACHIEVEMENTS             │   │
│  │                          │  │                              │   │
│  │   ⚠️ Topics needing      │  │   🏆 Unlocked achievements  │   │
│  │   improvement with       │  │   with progress tracking    │   │
│  │   recommendations        │  │                              │   │
│  │                          │  │                              │   │
│  └──────────────────────────┘  └──────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 New Component: `TrendsChart`

**Location:** `src/feature/progress/components/trends-chart.tsx`

**Purpose:** Visualize progress trends over time.

**Data Source:** `useTrends(days)`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  Performance Trends                        [7d] [30d] [All] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  100% ─┼───────────────●─────────●                         │
│   80% ─┼─────────●─────────────────                        │
│   60% ─┼───●─────────────────────────                      │
│   40% ─┼─────────────────────────────                      │
│   20% ─┼─────────────────────────────                      │
│    0% ─┼─────────────────────────────                      │
│        Mon  Tue  Wed  Thu  Fri  Sat  Sun                   │
│                                                             │
│  Legend: ● Average Score  ○ XP Earned                      │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/progress/components/trends-chart.tsx

import { useState } from "react";
import { useTrends } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Using a charting library like recharts or chart.js

export function TrendsChart() {
  const [days, setDays] = useState(7);
  const { data: trends, isLoading } = useTrends(days);

  if (isLoading) return <TrendsChartSkeleton />;

  const chartData = trends?.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: trend.averageScore,
    xp: trend.xpEarned,
    exams: trend.examsCompleted,
  })) ?? [];

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Performance Trends</h3>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="90">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-64">
        {/* Chart component - using recharts example */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              name="Avg Score (%)"
            />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#82ca9d"
              name="XP Earned"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

#### 3.3.3 New Component: `SubjectBreakdown`

**Location:** `src/feature/progress/components/subject-breakdown.tsx`

**Purpose:** Detailed subject-by-subject progress breakdown.

**Data Source:** `useProgressBySubject()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  Subject Breakdown                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mathematics                                                │
│  ████████████████████░░░░░░░░░░  75% (15/20 correct)       │
│                                                             │
│  English                                                    │
│  ██████████████████████████░░░░  90% (18/20 correct)       │
│                                                             │
│  Physics                                                    │
│  ████████████░░░░░░░░░░░░░░░░░░  40% (8/20 correct)        │
│                                                             │
│  Chemistry                                                  │
│  ████████████████████████████░░  95% (19/20 correct)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/progress/components/subject-breakdown.tsx

import { useProgressBySubject } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SubjectBreakdown() {
  const { data: subjectProgress, isLoading } = useProgressBySubject();

  if (isLoading) return <SubjectBreakdownSkeleton />;

  // Convert map to sorted array
  const subjects = Object.entries(subjectProgress ?? {})
    .map(([id, data]) => ({
      id,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      correct: data.correct,
      total: data.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  if (subjects.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Subject Breakdown</h3>
        <p className="text-muted-foreground text-center py-8">
          No subject data available yet. Start practicing to see your progress!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Subject Breakdown</h3>

      <div className="space-y-4">
        {subjects.map((subject) => (
          <SubjectProgressRow
            key={subject.id}
            subjectId={subject.id}
            accuracy={subject.accuracy}
            correct={subject.correct}
            total={subject.total}
          />
        ))}
      </div>
    </Card>
  );
}

function SubjectProgressRow({
  subjectId,
  accuracy,
  correct,
  total
}: {
  subjectId: string;
  accuracy: number;
  correct: number;
  total: number;
}) {
  // You may need to fetch subject name from a subjects store/hook
  const subjectName = useSubjectName(subjectId) ?? subjectId;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-medium">{subjectName}</span>
        <span className="text-sm text-muted-foreground">
          {accuracy}% ({correct}/{total} correct)
        </span>
      </div>
      <Progress value={accuracy} className="h-2" />
    </div>
  );
}
```

#### 3.3.4 New Component: `WeakAreasCard`

**Location:** `src/feature/progress/components/weak-areas-card.tsx`

**Purpose:** Highlight areas needing improvement with recommendations.

**Data Source:** `useWeakAreas()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Areas to Improve                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Physics - Mechanics                              │   │
│  │    Accuracy: 35% | 20 questions attempted           │   │
│  │    [Practice Now →]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟠 Mathematics - Calculus                           │   │
│  │    Accuracy: 48% | 15 questions attempted           │   │
│  │    [Practice Now →]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 English - Grammar                                │   │
│  │    Accuracy: 55% | 30 questions attempted           │   │
│  │    [Practice Now →]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/progress/components/weak-areas-card.tsx

import { useWeakAreas } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function WeakAreasCard() {
  const { data: weakAreas, isLoading } = useWeakAreas();

  if (isLoading) return <WeakAreasSkeleton />;

  if (!weakAreas || weakAreas.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangleIcon /> Areas to Improve
        </h3>
        <p className="text-muted-foreground text-center py-8">
          Great job! No weak areas identified yet.
        </p>
      </Card>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 40) return "text-red-500";
    if (accuracy < 60) return "text-orange-500";
    return "text-yellow-500";
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy < 40) return "🔴";
    if (accuracy < 60) return "🟠";
    return "🟡";
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <AlertTriangleIcon /> Areas to Improve
      </h3>

      <div className="space-y-3">
        {weakAreas.map((area) => (
          <div
            key={`${area.subjectId}-${area.topicId}`}
            className="border rounded-lg p-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {getAccuracyIcon(area.accuracy)}
                  {area.subjectName}
                  {area.topicName && ` - ${area.topicName}`}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Accuracy: <span className={getAccuracyColor(area.accuracy)}>
                    {area.accuracy}%
                  </span> | {area.questionsAttempted} questions attempted
                </div>
              </div>
              {area.suggestedFocus && (
                <Link
                  to="/tests"
                  search={{ subject: area.subjectId, topic: area.topicId }}
                >
                  <Button variant="outline" size="sm">
                    Practice Now →
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

#### 3.3.5 New Component: `AchievementsCard`

**Location:** `src/feature/progress/components/achievements-card.tsx`

**Purpose:** Display user achievements and progress toward locked ones.

**Data Source:** `useAchievements()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  🏆 Achievements                              [View All →]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Unlocked (3)                                               │
│  ┌──────┐  ┌──────┐  ┌──────┐                              │
│  │  🌟  │  │  🎯  │  │  🔥  │                              │
│  │First │  │ 100% │  │ 7Day │                              │
│  │ Exam │  │Score │  │Streak│                              │
│  └──────┘  └──────┘  └──────┘                              │
│                                                             │
│  In Progress                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📚 Bookworm - Complete 50 exams                     │   │
│  │ ████████████░░░░░░░░░░  30/50 (60%)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/progress/components/achievements-card.tsx

import { useAchievements } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AchievementsCard() {
  const { data: achievements, isLoading } = useAchievements();

  if (isLoading) return <AchievementsSkeleton />;

  const unlocked = achievements?.filter((a) => a.unlocked) ?? [];
  const inProgress = achievements?.filter(
    (a) => !a.unlocked && a.progress !== undefined
  ) ?? [];

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <TrophyIcon /> Achievements
        </h3>
        <Link to="/achievements" className="text-primary text-sm">
          View All →
        </Link>
      </div>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <section className="mb-4">
          <h4 className="text-sm text-muted-foreground mb-2">
            Unlocked ({unlocked.length})
          </h4>
          <div className="flex gap-2 flex-wrap">
            {unlocked.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-2 bg-muted/50 rounded-lg w-16"
                title={achievement.description}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-xs text-center truncate w-full">
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* In Progress Achievements */}
      {inProgress.length > 0 && (
        <section>
          <h4 className="text-sm text-muted-foreground mb-2">In Progress</h4>
          <div className="space-y-2">
            {inProgress.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="border rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span>{achievement.icon}</span>
                  <span className="font-medium text-sm">{achievement.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {achievement.description}
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(achievement.progress! / achievement.target!) * 100}
                    className="h-1.5 flex-1"
                  />
                  <span className="text-xs">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {unlocked.length === 0 && inProgress.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          Start practicing to unlock achievements!
        </p>
      )}
    </Card>
  );
}
```

#### 3.3.6 Progress Page Assembly

**File:** `src/routes/_user/progress.tsx` (NEW FILE)

```typescript
// src/routes/_user/progress.tsx

import { createFileRoute } from "@tanstack/react-router";
import { ProfileStatistics } from "@/feature/profile/components/profile-statistics";
import { TrendsChart } from "@/feature/progress/components/trends-chart";
import { SubjectBreakdown } from "@/feature/progress/components/subject-breakdown";
import { WeakAreasCard } from "@/feature/progress/components/weak-areas-card";
import { AchievementsCard } from "@/feature/progress/components/achievements-card";

export const Route = createFileRoute("/_user/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your learning journey and identify areas for improvement
        </p>
      </div>

      {/* Statistics Overview */}
      <ProfileStatistics />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendsChart />
        <SubjectBreakdown />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeakAreasCard />
        <AchievementsCard />
      </div>
    </div>
  );
}
```

---

### 3.4 Activities Page Enhancement

**File:** `src/routes/_user/activities.tsx`

**Current State:**
- Tabs: Paused, Completed, Bookmarked, Reported
- No statistics summary

**Proposed Changes:**
Add a statistics summary card at the top of the page.

#### 3.4.1 New Component: `ActivitiesSummary`

**Location:** `src/feature/activities/components/activities-summary.tsx`

**Purpose:** Quick statistics summary for the activities page.

**Data Source:** `useStatistics()`

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │    3     │  │    5     │  │   100%   │  │   2h 5m  │    │
│  │  Exams   │  │ Questions│  │   Avg    │  │  Total   │    │
│  │ Completed│  │ Answered │  │  Score   │  │   Time   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Details:**

```typescript
// src/feature/activities/components/activities-summary.tsx

import { useStatistics } from "@/feature/progress/hooks";
import { Card } from "@/components/ui/card";

export function ActivitiesSummary() {
  const { data: stats, isLoading } = useStatistics();

  if (isLoading) return <ActivitiesSummarySkeleton />;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{stats?.totalExams ?? 0}</div>
          <div className="text-sm text-muted-foreground">Exams Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats?.totalQuestions ?? 0}</div>
          <div className="text-sm text-muted-foreground">Questions Answered</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats?.averageScore ?? 0}%</div>
          <div className="text-sm text-muted-foreground">Avg Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {formatTime(stats?.totalTimeSpent ?? 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Time</div>
        </div>
      </div>
    </Card>
  );
}
```

#### 3.4.2 Activities Page Integration

**File to modify:** `src/routes/_user/activities.tsx`

```typescript
// Add import
import { ActivitiesSummary } from "@/feature/activities/components/activities-summary";

// In the component JSX, add before tabs:
<ActivitiesSummary />
```

---

## 4. Component Specifications

### 4.1 Shared Components Needed

#### 4.1.1 `StatCard` (Reusable)

**Location:** `src/components/ui/stat-card.tsx`

```typescript
interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export function StatCard({ value, label, icon, trend }: StatCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center">
      {icon && <div className="mb-2">{icon}</div>}
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {trend && (
        <div className={cn(
          "text-xs mt-1",
          trend.direction === "up" ? "text-green-500" : "text-red-500"
        )}>
          {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
        </div>
      )}
    </div>
  );
}
```

#### 4.1.2 Loading Skeletons

Create skeleton components for each new component:
- `ProgressOverviewSkeleton`
- `SubjectProgressSkeleton`
- `TrendsChartSkeleton`
- `WeakAreasSkeleton`
- `AchievementsSkeleton`
- `ProfileStatisticsSkeleton`
- `ActivitiesSummarySkeleton`

---

## 5. File Structure

### 5.1 New Files to Create

```
src/
├── routes/_user/
│   └── progress.tsx                    # NEW: Progress dashboard page
│
├── feature/
│   ├── home/components/
│   │   ├── progress-overview-card.tsx  # NEW: Home page stats card
│   │   └── subject-progress-mini.tsx   # NEW: Home page subject mini
│   │
│   ├── progress/components/
│   │   ├── trends-chart.tsx            # NEW: Trends visualization
│   │   ├── subject-breakdown.tsx       # NEW: Subject details
│   │   ├── weak-areas-card.tsx         # NEW: Weak areas display
│   │   └── achievements-card.tsx       # NEW: Achievements display
│   │
│   ├── profile/components/
│   │   └── profile-statistics.tsx      # NEW: Profile stats section
│   │
│   └── activities/components/
│       └── activities-summary.tsx      # NEW: Activities stats summary
│
└── components/ui/
    └── stat-card.tsx                   # NEW: Reusable stat card
```

### 5.2 Files to Modify

```
src/
├── routes/_user/
│   ├── index.tsx          # Add ProgressOverviewCard, SubjectProgressMini
│   ├── settings.tsx       # Add ProfileStatistics
│   └── activities.tsx     # Add ActivitiesSummary
│
└── feature/progress/hooks/
    └── index.ts           # Ensure all hooks are exported
```

---

## 6. Implementation Priority

### Phase 1: Core Statistics (High Priority)
1. Create `StatCard` shared component
2. Create `ProfileStatistics` component
3. Add to Settings page
4. Create `ActivitiesSummary` component
5. Add to Activities page

### Phase 2: Home Page Enhancement (High Priority)
1. Create `ProgressOverviewCard` component
2. Create `SubjectProgressMini` component
3. Integrate into Home page

### Phase 3: Progress Dashboard (Medium Priority)
1. Create Progress page route
2. Create `TrendsChart` component (requires charting library)
3. Create `SubjectBreakdown` component
4. Create `WeakAreasCard` component
5. Create `AchievementsCard` component
6. Assemble Progress dashboard page

### Phase 4: Polish & Refinement (Lower Priority)
1. Add loading skeletons for all components
2. Add error states and empty states
3. Add animations and transitions
4. Mobile responsive adjustments
5. Add navigation links between pages

---

## 7. Dependencies

### 7.1 Required Libraries

For charts (TrendsChart component):
```bash
pnpm add recharts
# or
pnpm add chart.js react-chartjs-2
```

### 7.2 Existing Dependencies Used

- `@tanstack/react-query` - Data fetching (already installed)
- `@tanstack/react-router` - Routing (already installed)
- UI components from `@/components/ui/` (already installed)

---

## 8. Testing Checklist

- [ ] All hooks return expected data shapes
- [ ] Loading states display correctly
- [ ] Error states are handled gracefully
- [ ] Empty states show appropriate messages
- [ ] Components are responsive on mobile
- [ ] Navigation between pages works correctly
- [ ] Data refreshes appropriately
- [ ] Skeletons match component layouts

---

## 9. Notes

1. **Subject Names**: The `useProgressBySubject()` hook returns subject IDs. You'll need a way to resolve these IDs to subject names (either from a store, another API call, or embed the names in the response).

2. **Chart Library**: Choose between `recharts` (simpler, React-native) or `chart.js` (more powerful, needs wrapper) based on your needs.

3. **Authentication**: All hooks already check `isAuthenticated` from the auth store, so components will only fetch data when the user is logged in.

4. **Caching**: React Query handles caching automatically. Consider setting appropriate `staleTime` values for progress data that doesn't change frequently.
