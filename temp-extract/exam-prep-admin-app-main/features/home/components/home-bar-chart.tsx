"use client";

import { ExternalLink, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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

export const description = "A multiple bar chart";

const chartData = [
  { month: "January", practice: 186, mock: 80 },
  { month: "February", practice: 305, mock: 200 },
  { month: "March", practice: 237, mock: 120 },
  { month: "April", practice: 73, mock: 190 },
  { month: "May", practice: 209, mock: 130 },
  { month: "June", practice: 214, mock: 140 },
];

const chartConfig = {
  practice: {
    label: "Practice Exam",
    color: "#CBDCFA",
  },
  mock: {
    label: "Mock Exams",
    color: "#1E85FF",
  },
} satisfies ChartConfig;

export default function HomeBarChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="items-center pb-0 border-b-0">
        <CardTitle>Exam Statistics</CardTitle>
        <Button variant="ghost" size="icon-lg">
          <ExternalLink />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer className="h-[250px] w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="practice" fill="var(--color-practice)" radius={4} />
            <Bar dataKey="mock" fill="var(--color-mock)" radius={4} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
