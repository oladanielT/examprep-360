import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTutorial, useUpdateTutorialProgress, useSubmitTutorialQuestions, useMarkTutorialComplete, useToggleTutorialBookmark } from "@/feature/tutorials/hooks";
import { useStartPractice } from "@/feature/exams/hooks";
import { ArrowLeft, Play, CheckCircle, Warning, BookmarkSimple, Trophy } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, XP_PER_CORRECT_ANSWER } from "@/lib/utils";
import { toast } from "sonner";
import type { TutorialChapter, TutorialQuestion, TutorialQuizAnswer } from "@/api/types/tutorial.types";
import type { SubmitTutorialQuestionsResponse } from "@/api/types/tutorial.types";
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
      {videoData && (() => {
        const isYouTube = videoData.src.includes("youtube.com") || videoData.src.includes("youtu.be");

        if (isYouTube) {
          let videoId = "";
          if (videoData.src.includes("youtu.be/")) {
            videoId = videoData.src.split("youtu.be/")[1]?.split("?")[0] || "";
          } else if (videoData.src.includes("v=")) {
            videoId = videoData.src.split("v=")[1]?.split("&")[0] || "";
          }

          return (
            <div>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={videoData.title || "Video content"}
                />
              </div>
              {videoData.title && (
                <p className="text-sm text-gray-500 mt-2">{videoData.title}</p>
              )}
            </div>
          );
        }

        return (
          <div>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={videoData.src}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full"
              >
                <source src={videoData.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {videoData.title && (
              <p className="text-sm text-gray-500 mt-2">{videoData.title}</p>
            )}
          </div>
        );
      })()}

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
  selectedAnswers,
  onSelectAnswer,
  onToggleAnswer,
  onSubmitAnswer,
  isSubmitted,
  hasAnswer,
  onPrevious,
  onNext,
  onReport,
  isFirst,
  isLast,
}: {
  question: TutorialQuestion;
  questionNumber: number;
  selectedAnswer: string | null;
  selectedAnswers: string[];
  onSelectAnswer: (optionId: string) => void;
  onToggleAnswer: (optionId: string) => void;
  onSubmitAnswer: () => void;
  isSubmitted: boolean;
  hasAnswer: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReport: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const isMultipleChoice = question.questionType === "MULTIPLE_CHOICE";

  const isCorrect = isSubmitted && (
    isMultipleChoice
      ? question.correctAnswers.length === selectedAnswers.length &&
        question.correctAnswers.every((a) => selectedAnswers.includes(a))
      : selectedAnswer === question.correctAnswer
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      {question.instruction && (
        <div className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex items-start sm:items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0 mt-0.5 sm:mt-0">i</div>
          <p className="text-xs sm:text-sm">{question.instruction}</p>
        </div>
      )}

      {/* Question Card */}
      <Card className="p-4 sm:p-6">
        <p className="text-sm text-gray-500 mb-2">Question {questionNumber}</p>
        <div className="text-base sm:text-lg font-medium mb-4 sm:mb-6">
          <RichContentRenderer content={question.questionText} />
        </div>

        {/* Options - Single Choice */}
        {!isMultipleChoice && (
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={(value: unknown) => {
              if (!isSubmitted) onSelectAnswer(value as string);
            }}
            className="space-y-3"
          >
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const showCorrect = isSubmitted && option.id === question.correctAnswer;
              const showWrong = isSubmitted && isSelected && option.id !== question.correctAnswer;

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors",
                    !isSubmitted && "hover:bg-gray-50",
                    isSelected && !isSubmitted && "border-blue-500 bg-blue-50",
                    showCorrect && "border-green-500 bg-green-50",
                    showWrong && "border-red-500 bg-red-50"
                  )}
                >
                  <RadioGroupItem value={option.id} disabled={isSubmitted} />
                  <span className="text-sm sm:text-base flex-1">
                    <RichContentRenderer content={option.content} />
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        )}

        {/* Options - Multiple Choice */}
        {isMultipleChoice && (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              const showCorrect = isSubmitted && question.correctAnswers.includes(option.id);
              const showWrong = isSubmitted && isSelected && !question.correctAnswers.includes(option.id);

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors",
                    !isSubmitted && "hover:bg-gray-50",
                    isSelected && !isSubmitted && "border-blue-500 bg-blue-50",
                    showCorrect && "border-green-500 bg-green-50",
                    showWrong && "border-red-500 bg-red-50"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isSubmitted) onToggleAnswer(option.id);
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isSubmitted}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  <span className="text-sm sm:text-base flex-1">
                    <RichContentRenderer content={option.content} />
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* Submit Answer Button */}
        {!isSubmitted && (
          <Button
            onClick={onSubmitAnswer}
            disabled={!hasAnswer}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
          >
            Submit Answer
          </Button>
        )}

        {/* Explanation (shown after submit) */}
        {isSubmitted && (
          <div className="mt-4 sm:mt-6 space-y-4">
            {question.explanation?.solution && (
              <div className="bg-teal-600 text-white p-3 sm:p-4 rounded-lg">
                <p className="text-xs uppercase tracking-wide mb-1">Explanation</p>
                <div className="text-sm">
                  <RichContentRenderer content={question.explanation.solution} />
                </div>
              </div>
            )}
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
              {isCorrect && <span className="text-green-500 font-medium text-sm sm:text-base">+{XP_PER_CORRECT_ANSWER}XP</span>}
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

function TutorialQuizNavigator({
  totalQuestions,
  currentQuestion,
  selectedQuestions,
  submittedQuestions,
  correctQuestions,
  onQuestionSelect,
  onSubmitAnswer,
  onPrevious,
  onNext,
  onFinish,
  hasAnswer,
  isCurrentSubmitted,
  isFirst,
  isLast,
  isSubmitting,
}: {
  totalQuestions: number;
  currentQuestion: number;
  selectedQuestions: Set<number>;  // answered but not submitted
  submittedQuestions: Set<number>; // submitted (locked in)
  correctQuestions: Map<number, boolean>;
  onQuestionSelect: (index: number) => void;
  onSubmitAnswer: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  hasAnswer: boolean;
  isCurrentSubmitted: boolean;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
}) {
  const submitted = submittedQuestions.size;
  const correct = Array.from(correctQuestions.values()).filter(Boolean).length;
  const progressPercent = totalQuestions > 0 ? Math.round((submitted / totalQuestions) * 100) : 0;

  return (
    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4 lg:sticky lg:top-4">
      {/* Progress Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-500">{submitted}/{totalQuestions}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {submitted > 0 && (
          <p className="text-xs text-gray-500">
            {correct} correct · {submitted - correct} incorrect
          </p>
        )}
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 sm:gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isCurrent = i === currentQuestion;
          const isSubmitted = submittedQuestions.has(i);
          const isSelected = selectedQuestions.has(i);
          const correctness = correctQuestions.get(i);

          return (
            <button
              key={i}
              onClick={() => onQuestionSelect(i)}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50",
                isCurrent && "bg-blue-600 text-white ring-2 ring-blue-400/50",
                !isCurrent && isSubmitted && correctness === true && "bg-green-500 text-white",
                !isCurrent && isSubmitted && correctness === false && "bg-red-500 text-white",
                !isCurrent && !isSubmitted && isSelected && "bg-yellow-100 text-yellow-700 border border-yellow-300",
                !isCurrent && !isSubmitted && !isSelected && "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Current</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Correct</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Wrong</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-100 border border-yellow-300 inline-block" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> Unanswered</span>
      </div>

      {/* Submit Answer */}
      {!isCurrentSubmitted && (
        <Button
          onClick={onSubmitAnswer}
          disabled={!hasAnswer}
          className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
        >
          Submit Answer
        </Button>
      )}
      {isCurrentSubmitted && (
        <p className="text-center text-sm text-green-600 font-medium">Submitted ✓</p>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="rounded-full text-sm"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={isLast ? onFinish : onNext}
          disabled={isSubmitting}
          className={cn(
            "rounded-full text-sm",
            isLast && "bg-[#F04F54] text-white hover:bg-[#F04F54]/90 border-[#F04F54]"
          )}
        >
          {isSubmitting ? "Submitting..." : isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </Card>
  );
}

function TutorialDetailPage() {
  const { tutorialId } = Route.useParams();
  const navigate = useNavigate();
  const { data: tutorial, isLoading, error } = useTutorial(tutorialId);
  const updateProgress = useUpdateTutorialProgress();
  const submitQuestions = useSubmitTutorialQuestions();
  const markComplete = useMarkTutorialComplete();
  const toggleBookmark = useToggleTutorialBookmark();
  const startPractice = useStartPractice();

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
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [quizResults, setQuizResults] = useState<SubmitTutorialQuestionsResponse | null>(null);

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
    // Allow re-selecting (changing answer) before submission
    setAnswers((prev) => ({
      ...prev,
      [question.id]: prev[question.id] === optionId ? "" : optionId,
    }));
  };

  const handleToggleAnswer = (optionId: string) => {
    const question = questions[currentQuestionIndex];
    setMultiAnswers((prev) => {
      const current = prev[question.id] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [question.id]: updated };
    });
  };

  const handleSubmitCurrentAnswer = () => {
    setSubmittedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
  };

  // Track which questions have a selection (but not necessarily submitted)
  const getSelectedQuestions = () => {
    const selected = new Set<number>();
    questions.forEach((q, idx) => {
      if (answers[q.id]) selected.add(idx);
      if (multiAnswers[q.id]?.length > 0) selected.add(idx);
    });
    return selected;
  };

  const hasCurrentAnswer = () => {
    const q = questions[currentQuestionIndex];
    if (!q) return false;
    if (q.questionType === "MULTIPLE_CHOICE") {
      return (multiAnswers[q.id] || []).length > 0;
    }
    return !!answers[q.id];
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
                <AvatarFallback>AT</AvatarFallback>
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
          {viewMode === "test" && questions.length > 0 && (() => {
            // Compute correctness map for navigator
            const correctMap = new Map<number, boolean>();
            questions.forEach((q, idx) => {
              if (!submittedQuestions.has(idx)) return;
              const isMulti = q.questionType === "MULTIPLE_CHOICE";
              if (isMulti) {
                const selected = multiAnswers[q.id] || [];
                const isCorrect =
                  q.correctAnswers.length === selected.length &&
                  q.correctAnswers.every((a) => selected.includes(a));
                correctMap.set(idx, isCorrect);
              } else {
                correctMap.set(idx, answers[q.id] === q.correctAnswer);
              }
            });

            const handleFinish = () => {
              const answersList: TutorialQuizAnswer[] = questions.map((q) => ({
                questionId: q.id,
                answer: q.questionType === "MULTIPLE_CHOICE"
                  ? (multiAnswers[q.id] || []).sort().join(",")
                  : (answers[q.id] || ""),
              }));
              submitQuestions.mutate(
                { id: tutorialId, answers: { answers: answersList } },
                {
                  onSuccess: (data) => {
                    setQuizResults(data);
                    toast.success("Quiz submitted successfully!");
                    handleMarkComplete();
                  },
                  onError: (error: any) => {
                    const message = error?.response?.data?.message || error?.message || "Failed to submit quiz. Please try again.";
                    toast.error(message);
                  },
                }
              );
            };

            const selectedQs = getSelectedQuestions();

            return (
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Navigator — top on mobile, right side on desktop */}
                <div className="w-full lg:w-56 lg:order-2 shrink-0">
                  <TutorialQuizNavigator
                    totalQuestions={questions.length}
                    currentQuestion={currentQuestionIndex}
                    selectedQuestions={selectedQs}
                    submittedQuestions={submittedQuestions}
                    correctQuestions={correctMap}
                    onQuestionSelect={setCurrentQuestionIndex}
                    onSubmitAnswer={handleSubmitCurrentAnswer}
                    onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                    onNext={() => setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))}
                    onFinish={handleFinish}
                    hasAnswer={hasCurrentAnswer()}
                    isCurrentSubmitted={submittedQuestions.has(currentQuestionIndex)}
                    isFirst={currentQuestionIndex === 0}
                    isLast={currentQuestionIndex === questions.length - 1}
                    isSubmitting={submitQuestions.isPending}
                  />
                </div>

                {/* Question Area */}
                <div className="flex-1 min-w-0 lg:order-1">
                  <QuizQuestion
                    question={questions[currentQuestionIndex]}
                    questionNumber={currentQuestionIndex + 1}
                    selectedAnswer={answers[questions[currentQuestionIndex].id] || null}
                    selectedAnswers={multiAnswers[questions[currentQuestionIndex].id] || []}
                    onSelectAnswer={handleAnswerSelect}
                    onToggleAnswer={handleToggleAnswer}
                    onSubmitAnswer={handleSubmitCurrentAnswer}
                    isSubmitted={submittedQuestions.has(currentQuestionIndex)}
                    hasAnswer={hasCurrentAnswer()}
                    onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                    onNext={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex((i) => i + 1);
                      } else {
                        handleFinish();
                      }
                    }}
                    onReport={() => {/* TODO: Implement report */}}
                    isFirst={currentQuestionIndex === 0}
                    isLast={currentQuestionIndex === questions.length - 1}
                  />
                </div>
              </div>
            );
          })()}

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
              You completed {tutorial.name}
            </DialogDescription>
          </DialogHeader>

          {/* Quiz Results */}
          {quizResults && (
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-1">
              <p className="text-sm font-medium">
                Score: {quizResults.correctCount}/{quizResults.totalCount} ({quizResults.score}%)
              </p>
              <p className="text-sm text-green-600 font-medium">
                XP Earned: +{quizResults.xpEarned} XP
              </p>
            </div>
          )}

          {/* Practice Prompt */}
          <div className="text-sm text-gray-600">
            <p>Ready to test your knowledge?</p>
            <p>Practice {tutorial.subject?.name || "related"} questions to reinforce what you learned.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90"
              disabled={startPractice.isPending}
              onClick={() => {
                startPractice.mutate(
                  {
                    subjectId: tutorial.subjectId,
                    topicIds: tutorial.topicId ? [tutorial.topicId] : undefined,
                  },
                  {
                    onSuccess: (data) => {
                      navigate({ to: "/exam/$attemptId", params: { attemptId: data.id } });
                    },
                    onError: (error: any) => {
                      const message = error?.response?.data?.message || error?.message || "Failed to start practice.";
                      toast.error(message);
                    },
                  }
                );
              }}
            >
              {startPractice.isPending ? "Starting..." : "Practice Now"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCompletionModal(false)}
            >
              Maybe Later
            </Button>
            <Link to="/tutorials" className="w-full">
              <Button
                variant="ghost"
                className="w-full text-gray-500"
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
