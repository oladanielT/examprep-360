import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Loader2, Clock, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomPageHeader from "@/components/global/custom-page-header";
import { useExamPreferences, useAvailableExams } from "@/feature/exams/hooks";
import { useStartMockExams } from "@/feature/mock-exam/hooks";
import {
  groupMocksByPaper,
  pickRandomMockPerBucket,
  hasMultiplePapers,
} from "@/feature/mock-exam/paper-utils";
import { cn } from "@/lib/utils";
import type {
  Subject,
  AvailableExam,
  AvailableExamsGrouped,
} from "@/api/types/exam.types";

// Per-paper pick for a subject. The chosen mock is frozen when the user
// selects the subject; switching subjects on/off re-rolls.
interface SubjectPick {
  subject: Subject;
  papers: Array<{
    paperNumber: number;
    paperName: string;
    examId: string;
    exam: AvailableExam;
  }>;
}

function SubjectMockPicker({
  subject,
  selected,
  pick,
  onToggle,
}: {
  subject: Subject;
  selected: boolean;
  pick?: SubjectPick;
  onToggle: (next: SubjectPick | null) => void;
}) {
  const { data, isLoading } = useAvailableExams({
    subjectId: subject.id,
    examTypeEnum: "MOCK",
  });

  const isGrouped = data && !Array.isArray(data);
  const groupedData = isGrouped ? (data as AvailableExamsGrouped) : null;
  const ungroupedData = !isGrouped ? (data as AvailableExam[]) : null;
  const mocks: AvailableExam[] = groupedData
    ? Object.values(groupedData).flat()
    : ungroupedData || [];

  // Group mocks by paper number. Memoize on the underlying mocks array
  // identity so the buckets are stable for the lifetime of this data.
  const buckets = useMemo(() => groupMocksByPaper(mocks), [mocks]);
  const isMultiPaper = hasMultiplePapers(buckets);

  // The "preview" pick is what we'd select if the user taps this card now.
  // It's randomized once per mocks-array, but a frozen `pick` from the
  // parent overrides it so selection is stable while selected.
  const previewPick = useMemo(
    () => pickRandomMockPerBucket(buckets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buckets.length, mocks.length]
  );

  // Normalize either the frozen pick or the random preview to a flat
  // { exam } shape so the totals math doesn't have to branch on which one
  // produced the entry.
  const activeExams: AvailableExam[] = pick
    ? pick.papers.map((p) => p.exam)
    : previewPick.map((p) => p.mock);

  const totalQuestions = activeExams.reduce((sum, exam) => sum + exam.numQuestions, 0);
  const totalMinutes = activeExams.reduce((sum, exam) => sum + exam.durationMinutes, 0);

  const handleClick = () => {
    if (isLoading || buckets.length === 0) return;
    if (selected) {
      onToggle(null);
      return;
    }
    // Freeze the current preview pick into the selection.
    const papers = previewPick.map((p) => ({
      paperNumber: p.paperNumber,
      paperName: p.paperName,
      examId: p.mock.id,
      exam: p.mock,
    }));
    onToggle({ subject, papers });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || buckets.length === 0}
      className={cn(
        "text-left w-full cursor-pointer group transition-all duration-200",
        (isLoading || buckets.length === 0) && "opacity-50 cursor-not-allowed"
      )}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]",
          selected
            ? "border-[#F04F54] bg-red-50/50 shadow-md"
            : "border-gray-100 bg-gradient-to-b from-white to-gray-50/80 shadow-sm hover:shadow-lg hover:border-gray-200 group-hover:-translate-y-0.5"
        )}
      >
        {selected && (
          <div className="absolute top-2.5 right-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#F04F54]" />
          </div>
        )}

        <div className="flex flex-col items-center justify-center px-3 py-5 sm:px-4 sm:py-6">
          <div
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 transition-colors",
              selected ? "bg-red-100" : "bg-amber-50"
            )}
          >
            <img
              width={1000}
              height={1000}
              alt={subject.name}
              src="/img/jamb.png"
              className="object-contain w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>
          <h6 className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight line-clamp-2">
            {subject.name}
          </h6>

          {/* Paper pills — only when the subject has multiple papers */}
          {isMultiPaper && (
            <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
              {buckets.map((b) => (
                <span
                  key={b.paperNumber}
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium border",
                    selected
                      ? "border-[#F04F54] text-[#F04F54]"
                      : "border-gray-300 text-gray-500"
                  )}
                >
                  P{b.paperNumber}
                </span>
              ))}
            </div>
          )}

          {/* Question & duration totals */}
          {isLoading ? (
            <p className="text-[10px] text-gray-400 mt-1.5">Loading...</p>
          ) : buckets.length === 0 ? (
            <p className="text-[10px] text-gray-400 mt-1.5">No mocks available</p>
          ) : (
            <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <BookOpen className="w-3 h-3" />
                {totalQuestions}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {totalMinutes}m
              </span>
              {isMultiPaper && (
                <span className="text-gray-400">
                  · {buckets.length} papers
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </button>
  );
}

function MockExamSetupPage() {
  const navigate = useNavigate();
  const { data: preferences, isLoading: loadingPrefs } = useExamPreferences();
  const startMockExams = useStartMockExams();

  const [picks, setPicks] = useState<Map<string, SubjectPick>>(new Map());
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allSubjects = preferences?.subjects || [];
  const filteredSubjects = searchQuery
    ? allSubjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSubjects;

  // Detect WAEC/NECO/SSCE so we can swap the info banner copy. The runner
  // doesn't need this — it just renders the paper-tab row whenever a
  // subject has >1 paper.
  const examTypeName =
    preferences?.examTypeRecord?.name || preferences?.examSubtype || "";
  const isMultiPaperExam = /waec|neco|wassce|ssce/i.test(examTypeName);

  const totals = useMemo(() => {
    let papers = 0;
    let questions = 0;
    let minutes = 0;
    let anySubjectHasMultiplePapers = false;
    picks.forEach((pick) => {
      if (pick.papers.length > 1) anySubjectHasMultiplePapers = true;
      papers += pick.papers.length;
      pick.papers.forEach((p) => {
        questions += p.exam.numQuestions;
        minutes += p.exam.durationMinutes;
      });
    });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeLabel =
      hours > 0 ? `${hours}hr ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
    return {
      count: picks.size,
      papers,
      questions,
      timeLabel,
      showPapersColumn: anySubjectHasMultiplePapers,
    };
  }, [picks]);

  const handleSubjectToggle = (subject: Subject, next: SubjectPick | null) => {
    setPicks((prev) => {
      const map = new Map(prev);
      if (next === null) {
        map.delete(subject.id);
      } else {
        map.set(subject.id, next);
      }
      return map;
    });
  };

  const handleStartSimulation = () => {
    if (picks.size < 2) {
      setErrorMessage(
        "Please select at least 2 subjects for a combined exam simulation."
      );
      return;
    }
    setErrorMessage("");

    const subjectsInput = Array.from(picks.values()).map((pick) => ({
      subject: pick.subject,
      papers: pick.papers.map((p) => ({
        paperNumber: p.paperNumber,
        paperName: p.paperName,
        examId: p.examId,
      })),
    }));

    startMockExams.mutate(
      { subjects: subjectsInput },
      {
        onSuccess: ({ sessionId }) => {
          navigate({ to: "/mock-exam/$sessionId", params: { sessionId } });
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to start exam simulation. Please try again.";
          setErrorMessage(message);
        },
      }
    );
  };

  if (loadingPrefs) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#F04F54]" />
      </div>
    );
  }

  return (
    <div>
      <CustomPageHeader
        backLink="/tests/exams"
        heading="Exam Simulation"
        subHeading="Select subjects for a combined mock exam"
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search subjects..."
      />

      <div className="py-6 sm:py-8">
        {/* Sticky summary bar */}
        {totals.count > 0 && (
          <div className="sticky top-0 z-10 mb-6">
            <Card className="rounded-2xl border border-[#F04F54]/20 bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-[#F04F54]">
                      {totals.count}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                      Subjects
                    </p>
                  </div>
                  {totals.showPapersColumn && (
                    <>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                          {totals.papers}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                          Papers
                        </p>
                      </div>
                    </>
                  )}
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {totals.questions}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                      Questions
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {totals.timeLabel}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                      Total Time
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStartSimulation}
                  disabled={startMockExams.isPending || totals.count < 2}
                  className="bg-[#F04F54] hover:bg-[#F04F54]/90 text-white rounded-full h-12 px-8 font-semibold text-sm shadow-md"
                >
                  {startMockExams.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    "Start Simulation"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-blue-700">
            {isMultiPaperExam
              ? "Select 2 or more subjects to simulate real exam conditions. All papers (1, 2, and 3 where applicable) will be included — just like the actual WAEC/NECO sitting."
              : "Select 2 or more subjects to simulate real exam conditions. Questions from all subjects will be combined into a single timed session — just like the actual exam."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-8">
          {filteredSubjects.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              {allSubjects.length > 0
                ? "No subjects match your search"
                : "No subjects available"}
            </div>
          )}
          {filteredSubjects.map((subject) => (
            <SubjectMockPicker
              key={subject.id}
              subject={subject}
              selected={picks.has(subject.id)}
              pick={picks.get(subject.id)}
              onToggle={(next) => handleSubjectToggle(subject, next)}
            />
          ))}
        </div>

        {totals.count >= 2 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t sm:hidden z-20">
            <Button
              onClick={handleStartSimulation}
              disabled={startMockExams.isPending}
              className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90 text-white rounded-full h-12 font-semibold shadow-lg"
            >
              {startMockExams.isPending
                ? "Starting..."
                : `Start Simulation (${totals.count} subjects)`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/mock-exam/setup")({
  component: MockExamSetupPage,
});
