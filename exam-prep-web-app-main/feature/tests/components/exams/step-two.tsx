'use client'
import PrimaryButton from '@/components/buttons/primary-button'
import { CustomSelect } from '@/components/custom/custom-select'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'
import { examTypes } from '@/lib/placehoder-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
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
    { label: "15 mins", value: "15mins" },
    { label: "30 mins", value: "30mins" },
    { label: "45 mins", value: "45mins" },
    { label: "1 hour", value: "1hour" },
];

export default function StepTwo() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionType: "",
            time: "",
            subjects: '',
            numQuestion: [4],
        },
    });
    return (
        <div className=' '>
            <h5 className='  font-semibold text-lg text-center! mb-6'>Confirm Subject and Time</h5>
            <form className="w-full" >
                <FieldGroup className="w-full">
                    <Controller
                        name="subjects"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    className="text-[#6D6D6D] uppercase text-[12px]"
                                    htmlFor="form-subjects"
                                >
                                    Subject
                                </FieldLabel>
                                <CustomSelect
                                    name={field.name}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    options={examTypes}
                                    placeholder="Select Subject"
                                    required
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />



                </FieldGroup>
                <FieldGroup className="w-full">
                    <Controller
                        name="time"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    className="text-[#6D6D6D] uppercase text-[12px]"
                                    htmlFor="form-time"
                                >
                                    Timer
                                </FieldLabel>
                                <CustomSelect
                                    name={field.name}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    options={durations}
                                    placeholder="00:00"
                                    required
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />



                </FieldGroup>
                <Controller
                    name="numQuestion"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field className=' my-5' data-invalid={fieldState.invalid}>
                            <div className="flex items-center justify-between mb-2">
                                <FieldLabel className="text-[#6D6D6D] uppercase text-xs">
                                    Number of Questions
                                </FieldLabel>
                                <span className="text-[14px] font-semibold text-accent">
                                    {field.value[0]} Questions
                                </span>
                            </div>
                            <Slider
                                min={2}
                                max={200}
                                step={1}
                                value={field.value}
                                onValueChange={field.onChange}
                                className="w-full"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <FieldGroup className="w-full">
                    <Controller
                        name="time"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                    className="text-[#6D6D6D] uppercase text-[12px]"
                                    htmlFor="form-question-type"
                                >
                                    SELECT QUESTION TYPE
                                </FieldLabel>
                                <CustomSelect
                                    name={field.name}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    options={durations}
                                    placeholder="Question Type"
                                    required
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <PrimaryButton title='Continue' className=' mt-5 bg-[#F04F54] hover:bg-[#F04F54]/80 max-w-2xs flex  justify-self-center  text-white' />
            </form>

        </div>
    )
}
