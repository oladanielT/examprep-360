import { useState, useEffect } from "react";
import PrimaryButton from "@/components/buttons/primary-button";
import { Card } from "@/components/ui/card";
import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
  ChoiceboxItemDescription,
  ChoiceboxItemHeader,
  ChoiceboxItemTitle,
} from "@/components/kibo-ui/choicebox";
import {
  DialogStack,
  DialogStackOverlay,
  DialogStackTrigger,
  DialogStackBody,
  DialogStackContent,
  DialogStackHeader,
  DialogStackNext,
  DialogStackPrevious,
} from "@/components/kibo-ui/dialog-stack";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ConfigurePracticeForm from "./step-two";
import { ArrowLeft } from "lucide-react";
import {
  useExamPreferences,
  useAvailableExams,
  useStartPractice,
  useStartExam,
} from "@/feature/exams/hooks";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type {
  Subject as SubjectType,
  AvailableExam,
  AvailableExamsGrouped,
} from "@/api/types/exam.types";

const testTypeOptions = [
  {
    id: "practice",
    label: "Practice Test",
    description: "Practice at your own pace with customizable settings.",
  },
  {
    id: "mock",
    label: "Mock Exam",
    description: "Simulate real exam conditions with timed tests.",
  },
];

const practiceOptions = [
  {
    id: "jump",
    label: "Jump Straight In",
    description: "Start practicing immediately with default settings.",
  },
  {
    id: "configure",
    label: "Configure Practice",
    description: "Customize duration, question count, and difficulty.",
  },
];

// Mock selection component that fetches available mocks
function MockSelection({
  subject,
  onClose,
}: {
  subject: SubjectType;
  onClose?: () => void;
}) {
  const [selectedMockId, setSelectedMockId] = useState<string>("");
  const navigate = useNavigate();
  const startMock = useStartExam();
  const { data, isLoading, error } = useAvailableExams({
    subjectId: subject.id,
    examTypeEnum: "MOCK",
  });

  // Handle both grouped and ungrouped responses
  const isGrouped = data && !Array.isArray(data);
  const groupedData = isGrouped ? (data as AvailableExamsGrouped) : null;
  const ungroupedData = !isGrouped ? (data as AvailableExam[]) : null;
  const mocks: AvailableExam[] = groupedData
    ? Object.values(groupedData).flat()
    : ungroupedData || [];

  // Sync state with default selection when data loads
  useEffect(() => {
    if (mocks.length > 0 && !selectedMockId) {
      setSelectedMockId(mocks[0].id);
    }
  }, [mocks, selectedMockId]);

  if (isLoading) {
    return <div className="py-5 text-center">Loading available mocks...</div>;
  }

  if (error) {
    return (
      <div className="py-5 text-center text-red-500">Failed to load mocks</div>
    );
  }

  if (mocks.length === 0) {
    return (
      <div className="py-5 text-center text-gray-500">
        No mocks available for this subject
      </div>
    );
  }

  return (
    <>
      <Choicebox
        className="my-5"
        defaultValue={mocks[0]?.id}
        onValueChange={(value: unknown) => setSelectedMockId(value as string)}
      >
        {mocks.map((mock) => (
          <ChoiceboxItem key={mock.id} value={mock.id}>
            <ChoiceboxItemHeader>
              <ChoiceboxItemTitle>{mock.name}</ChoiceboxItemTitle>
              <ChoiceboxItemDescription>
                {mock.numQuestions} questions • {mock.durationMinutes} mins
                {mock._count.attempts > 0 &&
                  ` • Attempted ${mock._count.attempts}/${mock.allowedAttempts}`}
              </ChoiceboxItemDescription>
            </ChoiceboxItemHeader>
            <ChoiceboxIndicator />
          </ChoiceboxItem>
        ))}
      </Choicebox>
      <PrimaryButton
        title={startMock.isPending ? "Starting..." : "Start Mock"}
        onClick={() => {
          if (selectedMockId) {
            startMock.mutate(selectedMockId, {
              onSuccess: (data) => {
                onClose?.();
                navigate({ to: `/exam/${data.id}` });
              },
            });
          }
        }}
        disabled={!selectedMockId || startMock.isPending}
        className="bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white disabled:opacity-50"
      />
    </>
  );
}

