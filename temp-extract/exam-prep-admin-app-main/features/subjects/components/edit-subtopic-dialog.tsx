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
  useUpdateSubTopic,
  updateSubTopicInputSchema,
  UpdateSubTopicInput,
} from "@/features/subjects/api/sub-topic/update-sub-topic";
import { SubTopic } from "@/features/subjects/api/sub-topic/get-sub-topics";

interface EditSubtopicDialogProps {
  children: React.ReactNode;
  subtopic: SubTopic;
  onSuccess?: () => void;
}

export function EditSubtopicDialog({
  children,
  subtopic,
  onSuccess,
}: EditSubtopicDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateSubTopicInput>({
    resolver: zodResolver(updateSubTopicInputSchema),
    defaultValues: {
      name: subtopic.name,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: subtopic.name,
      });
    }
  }, [open, form, subtopic.name]);

  const { mutate: updateSubtopic, isPending } = useUpdateSubTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Subtopic updated successfully");
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update subtopic");
      },
    },
  });

  const onSubmit = (data: UpdateSubTopicInput) => {
    updateSubtopic({ data, subtopicId: subtopic.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subtopic</DialogTitle>
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
              Update Subtopic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
