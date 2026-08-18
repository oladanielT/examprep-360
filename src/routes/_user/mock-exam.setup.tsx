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

// Hook-shaped helper that loads a subject's MOCK exams and returns the
// paper buckets. Shared by both JAMB and WAEC flows.
function useSubjectMocks(subjectId: string | null) {
  const { data, isLoading } = useAvailableExams(
    subjectId
      ? { subjectId, examTypeEnum: "MOCK" }
      : { subjectId: "", examTypeEnum: "MOCK" }
  );
  const enabled = !!subjectId;
  const isGrouped = enabled && data && !Array.isArray(data);
  const groupedData = isGrouped ? (data as AvailableExamsGrouped) : null;
  const ungroupedData = enabled && !isGrouped ? (data as AvailableExam[]) : null;
  const mocks: AvailableExam[] = enabled
    ? groupedData
      ? Object.values(groupedData).flat()
      : ungroupedData || []
    : [];
  return { mocks, isLoading: enabled && isLoading };
}

// ============================================================================
// JAMB flow — pick ≥2 subjects, combined session
// ============================================================================

function JambSubjectCard({
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
  const { mocks, isLoading } = useSubjectMocks(subject.id);
  const buckets = useMemo(() => groupMocksByPaper(mocks), [mocks]);
  const isMultiPaper = hasMultiplePapers(buckets);

  const previewPick = useMemo(
    () => pickRandomMockPerBucket(buckets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subject.id, buckets.length, mocks.length]
  );

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

function JambMockSetup({
  subjects,
  searchQuery,
  minSubjects = 2,
}: {
  subjects: Subject[];
  searchQuery: string;
  // Smallest number of subjects needed to start. JAMB combines 2+; Post-UTME
  // is a single-subject exam, so it passes 1.
  minSubjects?: number;
}) {
  const navigate = useNavigate();
  const startMockExams = useStartMockExams();
  const [picks, setPicks] = useState<Map<string, SubjectPick>>(new Map());
  const [errorMessage, setErrorMessage] = useState("");
  const isSingleSubject = minSubjects <= 1;

  const filteredSubjects = searchQuery
    ? subjects.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : subjects;

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
      if (next === null) map.delete(subject.id);
      else map.set(subject.id, next);
      return map;
    });
  };

  const handleStartSimulation = () => {
    if (picks.size < minSubjects) {
      setErrorMessage(
        isSingleSubject
          ? "Please select a subject to start."
          : `Please select at least ${minSubjects} subjects for a combined exam simulation.`
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
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to start exam simulation. Please try again."
          );
        },
      }
    );
  };

  return (
    <>
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
                disabled={startMockExams.isPending || totals.count < minSubjects}
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
          {isSingleSubject
            ? "Select your subject to start a timed mock exam under real exam conditions."
            : "Select 2 or more subjects to simulate real exam conditions. Questions from all subjects will be combined into a single timed session — just like the actual exam."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-8">
        {filteredSubjects.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            {subjects.length > 0
              ? "No subjects match your search"
              : "No subjects available"}
          </div>
        )}
        {filteredSubjects.map((subject) => (
          <JambSubjectCard
            key={subject.id}
            subject={subject}
            selected={picks.has(subject.id)}
            pick={picks.get(subject.id)}
            onToggle={(next) => handleSubjectToggle(subject, next)}
          />
        ))}
      </div>

      {totals.count >= minSubjects && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t sm:hidden z-20">
          <Button
            onClick={handleStartSimulation}
            disabled={startMockExams.isPending}
            className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90 text-white rounded-full h-12 font-semibold shadow-lg"
          >
            {startMockExams.isPending
              ? "Starting..."
              : isSingleSubject
                ? "Start Simulation"
                : `Start Simulation (${totals.count} subjects)`}
          </Button>
        </div>
      )}
    </>
  );
}

// ============================================================================
// WAEC / NECO flow — pick 1 subject, then pick which papers
// ============================================================================

