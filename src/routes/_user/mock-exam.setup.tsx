import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Loader2, Clock, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomPageHeader from "@/components/global/custom-page-header";
import { useExamPreferences, useAvailableExams } from "@/feature/exams/hooks";
import { useStartMockExams } from "@/feature/mock-exam/hooks";
import { cn } from "@/lib/utils";
import type { Subject, AvailableExam, AvailableExamsGrouped } from "@/api/types/exam.types";

// Per-subject mock selector — picks the first available mock automatically
function SubjectMockPicker({
  subject,
  selected,
  onToggle,
  onMockSelect,
  selectedMockId,
}: {
  subject: Subject;
  selected: boolean;
  onToggle: () => void;
  onMockSelect: (examId: string, exam: AvailableExam) => void;
  selectedMockId?: string;
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

  // Auto-select first mock when data loads
  const firstMock = mocks[0];
  const activeMock = mocks.find((m) => m.id === selectedMockId) || firstMock;

  return (
    <button
      type="button"
      onClick={() => {
        onToggle();
        if (!selected && activeMock) {
          onMockSelect(activeMock.id, activeMock);
        }
      }}
      disabled={isLoading || mocks.length === 0}
      className={cn(
        "text-left w-full cursor-pointer group transition-all duration-200",
        (isLoading || mocks.length === 0) && "opacity-50 cursor-not-allowed"
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
        {/* Selection indicator */}
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

          {/* Mock info */}
          {isLoading ? (
            <p className="text-[10px] text-gray-400 mt-1.5">Loading...</p>
          ) : mocks.length === 0 ? (
            <p className="text-[10px] text-gray-400 mt-1.5">No mocks available</p>
          ) : activeMock ? (
            <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <BookOpen className="w-3 h-3" />
                {activeMock.numQuestions}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {activeMock.durationMinutes}m
              </span>
            </div>
          ) : null}
        </div>
      </Card>
    </button>
  );
}

function MockExamSetupPage() {
  const navigate = useNavigate();
  const { data: preferences, isLoading: loadingPrefs } = useExamPreferences();
  const startMockExams = useStartMockExams();

  const [selectedSubjects, setSelectedSubjects] = useState<
    Map<string, { subject: Subject; examId: string; exam: AvailableExam }>
  >(new Map());
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allSubjects = preferences?.subjects || [];
  const filteredSubjects = searchQuery
    ? allSubjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSubjects;

  // Calculate totals from selected subjects
  const totals = useMemo(() => {
    let questions = 0;
    let minutes = 0;
    selectedSubjects.forEach(({ exam }) => {
      questions += exam.numQuestions;
      minutes += exam.durationMinutes;
    });
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeLabel = hours > 0 ? `${hours}hr ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
    return { questions, minutes, timeLabel, count: selectedSubjects.size };
  }, [selectedSubjects]);

  const handleToggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) => {
      const next = new Map(prev);
      if (next.has(subject.id)) {
        next.delete(subject.id);
      } else {
        // Will be fully populated when mock data arrives via onMockSelect
        // placeholder until mock info is set
      }
      return next;
    });
  };

  const handleMockSelect = (subject: Subject, examId: string, exam: AvailableExam) => {
    setSelectedSubjects((prev) => {
      const next = new Map(prev);
      next.set(subject.id, { subject, examId, exam });
      return next;
    });
  };

  const handleStartSimulation = () => {
    if (selectedSubjects.size < 2) {
      setErrorMessage("Please select at least 2 subjects for a combined exam simulation.");
      return;
    }

    setErrorMessage("");

    const subjectsArray = Array.from(selectedSubjects.values()).map(({ subject, examId }) => ({
      subject,
      examId,
    }));

    startMockExams.mutate(
      { subjects: subjectsArray },
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
        {/* Summary bar — sticky on scroll */}
        {totals.count > 0 && (
          <div className="sticky top-0 z-10 mb-6">
            <Card className="rounded-2xl border border-[#F04F54]/20 bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-[#F04F54]">{totals.count}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Subjects</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totals.questions}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Questions</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totals.timeLabel}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Time</p>
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

        {/* Error */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 mb-6">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-blue-700">
            Select 2 or more subjects to simulate real exam conditions. Questions from all subjects will be combined into a single timed session — just like the actual exam.
          </p>
        </div>

        {/* Subject grid */}
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
              selected={selectedSubjects.has(subject.id)}
              selectedMockId={selectedSubjects.get(subject.id)?.examId}
              onToggle={() => handleToggleSubject(subject)}
              onMockSelect={(examId, exam) => handleMockSelect(subject, examId, exam)}
            />
          ))}
        </div>

        {/* Bottom CTA for mobile */}
        {totals.count >= 2 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t sm:hidden z-20">
            <Button
              onClick={handleStartSimulation}
              disabled={startMockExams.isPending}
              className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90 text-white rounded-full h-12 font-semibold shadow-lg"
            >
              {startMockExams.isPending ? "Starting..." : `Start Simulation (${totals.count} subjects)`}
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
