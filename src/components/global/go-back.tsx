import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GoBack({ backTo }: { backTo: string }) {
  return (
    <Button asChild variant="ghost" size="icon-lg">
      <Link to={backTo}>
        <ArrowLeftIcon className="size-8!" />
      </Link>
    </Button>
  );
}
