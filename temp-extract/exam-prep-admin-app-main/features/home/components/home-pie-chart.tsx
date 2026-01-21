"use client";

import { ExternalLink, TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

export const description = "A donut chart";

const chartData = [
  { exams: "completed", users: 70, fill: "var(--color-completed)" },
  { exams: "paused", users: 30, fill: "var(--color-paused)" },
];

const chartConfig = {
  users: {
    label: "Exams",
  },
  completed: {
    label: "Completed Exams",
    color: "#0ACF97",
  },
  paused: {
    label: "Paused Exams",
    color: "#1E85FF",
  },
} satisfies ChartConfig;

export default function HomePieChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0 border-b-0">
        <CardTitle>Exam Statistics</CardTitle>
        <Button variant="ghost" size="icon-lg">
          <ExternalLink />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pt-0 pb-5 border-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="users"
              nameKey="exams"
              innerRadius={60}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
