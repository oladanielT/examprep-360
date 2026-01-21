"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { MoreHorizontalIcon } from "lucide-react";
import { formatNaira, Sale } from "../columns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/base-badge";

export interface Transaction {
  id: string;
  paymentRef: string;
  amount: string;
  status: "Failed" | "Successful" | "Pending";
  customerName: string;
  deviceInfo?: string;
  email: string;
  authorization: string;
  cardDetails: {
    type: "mastercard" | "visa";
    lastFour: string;
    holderName: string;
  };
  location: string;
  date: string;
  time: string;
  examsPaidFor?: string[];
}

interface TransactionDetailsSheetProps {
  transaction: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsSheet({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsSheetProps) {
  if (!transaction) return null;

  const getStatusVariant = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "primary";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto px-5 f"
      >
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-20">
            <Button
              variant="ghost"
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <MoreHorizontalIcon className="size-5" />
            </Button>
            <SheetTitle className="text-lg">Transaction Details</SheetTitle>
          </div>
          <div className="flex justify-center pt-2">
            <Badge
              variant={getStatusVariant(transaction.status)}
              className="capitalize text-white"
            >
              {transaction.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-6">
          {/* Transaction Info Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Transaction ID
              </p>
              <p className="text-base font-medium">{transaction.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Payment Ref
              </p>
              <p className="text-base font-medium">67889Y98BJK</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Transaction Amount
              </p>
              <p className="text-xl font-semibold">
                {formatNaira(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Customer Name
              </p>
              <p className="text-base font-medium">
                {transaction.customerName}
              </p>
              <p className="text-sm text-muted-foreground">
                Iphone 12 Pro Max iOS 16
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Transaction Date
              </p>
              <p className="text-base font-medium">{transaction.date}</p>
              <p className="text-sm text-muted-foreground">12:40:11PM</p>
            </div>
          </div>

          {/* Email and Authorization */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Email Address
              </p>
              <p className="text-base font-medium break-all">
                PreciousJameson@email.com
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Authorization
              </p>
              <p className="text-base font-medium">Face ID</p>
            </div>
          </div>

          {/* Card Details and Location */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Card Details
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1">
                  <div className="size-6 rounded-full bg-red-500" />
                  <div className="size-6 rounded-full bg-orange-500 -ml-3" />
                </div>
                <span className="text-base font-medium">
                  **** **** **** 7589
                </span>
              </div>
              <p className="text-base font-medium pt-1">Precious Jameson</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Transaction Location
              </p>
              <p className="text-base font-medium">
                Iyana Ipaja, Lagos (47282.246872)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Exams Paid For
            </p>
            <div className="space-y-2">
              <p className="text-lg font-normal">{transaction.examName}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
