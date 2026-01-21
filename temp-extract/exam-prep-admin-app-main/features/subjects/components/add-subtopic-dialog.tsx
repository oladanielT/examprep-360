"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import {
  useCreateSubTopic,
  createSubTopicInputSchema,
  CreateSubTopicInput,
} from "@/features/subjects/api/sub-topic/create-sub-topic";

interface AddSubtopicDialogProps {
  children: React.ReactNode;
  topicId: string;
  onSuccess?: () => void;
}

export function AddSubtopicDialog({
  children,
  topicId,
  onSuccess,
}: AddSubtopicDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateSubTopicInput>({
    resolver: zodResolver(createSubTopicInputSchema),
    defaultValues: {
      name: "",
      topicId,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        topicId,
      });
    }
  }, [open, form, topicId]);

  const { mutate: createSubtopic, isPending } = useCreateSubTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Subtopic created successfully");
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create subtopic");
      },
    },
  });

  const onSubmit = (data: CreateSubTopicInput) => {
    createSubtopic({ data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subtopic</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Subtopic Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter subtopic name"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Subtopic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
