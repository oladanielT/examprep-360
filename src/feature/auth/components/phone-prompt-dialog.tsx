import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import { useAuthStore } from "@/stores/authStore";
import { useUpdateProfile } from "@/feature/profile/hooks/useProfile";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters.")
    .max(15, "Phone number must be at most 15 characters."),
});

export const PhonePromptDialog = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateProfile = useUpdateProfile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !user.phone) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isAuthenticated, user]);

  const form = useForm({
    defaultValues: { phone: "" },
    validators: { onSubmit: phoneSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateProfile.mutateAsync({ phone: value.phone });
        toast.success("Phone number saved.");
        setOpen(false);
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to save phone number. Please try again.";
        toast.error(message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg">Add your phone number</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            We need your phone number to keep your account secure and to send
            you important updates about your exams.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="w-full">
            <form.Field
              name="phone"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="phone-prompt-phone">
                      Phone Number
                    </FieldLabel>
                    <InputField
                      id="phone-prompt-phone"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="+23470 **** ****"
                      type="tel"
                      autoComplete="tel"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <PrimaryButton
            type="submit"
            disabled={form.state.isSubmitting || updateProfile.isPending}
            className="w-full bg-accent hover:bg-accent/80 mt-6 text-white text-lg disabled:opacity-50"
            title={updateProfile.isPending ? "Saving..." : "Save Phone Number"}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
