import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTutorial, useUpdateTutorialProgress, useSubmitTutorialQuestions, useMarkTutorialComplete, useToggleTutorialBookmark } from "@/feature/tutorials/hooks";
import { ArrowLeft, Play, CheckCircle, Warning, BookmarkSimple, Trophy } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TutorialChapter, TutorialQuestion, TutorialQuizAnswer } from "@/api/types/tutorial.types";
import { RichContentRenderer } from "@/components/questions/RichContentRenderer";

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
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", isActive && "text-[#F04F54]")}>
          {chapter.name}
        </p>
        <p className="text-sm text-gray-400">Lesson {chapter.order}</p>
      </div>
      {isCompleted && <CheckCircle weight="fill" className="w-5 h-5 text-green-500 mt-1 shrink-0" />}
    </button>
  );
}

function ChapterContent({
  chapter,
  onComplete,
}: {
  chapter: TutorialChapter;
  onComplete: () => void;
}) {
  // Parse video data from content block
  const getVideoFromContent = () => {
    if (!chapter.content || !Array.isArray(chapter.content)) return null;

    const videoBlock = chapter.content.find((block: any) => block.type === "video");
    if (!videoBlock) return null;

    // Handle direct url property
    if ((videoBlock as any).url) {
      return { src: (videoBlock as any).url, title: "" };
    }

    // Handle JSON string in value property (API format: { type: "video", value: "{\"src\":\"...\",\"title\":\"...\"}" })
    if ((videoBlock as any).value) {
      try {
        const parsed = typeof (videoBlock as any).value === "string"
          ? JSON.parse((videoBlock as any).value)
          : (videoBlock as any).value;
        return { src: parsed.src || parsed.url || "", title: parsed.title || "" };
      } catch {
        // value might be a direct URL string
        return { src: (videoBlock as any).value, title: "" };
      }
    }

    return null;
  };

  const videoData = getVideoFromContent();

  // Filter non-video content for RichContentRenderer
  const nonVideoContent = chapter.content?.filter((block: any) => block.type !== "video") || [];
  const hasTextContent = nonVideoContent.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">{chapter.name}</h2>

      {/* Video Player */}
      {videoData && (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={videoData.src}
            controls
            className="w-full h-full"
          >
            Your browser does not support the video tag.
          </video>
          {videoData.title && (
            <p className="text-sm text-gray-500 mt-2">{videoData.title}</p>
          )}
        </div>
      )}

      {/* No video placeholder */}
      {!videoData && !hasTextContent && (
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Play weight="fill" className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No content available</p>
          </div>
        </div>
      )}

      {/* Chapter Rich Content */}
      {hasTextContent && (
        <Card className="p-4 sm:p-6">
          <div className="max-w-none overflow-hidden break-words [word-break:break-word]">
            <RichContentRenderer
              content={nonVideoContent}
              className="space-y-4 text-sm sm:text-base text-gray-700"
            />
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        <Button
          onClick={onComplete}
          className="bg-[#F04F54] hover:bg-[#F04F54]/90 px-8 w-full sm:w-auto"
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex items-start sm:items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0 mt-0.5 sm:mt-0">i</div>
        <p className="text-xs sm:text-sm">Choose the option that best conveys the meaning of the underlined portion in the following sentence:</p>
      </div>

      {/* Question Card */}
      <Card className="p-4 sm:p-6">
        <p className="text-sm text-gray-500 mb-2">Question {questionNumber}</p>
        <p className="text-base sm:text-lg font-medium mb-4 sm:mb-6">{question.questionText}</p>

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
                  "flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors",
                  !isSubmitted && "hover:bg-gray-50",
                  isSelected && !isSubmitted && "border-[#F04F54] bg-red-50",
                  showCorrect && "border-green-500 bg-green-50",
                  showWrong && "border-red-500 bg-red-50"
                )}
              >
                <RadioGroupItem value={option.id} disabled={isSubmitted} />
                <span className="text-sm sm:text-base">{option.text}</span>
              </label>
            );
          })}
        </RadioGroup>

        {/* Explanation (shown after submit) */}
        {isSubmitted && (
          <div className="mt-4 sm:mt-6 space-y-4">
            <div className="bg-teal-600 text-white p-3 sm:p-4 rounded-lg">
              <p className="text-xs uppercase tracking-wide mb-1">Explanation</p>
              <p className="text-sm">The correct answer demonstrates the intended meaning based on the context.</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-sm sm:text-base">Correct!</span>
                  </>
                ) : (
                  <>
                    <Warning weight="fill" className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-sm sm:text-base">Incorrect</span>
                  </>
                )}
              </div>
              {isCorrect && <span className="text-green-500 font-medium text-sm sm:text-base">+40XP</span>}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="text-sm"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onReport}
          className="border-[#F04F54] text-[#F04F54] hover:bg-red-50 text-xs sm:text-sm"
        >
          Report
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          className="text-sm"
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function TutorialDetailPage() {
  const { tutorialId } = Route.useParams();
  const { data: tutorial, isLoading, error } = useTutorial(tutorialId);
  const updateProgress = useUpdateTutorialProgress();
  const submitQuestions = useSubmitTutorialQuestions();
  const markComplete = useMarkTutorialComplete();
  const toggleBookmark = useToggleTutorialBookmark();

  const [activeTab, setActiveTab] = useState<"lessons" | "test">("lessons");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("lessons");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [showFinishFirstModal, setShowFinishFirstModal] = useState(false);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  // Initialize state from tutorial data
  useEffect(() => {
    if (tutorial) {
      if (tutorial.isBookmarked !== undefined) {
        setIsBookmarked(tutorial.isBookmarked);
      }

      if (tutorial.userProgress?.lastChapterId && tutorial.chapters) {
        const lastChapterIndex = tutorial.chapters.findIndex(
          (c) => c.id === tutorial.userProgress?.lastChapterId
        );
        if (lastChapterIndex !== -1) {
          const completedIds = tutorial.chapters
            .slice(0, lastChapterIndex + 1)
            .map((c) => c.id);
          setCompletedChapters(new Set(completedIds));
        }
      }

      if (tutorial.userProgress?.isCompleted && tutorial.chapters) {
        setCompletedChapters(new Set(tutorial.chapters.map((c) => c.id)));
      }
    }
  }, [tutorial]);

  if (isLoading) {
    return <div className="py-10 text-center">Loading tutorial...</div>;
  }

  if (error || !tutorial) {
    return <div className="py-10 text-center text-red-500">Failed to load tutorial</div>;
  }

  const chapters = tutorial.chapters || [];
  const questions = tutorial.testQuestions || [];
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
      const currentIndex = chapters.findIndex((c) => c.id === chapterId);
      const isLastChapter = currentIndex === chapters.length - 1;

      setCompletedChapters((prev) => new Set([...prev, chapterId]));

      updateProgress.mutate(
        {
          id: tutorialId,
          progress: {
            lastWatchTime: 0,
            lastChapterId: chapterId,
          },
        },
        {
          onSuccess: () => {
            toast.success("Chapter completed!");
            if (isLastChapter && questions.length === 0) {
              handleMarkComplete();
            }
          },
          onError: (error: any) => {
            setCompletedChapters((prev) => {
              const newSet = new Set(prev);
              newSet.delete(chapterId);
              return newSet;
            });
            const message = error?.response?.data?.message || error?.message || "Failed to update progress.";
            toast.error(message);
          },
        }
      );

      if (!isLastChapter) {
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
    setSubmittedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
  };

  const handleBookmarkToggle = () => {
    toggleBookmark.mutate(tutorialId, {
      onSuccess: () => {
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);
        toast.success(newBookmarkState ? "Tutorial bookmarked!" : "Bookmark removed!");
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || "Failed to update bookmark.";
        toast.error(message);
      },
    });
  };

  const handleMarkComplete = () => {
    markComplete.mutate(tutorialId, {
      onSuccess: () => {
        setShowCompletionModal(true);
        toast.success("Tutorial completed! Great job!");
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || "Failed to mark tutorial as complete.";
        toast.error(message);
      },
    });
  };

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">{tutorial.name}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            {tutorial.subject?.name && (
              <>
                <span>{tutorial.subject.name}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            <span>{tutorial.subscriberCount?.toLocaleString() || 0} Students</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleBookmarkToggle}
          disabled={toggleBookmark.isPending}
          className={cn(
            "shrink-0",
            isBookmarked && "text-[#F04F54] border-[#F04F54]"
          )}
        >
          <BookmarkSimple
            weight={isBookmarked ? "fill" : "regular"}
            className="w-5 h-5"
          />
        </Button>
      </div>

      {/* Main Layout: stacked on mobile, side-by-side on lg */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 lg:shrink-0">
          <Card className="p-4">
            {/* Thumbnail + Progress row on mobile, stacked on lg */}
            <div className="flex gap-4 lg:flex-col lg:gap-0">
              {/* Thumbnail */}
              <div className="aspect-square w-24 sm:w-28 lg:w-full lg:aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shrink-0 lg:mb-4">
                {tutorial.tutorialImages?.[0]?.url ? (
                  <img
                    src={tutorial.tutorialImages[0].url}
                    alt={tutorial.name}
                    className="w-full h-full object-cover"
                  />
                ) : tutorial.tutorialVideos?.[0]?.url ? (
                  <video
                    src={tutorial.tutorialVideos[0].url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50">
                    <Play weight="fill" className="w-10 h-10 lg:w-12 lg:h-12 text-[#F04F54] opacity-50" />
                  </div>
                )}
              </div>

              {/* Progress + Tabs beside thumbnail on mobile */}
              <div className="flex-1 min-w-0">
                {/* Progress */}
                <div className="mb-3 lg:mb-4">
                  <Progress value={progressPercent} className="mb-1">
                    <ProgressTrack className="h-1.5 bg-gray-200">
                      <ProgressIndicator className="bg-[#F04F54]" />
                    </ProgressTrack>
                  </Progress>
                  <p className="text-xs sm:text-sm text-gray-600">{progressPercent}% Complete</p>
                </div>

                {/* Tabs */}
                <div className="flex lg:flex-col gap-1 lg:mb-6">
                  <button
                    onClick={() => handleTabClick("lessons")}
                    className={cn(
                      "text-left px-3 py-2 rounded font-medium transition-colors text-sm",
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
                      "text-left px-3 py-2 rounded font-medium transition-colors text-sm",
                      activeTab === "test"
                        ? "border-l-4 border-[#F04F54] bg-red-50 text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Class Test
                  </button>
                </div>
              </div>
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
        <div className="flex-1 min-w-0 overflow-hidden">
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

          {/* Lesson Content View */}
          {viewMode === "lesson-content" && selectedChapter && (
            <ChapterContent
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
                  const answersList: TutorialQuizAnswer[] = Object.entries(answers).map(
                    ([questionId, answer]) => ({ questionId, answer })
                  );
                  submitQuestions.mutate(
                    { id: tutorialId, answers: { answers: answersList } },
                    {
                      onSuccess: () => {
                        toast.success("Quiz submitted successfully!");
                        handleMarkComplete();
                      },
                      onError: (error: any) => {
                        const message = error?.response?.data?.message || error?.message || "Failed to submit quiz. Please try again.";
                        toast.error(message);
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

      {/* Tutorial Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <Trophy weight="fill" className="w-16 h-16 text-yellow-500" />
            </div>
            <DialogTitle className="text-xl">Congratulations!</DialogTitle>
            <DialogDescription className="text-base">
              You have successfully completed this tutorial. Keep up the great work!
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCompletionModal(false)}
            >
              Stay Here
            </Button>
            <Link to="/tutorials" className="flex-1">
              <Button
                className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90"
              >
                Back to Tutorials
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_user/tutorials/$tutorialId")({
  component: TutorialDetailPage,
});
