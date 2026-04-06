import { Link } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown } from "lucide-react";

interface TrialLimitAlertProps {
  message: string;
  className?: string;
}

/**
 * Displays an error message with an upgrade button when the message
 * looks like a trial/limit restriction from the backend.
 * Falls back to a plain error alert for other messages.
 */
export function TrialLimitAlert({ message, className }: TrialLimitAlertProps) {
  const isLimitError = /limit|trial|upgrade|quota|exceed|restrict|expir|subscri/i.test(message);

  return (
    <Alert variant="destructive" className={className}>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {isLimitError && (
          <Link
            to="/subscription"
            className="inline-flex items-center gap-1.5 self-start px-4 py-2 text-xs font-semibold rounded-full bg-accent text-white hover:bg-accent/80 transition-colors"
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade Plan
          </Link>
        )}
      </AlertDescription>
    </Alert>
  );
}
