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
  useCreateTopic,
  createTopicInputSchema,
  CreateTopicInput,
} from "@/features/subjects/api/topic/create-topic";

interface AddTopicDialogProps {
  children: React.ReactNode;
  subjectId: string;
  onSuccess?: () => void;
}

export function AddTopicDialog({
  children,
  subjectId,
  onSuccess,
}: AddTopicDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateTopicInput>({
    resolver: zodResolver(createTopicInputSchema),
    defaultValues: {
      name: "",
      subjectId,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        subjectId,
      });
    }
  }, [open, form, subjectId]);

  const { mutate: createTopic, isPending } = useCreateTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Topic created successfully");
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create topic");
      },
    },
  });

  const onSubmit = (data: CreateTopicInput) => {
    createTopic({ data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Topic Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter topic name"
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
              Create Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
