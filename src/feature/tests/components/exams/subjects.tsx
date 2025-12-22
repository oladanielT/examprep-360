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
import { ArrowLeft, X } from 'lucide-react';

const options = [
    {
        id: "1",
        label: "Practice Test",
        description: "Select Subject and set duration of your practice test.",
    },
    {
        id: "2",
        label: "Mock Exam",
        description: "Quick question: How does it feel knowing you’re the most interesting person on this app?",
    },
];

export default function Subjects() {
    return (
        <div className=' grid grid-cols-5 gap-x-5 gap-y-10 py-10'>

            {new Array(10).fill(0).map((_, index) =>
                <DialogStack key={index}>
                    <DialogStackTrigger asChild>
                        <CustomCard className=' cursor-pointer' src='/img/jamb.png' imgClassName=' w-24 '>
                            <div>
                                <h6 className=' text-lg  font-medium text-center pt-2'>English Language</h6>
                                <p className=' text-gray-400  text-center'>2025</p>
                            </div>
                        </CustomCard>
                    </DialogStackTrigger>
                    <DialogStackOverlay />
                    <DialogStackBody>
                        <DialogStackContent className=' '>
                            <DialogStackHeader className='  font-semibold text-lg text-center!'>Select Test Option</DialogStackHeader>
                            <Choicebox className=' my-5' defaultValue="1">
                                {options.map((option) => (
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
                            
                            <StepTwo />
                        </DialogStackContent>
                    </DialogStackBody></DialogStack>
            )}
        </div>
    )
}
