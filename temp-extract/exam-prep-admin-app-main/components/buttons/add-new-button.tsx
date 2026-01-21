import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddNewButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AddNewButton({
  label,
  onClick,
  className,
  disabled = false,
  loading = false,
}: AddNewButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      className={cn(
        "w-full h-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between px-6 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {label}
      </span>
      <div className="bg-[#BEE74C] hover:bg-[#B0D945] disabled:hover:bg-[#BEE74C] rounded-full p-2 flex items-center justify-center transition-colors">
        <Plus size={20} className="text-white" strokeWidth={3} />
      </div>
    </Button>
  );
}
