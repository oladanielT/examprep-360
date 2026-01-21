"use client";

import { ExternalLink, TrendingUp } from "lucide-react";
import { RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const description = "A radial chart";

const chartData = [
  { browser: "question", users: 275, fill: "#1E85FF" },
  { browser: "exam", users: 200, fill: "#E63535" },
  { browser: "subjects", users: 187, fill: "#1CB454" },
  { browser: "courses", users: 173, fill: "#E2A907" },
];

const chartConfig = {
  users: {
    label: "Users",
  },
  question: {
    label: "Question",
    color: "#1E85FF",
  },
  exams: {
    label: "Exams",
    color: "#E63535",
  },
  subjects: {
    label: "Subjects",
    color: "#1CB454",
  },
  courses: {
    label: "Courses",
    color: "#E2A907",
  },
} satisfies ChartConfig;

const legendItems = [
  {
    label: "Questions",
    count: "100,000",
    unit: "Items",
    color: "bg-[#1E85FF]",
    colorOut: "bg-[#1E85FF]/30",
  },
  {
    label: "Exams",
    count: "30",
    unit: "Items",
    color: "bg-[#E63535]",
    colorOut: "bg-[#E63535]/30",
  },
  {
    label: "Subjects",
    count: "12",
    unit: "Items",
    color: "bg-[#1CB454]",
    colorOut: "bg-[#1CB454]/30",
  },
  {
    label: "Courses",
    count: "8",
    unit: "Items",
    color: "bg-[#E2A907]",
    colorOut: "bg-[#E2A907]/30",
  },
];

export default function ChartRadialSimple() {
  return (
    <Card className="col-span-2 flex flex-col">
      <CardHeader className="items-center pb-0 border-b-0">
        <CardTitle>Overview</CardTitle>
        <Button variant="ghost" size="icon-lg">
          <ExternalLink />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-shrink-0 space-y-4">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", item.colorOut)}>
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {item.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.count} {item.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <ChartContainer
            config={chartConfig}
            className="w-full aspect-square max-h-[350px]"
          >
            <RadialBarChart data={chartData} innerRadius={70} outerRadius={150}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="browser" />}
              />
              <RadialBar dataKey="users" background />
            </RadialBarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
