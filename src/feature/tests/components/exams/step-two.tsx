'use client'
import PrimaryButton from '@/components/buttons/primary-button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { useForm } from '@tanstack/react-form'
import { useConfigurePractice } from '@/feature/exams/hooks'
import { useNavigate } from '@tanstack/react-router'
import type { Subject } from '@/api/types/exam.types'
import z from 'zod'
import { cn } from '@/lib/utils'

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
    { label: "Fill in the Blank", value: "FILL_IN_BLANK" },
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
                    questionTypes: value.questionType ? [value.questionType as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_BLANK" | "ESSAY"] : undefined,
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
                                <input
                                    type="range"
                                    min={10}
                                    max={100}
                                    step={5}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
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
                                    <select
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={cn(
                                            "w-full h-14 px-5 rounded-full border border-input bg-input/30",
                                            "text-sm appearance-none cursor-pointer",
                                            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                                            "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22m213.66%2C101.66l-80%2C80c-4.69%2C4.69-12.28%2C4.69-16.97%2C0l-80-80c-4.69-4.69-4.69-12.28%2C0-16.97%2C4.69-4.69%2C12.28-4.69%2C16.97%2C0l71.51%2C71.51%2C71.51-71.51c4.69-4.69%2C12.28-4.69%2C16.97%2C0%2C4.69%2C4.69%2C4.69%2C12.28%2C0%2C16.97Z%22%2F%3E%3C%2Fsvg%3E')]",
                                            "bg-no-repeat bg-[right_1.25rem_center]"
                                        )}
                                    >
                                        {timeLimitOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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
                                    <select
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={cn(
                                            "w-full h-14 px-5 rounded-full border border-input bg-input/30",
                                            "text-sm appearance-none cursor-pointer",
                                            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                                            "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22m213.66%2C101.66l-80%2C80c-4.69%2C4.69-12.28%2C4.69-16.97%2C0l-80-80c-4.69-4.69-4.69-12.28%2C0-16.97%2C4.69-4.69%2C12.28-4.69%2C16.97%2C0l71.51%2C71.51%2C71.51-71.51c4.69-4.69%2C12.28-4.69%2C16.97%2C0%2C4.69%2C4.69%2C4.69%2C12.28%2C0%2C16.97Z%22%2F%3E%3C%2Fsvg%3E')]",
                                            "bg-no-repeat bg-[right_1.25rem_center]"
                                        )}
                                    >
                                        {difficultyOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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
                                    <select
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={cn(
                                            "w-full h-14 px-5 rounded-full border border-input bg-input/30",
                                            "text-sm appearance-none cursor-pointer",
                                            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                                            "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22m213.66%2C101.66l-80%2C80c-4.69%2C4.69-12.28%2C4.69-16.97%2C0l-80-80c-4.69-4.69-4.69-12.28%2C0-16.97%2C4.69-4.69%2C12.28-4.69%2C16.97%2C0l71.51%2C71.51%2C71.51-71.51c4.69-4.69%2C12.28-4.69%2C16.97%2C0%2C4.69%2C4.69%2C4.69%2C12.28%2C0%2C16.97Z%22%2F%3E%3C%2Fsvg%3E')]",
                                            "bg-no-repeat bg-[right_1.25rem_center]"
                                        )}
                                    >
                                        {questionTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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
                                    <select
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className={cn(
                                            "w-full h-14 px-5 rounded-full border border-input bg-input/30",
                                            "text-sm appearance-none cursor-pointer",
                                            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                                            "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22m213.66%2C101.66l-80%2C80c-4.69%2C4.69-12.28%2C4.69-16.97%2C0l-80-80c-4.69-4.69-4.69-12.28%2C0-16.97%2C4.69-4.69%2C12.28-4.69%2C16.97%2C0l71.51%2C71.51%2C71.51-71.51c4.69-4.69%2C12.28-4.69%2C16.97%2C0%2C4.69%2C4.69%2C4.69%2C12.28%2C0%2C16.97Z%22%2F%3E%3C%2Fsvg%3E')]",
                                            "bg-no-repeat bg-[right_1.25rem_center]"
                                        )}
                                    >
                                        {yearOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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
