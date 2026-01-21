// ===========================================
// FILE: components/ui/custom-toast.tsx
// Global Toast Configuration
// ===========================================
import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-5 w-5" />,
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      icon: <AlertCircle className="h-5 w-5" />,
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      icon: <Info className="h-5 w-5" />,
    });
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

// Toast Usage
// toast.success("Exam created successfully")
// toast.error("Failed to create exam", "Please try again")
// toast.promise(
//   createExam(data),
//   {
//     loading: "Creating exam...",
//     success: "Exam created successfully!",
//     error: "Failed to create exam",
//   }
// )
