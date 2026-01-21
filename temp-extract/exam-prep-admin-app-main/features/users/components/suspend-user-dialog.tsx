"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DangerButton from "@/components/buttons/danger-button";

interface SuspendUserDialogProps {
  children: React.ReactNode;
  onSuspend?: (reason: string) => void;
}

export default function SuspendUserDialog({
  children,
  onSuspend,
}: SuspendUserDialogProps) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  const handleSuspend = () => {
    if (onSuspend) {
      onSuspend(reason);
    }
    setOpen(false);
    setReason("");
  };

  const handleCancel = () => {
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Suspend User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="reason"
              className="tracking-[3px]  text-xs uppercase text-gray-400 font-medium "
            >
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Incomplete profile"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] resize-none rounded-4xl px-6 py-4 border-border"
            />
          </div>
          <div className="space-y-3 ">

            <DangerButton className="max-w-full h-12 rounded-full  font-medium"
              title="   Suspend User" onClick={handleSuspend} />

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full h-12 rounded-full border-border hover:bg-accent bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
