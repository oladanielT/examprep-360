"use client";

import React from "react";
import { Card } from "../ui/card";
import { StatsCard } from "./graph-stats-card";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import type { LucideIcon } from "lucide-react";
import { Pen } from "lucide-react";

interface Props {
  title: string;
  amount: string;
  className?: string;
  amountClassName?: string;
  containerClassName?: string;
  showMenu?: boolean;
  children?: React.ReactNode;
  icon?: LucideIcon;
  onIconClick?: () => void;
  iconAriaLabel?: string;
}

export const SmallStatsCard = ({
  title,
  amount,
  amountClassName,
  children,
  containerClassName,
  className,
  showMenu = true,
  icon: Icon,
  onIconClick,
  iconAriaLabel,
}: Props) => {
  return (
    <Card
      className={cn(
        "p-4 flex-row gap-4 relative justify-between",
        containerClassName
      )}
    >
      <div className={cn("space-y-4", className)}>
        <h2 className="text-gray-900 font-medium text-sm">{title}</h2>
        <p
          className={cn(
            "text-2xl font-semibold text-gray-900",
            amountClassName
          )}
        >
          {amount}
        </p>
        {children}
      </div>
      {showMenu && <StatsCard.Menu />}
      {Icon && (
        <Button
          className="absolute bottom-2 right-2"
          variant="ghost"
          size="icon-lg"
          onClick={onIconClick}
          aria-label={iconAriaLabel ?? `${title} action`}
        >
          <Icon className="text-gray-900" aria-hidden="true" />
        </Button>
      )}
    </Card>
  );
};