// Subject card for the radio-style WAEC picker. Lighter than the JAMB card
// because totals depend on which papers the user keeps checked, which only
// the parent knows. We just show subject name + paper count from this card.
function WaecSubjectCard({
  subject,
  selected,
  onSelect,
}: {
  subject: Subject;
  selected: boolean;
  onSelect: () => void;
}) {
  const { mocks, isLoading } = useSubjectMocks(subject.id);
  const buckets = useMemo(() => groupMocksByPaper(mocks), [mocks]);
  const hasAnyMocks = buckets.length > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isLoading || !hasAnyMocks}
      className={cn(
        "text-left w-full cursor-pointer group transition-all duration-200",
        (isLoading || !hasAnyMocks) && "opacity-50 cursor-not-allowed"
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
          {isLoading ? (
            <p className="text-[10px] text-gray-400 mt-1.5">Loading...</p>
          ) : !hasAnyMocks ? (
            <p className="text-[10px] text-gray-400 mt-1.5">No mocks available</p>
          ) : (
            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
              {buckets.length} paper{buckets.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </Card>
    </button>
  );
}

// Sticky bar that shows once a subject is selected. All papers for the
// subject are auto-included (one mock per paper kind, randomly chosen).
// The bar is read-only — no user-side paper selection.
function WaecPickedSubjectBar({
  subject,
  onClear,
  isStarting,
  onStart,
}: {
  subject: Subject;
  onClear: () => void;
  isStarting: boolean;
  onStart: (
    papers: Array<{ paperNumber: number; paperName: string; examId: string }>
  ) => void;
}) {
  const { mocks, isLoading } = useSubjectMocks(subject.id);
  const buckets = useMemo(() => groupMocksByPaper(mocks), [mocks]);

  // Roll a random pick per bucket. Stable for the lifetime of this mocks
  // array so the displayed totals don't churn between renders. Includes
  // subject.id so swapping subjects always re-rolls — without it, two
  // subjects with the same bucket+mock counts would share a stale memo.
  const rolledPicks = useMemo(
    () => pickRandomMockPerBucket(buckets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subject.id, buckets.length, mocks.length]
  );

  // Totals across every paper kind — they're all included automatically.
  const totals = useMemo(() => {
    let questions = 0;
    let minutes = 0;
    rolledPicks.forEach((p) => {
      questions += p.mock.numQuestions;
      minutes += p.mock.durationMinutes;
    });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeLabel =
      hours > 0 ? `${hours}hr ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
    return { questions, timeLabel, paperCount: rolledPicks.length };
  }, [rolledPicks]);

  const handleStart = () => {
    const papers = rolledPicks.map((p) => ({
      paperNumber: p.paperNumber,
      paperName: p.paperName,
      examId: p.mock.id,
    }));
    onStart(papers);
  };

  return (
    <div className="sticky top-0 z-10 mb-6">
      <Card className="rounded-2xl border border-[#F04F54]/20 bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                Subject
              </p>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {subject.name}
              </h3>
            </div>
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-gray-700 underline shrink-0"
            >
              Change subject
            </button>
          </div>

          {/* Auto-included papers (read-only). One mock per paper kind,
              picked at random from each bucket. */}
          {isLoading ? (
            <p className="text-xs text-gray-500">Loading papers...</p>
          ) : buckets.length === 0 ? (
            <p className="text-xs text-gray-500">No papers available.</p>
          ) : (
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                Papers (auto-included)
              </p>
              <div className="flex flex-wrap gap-2">
                {rolledPicks.map((p) => (
                  <div
                    key={p.paperNumber}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-[#F04F54] text-white border-[#F04F54]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{p.paperName}</span>
                    <span className="text-[10px] px-1 rounded bg-white/20">
                      {p.mock.numQuestions}q · {p.mock.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals + Start */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#F04F54]">
                  {totals.paperCount}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Papers
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {totals.questions}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Questions
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {totals.timeLabel}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Total Time
                </p>
              </div>
            </div>
            <Button
              onClick={handleStart}
              disabled={isStarting || isLoading || totals.paperCount < 1}
              className="bg-[#F04F54] hover:bg-[#F04F54]/90 text-white rounded-full h-12 px-8 font-semibold text-sm shadow-md"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                "Start Simulation"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function WaecMockSetup({
  subjects,
  searchQuery,
}: {
  subjects: Subject[];
  searchQuery: string;
}) {
  const navigate = useNavigate();
  const startMockExams = useStartMockExams();
  const [pickedSubject, setPickedSubject] = useState<Subject | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredSubjects = searchQuery
    ? subjects.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : subjects;

  const handleSelectSubject = (subject: Subject) => {
    setErrorMessage("");
    if (pickedSubject?.id === subject.id) {
      // Tapping the active subject clears the selection.
      setPickedSubject(null);
      return;
    }
    setPickedSubject(subject);
  };

  const handleClearSubject = () => {
    setPickedSubject(null);
  };

  const handleStart = (
    papers: Array<{ paperNumber: number; paperName: string; examId: string }>
  ) => {
    if (!pickedSubject) return;
    if (papers.length < 1) {
      setErrorMessage("No papers available for this subject.");
      return;
    }
    setErrorMessage("");
    startMockExams.mutate(
      { subjects: [{ subject: pickedSubject, papers }] },
      {
        onSuccess: ({ sessionId }) => {
          navigate({ to: "/mock-exam/$sessionId", params: { sessionId } });
        },
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to start exam simulation. Please try again."
          );
        },
      }
    );
  };

  return (
    <>
      {pickedSubject && (
        <WaecPickedSubjectBar
          subject={pickedSubject}
          onClear={handleClearSubject}
          isStarting={startMockExams.isPending}
          onStart={handleStart}
        />
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
          Pick a subject. Every paper for that subject (Paper 1, 2, 3 where
          applicable) is auto-included — one mock per paper kind, chosen at random
          each sitting. All papers run on one shared timer, just like the actual
          WAEC/NECO sitting.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-8">
        {filteredSubjects.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            {subjects.length > 0
              ? "No subjects match your search"
              : "No subjects available"}
          </div>
        )}
        {filteredSubjects.map((subject) => (
          <WaecSubjectCard
            key={subject.id}
            subject={subject}
            selected={pickedSubject?.id === subject.id}
            onSelect={() => handleSelectSubject(subject)}
          />
        ))}
      </div>
    </>
  );
}

// ============================================================================
// NCEE / Common Entrance flow — Paper 1 and Paper 2 are stored as separate
// per-year subjects ("NCEE 2024 paper 1", "NCEE 2024 paper 2", ...). A mock
// auto-combines ONE random Paper 1 with ONE random Paper 2 (any year each) into
// a single combined sitting. A "Shuffle" button re-rolls the pick.
// ============================================================================

// Detect the paper number from a subject name like "NCEE 2024 paper 1".
// Checks "2" before "1" so "paper 1" never matches as 2 and vice-versa.
function parsePaperKindFromSubject(name: string): 1 | 2 | null {
  if (/paper\s*2\b/i.test(name)) return 2;
  if (/paper\s*1\b/i.test(name)) return 1;
  return null;
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}hr ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
}

function NceeMockSetup({ subjects }: { subjects: Subject[] }) {
  const navigate = useNavigate();
  const startMockExams = useStartMockExams();
  const [errorMessage, setErrorMessage] = useState("");
  // Bumping this re-rolls both the chosen year-subjects and the mock per paper.
  const [shuffleKey, setShuffleKey] = useState(0);

  const { paper1Subjects, paper2Subjects } = useMemo(() => {
    const p1: Subject[] = [];
    const p2: Subject[] = [];
    subjects.forEach((s) => {
      const kind = parsePaperKindFromSubject(s.name);
      if (kind === 1) p1.push(s);
      else if (kind === 2) p2.push(s);
    });
    return { paper1Subjects: p1, paper2Subjects: p2 };
  }, [subjects]);

  // Roll a random Paper 1 subject and a random Paper 2 subject (independent
  // years). Re-rolls whenever the pools change or the user taps Shuffle.
  const chosenP1 = useMemo(
    () => pickRandom(paper1Subjects),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paper1Subjects, shuffleKey]
  );
  const chosenP2 = useMemo(
    () => pickRandom(paper2Subjects),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paper2Subjects, shuffleKey]
  );

  // Load the mocks for just the two rolled subjects and pick one mock each.
  const p1Mocks = useSubjectMocks(chosenP1?.id ?? null);
  const p2Mocks = useSubjectMocks(chosenP2?.id ?? null);

  const p1Pick = useMemo(
    () => pickRandom(p1Mocks.mocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p1Mocks.mocks, shuffleKey]
  );
  const p2Pick = useMemo(
    () => pickRandom(p2Mocks.mocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p2Mocks.mocks, shuffleKey]
  );

  const loading = p1Mocks.isLoading || p2Mocks.isLoading;

  const rows = [
    { kind: 1 as const, subject: chosenP1, pick: p1Pick },
    { kind: 2 as const, subject: chosenP2, pick: p2Pick },
  ];
  const startablePapers = rows.filter((r) => r.subject && r.pick);

  const totals = useMemo(() => {
    let questions = 0;
    let minutes = 0;
    startablePapers.forEach((r) => {
      questions += r.pick!.numQuestions;
      minutes += r.pick!.durationMinutes;
    });
    return {
      questions,
      timeLabel: formatMinutes(minutes),
      paperCount: startablePapers.length,
    };
  }, [startablePapers]);

  const handleShuffle = () => {
    setErrorMessage("");
    setShuffleKey((k) => k + 1);
  };

  const handleStart = () => {
    if (startablePapers.length === 0) {
      setErrorMessage("No NCEE mock papers are available right now.");
      return;
    }
    setErrorMessage("");
    const subjectsInput = startablePapers.map((r) => ({
      subject: r.subject!,
      papers: [
        {
          paperNumber: r.kind,
          paperName: `Paper ${r.kind}`,
          examId: r.pick!.id,
        },
      ],
    }));
    startMockExams.mutate(
      { subjects: subjectsInput },
      {
        onSuccess: ({ sessionId }) => {
          navigate({ to: "/mock-exam/$sessionId", params: { sessionId } });
        },
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to start NCEE mock. Please try again."
          );
        },
      }
    );
  };

  const noPapersConfigured =
    paper1Subjects.length === 0 && paper2Subjects.length === 0;

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 mb-6">
        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs sm:text-sm text-blue-700">
          Your NCEE mock combines a Paper 1 and a Paper 2, picked at random (they
          may be from different years). Both run together on one shared timer —
          tap Shuffle to draw a different pair.
        </p>
      </div>

      {noPapersConfigured ? (
        <Card className="p-6 text-center text-sm text-gray-500">
          No NCEE papers are available for your account yet.
        </Card>
      ) : (
        <Card className="rounded-2xl border border-[#F04F54]/20 bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                Papers (auto-combined)
              </p>
              <button
                onClick={handleShuffle}
                disabled={loading || startMockExams.isPending}
                className="text-xs text-[#F04F54] hover:text-[#F04F54]/80 underline shrink-0 disabled:opacity-50"
              >
                Shuffle
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Drawing papers...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {rows.map((r) => (
                  <div
                    key={r.kind}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border",
                      r.subject && r.pick
                        ? "bg-[#F04F54] text-white border-[#F04F54]"
                        : "bg-white text-gray-400 border-dashed border-gray-300"
                    )}
                  >
                    {r.subject && r.pick ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{r.subject.name}</span>
                        <span className="text-[10px] px-1 rounded bg-white/20 shrink-0 ml-auto">
                          {r.pick.numQuestions}q · {r.pick.durationMinutes}m
                        </span>
                      </>
                    ) : (
                      <span>
                        No Paper {r.kind} mock available — tap Shuffle to retry.
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-[#F04F54]">
                    {totals.paperCount}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Papers
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {totals.questions}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Questions
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {totals.timeLabel}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Total Time
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStart}
                disabled={
                  loading || startMockExams.isPending || totals.paperCount < 1
                }
                className="bg-[#F04F54] hover:bg-[#F04F54]/90 text-white rounded-full h-12 px-8 font-semibold text-sm shadow-md"
              >
                {startMockExams.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  "Start NCEE Mock"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

// ============================================================================
// Setup page — branches on exam type
// ============================================================================

function MockExamSetupPage() {
  const { data: preferences, isLoading: loadingPrefs } = useExamPreferences();
  const [searchQuery, setSearchQuery] = useState("");

  const allSubjects = preferences?.subjects || [];

  const examTypeName =
    preferences?.examTypeRecord?.name || preferences?.examSubtype || "";
  // NCEE / Common Entrance: papers are separate per-year subjects that get
  // auto-combined. Checked first since it has its own dedicated flow.
  const isNcee = /ncee|common\s*entrance/i.test(examTypeName);
  const isMultiPaperExam = /waec|neco|wassce|ssce/i.test(examTypeName);
  // Post-UTME is a single-subject exam (one per-institution subject), so it
  // uses the JAMB flow but only needs 1 subject to start. Matches how the rest
  // of the app detects Post-UTME ("post" also matches /utme/, so check it here).
  const isPostUtme = /post/i.test(examTypeName);

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
        subHeading={
          isNcee
            ? "Paper 1 & Paper 2 are combined automatically"
            : isMultiPaperExam
              ? "Pick a subject — all papers are auto-included"
              : isPostUtme
                ? "Select your subject to start a mock exam"
                : "Select subjects for a combined mock exam"
        }
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search subjects..."
      />

      <div className="py-6 sm:py-8">
        {isNcee ? (
          <NceeMockSetup subjects={allSubjects} />
        ) : isMultiPaperExam ? (
          <WaecMockSetup subjects={allSubjects} searchQuery={searchQuery} />
        ) : (
          <JambMockSetup
            subjects={allSubjects}
            searchQuery={searchQuery}
            minSubjects={isPostUtme ? 1 : 2}
          />
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/mock-exam/setup")({
  component: MockExamSetupPage,
});
