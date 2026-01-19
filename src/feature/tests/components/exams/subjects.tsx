import PrimaryButton from '@/components/buttons/primary-button';
import CustomCard from '@/components/global/custom-card';
import {
    Choicebox, ChoiceboxIndicator,
    ChoiceboxItem,
    ChoiceboxItemDescription,
    ChoiceboxItemHeader, ChoiceboxItemTitle
} from '@/components/kibo-ui/choicebox';
import { DialogStack, DialogStackOverlay, DialogStackTrigger, DialogStackBody, DialogStackContent, DialogStackHeader, DialogStackNext, DialogStackPrevious } from '@/components/kibo-ui/dialog-stack';
import StepTwo from './step-two';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useStudentPreferences } from '@/feature/exams/hooks/useExams';

const testOptions = [
    {
        id: "PRACTICE",
        label: "Practice Test",
        description: "Select Subject and set duration of your practice test.",
    },
    {
        id: "MOCK",
        label: "Mock Exam",
        description: "Take a timed mock exam to simulate the real test experience.",
    },
];

export default function Subjects() {
    const { data: preferences, isLoading, error } = useStudentPreferences();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-destructive">Failed to load preferences. Please try again.</p>
            </div>
        );
    }

    const subjects = preferences?.selectedSubjects ?? [];

    return (
        <div className=' grid grid-cols-5 gap-x-5 gap-y-10 py-10'>
            {subjects.length === 0 ? (
                <div className="col-span-5 text-center py-10 text-muted-foreground">
                    No subjects available. Please update your preferences.
                </div>
            ) : (
                subjects.map((subject) => (
                    <DialogStack key={subject}>
                        <DialogStackTrigger asChild>
                            <CustomCard className=' cursor-pointer' src='/img/jamb.png' imgClassName=' w-24 '>
                                <div>
                                    <h6 className=' text-lg  font-medium text-center pt-2'>{subject}</h6>
                                    <p className=' text-gray-400  text-center'>Select to start</p>
                                </div>
                            </CustomCard>
                        </DialogStackTrigger>
                        <DialogStackOverlay />
                        <DialogStackBody>
                            <DialogStackContent className=' '>
                                <DialogStackHeader className='  font-semibold text-lg text-center!'>Select Test Option</DialogStackHeader>
                                <Choicebox className=' my-5' defaultValue="PRACTICE">
                                    {testOptions.map((option) => (
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
                                    <PrimaryButton title='Continue' className=' bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex  justify-self-center  text-white' />
                                </DialogStackNext>

                            </DialogStackContent>
                            <DialogStackContent className=' relative '>
                                <DialogStackPrevious className=' left-5 absolute top-7' asChild>
                                    <button className='  flex items-center gap-2  font-medium'> <ArrowLeft />
                                    </button>
                                </DialogStackPrevious>

                                <StepTwo subjectId={subject} />
                            </DialogStackContent>
                        </DialogStackBody>
                    </DialogStack>
                ))
            )}
        </div>
    )
}
