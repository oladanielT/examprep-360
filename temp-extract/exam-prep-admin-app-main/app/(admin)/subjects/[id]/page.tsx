import { AppSidebarContent } from "@/components/globals";
import SubjectsDetail from "@/features/subjects/components/subject-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { paths } from "@/config/paths";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params; // Next.js 15 - params is a Promise!

  return (
    <AppSidebarContent>
      <div className="flex items-center justify-between">
        <Link
          href={paths.app.subjects.getHref()}
          className="font-medium flex items-center gap-2"
        >
          <ArrowLeft className="h-5" /> Back
        </Link>
      </div>
      <SubjectsDetail subjectId={id} />
    </AppSidebarContent>
  );
};

export default Page;
