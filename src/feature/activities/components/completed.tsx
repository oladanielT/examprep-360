import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExamHistory } from "../hooks/useActivities";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMockExamStore } from "@/stores/mockExamStore";
import type { ExamTypeEnum, ExamHistoryItem } from "@/api/types/exam.types";

// Group mock exams started within 60s of each other as a simulation session
interface SimulationGroup {
  type: "simulation";
  items: ExamHistoryItem[];
}
interface SingleExam {
  type: "single";
  item: ExamHistoryItem;
}
type ExamEntry = SimulationGroup | SingleExam;

function groupMockExams(exams: ExamHistoryItem[]): ExamEntry[] {
  if (exams.length === 0) return [];

  // Sort by startedAt descending
  const sorted = [...exams].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const entries: ExamEntry[] = [];
  let i = 0;

  while (i < sorted.length) {
    const current = sorted[i];
    const currentTime = new Date(current.startedAt).getTime();

    // Collect all exams started within 60s of this one
    const group: ExamHistoryItem[] = [current];
    let j = i + 1;
    while (j < sorted.length) {
      const diff = Math.abs(currentTime - new Date(sorted[j].startedAt).getTime());
      if (diff <= 60_000) {
        group.push(sorted[j]);
        j++;
      } else {
        break;
      }
    }

    if (group.length >= 2) {
      entries.push({ type: "simulation", items: group });
    } else {
      entries.push({ type: "single", item: current });
    }
    i = j;
  }

  return entries;
}

function calcExamScore(exam: ExamHistoryItem) {
  const numQuestions = exam.exam?.numQuestions || 0;
  const correctCount = exam.totalScore ?? 0;
  const percentage =
    numQuestions > 0
      ? Math.round((correctCount / numQuestions) * 100)
      : (exam.percentage ?? 0);
  const passingScore = 50;
  const passed = percentage >= passingScore;
  const examTypeName = exam.exam?.examType?.name || exam.exam?.name || "";
  const isJamb = /jamb|utme/i.test(examTypeName);
  return { numQuestions, correctCount, percentage, passed, isJamb };
}

