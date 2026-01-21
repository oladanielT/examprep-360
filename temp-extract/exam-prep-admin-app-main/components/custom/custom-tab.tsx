// FILE: components/ui/custom-tabs.tsx
// Global Tabs Configuration
// ===========================================
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface CustomTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function CustomTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  triggerClassName,
  contentClassName,
}: CustomTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("bg-transparent space-y-5", className)}
    >
      <TabsList className=" bg-transparent border-b rounded-none py-0  h-12 gap-5  w-full justify-start">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              "flex items-center gap-2  flex-none data-[state=active]:border-b-2  data-[state=active]:shadow-none data-[state=active]:border-black data-[state=active]:border-r-0 data-[state=active]:border-l-0 data-[state=active]:border-t-0  rounded-none",
              triggerClassName
            )}
          >
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          className={cn(contentClassName)}
          key={tab.value}
          value={tab.value}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

//Examples

{
  /* <CustomTabs
  tabs={[
    {
      value: "details",
      label: "Details",
      icon: <Info className="h-4 w-4" />,
      content: <ExamDetails />,
    },
    {
      value: "questions",
      label: "Questions",
      icon: <FileText className="h-4 w-4" />,
      content: <QuestionList />,
    },
  ]}
/> */
}