// Subject card with its own dialog state
function SubjectCard({ subject }: { subject: SubjectType }) {
  const [selectedTestType, setSelectedTestType] = useState<string>("practice");
  const [selectedPracticeOption, setSelectedPracticeOption] =
    useState<string>("jump");
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const startPractice = useStartPractice();

  const handleJumpStraightIn = () => {
    setErrorMessage("");
    startPractice.mutate(
      {
        subjectId: subject.id,
        title: `${subject.name} Practice`,
      },
      {
        onSuccess: (data) => {
          setErrorMessage("");
          toast.success("Practice exam started successfully!");
          setTimeout(() => {
            setIsOpen(false);
            // Navigate to exam with attemptId
            navigate({ to: `/exam/${data.id}` });
          }, 800);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to start practice exam";
          setErrorMessage(message);
        },
      }
    );
  };

  return (
    <DialogStack open={isOpen} onOpenChange={setIsOpen}>
      <DialogStackTrigger asChild>
        <button className="text-left cursor-pointer group w-full">
          <Card className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 active:scale-[0.96] group-hover:-translate-y-0.5">
            <div className="flex flex-col items-center justify-center px-3 py-5 sm:px-4 sm:py-7">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <img
                  width={1000}
                  height={1000}
                  alt={subject.name}
                  src="/img/jamb.png"
                  className="object-contain w-10 h-10 sm:w-14 sm:h-14"
                />
              </div>
              <h6 className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight line-clamp-2">
                {subject.name}
              </h6>
            </div>
          </Card>
        </button>
      </DialogStackTrigger>
      <DialogStackOverlay />
      <DialogStackBody>
        {/* Step 1: Select Practice or Mock */}
        <DialogStackContent>
          <DialogStackHeader className="font-semibold text-lg text-center!">
            Select Test Type
          </DialogStackHeader>
          <Choicebox
            className="my-5"
            defaultValue="practice"
            onValueChange={(value: unknown) =>
              setSelectedTestType(value as string)
            }
          >
            {testTypeOptions.map((option) => (
              <ChoiceboxItem key={option.id} value={option.id}>
                <ChoiceboxItemHeader>
                  <ChoiceboxItemTitle>{option.label}</ChoiceboxItemTitle>
                  <ChoiceboxItemDescription>
                    {option.description}
                  </ChoiceboxItemDescription>
                </ChoiceboxItemHeader>
                <ChoiceboxIndicator />
              </ChoiceboxItem>
            ))}
          </Choicebox>
          <DialogStackNext asChild>
            <PrimaryButton
              title="Continue"
              className="bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white"
            />
          </DialogStackNext>
        </DialogStackContent>

        {/* Step 2: Practice or Mock options based on selection */}
        <DialogStackContent className="relative">
          <DialogStackPrevious className="left-5 absolute top-7" asChild>
            <button className="flex items-center gap-2 font-medium">
              <ArrowLeft />
            </button>
          </DialogStackPrevious>

          {selectedTestType === "practice" ? (
            <>
              <DialogStackHeader className="font-semibold text-lg text-center! pt-8">
                Practice Options
              </DialogStackHeader>
              <Choicebox
                className="my-5"
                defaultValue="jump"
                onValueChange={(value: unknown) =>
                  setSelectedPracticeOption(value as string)
                }
              >
                {practiceOptions.map((option) => (
                  <ChoiceboxItem key={option.id} value={option.id}>
                    <ChoiceboxItemHeader>
                      <ChoiceboxItemTitle>{option.label}</ChoiceboxItemTitle>
                      <ChoiceboxItemDescription>
                        {option.description}
                      </ChoiceboxItemDescription>
                    </ChoiceboxItemHeader>
                    <ChoiceboxIndicator />
                  </ChoiceboxItem>
                ))}
              </Choicebox>

              {/* Error Message */}
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {selectedPracticeOption === "jump" ? (
                <PrimaryButton
                  title={
                    startPractice.isPending ? "Starting..." : "Start Practice"
                  }
                  disabled={startPractice.isPending}
                  onClick={handleJumpStraightIn}
                  className="bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white"
                />
              ) : (
                <DialogStackNext asChild>
                  <PrimaryButton
                    title="Continue"
                    className="bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white"
                  />
                </DialogStackNext>
              )}
            </>
          ) : (
            <>
              <DialogStackHeader className="font-semibold text-lg text-center! pt-8">
                Select Mock Exam
              </DialogStackHeader>
              <MockSelection
                subject={subject}
                onClose={() => setIsOpen(false)}
              />
            </>
          )}
        </DialogStackContent>

        {/* Step 3: Configure Practice form */}
        <DialogStackContent className="relative">
          <DialogStackPrevious className="left-5 absolute top-7" asChild>
            <button className="flex items-center gap-2 font-medium">
              <ArrowLeft />
            </button>
          </DialogStackPrevious>
          <ConfigurePracticeForm
            subject={subject}
            onClose={() => setIsOpen(false)}
          />
        </DialogStackContent>
      </DialogStackBody>
    </DialogStack>
  );
}

export default function Subjects() {
  const { data, isLoading, error } = useExamPreferences();

  if (isLoading) {
    return <div className="py-10 text-center">Loading subjects...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Failed to load subjects
      </div>
    );
  }

  const subjects = data?.subjects || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-10 py-6 sm:py-10">
      {subjects.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500">
          No subjects available
        </div>
      )}
      {subjects.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
}