// Card for a single exam attempt
function SingleExamCard({ exam }: { exam: ExamHistoryItem }) {
  const completedDate = exam.completedAt || exam.submittedAt;
  const formattedDate = completedDate
    ? new Date(completedDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";
  const { numQuestions, correctCount, percentage, passed, isJamb } = calcExamScore(exam);

  return (
    <Link
      to="/exam/review/$attemptId"
      params={{ attemptId: exam.id }}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 hover:shadow-md transition-all block"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          <img
            src="/img/jamb.png"
            alt={exam.exam?.subject?.name || exam.exam?.name || "Exam"}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            {exam.exam?.subject?.name || exam.exam?.name || "Exam"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {numQuestions} questions
          </p>

          {/* Score */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5">
            {passed ? (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span
              className={`text-lg font-bold ${passed ? "text-green-600" : "text-red-600"}`}
            >
              {isJamb ? `${percentage}/100` : `${percentage}%`}
            </span>
            {numQuestions > 0 && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                ({correctCount}/{numQuestions} correct)
              </span>
            )}
          </div>

          {formattedDate && (
            <p className="text-xs text-gray-400 mt-1.5">{formattedDate}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Combined simulation card — navigates to combined review
function SimulationCard({ items }: { items: ExamHistoryItem[] }) {
  const navigate = useNavigate();
  const loadForReview = useMockExamStore((s) => s.loadForReview);

  const stats = useMemo(() => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalJambScore = 0;
    let allPassed = true;
    let isJamb = false;

    const subjects = items.map((exam) => {
      const { numQuestions, correctCount, percentage, passed, isJamb: examIsJamb } =
        calcExamScore(exam);
      totalCorrect += correctCount;
      totalQuestions += numQuestions;
      totalJambScore += percentage;
      if (!passed) allPassed = false;
      if (examIsJamb) isJamb = true;
      return {
        exam,
        name: exam.exam?.subject?.name || exam.exam?.name || "Subject",
        percentage,
        passed,
        correctCount,
        numQuestions,
      };
    });

    const overallPercentage =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const maxJambScore = items.length * 100;

    // A WAEC sitting is a single subject across N papers, so every item
    // shares the same subject name. Detect that so we can swap the badge
    // and the comma-joined subject list to a single-subject summary.
    const uniqueSubjectNames = Array.from(new Set(subjects.map((s) => s.name)));
    const isSingleSubject = uniqueSubjectNames.length === 1;

    return {
      subjects,
      totalCorrect,
      totalQuestions,
      totalJambScore,
      maxJambScore,
      overallPercentage,
      allPassed,
      isJamb,
      isSingleSubject,
      singleSubjectName: isSingleSubject ? uniqueSubjectNames[0] : null,
    };
  }, [items]);

  const completedDate = items[0]?.completedAt || items[0]?.submittedAt;
  const formattedDate = completedDate
    ? new Date(completedDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";

  const handleClick = () => {
    // Generate a stable session ID from the attempt IDs
    const sessionId = items.map((i) => i.id).sort().join("-");

    // Load minimal data into the mock exam store for the review page.
    // Activities exposes each completed attempt as one "subject" with a
    // single paper; the review page flattens to one card per paper, so
    // legacy JAMB-style sessions still render with one card per attempt.
    loadForReview(
      sessionId,
      items.map((exam, i) => ({
        subject: { id: exam.id, name: exam.exam?.subject?.name || exam.exam?.name || "Subject" } as any,
        papers: [
          {
            paperNumber: 1,
            paperName: "Paper 1",
            attemptId: exam.id,
            _legacyIndex: i,
          } as any,
        ],
      }))
    );

    navigate({ to: "/mock-exam/review/$sessionId", params: { sessionId } });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 hover:shadow-md transition-all col-span-full text-left w-full"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          <img
            src="/img/jamb.png"
            alt="Exam Simulation"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              Exam Simulation
            </h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
              {stats.isSingleSubject
                ? `${items.length} paper${items.length !== 1 ? "s" : ""}`
                : `${items.length} subjects`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {stats.isSingleSubject
              ? stats.singleSubjectName
              : stats.subjects.map((s) => s.name).join(" · ")}
          </p>

          {/* Combined Score */}
          <div className="flex items-center gap-2 mt-2.5">
            {stats.allPassed ? (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span
              className={`text-lg font-bold ${stats.allPassed ? "text-green-600" : "text-red-600"}`}
            >
              {stats.isJamb
                ? `${stats.totalJambScore}/${stats.maxJambScore}`
                : `${stats.overallPercentage}%`}
            </span>
            <span className="text-xs text-gray-400">
              ({stats.totalCorrect}/{stats.totalQuestions} correct)
            </span>
          </div>

          {formattedDate && (
            <p className="text-xs text-gray-400 mt-1.5">{formattedDate}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function CompletedExamsList({ examType }: { examType: ExamTypeEnum }) {
  const { data, isLoading } = useExamHistory({ examType });

  const entries = useMemo(() => {
    const exams = data?.items || [];
    if (examType === "MOCK") {
      return groupMockExams(exams);
    }
    return exams.map((item): ExamEntry => ({ type: "single", item }));
  }, [data, examType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No completed exams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {entries.map((entry, idx) =>
        entry.type === "simulation" ? (
          <SimulationCard key={`sim-${idx}`} items={entry.items} />
        ) : (
          <SingleExamCard key={entry.item.id} exam={entry.item} />
        )
      )}
    </div>
  );
}

export default function Completed() {
  return (
    <Tabs defaultValue="practice" className="w-full">
      <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0 w-full justify-start mb-6">
        <TabsTrigger
          value="practice"
          className="data-[state=active]:border-b-2 data-[state=active]:border-[#F04F54] data-[state=active]:text-[#F04F54] data-[state=active]:bg-transparent rounded-none px-4 py-2.5 text-gray-600 text-sm font-medium"
        >
          Practice Exams
        </TabsTrigger>
        <TabsTrigger
          value="mock"
          className="data-[state=active]:border-b-2 data-[state=active]:border-[#F04F54] data-[state=active]:text-[#F04F54] data-[state=active]:bg-transparent rounded-none px-4 py-2.5 text-gray-600 text-sm font-medium"
        >
          Mock Exams
        </TabsTrigger>
      </TabsList>

      <TabsContent value="practice" className="mt-0">
        <CompletedExamsList examType="PRACTICE" />
      </TabsContent>

      <TabsContent value="mock" className="mt-0">
        <CompletedExamsList examType="MOCK" />
      </TabsContent>
    </Tabs>
  );
}
