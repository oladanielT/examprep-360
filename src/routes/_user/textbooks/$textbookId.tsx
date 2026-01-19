import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTutorial, useUpdateTutorialProgress, useSubmitTutorialQuestions } from "@/feature/tutorials/hooks";
import { ArrowLeft, CheckCircle, Warning } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { TutorialChapter, TutorialQuestion, TutorialQuizAnswer } from "@/api/types/tutorial.types";

type ViewMode = "lessons" | "lesson-content" | "test";

function ChapterItem({
  chapter,
  index,
  isActive,
  isCompleted,
  onClick,
}: {
  chapter: TutorialChapter;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg transition-colors flex items-start gap-3",
        isActive ? "bg-red-50" : "hover:bg-gray-50",
        isCompleted && "text-green-600"
      )}
    >
      <span className="font-medium text-gray-500 mt-0.5">{index + 1}.</span>
      <div className="flex-1">
        <p className={cn("font-medium", isActive && "text-[#F04F54]")}>
          {chapter.name}
        </p>
        <p className="text-sm text-gray-400">Chapter {chapter.order}</p>
      </div>
      {isCompleted && <CheckCircle weight="fill" className="w-5 h-5 text-green-500 mt-1" />}
    </button>
  );
}

function TextContent({
  chapter,
  onComplete,
}: {
  chapter: TutorialChapter;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{chapter.name}</h2>

      {/* Text Content from chapter blocks */}
      <div className="prose prose-gray max-w-none">
        {chapter.content?.blocks && chapter.content.blocks.length > 0 ? (
          <div className="space-y-4">
            {chapter.content.blocks.map((block, idx) => (
              <p key={idx}>{block.text}</p>
            ))}
          </div>
        ) : (
          <div className="space-y-4 text-gray-700">
            <p>
              A fraction is a way of expressing a part of a whole. It is written in the form:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The numerator (top number) tells you how many parts you have.</li>
              <li>The denominator (bottom number) tells you how many equal parts the whole is divided into.</li>
            </ul>
            <p>
              For example, if a pizza is cut into 4 equal slices and you take 3, you have taken 3/4 of the pizza.
            </p>
            <p>
              Fractions are everywhere — in measuring time, money, distance, ingredients in recipes, and much more. Understanding fractions is essential in solving more complex math problems like ratios, proportions, and algebraic expressions.
            </p>
            <p>There are different types of fractions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proper Fractions: Numerator is less than denominator, e.g., 3/5</li>
              <li>Improper Fractions: Numerator is greater than or equal to denominator, e.g., 7/4</li>
              <li>Mixed Numbers: A whole number combined with a fraction, e.g., 2 1/2</li>
            </ul>

            {/* Sample image placeholder */}
            <div className="my-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Write the solutions in your book and also here. Be cognizant of showing E-models</p>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <span>1/2 + 1/4 =</span>
                  <span>1/3 + 1/6 =</span>
                  <span>2/5 + 1/5 =</span>
                  <span>3/4 + 1/8 =</span>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Finding and dividing</p>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <span>1/2 + 1/4 =</span>
                  <span>1/3 + 1/6 =</span>
                  <span>2/5 + 1/5 =</span>
                  <span>3/4 + 1/8 =</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      {chapter.documents && chapter.documents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Documents</h3>
          <div className="space-y-2">
            {chapter.documents.map((doc, idx) => (
              <a
                key={idx}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                📄 {doc.format.toUpperCase()} Document
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button
          onClick={onComplete}
          className="bg-[#F04F54] hover:bg-[#F04F54]/90 px-8"
        >
          Complete and continue
        </Button>
      </div>
    </div>
  );
}

function QuizQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onSelectAnswer,
  isSubmitted,
  onPrevious,
  onNext,
  onReport,
  isFirst,
  isLast,
}: {
  question: TutorialQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  onSelectAnswer: (optionId: string) => void;
  isSubmitted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReport: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const correctOption = question.options.find((o) => o.isCorrect);
  const isCorrect = isSubmitted && selectedAnswer === correctOption?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 rounded-lg flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">i</div>
        <p className="text-sm">Choose the option that best conveys the meaning of the underlined portion in the following sentence:</p>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-2">Question {questionNumber}</p>
        <p className="text-lg font-medium mb-6">{question.questionText}</p>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer || ""}
          onValueChange={(value: unknown) => onSelectAnswer(value as string)}
          className="space-y-3"
        >
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const showCorrect = isSubmitted && option.isCorrect;
            const showWrong = isSubmitted && isSelected && !option.isCorrect;

            return (
              <label
                key={option.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  !isSubmitted && "hover:bg-gray-50",
                  isSelected && !isSubmitted && "border-[#F04F54] bg-red-50",
                  showCorrect && "border-green-500 bg-green-50",
                  showWrong && "border-red-500 bg-red-50"
                )}
              >
                <RadioGroupItem value={option.id} disabled={isSubmitted} />
                <span>{option.text}</span>
              </label>
            );
          })}
        </RadioGroup>

        {/* Explanation (shown after submit) */}
        {isSubmitted && (
          <div className="mt-6 space-y-4">
            <div className="bg-teal-600 text-white p-4 rounded-lg">
              <p className="text-xs uppercase tracking-wide mb-1">Explanation</p>
              <p className="text-sm">The correct answer demonstrates the intended meaning based on the context.</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <Warning weight="fill" className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Incorrect</span>
                  </>
                )}
              </div>
              {isCorrect && <span className="text-green-500 font-medium">+40XP</span>}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onReport}
          className="border-[#F04F54] text-[#F04F54] hover:bg-red-50"
        >
          Report Question
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function TextbookDetailPage() {
  const { textbookId } = Route.useParams();
  const { data: textbook, isLoading, error } = useTutorial(textbookId);
  const updateProgress = useUpdateTutorialProgress();
  const submitQuestions = useSubmitTutorialQuestions();

  const [activeTab, setActiveTab] = useState<"lessons" | "test">("lessons");
  const [viewMode, setViewMode] = useState<ViewMode>("lessons");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [showFinishFirstModal, setShowFinishFirstModal] = useState(false);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (isLoading) {
    return <div className="py-10 text-center">Loading textbook...</div>;
  }

  if (error || !textbook) {
    return <div className="py-10 text-center text-red-500">Failed to load textbook</div>;
  }

  const chapters = textbook.chapters || [];
  const questions = textbook.testQuestions || [];
  const progressPercent = chapters.length > 0
    ? Math.round((completedChapters.size / chapters.length) * 100)
    : 0;
  const allLessonsComplete = completedChapters.size === chapters.length && chapters.length > 0;

  const handleChapterClick = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setViewMode("lesson-content");
  };

  const handleCompleteChapter = () => {
    if (selectedChapterId) {
      const chapterId = selectedChapterId;
      setCompletedChapters((prev) => new Set([...prev, chapterId]));

      updateProgress.mutate(
        {
          id: textbookId,
          progress: {
            lastWatchTime: 0,
            lastChapterId: chapterId,
          },
        },
        {
          onSuccess: () => {
            setErrorMessage(""); // Clear any previous errors
          },
          onError: (error: any) => {
            // Revert completion on error
            setCompletedChapters((prev) => {
              const newSet = new Set(prev);
              newSet.delete(chapterId);
              return newSet;
            });
            const message = error?.response?.data?.message || error?.message || "Failed to update progress.";
            setErrorMessage(message);
          },
        }
      );

      // Move to next chapter or back to list
      const currentIndex = chapters.findIndex((c) => c.id === chapterId);
      if (currentIndex < chapters.length - 1) {
        setSelectedChapterId(chapters[currentIndex + 1].id);
      } else {
        setViewMode("lessons");
        setSelectedChapterId(null);
      }
    }
  };

  const handleTabClick = (tab: "lessons" | "test") => {
    if (tab === "test" && !allLessonsComplete) {
      setShowFinishFirstModal(true);
      return;
    }
    setActiveTab(tab);
    setViewMode(tab === "test" ? "test" : "lessons");
    setSelectedChapterId(null);
  };

  const handleAnswerSelect = (optionId: string) => {
    const question = questions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    // Auto-submit on selection
    setSubmittedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
  };

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  return (
    <div className="py-6">
      {/* Header */}
      <Link to="/textbooks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{textbook.name}</h1>
        <p className="text-gray-500">400k Students</p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Layout */}
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Card className="p-4">
            {/* Thumbnail */}
            <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-gray-100">
              <img
                src="/img/algebra.png"
                alt={textbook.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Progress */}
            <div className="mb-4">
              <Progress value={progressPercent} className="mb-1">
                <ProgressTrack className="h-1.5 bg-gray-200">
                  <ProgressIndicator className="bg-[#F04F54]" />
                </ProgressTrack>
              </Progress>
              <p className="text-sm text-center text-gray-600">{progressPercent}% Complete</p>
            </div>

            {/* Tabs */}
            <div className="space-y-1 mb-6">
              <button
                onClick={() => handleTabClick("lessons")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded font-medium transition-colors",
                  activeTab === "lessons"
                    ? "border-l-4 border-[#F04F54] bg-red-50 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Lessons
              </button>
              <button
                onClick={() => handleTabClick("test")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded font-medium transition-colors",
                  activeTab === "test"
                    ? "border-l-4 border-[#F04F54] bg-red-50 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Class Test
              </button>
            </div>

            {/* Teacher Info */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Avatar className="w-10 h-10">
                <img src="/img/teacher.png" alt="Teacher" />
              </Avatar>
              <div>
                <p className="font-medium text-sm">Audrey Teacher</p>
                <p className="text-xs text-gray-400">Over 30k courses</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {/* Lessons List View */}
          {viewMode === "lessons" && (
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  isActive={selectedChapterId === chapter.id}
                  isCompleted={completedChapters.has(chapter.id)}
                  onClick={() => handleChapterClick(chapter.id)}
                />
              ))}
              {chapters.length === 0 && (
                <p className="text-gray-500 text-center py-10">No lessons available</p>
              )}
            </div>
          )}

          {/* Lesson Content (Text) View */}
          {viewMode === "lesson-content" && selectedChapter && (
            <TextContent
              chapter={selectedChapter}
              onComplete={handleCompleteChapter}
            />
          )}

          {/* Test View */}
          {viewMode === "test" && questions.length > 0 && (
            <QuizQuestion
              question={questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              selectedAnswer={answers[questions[currentQuestionIndex].id] || null}
              onSelectAnswer={handleAnswerSelect}
              isSubmitted={submittedQuestions.has(currentQuestionIndex)}
              onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              onNext={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex((i) => i + 1);
                } else {
                  // Submit all answers
                  const answersList: TutorialQuizAnswer[] = Object.entries(answers).map(
                    ([questionId, answer]) => ({ questionId, answer })
                  );
                  setErrorMessage(""); // Clear any previous errors
                  submitQuestions.mutate(
                    { id: textbookId, answers: { answers: answersList } },
                    {
                      onSuccess: () => {
                        setErrorMessage("");
                      },
                      onError: (error: any) => {
                        const message = error?.response?.data?.message || error?.message || "Failed to submit quiz. Please try again.";
                        setErrorMessage(message);
                      },
                    }
                  );
                }
              }}
              onReport={() => {/* TODO: Implement report */}}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === questions.length - 1}
            />
          )}

          {viewMode === "test" && questions.length === 0 && (
            <p className="text-gray-500 text-center py-10">No test questions available</p>
          )}
        </div>
      </div>

      {/* Finish Tutorial First Modal */}
      <Dialog open={showFinishFirstModal} onOpenChange={setShowFinishFirstModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <Warning weight="fill" className="w-12 h-12 text-yellow-500" />
            </div>
            <DialogTitle>Finish Tutorial First</DialogTitle>
            <DialogDescription>
              Finish course to take Class test.
            </DialogDescription>
          </DialogHeader>
          <Button
            className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90"
            onClick={() => setShowFinishFirstModal(false)}
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_user/textbooks/$textbookId")({
  component: TextbookDetailPage,
});
