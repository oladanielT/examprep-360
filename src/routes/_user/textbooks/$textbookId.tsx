import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTutorial, useUpdateTutorialProgress, useSubmitTutorialQuestions, useMarkTutorialComplete, useToggleTutorialBookmark } from "@/feature/tutorials/hooks";
import { useStartPractice } from "@/feature/exams/hooks";
import { ArrowLeft, CheckCircle, Warning, BookmarkSimple, Trophy, Book } from "@phosphor-icons/react";
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
import { Explanation } from "@/components/questions/Explanation";

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
        <p className="text-sm text-gray-400">Chapter {chapter.order}</p>
      </div>
      {isCompleted && <CheckCircle weight="fill" className="w-5 h-5 text-green-500 mt-1 shrink-0" />}
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
      <h2 className="text-lg sm:text-xl font-semibold">{chapter.name}</h2>

      {/* Rich Content from chapter blocks */}
      <div className="max-w-none overflow-hidden break-words [word-break:break-word]">
        {chapter.content && Array.isArray(chapter.content) && chapter.content.length > 0 ? (
          <RichContentRenderer
            content={chapter.content}
            className="space-y-4 text-sm sm:text-base text-gray-700"
          />
        ) : (
          <p className="text-gray-500 text-center py-6">No content available for this chapter.</p>
        )}
      </div>

      {/* Documents */}
      {chapter.documents && chapter.documents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Documents</h3>
          <div className="space-y-2">
            {chapter.documents.map((doc, idx) => {
              const sizeInMB = doc.bytes ? (doc.bytes / (1024 * 1024)).toFixed(1) : null;
              const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(doc.url)}&embedded=true`;
              return (
                <a
                  key={idx}
                  href={viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-lg">📄</span>
                  <span className="text-sm font-medium text-gray-700">Document {idx + 1}</span>
                  {sizeInMB && (
                    <span className="text-xs text-gray-400 ml-auto">{sizeInMB} MB</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
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
  selectedAnswers: string[];
  onSelectAnswer: (optionId: string) => void;
  onToggleAnswer: (optionId: string) => void;
  isSubmitted: boolean;
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
            onValueChange={(value: unknown) => onSelectAnswer(value as string)}
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
                    isSelected && !isSubmitted && "border-[#F04F54] bg-red-50",
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
                    isSelected && !isSubmitted && "border-[#F04F54] bg-red-50",
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

        {/* Explanation (shown after submit) */}
        {isSubmitted && (
          <div className="mt-4 sm:mt-6 space-y-4">
            {question.explanation?.solution && (
              <Explanation explanation={{ solution: question.explanation.solution }} />
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

function TextbookDetailPage() {
  const { textbookId } = Route.useParams();
  const navigate = useNavigate();
  const { data: textbook, isLoading, error } = useTutorial(textbookId);
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

  // Initialize state from textbook data
  useEffect(() => {
    if (textbook) {
      if (textbook.isBookmarked !== undefined) {
        setIsBookmarked(textbook.isBookmarked);
      }

      if (textbook.userProgress?.lastChapterId && textbook.chapters) {
        const lastChapterIndex = textbook.chapters.findIndex(
          (c) => c.id === textbook.userProgress?.lastChapterId
        );
        if (lastChapterIndex !== -1) {
          const completedIds = textbook.chapters
            .slice(0, lastChapterIndex + 1)
            .map((c) => c.id);
          setCompletedChapters(new Set(completedIds));
        }
      }

      if (textbook.userProgress?.isCompleted && textbook.chapters) {
        setCompletedChapters(new Set(textbook.chapters.map((c) => c.id)));
      }
    }
  }, [textbook]);

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
      const currentIndex = chapters.findIndex((c) => c.id === chapterId);
      const isLastChapter = currentIndex === chapters.length - 1;

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

  const handleToggleAnswer = (optionId: string) => {
    const question = questions[currentQuestionIndex];
    setMultiAnswers((prev) => {
      const current = prev[question.id] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [question.id]: updated };
    });
    setSubmittedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
  };

  const handleBookmarkToggle = () => {
    toggleBookmark.mutate(textbookId, {
      onSuccess: () => {
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);
        toast.success(newBookmarkState ? "Textbook bookmarked!" : "Bookmark removed!");
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || "Failed to update bookmark.";
        toast.error(message);
      },
    });
  };

  const handleMarkComplete = () => {
    markComplete.mutate(textbookId, {
      onSuccess: () => {
        setShowCompletionModal(true);
        toast.success("Textbook completed! Great job!");
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || "Failed to mark textbook as complete.";
        toast.error(message);
      },
    });
  };

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <Link to="/textbooks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">{textbook.name}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            {textbook.subject?.name && (
              <>
                <span>{textbook.subject.name}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            <span>{textbook.subscriberCount?.toLocaleString() || 0} Students</span>
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
                {textbook.tutorialImages?.[0]?.url ? (
                  <img
                    src={textbook.tutorialImages[0].url}
                    alt={textbook.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                    <Book weight="fill" className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500 opacity-50" />
                  </div>
                )}
              </div>

              {/* Progress + Tabs on mobile beside thumbnail */}
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
              selectedAnswers={multiAnswers[questions[currentQuestionIndex].id] || []}
              onSelectAnswer={handleAnswerSelect}
              onToggleAnswer={handleToggleAnswer}
              isSubmitted={submittedQuestions.has(currentQuestionIndex)}
              onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              onNext={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex((i) => i + 1);
                } else {
                  const answersList: TutorialQuizAnswer[] = questions.map((q) => ({
                    questionId: q.id,
                    answer: q.questionType === "MULTIPLE_CHOICE"
                      ? (multiAnswers[q.id] || []).sort().join(",")
                      : (answers[q.id] || ""),
                  }));
                  submitQuestions.mutate(
                    { id: textbookId, answers: { answers: answersList } },
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
            <DialogTitle>Finish Textbook First</DialogTitle>
            <DialogDescription>
              Finish all chapters to take the Class test.
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

      {/* Textbook Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <Trophy weight="fill" className="w-16 h-16 text-yellow-500" />
            </div>
            <DialogTitle className="text-xl">Congratulations!</DialogTitle>
            <DialogDescription className="text-base">
              You completed {textbook.name}
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
            <p>Practice {textbook.subject?.name || "related"} questions to reinforce what you learned.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-[#F04F54] hover:bg-[#F04F54]/90"
              disabled={startPractice.isPending}
              onClick={() => {
                startPractice.mutate(
                  {
                    subjectId: textbook.subjectId,
                    topicIds: textbook.topicId ? [textbook.topicId] : undefined,
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
            <Link to="/textbooks" className="w-full">
              <Button
                variant="ghost"
                className="w-full text-gray-500"
              >
                Back to Textbooks
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_user/textbooks/$textbookId")({
  component: TextbookDetailPage,
});
