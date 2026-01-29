import { Info } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

interface QuestionCardProps {
  instruction?: string;
  children: ReactNode;
}

export function QuestionCard({ instruction, children }: QuestionCardProps) {
  return (
    <div className="space-y-4">
      {/* Instruction Banner */}
      {instruction && (
        <div className="bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-start gap-2.5 sm:gap-3">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info weight="bold" className="w-3 h-3" />
          </div>
          <p className="text-xs sm:text-sm">{instruction}</p>
        </div>
      )}

      {/* Question Content */}
      <Card className="p-4 sm:p-6">
        {children}
      </Card>
    </div>
  );
}
