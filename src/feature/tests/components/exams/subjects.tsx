import { useState } from 'react';
import PrimaryButton from '@/components/buttons/primary-button';
import CustomCard from '@/components/global/custom-card';
import {
    Choicebox, ChoiceboxIndicator,
    ChoiceboxItem,
    ChoiceboxItemDescription,
    ChoiceboxItemHeader, ChoiceboxItemTitle
} from '@/components/kibo-ui/choicebox';
import { DialogStack, DialogStackOverlay, DialogStackTrigger, DialogStackBody, DialogStackContent, DialogStackHeader, DialogStackNext, DialogStackPrevious } from '@/components/kibo-ui/dialog-stack';
import ConfigurePracticeForm from './step-two';
import { ArrowLeft } from 'lucide-react';
import { useExamPreferences, useAvailableExams, useStartPractice } from '@/feature/exams/hooks';
import { useNavigate } from '@tanstack/react-router';
import type { Subject as SubjectType, AvailableExam, AvailableExamsGrouped } from '@/api/types/exam.types';

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
function MockSelection({ subject, onClose }: { subject: SubjectType; onClose?: () => void }) {
    const [selectedMockId, setSelectedMockId] = useState<string>("");
    const navigate = useNavigate();
    const { data, isLoading, error } = useAvailableExams({
        subjectId: subject.id,
        examTypeEnum: 'MOCK',
    });

    // Handle both grouped and ungrouped responses
    const isGrouped = data && !Array.isArray(data);
    const groupedData = isGrouped ? (data as AvailableExamsGrouped) : null;
    const ungroupedData = !isGrouped ? (data as AvailableExam[]) : null;
    const mocks: AvailableExam[] = groupedData
        ? Object.values(groupedData).flat()
        : (ungroupedData || []);

    const handleStartMock = () => {
        if (selectedMockId) {
            onClose?.();
            navigate({ to: '/exam', search: { examId: selectedMockId } });
        }
    };

    if (isLoading) {
        return <div className="py-5 text-center">Loading available mocks...</div>;
    }

    if (error) {
        return <div className="py-5 text-center text-red-500">Failed to load mocks</div>;
    }

    if (mocks.length === 0) {
        return <div className="py-5 text-center text-gray-500">No mocks available for this subject</div>;
    }

    return (
        <>
            <Choicebox
                className='my-5'
                defaultValue={mocks[0]?.id}
                onValueChange={(value) => setSelectedMockId(value)}
            >
                {mocks.map((mock) => (
                    <ChoiceboxItem key={mock.id} value={mock.id}>
                        <ChoiceboxItemHeader>
                            <ChoiceboxItemTitle>
                                {mock.name}
                            </ChoiceboxItemTitle>
                            <ChoiceboxItemDescription>
                                {mock.numQuestions} questions • {mock.durationMinutes} mins
                                {mock._count.attempts > 0 && ` • Attempted ${mock._count.attempts}/${mock.allowedAttempts}`}
                            </ChoiceboxItemDescription>
                        </ChoiceboxItemHeader>
                        <ChoiceboxIndicator />
                    </ChoiceboxItem>
                ))}
            </Choicebox>
            <PrimaryButton
                title='Start Mock'
                onClick={handleStartMock}
                className='bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white'
            />
        </>
    );
}

