import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  title: string;
  disabled?: boolean;
}

const DangerButton = ({
  title,
  disabled = false,
  className,
  ...props
}: ButtonProps) => {
  return (
    <Button
      {...props}
      disabled={disabled}
      className={cn(
        " bg-destructive  hover:bg-destructive/30 max-w-3xs rounded-lg w-full text-white  h-9",
        className
      )}
    >
      {title}
    </Button>
  );
};

export default DangerButton;
