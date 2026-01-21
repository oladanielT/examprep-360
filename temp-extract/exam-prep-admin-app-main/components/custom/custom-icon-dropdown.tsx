// ===========================================
// FILE: components/ui/icon-dropdown.tsx
// ===========================================
// Pre-configured dropdown with icon trigger (commonly used for actions)
import * as React from "react";
import {
  CustomDropdown,
  DropdownOption,
  DropdownGroupOption,
} from "./custom-dropdown";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IconDropdownProps {
  options: DropdownOption[] | DropdownGroupOption[];
  grouped?: boolean;
  className?: string;
}

export function IconDropdown({
  options,
  grouped,
  className,
}: IconDropdownProps) {
  return (
    <CustomDropdown
      options={options}
      grouped={grouped}
      trigger={
        <Button variant="ghost" size="icon" className={className}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      }
    />
  );
}

// Example 5: Icon Dropdown (Table Actions)
// import { IconDropdown } from "@/components/ui/icon-dropdown"

// <IconDropdown
//   options={[
//     { label: "View", value: "view", onClick: () => {} },
//     { label: "Edit", value: "edit", onClick: () => {} },
//     { label: "Delete", value: "delete", onClick: () => {}, destructive: true },
//   ]}
// />
