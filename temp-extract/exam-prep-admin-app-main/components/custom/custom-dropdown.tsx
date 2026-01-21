// ===========================================
// FILE: components/ui/custom-dropdown.tsx
// ===========================================
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

export interface DropdownGroupOption {
  label: string;
  options: DropdownOption[];
}

interface CustomDropdownProps {
  options: DropdownOption[] | DropdownGroupOption[];
  trigger?: React.ReactNode;
  triggerText?: string;
  triggerIcon?: React.ReactNode;
  triggerVariant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  grouped?: boolean;
}

export function CustomDropdown({
  options,
  trigger,
  triggerText = "Options",
  triggerIcon = <ChevronDown className="ml-2 h-4 w-4" />,
  triggerVariant = "outline",
  align = "end",
  side = "bottom",
  className,
  triggerClassName,
  contentClassName,
  grouped = false,
}: CustomDropdownProps) {
  const renderTrigger = () => {
    if (trigger) return trigger;

    return (
      <Button variant={triggerVariant} className={triggerClassName}>
        {triggerText}
        {triggerIcon}
      </Button>
    );
  };

  const renderOption = (option: DropdownOption) => (
    <React.Fragment key={option.value}>
      <DropdownMenuItem
        onClick={option.onClick}
        disabled={option.disabled}
        className={cn(
          option.destructive &&
            "text-rose-600 focus:text-rose-600 focus:bg-rose-50",
          "cursor-pointer"
        )}
      >
        {option.icon && <span className="mr-2">{option.icon}</span>}
        {option.label}
      </DropdownMenuItem>
      {option.separator && <DropdownMenuSeparator />}
    </React.Fragment>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {renderTrigger()}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        className={cn("w-56", contentClassName)}
      >
        {grouped
          ? // Render grouped options
            (options as DropdownGroupOption[]).map((group, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <DropdownMenuSeparator />}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.options.map(renderOption)}
                </DropdownMenuGroup>
              </React.Fragment>
            ))
          : // Render flat options
            (options as DropdownOption[]).map(renderOption)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Example 1: Basic Dropdown Menu
// import { CustomDropdown } from "@/components/ui/custom-dropdown"
// import { Edit, Trash, Eye } from "lucide-react"

// <CustomDropdown
//   triggerText="Actions"
//   options={[
//     {
//       label: "View Details",
//       value: "view",
//       icon: <Eye className="h-4 w-4" />,
//       onClick: () => handleView(),
//     },
//     {
//       label: "Edit",
//       value: "edit",
//       icon: <Edit className="h-4 w-4" />,
//       onClick: () => handleEdit(),
//     },
//     {
//       label: "Delete",
//       value: "delete",
//       icon: <Trash className="h-4 w-4" />,
//       onClick: () => handleDelete(),
//       destructive: true,
//       separator: true,
//     },
//   ]}
// />

// Example 2: Grouped Dropdown
{
  /* <CustomDropdown
  triggerText="Export"
  grouped
  options={[
    {
      label: "Export As",
      options: [
        { label: "PDF", value: "pdf", onClick: () => exportPDF() },
        { label: "Excel", value: "excel", onClick: () => exportExcel() },
        { label: "CSV", value: "csv", onClick: () => exportCSV() },
      ],
    },
    {
      label: "Share",
      options: [
        { label: "Email", value: "email", onClick: () => shareEmail() },
        { label: "WhatsApp", value: "whatsapp", onClick: () => shareWhatsApp() },
      ],
    },
  ]}
/> */
}
