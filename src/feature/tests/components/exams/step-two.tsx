'use client'
import PrimaryButton from '@/components/buttons/primary-button'
import { CustomSelect } from '@/components/custom/custom-select'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'
import { examTypes } from '@/lib/placehoder-data'
import { useForm } from '@tanstack/react-form'
import z from 'zod'

const formSchema = z.object({
    questionType: z.string().min(1, "Please select an exam type"),
    time: z.string().min(1, "Please select a timer."),
    subjects: z
        .string()
        .min(1, "Please select a subject"),
    numQuestion: z
        .array(z.number())
        .length(1, "Please set number of question")
        .refine((val) => val[0] >= 2 && val[0] <= 200, {
            message: "Number of question must be between 2 and 200",
        }),
});

const durations = [
    { label: "15 mins", value: "15" },
    { label: "30 mins", value: "30" },
    { label: "45 mins", value: "45" },
    { label: "1 hour", value: "60" },
];

interface StepTwoProps {
    subjectId: string;
}

export default function StepTwo({ subjectId }: StepTwoProps) {
    const form = useForm({
        defaultValues: {
            questionType: "",
            time: "",
            subjects: subjectId,
            numQuestion: [10],
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            console.log("Starting exam:", {
                subjectId,
                ...value,
            });
            // TODO: Call useStartExam mutation here
        },
    });
    return (
        <div className=' '>
            <h5 className='  font-semibold text-lg text-center! mb-2'>Confirm Subject and Time</h5>
            <p className="text-muted-foreground text-center text-sm mb-6">
                {subjectId}
            </p>
            <form
                className="w-full"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup className="w-full">
                    <form.Field
                        name="subjects"
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                        className="text-[#6D6D6D] uppercase text-[12px]"
                                        htmlFor="form-subjects"
                                    >
                                        Subject
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={examTypes}
                                        placeholder="Select Subject"
                                        required
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>
                <FieldGroup className="w-full">
                    <form.Field
                        name="time"
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                        className="text-[#6D6D6D] uppercase text-[12px]"
                                        htmlFor="form-time"
                                    >
                                        Timer
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={durations}
                                        placeholder="00:00"
                                        required
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>
                <form.Field
                    name="numQuestion"
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                            <Field className=' my-5' data-invalid={isInvalid}>
                                <div className="flex items-center justify-between mb-2">
                                    <FieldLabel className="text-[#6D6D6D] uppercase text-xs">
                                        Number of Questions
                                    </FieldLabel>
                                    <span className="text-[14px] font-semibold text-accent">
                                        {field.state.value[0]} Questions
                                    </span>
                                </div>
                                <Slider
                                    min={2}
                                    max={200}
                                    step={1}
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(Array.isArray(value) ? value : [value])
                                    }
                                    className="w-full"
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        );
                    }}
                />
                <FieldGroup className="w-full">
                    <form.Field
                        name="questionType"
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel
                                        className="text-[#6D6D6D] uppercase text-[12px]"
                                        htmlFor="form-question-type"
                                    >
                                        SELECT QUESTION TYPE
                                    </FieldLabel>
                                    <CustomSelect
                                        name={field.name}
                                        value={field.state.value}
                                        onValueChange={field.handleChange}
                                        options={durations}
                                        placeholder="Question Type"
                                        required
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    />
                </FieldGroup>
                <PrimaryButton type="submit" title='Continue' className=' mt-5 bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex  justify-self-center  text-white' />
            </form>

        </div>
    )
}
