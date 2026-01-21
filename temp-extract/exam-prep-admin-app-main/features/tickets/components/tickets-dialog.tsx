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
import { InputField } from "@/components/custom/custom-form-field";
import { DropzoneField } from "@/components/custom/custom-dropzone";
import { Ticket } from "../columns";
import PrimaryButton from "@/components/buttons/primary-button";

interface DialogProps {
//   children: React.ReactNode;
  ticketData?: Ticket
}

export function TicketDialog({  ticketData}: DialogProps) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>{children}</DialogTrigger> */}
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <DialogTitle className="text-xl font-semibold">
               Ticket - {ticketData?.id}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 pt-6">
          <InputField  label="COMPLAINT" value={ticketData?.complaint} />
          <InputField  label="NAME" value={ticketData?.name} />
          <InputField  label="EMAIL" value={ticketData?.email} />
          <InputField  label="PHONE NUMBER" value={ticketData?.phoneNumber} />
         
         <PrimaryButton title="Mark as resolved" className=" max-w-full" />
         
        </div>
      </DialogContent>
    </Dialog>
  );
}