// Subject card with its own dialog state
function SubjectCard({ subject }: { subject: SubjectType }) {
    const [selectedTestType, setSelectedTestType] = useState<string>("practice");
    const [selectedPracticeOption, setSelectedPracticeOption] = useState<string>("jump");
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const startPractice = useStartPractice();

    const handleJumpStraightIn = () => {
        startPractice.mutate(
            {
                subjectId: subject.id,
                title: `${subject.name} Practice`,
            },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    navigate({ to: '/exam' }); // Navigate to exam page
                },
            }
        );
    };

    return (
        <DialogStack open={isOpen} onOpenChange={setIsOpen}>
            <DialogStackTrigger asChild>
                <CustomCard
                    className='cursor-pointer'
                    src='/img/jamb.png'
                    imgClassName='w-24'
                >
                    <div>
                        <h6 className='text-lg font-medium text-center pt-2'>
                            {subject.name}
                        </h6>
                    </div>
                </CustomCard>
            </DialogStackTrigger>
            <DialogStackOverlay />
            <DialogStackBody>
                {/* Step 1: Select Practice or Mock */}
                <DialogStackContent>
                    <DialogStackHeader className='font-semibold text-lg text-center!'>
                        Select Test Type
                    </DialogStackHeader>
                    <Choicebox
                        className='my-5'
                        defaultValue="practice"
                        onValueChange={(value) => setSelectedTestType(value)}
                    >
                        {testTypeOptions.map((option) => (
                            <ChoiceboxItem key={option.id} value={option.id}>
                                <ChoiceboxItemHeader>
                                    <ChoiceboxItemTitle>
                                        {option.label}
                                    </ChoiceboxItemTitle>
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
                            title='Continue'
                            className='bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white'
                        />
                    </DialogStackNext>
                </DialogStackContent>

                {/* Step 2: Practice or Mock options based on selection */}
                <DialogStackContent className='relative'>
                    <DialogStackPrevious className='left-5 absolute top-7' asChild>
                        <button className='flex items-center gap-2 font-medium'>
                            <ArrowLeft />
                        </button>
                    </DialogStackPrevious>

                    {selectedTestType === 'practice' ? (
                        <>
                            <DialogStackHeader className='font-semibold text-lg text-center! pt-8'>
                                Practice Options
                            </DialogStackHeader>
                            <Choicebox
                                className='my-5'
                                defaultValue="jump"
                                onValueChange={(value) => setSelectedPracticeOption(value)}
                            >
                                {practiceOptions.map((option) => (
                                    <ChoiceboxItem key={option.id} value={option.id}>
                                        <ChoiceboxItemHeader>
                                            <ChoiceboxItemTitle>
                                                {option.label}
                                            </ChoiceboxItemTitle>
                                            <ChoiceboxItemDescription>
                                                {option.description}
                                            </ChoiceboxItemDescription>
                                        </ChoiceboxItemHeader>
                                        <ChoiceboxIndicator />
                                    </ChoiceboxItem>
                                ))}
                            </Choicebox>
                            {selectedPracticeOption === 'jump' ? (
                                <PrimaryButton
                                    title={startPractice.isPending ? 'Starting...' : 'Start Practice'}
                                    disabled={startPractice.isPending}
                                    onClick={handleJumpStraightIn}
                                    className='bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white'
                                />
                            ) : (
                                <DialogStackNext asChild>
                                    <PrimaryButton
                                        title='Continue'
                                        className='bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white'
                                    />
                                </DialogStackNext>
                            )}
                        </>
                    ) : (
                        <>
                            <DialogStackHeader className='font-semibold text-lg text-center! pt-8'>
                                Select Mock Exam
                            </DialogStackHeader>
                            <MockSelection subject={subject} onClose={() => setIsOpen(false)} />
                        </>
                    )}
                </DialogStackContent>

                {/* Step 3: Configure Practice form */}
                <DialogStackContent className='relative'>
                    <DialogStackPrevious className='left-5 absolute top-7' asChild>
                        <button className='flex items-center gap-2 font-medium'>
                            <ArrowLeft />
                        </button>
                    </DialogStackPrevious>
                    <ConfigurePracticeForm subject={subject} onClose={() => setIsOpen(false)} />
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
        return <div className="py-10 text-center text-red-500">Failed to load subjects</div>;
    }

    const subjects = data?.subjects || [];

    return (
        <div className='grid grid-cols-5 gap-x-5 gap-y-10 py-10'>
            {subjects.length === 0 && (
                <div className="col-span-5 text-center py-10 text-gray-500">
                    No subjects available
                </div>
            )}
            {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
            ))}
        </div>
    );
}
