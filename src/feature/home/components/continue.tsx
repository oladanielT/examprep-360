import { Card } from '@/components/ui/card'
import { Progress } from "@/components/ui/progress"
import PrimaryButton from '@/components/buttons/primary-button'
import { usePausedExams } from '@/feature/activities/hooks/useActivities'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export default function Continue() {
    const { data: pausedExams, isLoading } = usePausedExams()
    const navigate = useNavigate()

    if (isLoading) {
        return (
            <div className="py-10">
                <h2 className='font-semibold text-2xl mb-5'>Jump back in</h2>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F04F54]" />
                </div>
            </div>
        )
    }

    if (!pausedExams || pausedExams.length === 0) {
        return (
            <div className="py-10">
                <h2 className='font-semibold text-2xl mb-5'>Jump back in</h2>
                <Empty className="border rounded-xl py-8">
                    <EmptyHeader>
                        <EmptyTitle>No paused exams</EmptyTitle>
                        <EmptyDescription>
                            You don't have any exams in progress. Start a new exam to see it here.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    return (
        <div className="py-10">
            <h2 className='font-semibold text-2xl mb-5'>Jump back in</h2>
            <div className='grid grid-cols-3 gap-5'>
                {pausedExams.slice(0, 3).map((exam) => {
                    const subject = exam.exam?.subject?.name || "Unknown Subject"
                    const examTitle = exam.exam?.name || "Practice Exam"
                    const totalQuestions = exam.exam?.numQuestions || 0
                    const answeredQuestions = exam._count?.responses || 0
                    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

                    return (
                        <Card key={exam.id} className="overflow-hidden">
                            <img
                                width={2000}
                                height={2000}
                                alt='exam'
                                src={"/img/dummy.png"}
                                className='h-28 w-full object-cover'
                            />
                            <div className='px-5 py-5 space-y-5'>
                                <div>
                                    <h1 className='font-medium text-lg line-clamp-1'>{subject}</h1>
                                    <p className='opacity-60 text-sm line-clamp-1'>{examTitle}</p>
                                </div>
                                <div className="space-y-2">
                                    <Progress value={progress} />
                                    <p className="text-xs text-gray-500">
                                        {answeredQuestions} of {totalQuestions} questions answered
                                    </p>
                                </div>
                                <PrimaryButton
                                    title='Continue'
                                    className='bg-black hover:bg-black/50 text-white w-full'
                                    onClick={() => navigate({ to: `/exam/${exam.id}` })}
                                />
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
