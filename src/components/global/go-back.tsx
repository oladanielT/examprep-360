import { ArrowLeftIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function GoBack({ backTo }: { backTo: string }) {
  return (
    <Link to={backTo} className="inline-flex items-center justify-center size-10 rounded-4xl hover:bg-muted transition-all">
      <ArrowLeftIcon className="size-8!" />
    </Link>
  );
}
