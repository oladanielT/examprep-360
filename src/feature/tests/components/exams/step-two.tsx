'use client'
import PrimaryButton from '@/components/buttons/primary-button'
import { CustomSelect } from '@/components/custom/custom-select'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'
import { useForm } from '@tanstack/react-form'
import { useConfigurePractice } from '@/feature/exams/hooks'
import { useNavigate } from '@tanstack/react-router'
import type { Subject } from '@/api/types/exam.types'
import z from 'zod'

const formSchema = z.object({
    questionCount: z.number().min(10).max(100),
    timeLimit: z.string(),
    difficulty: z.string(),
    questionType: z.string(),
    year: z.string(),
});

const timeLimitOptions = [
    { label: "No Limit", value: "" },
    { label: "15 mins", value: "15" },
    { label: "30 mins", value: "30" },
    { label: "45 mins", value: "45" },
    { label: "60 mins", value: "60" },
];

const difficultyOptions = [
    { label: "All Difficulties", value: "" },
    { label: "Easy", value: "EASY" },
    { label: "Medium", value: "MEDIUM" },
    { label: "Hard", value: "HARD" },
];

const questionTypeOptions = [
    { label: "All Types", value: "" },
    { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
    { label: "True/False", value: "TRUE_FALSE" },
    { label: "Fill in the Blank", value: "FILL_BLANK" },
];

const currentYear = new Date().getFullYear();
const yearOptions = [
    { label: "All Years", value: "" },
    ...Array.from({ length: 10 }, (_, i) => ({
        label: String(currentYear - i),
        value: String(currentYear - i),
    })),
];

interface ConfigurePracticeFormProps {
    subject: Subject;
    onClose?: () => void;
}

export default function ConfigurePracticeForm({ subject, onClose }: ConfigurePracticeFormProps) {
    const navigate = useNavigate();
    const configurePractice = useConfigurePractice();

    const form = useForm({
        defaultValues: {
            questionCount: 20,
            timeLimit: "",
            difficulty: "",
            questionType: "",
            year: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            configurePractice.mutate(
                {
                    subjectId: subject.id,
                    questionCount: value.questionCount,
                    timeLimit: value.timeLimit ? parseInt(value.timeLimit) : undefined,
                    difficulty: value.difficulty ? value.difficulty as "EASY" | "MEDIUM" | "HARD" : undefined,
                    questionTypes: value.questionType ? [value.questionType as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "ESSAY"] : undefined,
                    year: value.year ? parseInt(value.year) : undefined,
                    title: `${subject.name} Practice`,
                },
                {
                    onSuccess: () => {
                        onClose?.();
                        navigate({ to: '/tests/exam' });
                    },
                }
            );
        },
    });

    return (
        <div>
            <h5 className='font-semibold text-lg text-center! mb-6'>Configure Practice</h5>
            <p className='text-sm text-gray-500 text-center mb-4'>Subject: {subject.name}</p>
            <form
                className="w-full space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
            >
                {/* Number of Questions */}
                <form.Field
                    name="questionCount"
                    children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="flex items-center justify-between mb-2">
                                    <FieldLabel className="text-[#6D6D6D] uppercase text-xs">
                                        Number of Questions
                                    </FieldLabel>
                                    <span className="text-[14px] font-semibold text-accent">
                                        {field.state.value} Questions
                                    </span>
                                </div>
                                <Slider
                                    min={10}
                                    max={100}
                                    step={5}
                                    value={[field.state.value]}
                                    onValueChange={(value) => {
                                        const values = value as number[];
                                        field.handleChange(values[0]);
                                    }}
                                    className="w-full"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                />

                {/* Time Limit */}
                <FieldGroup className="w-full">
                    <form.Field
                        name="timeLimit"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel className="text-[#6D6D6D] uppercase text-[12px]">
                                        Time Limit
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={timeLimitOptions}
                                        placeholder="Select time limit"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>

                {/* Difficulty */}
                <FieldGroup className="w-full">
                    <form.Field
                        name="difficulty"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel className="text-[#6D6D6D] uppercase text-[12px]">
                                        Difficulty
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={difficultyOptions}
                                        placeholder="Select difficulty"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>

                {/* Question Type */}
                <FieldGroup className="w-full">
                    <form.Field
                        name="questionType"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel className="text-[#6D6D6D] uppercase text-[12px]">
                                        Question Type
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={questionTypeOptions}
                                        placeholder="Select question type"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>

                {/* Year */}
                <FieldGroup className="w-full">
                    <form.Field
                        name="year"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel className="text-[#6D6D6D] uppercase text-[12px]">
                                        Year
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={yearOptions}
                                        placeholder="Select year"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>

                <PrimaryButton
                    type="submit"
                    title={configurePractice.isPending ? 'Starting...' : 'Start Practice'}
                    disabled={configurePractice.isPending}
                    className='mt-5 bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex justify-self-center text-white'
                />
            </form>
        </div>
    )
}
