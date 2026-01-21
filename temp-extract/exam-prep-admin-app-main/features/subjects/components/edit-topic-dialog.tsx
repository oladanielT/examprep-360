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
  useUpdateTopic,
  updateTopicInputSchema,
  UpdateTopicInput,
} from "@/features/subjects/api/topic/update-topic";
import { Topic } from "@/features/subjects/api/topic/get-topics";

interface EditTopicDialogProps {
  children: React.ReactNode;
  topic: Topic;
  onSuccess?: () => void;
}

export function EditTopicDialog({
  children,
  topic,
  onSuccess,
}: EditTopicDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateTopicInput>({
    resolver: zodResolver(updateTopicInputSchema),
    defaultValues: {
      name: topic.name,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: topic.name,
      });
    }
  }, [open, form, topic.name]);

  const { mutate: updateTopic, isPending } = useUpdateTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Topic updated successfully");
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update topic");
      },
    },
  });

  const onSubmit = (data: UpdateTopicInput) => {
    updateTopic({ data, topicId: topic.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Topic</DialogTitle>
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
              Update Topic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
