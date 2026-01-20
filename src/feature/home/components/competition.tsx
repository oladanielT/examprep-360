'use client'
import PrimaryButton from '@/components/buttons/primary-button'
import { CustomDialog } from '@/components/global/custom-dialog'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { useAvailableExams, useStartExam } from '@/feature/exams/hooks/useExams'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import type { AvailableExam } from '@/api/types'

export default function Competition() {
    const [selectedExam, setSelectedExam] = useState<AvailableExam | null>(null)
    const [open, setOpen] = useState(false)
    const { data: examsResponse, isLoading } = useAvailableExams({ examTypeEnum: "BIG_MOCK" })
    const startExam = useStartExam()
    const navigate = useNavigate()

    // Handle both ungrouped array and grouped object responses
    const exams = Array.isArray(examsResponse) ? examsResponse : []

    const handleStartExam = () => {
        if (!selectedExam) return

        startExam.mutate(selectedExam.id, {
            onSuccess: (data) => {
                setOpen(false)
                navigate({ to: `/exam/${data.id}` })
            },
        })
    }

    const openDialog = (exam: AvailableExam) => {
        setSelectedExam(exam)
        setOpen(true)
    }

    if (isLoading) {
        return (
            <div className='py-10'>
                <h2 className='font-semibold text-2xl mb-5'>Mock Exam Competition</h2>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F04F54]" />
                </div>
            </div>
        )
    }

    if (!exams || exams.length === 0) {
        return (
            <div className='py-10'>
                <h2 className='font-semibold text-2xl mb-5'>Mock Exam Competition</h2>
                <Empty className="border rounded-xl py-8">
                    <EmptyHeader>
                        <EmptyTitle>No competitions available</EmptyTitle>
                        <EmptyDescription>
                            There are no mock exam competitions at the moment. Check back later.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        )
    }

    return (
        <div className='py-10'>
            <h2 className='font-semibold text-2xl mb-5'>Mock Exam Competition</h2>
            <div className='grid grid-cols-3 gap-5'>
                {exams.map((exam) => {
                    const timeRemaining = new Date(exam.endDate).getTime() - Date.now()
                    const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)))
                    const isActive = timeRemaining > 0

                    return (
                        <Card key={exam.id} className='flex-row p-5'>
                            <img
                                width={2000}
                                height={2000}
                                alt='exam'
                                src={"/img/mock.png"}
                                className='w-full'
                            />
                            <div>
                                <div>
                                    <h1 className='mb-3 text-sm font-medium'>{exam.name}</h1>
                                    <p className='opacity-60 text-xs'>
                                        {exam.description || "Participate in the exam competition for a chance to win a cash prize"}
                                    </p>
                                    {isActive && (
                                        <p className='text-xs text-orange-500 mt-2'>
                                            {hoursRemaining}h remaining
                                        </p>
                                    )}
                                </div>
                                <PrimaryButton
                                    title='Take Mock Exam'
                                    className='bg-black h-10 mt-4 hover:bg-black/50 text-white'
                                    onClick={() => openDialog(exam)}
                                    disabled={!isActive}
                                />
                            </div>
                        </Card>
                    )
                })}
            </div>

            <CustomDialog
                className=''
                size='xl'
                title=''
                onOpenChange={(isOpen) => setOpen(isOpen)}
                open={open}
                trigger={<div />}
            >
                {selectedExam && (
                    <div className='max-w-sm space-y-3 mx-auto text-center'>
                        <img
                            width={2000}
                            height={2000}
                            alt='exam'
                            src={"/img/mock.png"}
                            className='mx-auto h-28 w-28'
                        />
                        <div>
                            <h2 className='text-lg font-medium'>{selectedExam.name}</h2>
                            <p className='opacity-60'>
                                {selectedExam.description || "Participate in the exam competition for a chance to win a cash prize. This is available for a limited time, take time out to prepare for the exam before taking it or take it now."}
                            </p>
                            <div className='mt-4 text-sm text-gray-600 space-y-1'>
                                <p>Duration: {selectedExam.durationMinutes} minutes</p>
                                <p>Questions: {selectedExam.numQuestions}</p>
                                <p>Passing Score: {selectedExam.passingScore}%</p>
                            </div>
                        </div>
                        <PrimaryButton
                            title={startExam.isPending ? 'Starting...' : 'Start Mock Exam'}
                            className='h-12 text-white bg-[#F04F54] hover:bg-[#F04F54]/60'
                            onClick={handleStartExam}
                            disabled={startExam.isPending}
                        />
                    </div>
                )}
            </CustomDialog>
        </div>
    )
}
