import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      title,
      className,
      children,
      asChild = false,
      ...props
    }: PrimaryButtonProps,
    ref,
  ) => {
    const buttonProps = {
      ref,
      className: cn(
        "bg-sidebar-primary hover:bg-sidebar-primary rounded-4xl w-full text-black h-10",
        className,
      ),
      ...props,
    };

    // If using asChild, render children with button props (for composition)
    if (asChild && children) {
      return React.cloneElement(children as React.ReactElement, buttonProps);
    }

    // Default: render Button component
    return <Button {...buttonProps}>{children || title}</Button>;
  },
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
