import { isProfessionalExam } from "@/lib/exam-category";
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
import { TrialLimitAlert } from "@/components/global/trial-limit-alert";
import ConfigurePracticeForm from "./step-two";
import { ArrowLeft, X } from "lucide-react";
import {
  useExamPreferences,
  useAvailableExams,
  useProfessionalHierarchy,
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
              onError: (error: any) => {
                const message = error?.response?.data?.message || error?.message || "Failed to start mock exam";
                toast.error(message);
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
function SubjectCard({ subject, examName }: { subject: SubjectType; examName: string }) {
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

  const isJamb = /jamb|utme/i.test(examName);
  const isWaec = /waec|wce/i.test(examName);
  const isNeco = /neco/i.test(examName);
  const isNmcn = /nmcn/i.test(examName);

  let imgSrc = "/img/jamb.png";
  if (isNmcn) {
    imgSrc = "/img/nmcn-logo.png";
  } else if (isWaec) {
    imgSrc = "/img/waec-logo.png";
  } else if (isNeco) {
    imgSrc = "/img/neco-logo.png";
  } else if (!isJamb) {
    imgSrc = "/img/generic-book.png";
  }

  const [imgError, setImgError] = useState(false);

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
                  src={imgError ? "/img/generic-book.png" : imgSrc}
                  onError={() => setImgError(true)}
                  className="object-contain w-10 h-10 sm:w-14 sm:h-14"
                />
              </div>
              <h6 className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight line-clamp-2" title={subject.name}>
                {subject.name}
              </h6>

            </div>
          </Card>
        </button>
      </DialogStackTrigger>
      <DialogStackOverlay />
      <DialogStackBody>
        {/* Step 1: Select Practice or Mock */}
        <DialogStackContent className="relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
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
                <TrialLimitAlert message={errorMessage} className="mb-4" />
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

function ProfessionalDomainCard({
  domain,
  componentId,
  componentName,
}: {
  domain: { id: string; name: string; position: number; questionCount?: number };
  componentId: string;
  componentName: string;
}) {
  const navigate = useNavigate();
  const startPractice = useStartPractice();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState("practice");
  const [selectedPracticeOption, setSelectedPracticeOption] = useState("jump");
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartPractice = () => {
    setErrorMessage("");
    startPractice.mutate(
      {
        professionalComponentId: componentId,
        professionalDomainId: domain.id,
        title: `${domain.name} Practice`,
      },
      {
        onSuccess: (data) => navigate({ to: `/exam/${data.id}` }),
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message === "No questions found for the selected criteria"
              ? "No practice questions are available for this domain yet."
              : error?.response?.data?.message ||
              error?.message ||
              "Failed to start practice. Please try again.",
          );
        },
      },
    );
  };

  return (
    <DialogStack open={isOpen} onOpenChange={setIsOpen}>
      <DialogStackTrigger asChild>
        <button
          type="button"
          disabled={domain.questionCount === 0}
          className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-left shadow-sm transition-all hover:border-accent/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="min-w-0 text-sm font-medium leading-snug text-gray-800">
            {domain.questionCount === 0 ? `${domain.name} (coming soon)` : domain.name}
          </span>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-base leading-none text-accent transition-colors group-hover:bg-accent group-hover:text-white"
          >
            &rarr;
          </span>
        </button>
      </DialogStackTrigger>
      <DialogStackOverlay />
      <DialogStackBody>
        <DialogStackContent className="relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <DialogStackHeader className="pt-2 text-center! font-semibold text-lg">
            {domain.name}
          </DialogStackHeader>
          <p className="mt-1 text-center text-xs text-gray-500">{componentName}</p>
          <Choicebox
            className="my-5"
            defaultValue="practice"
            onValueChange={(value: unknown) => setSelectedTestType(value as string)}
          >
            {testTypeOptions.map((option) => (
              <ChoiceboxItem key={option.id} value={option.id}>
                <ChoiceboxItemHeader>
                  <ChoiceboxItemTitle>{option.label}</ChoiceboxItemTitle>
                  <ChoiceboxItemDescription>{option.description}</ChoiceboxItemDescription>
                </ChoiceboxItemHeader>
                <ChoiceboxIndicator />
              </ChoiceboxItem>
            ))}
          </Choicebox>
          <DialogStackNext asChild>
            <PrimaryButton
              title="Continue"
              className="mx-auto flex max-w-2xs bg-[#F04F54] text-white hover:bg-[#F04F54]/80"
            />
          </DialogStackNext>
        </DialogStackContent>

        <DialogStackContent className="relative">
          <DialogStackPrevious className="absolute left-5 top-7" asChild>
            <button className="flex items-center gap-2 font-medium">
              <ArrowLeft />
            </button>
          </DialogStackPrevious>
          {selectedTestType === "practice" ? (
            <>
              <DialogStackHeader className="pt-8 text-center! font-semibold text-lg">
                Practice Options
              </DialogStackHeader>
              <Choicebox
                className="my-5"
                defaultValue="jump"
                onValueChange={(value: unknown) => setSelectedPracticeOption(value as string)}
              >
                {practiceOptions.map((option) => (
                  <ChoiceboxItem key={option.id} value={option.id}>
                    <ChoiceboxItemHeader>
                      <ChoiceboxItemTitle>{option.label}</ChoiceboxItemTitle>
                      <ChoiceboxItemDescription>{option.description}</ChoiceboxItemDescription>
                    </ChoiceboxItemHeader>
                    <ChoiceboxIndicator />
                  </ChoiceboxItem>
                ))}
              </Choicebox>
              {errorMessage && <TrialLimitAlert message={errorMessage} className="mb-4" />}
              {selectedPracticeOption === "jump" ? (
                <PrimaryButton
                  title={startPractice.isPending ? "Starting..." : "Start Practice"}
                  disabled={startPractice.isPending}
                  onClick={handleStartPractice}
                  className="mx-auto flex max-w-2xs bg-[#F04F54] text-white hover:bg-[#F04F54]/80"
                />
              ) : (
                <DialogStackNext asChild>
                  <PrimaryButton
                    title="Continue"
                    className="mx-auto flex max-w-2xs bg-[#F04F54] text-white hover:bg-[#F04F54]/80"
                  />
                </DialogStackNext>
              )}
            </>
          ) : (
            <div className="pt-10 text-center text-sm text-gray-500">
              Select Practice Test above to continue.
            </div>
          )}
        </DialogStackContent>

        <DialogStackContent className="relative">
          <DialogStackPrevious className="absolute left-5 top-7" asChild>
            <button className="flex items-center gap-2 font-medium">
              <ArrowLeft />
            </button>
          </DialogStackPrevious>
          <ConfigurePracticeForm
            professionalTarget={{
              componentId,
              componentName,
              domainId: domain.id,
              domainName: domain.name,
            }}
            onClose={() => setIsOpen(false)}
          />
        </DialogStackContent>
      </DialogStackBody>
    </DialogStack>
  );
}

function ProfessionalHierarchy({
  examType,
  searchQuery,
}: {
  examType: string;
  searchQuery: string;
}) {
  const { data, isLoading, error } = useProfessionalHierarchy(examType);

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-500">Loading professional curriculum...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-sm text-red-500">Failed to load professional curriculum.</div>;
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const tracks = data?.professionalTracks || [];

  return (
    <div className="space-y-8 py-6 sm:py-10">
      {tracks.map((track) => (
        <section key={track.id} className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              Professional track
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{track.name}</h2>
          </div>

          {track.components.map((component) => {
            const domains = component.domains.filter((domain) =>
              !normalizedSearch ||
              domain.name.toLowerCase().includes(normalizedSearch) ||
              component.name.toLowerCase().includes(normalizedSearch),
            );

            return (
              <div key={component.id} className="space-y-3">
                <div className="flex items-end justify-between gap-3 border-b border-gray-200 pb-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {component.kind.replace("_", " ")}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-gray-900">
                      {component.name}
                    </h3>
                  </div>
                </div>

                {domains.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {domains.map((domain) => (
                      <ProfessionalDomainCard
                        key={domain.id}
                        domain={domain}
                        componentId={component.id}
                        componentName={component.name}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
                    {normalizedSearch
                      ? "No domains match your search."
                      : "Practice content is being prepared for this component."}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      ))}

      {tracks.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No professional curriculum is available yet.
        </p>
      )}
    </div>
  );
}

export default function Subjects({ searchQuery = "" }: { searchQuery?: string }) {
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

  const allSubjects = data?.subjects || [];
  const subjects = searchQuery
    ? allSubjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSubjects;

  const isProfessional = isProfessionalExam(data?.examCategory);
  const unitLabelPlural = isProfessional ? "Topics/Sections" : "subjects";
  const examName = data?.examTypeRecord?.name || "";

  if (isProfessional) {
    return (
      <ProfessionalHierarchy
        examType={data?.examTypeId || ""}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-10 py-6 sm:py-10">
      {subjects.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500">
          {allSubjects.length > 0
            ? `No ${unitLabelPlural.toLowerCase()} match your search`
            : `No ${unitLabelPlural.toLowerCase()} available`}
        </div>
      )}
      {subjects.map((subject) => {
        return (
          <SubjectCard key={subject.id} subject={subject} examName={examName} />
        );
      })}
    </div>
  );
}
