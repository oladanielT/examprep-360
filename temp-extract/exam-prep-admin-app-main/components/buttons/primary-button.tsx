import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  asChild?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      title,
      className,
      children,
      asChild = false,
      loading = false,
      disabled,
      ...props
    }: PrimaryButtonProps,
    ref
  ) => {
    const isDisabled = loading || disabled;

    const buttonProps = {
      ref,
      className: cn(
        "bg-sidebar-primary hover:bg-sidebar-primary/80 max-w-3xs rounded-4xl w-full text-black h-14",
        className,
        isDisabled && "opacity-50 cursor-not-allowed"
      ),
      disabled: isDisabled,
      ...props,
    };

    const buttonContent = (
      <>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
        {children || title}
      </>
    );

    // If using asChild, render children with button props (for composition)
    if (asChild && children) {
      return React.cloneElement(children as React.ReactElement, buttonProps);
    }

    // Default: render Button component
    return <Button {...buttonProps}>{buttonContent}</Button>;
  }
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
