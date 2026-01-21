import { AppSidebarContent } from "@/components/globals";
import CourseQuestionEditorFull from "@/features/questions/components/course-question-editor-full";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { paths } from "@/config/paths";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <AppSidebarContent>
      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${id}`}
          className="font-medium flex items-center gap-2"
        >
          <ArrowLeft className="h-5" /> Back to Course
        </Link>
      </div>
      <CourseQuestionEditorFull courseId={id} />
    </AppSidebarContent>
  );
};

export default Page;
