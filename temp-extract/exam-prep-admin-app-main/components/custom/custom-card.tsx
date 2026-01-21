// ===========================================
// FILE: components/ui/custom-card.tsx
// Global Card Configuration
// ===========================================
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CustomCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  actions?: React.ReactNode;
}

export function CustomCard({
  title,
  description,
  children,
  footer,
  icon,
  className,
  headerClassName,
  actions,
}: CustomCardProps) {
  return (
    <Card className={className}>
      {(title || description || icon || actions) && (
        <CardHeader className={headerClassName}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {icon && <div className="mt-0.5">{icon}</div>}
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
              </div>
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
