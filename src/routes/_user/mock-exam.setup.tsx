import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
    [buckets.length, mocks.length]
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
}: {
  subjects: Subject[];
  searchQuery: string;
}) {
  const navigate = useNavigate();
  const startMockExams = useStartMockExams();
  const [picks, setPicks] = useState<Map<string, SubjectPick>>(new Map());
  const [errorMessage, setErrorMessage] = useState("");

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
          Select 2 or more subjects to simulate real exam conditions. Questions from
          all subjects will be combined into a single timed session — just like the
          actual exam.
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

// Sticky picker that shows once a subject is selected. Owns the paper
// chips, the live totals, and the Start CTA.
function WaecPickedSubjectBar({
  subject,
  selectedPapers,
  onTogglePaper,
  onClear,
  isStarting,
  onStart,
}: {
  subject: Subject;
  selectedPapers: Set<number>;
  onTogglePaper: (paperNumber: number) => void;
  onClear: () => void;
  isStarting: boolean;
  onStart: (
    papers: Array<{ paperNumber: number; paperName: string; examId: string }>
  ) => void;
}) {
  const { mocks, isLoading } = useSubjectMocks(subject.id);
  const buckets = useMemo(() => groupMocksByPaper(mocks), [mocks]);

  // Roll a random pick per bucket. Stable for the lifetime of this mocks
  // array, so toggling a paper chip doesn't re-roll the others.
  const rolledPicks = useMemo(
    () => pickRandomMockPerBucket(buckets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buckets.length, mocks.length]
  );

  // Live totals only for the papers the user has kept selected.
  const totals = useMemo(() => {
    let questions = 0;
    let minutes = 0;
    rolledPicks.forEach((p) => {
      if (selectedPapers.has(p.paperNumber)) {
        questions += p.mock.numQuestions;
        minutes += p.mock.durationMinutes;
      }
    });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeLabel =
      hours > 0 ? `${hours}hr ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
    return { questions, timeLabel, paperCount: selectedPapers.size };
  }, [rolledPicks, selectedPapers]);

  const handleStart = () => {
    const papers = rolledPicks
      .filter((p) => selectedPapers.has(p.paperNumber))
      .map((p) => ({
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

          {/* Paper chips */}
          {isLoading ? (
            <p className="text-xs text-gray-500">Loading papers...</p>
          ) : buckets.length === 0 ? (
            <p className="text-xs text-gray-500">No papers available.</p>
          ) : (
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                Papers
              </p>
              <div className="flex flex-wrap gap-2">
                {rolledPicks.map((p) => {
                  const active = selectedPapers.has(p.paperNumber);
                  return (
                    <button
                      key={p.paperNumber}
                      type="button"
                      onClick={() => onTogglePaper(p.paperNumber)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        active
                          ? "bg-[#F04F54] text-white border-[#F04F54]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{p.paperName}</span>
                      <span
                        className={cn(
                          "text-[10px] px-1 rounded",
                          active ? "bg-white/20" : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {p.mock.numQuestions}q · {p.mock.durationMinutes}m
                      </span>
                    </button>
                  );
                })}
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
              disabled={isStarting || totals.paperCount < 1 || isLoading}
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

// Hidden helper: when a subject is picked, we need to know its paper
// buckets so we can default-select every paper number. This component
// runs the query and reports the bucket numbers up to the parent on mount
// or when the picked subject changes.
function PaperDefaulter({
  subjectId,
  onPapers,
}: {
  subjectId: string;
  onPapers: (paperNumbers: number[]) => void;
}) {
  const { mocks, isLoading } = useSubjectMocks(subjectId);
  const buckets = useMemo(() => groupMocksByPaper(mocks), [mocks]);
  useEffect(() => {
    if (isLoading) return;
    onPapers(buckets.map((b) => b.paperNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, isLoading, buckets.length]);
  return null;
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
  const [selectedPapers, setSelectedPapers] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  const filteredSubjects = searchQuery
    ? subjects.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : subjects;

  const handleSelectSubject = (subject: Subject) => {
    setErrorMessage("");
    if (pickedSubject?.id === subject.id) {
      // Tapping the active subject clears the selection.
      setPickedSubject(null);
      setSelectedPapers(new Set());
      return;
    }
    setPickedSubject(subject);
    // Papers default-on populate via <PaperDefaulter />.
    setSelectedPapers(new Set());
  };

  const handleTogglePaper = (paperNumber: number) => {
    setSelectedPapers((prev) => {
      const next = new Set(prev);
      if (next.has(paperNumber)) {
        if (next.size <= 1) return prev; // must keep ≥1
        next.delete(paperNumber);
      } else {
        next.add(paperNumber);
      }
      return next;
    });
  };

  const handleClearSubject = () => {
    setPickedSubject(null);
    setSelectedPapers(new Set());
  };

  const handleStart = (
    papers: Array<{ paperNumber: number; paperName: string; examId: string }>
  ) => {
    if (!pickedSubject) return;
    if (papers.length < 1) {
      setErrorMessage("Please select at least one paper.");
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
      {/* Hidden defaulter — populates selectedPapers with every paper number
          for the picked subject once its mocks load. */}
      {pickedSubject && selectedPapers.size === 0 && (
        <PaperDefaulter
          subjectId={pickedSubject.id}
          onPapers={(nums) => setSelectedPapers(new Set(nums))}
        />
      )}

      {pickedSubject && (
        <WaecPickedSubjectBar
          subject={pickedSubject}
          selectedPapers={selectedPapers}
          onTogglePaper={handleTogglePaper}
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
          Pick one subject, then choose which papers to sit (Paper 1, 2, 3 where
          applicable). All selected papers run on one shared timer — just like the
          actual WAEC/NECO sitting.
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
// Setup page — branches on exam type
// ============================================================================

function MockExamSetupPage() {
  const { data: preferences, isLoading: loadingPrefs } = useExamPreferences();
  const [searchQuery, setSearchQuery] = useState("");

  const allSubjects = preferences?.subjects || [];

  const examTypeName =
    preferences?.examTypeRecord?.name || preferences?.examSubtype || "";
  const isMultiPaperExam = /waec|neco|wassce|ssce/i.test(examTypeName);

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
          isMultiPaperExam
            ? "Pick a subject and choose papers to sit"
            : "Select subjects for a combined mock exam"
        }
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search subjects..."
      />

      <div className="py-6 sm:py-8">
        {isMultiPaperExam ? (
          <WaecMockSetup subjects={allSubjects} searchQuery={searchQuery} />
        ) : (
          <JambMockSetup subjects={allSubjects} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/mock-exam/setup")({
  component: MockExamSetupPage,
});
