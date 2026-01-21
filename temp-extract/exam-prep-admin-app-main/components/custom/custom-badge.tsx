// ===========================================
// FILE: components/ui/custom-badge.tsx
// Global Badge Configuration
// ===========================================
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

// Base variants that the Badge component accepts
type BaseBadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface CustomBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function CustomBadge({
  children,
  variant = "default",
  className,
  dot = false,
}: CustomBadgeProps) {
  const variantStyles = {
    success: "bg-green-100 text-green-800 hover:bg-green-100",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  };

  // Map custom variants to base variants for the Badge component
  const getBaseVariant = (v: BadgeVariant): BaseBadgeVariant => {
    if (v === "success" || v === "warning" || v === "info") {
      return "default";
    }
    return v;
  };

  return (
    <Badge
      variant={getBaseVariant(variant)}
      className={cn(
        variant === "success" && variantStyles.success,
        variant === "warning" && variantStyles.warning,
        variant === "info" && variantStyles.info,
        dot && "flex items-center gap-1.5",
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </Badge>
  );
}

// Status Badge (for exam statuses)
interface StatusBadgeProps {
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: "Draft", variant: "secondary" as const },
    published: { label: "Published", variant: "info" as const },
    ongoing: { label: "Ongoing", variant: "warning" as const },
    completed: { label: "Completed", variant: "success" as const },
    cancelled: { label: "Cancelled", variant: "destructive" as const },
  };

  const config = statusConfig[status];

  return (
    <CustomBadge variant={config.variant} className={className} dot>
      {config.label}
    </CustomBadge>
  );
}

// Payment Status Badge
interface PaymentBadgeProps {
  status: "pending" | "successful" | "failed" | "refunded";
  className?: string;
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const },
    successful: { label: "Successful", variant: "success" as const },
    failed: { label: "Failed", variant: "destructive" as const },
    refunded: { label: "Refunded", variant: "secondary" as const },
  };

  const config = statusConfig[status];

  return (
    <CustomBadge variant={config.variant} className={className} dot>
      {config.label}
    </CustomBadge>
  );
}
