import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  footer,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  size = "md",
  className,
}: CustomDialogProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
     {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogContent className={cn(sizeClasses[size], className)}>
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div>{children}</div>

        {(footer || onConfirm || onCancel) && (
          <DialogFooter>
            {footer || (
              <>
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    {cancelText}
                  </Button>
                )}
                {onConfirm && (
                  <Button onClick={onConfirm} disabled={loading}>
                    {loading ? "Processing..." : confirmText}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Confirmation Dialog
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-col items-center max-w-xs mx-auto justify-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:flex-col-reverse mt-5 gap-y-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-full"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            className="h-12 rounded-full"
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog Usage
{
  /* <CustomDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Create New Exam"
  description="Fill in the details to create a new exam"
  onConfirm={handleCreate}
  onCancel={() => setIsOpen(false)}
  loading={isCreating}
>
  <InputField label="Exam Title" required />
  <CustomSelect options={examTypes} label="Exam Type" required />
</CustomDialog>

// Confirm Dialog
<ConfirmDialog
  open={isDeleteOpen}
  onOpenChange={setIsDeleteOpen}
  title="Delete Exam"
  description="Are you sure you want to delete this exam? This action cannot be undone."
  onConfirm={handleDelete}
  variant="destructive"
  confirmText="Delete"
/> */
}
