import React from 'react'
import {
    Choicebox,
    ChoiceboxIndicator,
    ChoiceboxItem,
    ChoiceboxItemDescription,
    ChoiceboxItemHeader, ChoiceboxItemTitle
} from "@/components/kibo-ui/choicebox";
import PrimaryButton from "@/components/buttons/primary-button";
const options = [
    {
        id: "1",
        label: "Create New Course",
    },
    {
        id: "2",
        label: "Select existing course",
        description: "Select a course from a list of already existing courses",
    },
];

interface SelectCourseGroupProps {
onClick: () => void,

}

export default function SelectCourseRadioGroup({onClick }: SelectCourseGroupProps) {
    return   <div className=" space-y-4">
            <Choicebox defaultValue="1">
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
            <PrimaryButton onClick={onClick} title="Continue" className=" max-w-full" />
        </div>
}
