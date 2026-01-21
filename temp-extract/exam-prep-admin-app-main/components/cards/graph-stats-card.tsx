"use client";

import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "../ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  ArrowDown,
  ArrowUp,
  MoreVertical,
  Pin,
  Settings,
  Share2,
  Trash,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "../ui/base-badge";
import { formatNumber } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/base-button";

// --- TYPE DEFINITIONS ---

interface ChartDataPoint {
  value: number;
}

interface StatsCardProps {
  title: string;
  value: number;
  delta?: number;
  positive?: boolean;
  formatType?: "currency_in_millions";
  prefix?: string;
  suffix?: string;
  children?: ReactNode;
  toolbar?: ReactNode;
}

interface TooltipPayloadItem {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  formatter?: (value: number) => string;
}

// A more generic tooltip that uses the formatter
const CustomTooltip = ({ active, payload, formatter }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-lg p-2 pointer-events-none">
        <p className="text-sm font-semibold text-foreground">
          {formatter ? formatter(value) : value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// The Graph is now its own component
const StatsCardGraph = ({
  data,
  color = "#16a34a",
  formatType,
}: {
  data: ChartDataPoint[];
  color?: string;
  formatType?: string;
}) => {
  const gradientId = React.useId(); // Use React's hook for unique IDs

  // Tooltip formatter logic
  const tooltipFormatter = (val: number) => {
    if (formatType === "currency_in_millions") {
      return `$${(val / 1_000_000).toFixed(1)}M`;
    }
    return `${(val / 1000).toFixed(1)}k`;
  };

  return (
    <div className="h-16 w-full -ml-4">
      {" "}
      {/* Use negative margin to stretch chart */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "2 2" }}
            content={<CustomTooltip formatter={tooltipFormatter} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: color, stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// The Menu is now its own component
const StatsCardMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="dim" size="sm" mode="icon" className="-me-1.5">
        <MoreVertical className="w-5 h-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" side="bottom">
      <DropdownMenuItem>
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem>
        <TriangleAlert className="w-4 h-4 mr-2" />
        Add Alert
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Pin className="w-4 h-4 mr-2" />
        Pin to Dashboard
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">
        <Trash className="w-4 h-4 mr-2" />
        Remove
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- MAIN CARD COMPONENT ---

export const StatsCard = ({
  title,
  value,
  delta,
  positive,
  formatType,
  prefix = "",
  suffix = "",
  children,
  toolbar,
}: StatsCardProps) => {
  const getFormattedValue = (v: number) => {
    if (formatType === "currency_in_millions") {
      return `$${(v / 1_000_000).toFixed(1)}M`;
    }
    return prefix + formatNumber(v) + suffix;
  };

  const displayValue = getFormattedValue(value);
  const DeltaIcon = positive ? ArrowUp : ArrowDown;

  return (
    <Card>
      <CardHeader className="border-0">
        <CardTitle className="font-medium">{title}</CardTitle>
        {toolbar && <CardToolbar>{toolbar}</CardToolbar>}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between gap-2 items-end">
          <div className="space-y-4">
            <div>
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {displayValue}
              </span>
            </div>
            {delta && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Badge
                  variant={positive ? "success" : "destructive"}
                  appearance="light"
                >
                  <DeltaIcon className="w-4 h-4 mr-1" />
                  {Math.abs(delta)}%
                </Badge>
                <span>vs last month</span>
              </div>
            )}
          </div>
          <div className="w-1/4">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
};

StatsCard.Graph = StatsCardGraph;
StatsCard.Menu = StatsCardMenu;
