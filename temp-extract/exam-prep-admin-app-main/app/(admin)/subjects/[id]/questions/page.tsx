import { AppSidebarContent } from "@/components/globals";
import QuestionEditor from "@/features/questions/components/question-editor";
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
          href={paths.app.subjectDetail.getHref(id)}
          className="font-medium flex items-center gap-2"
        >
          <ArrowLeft className="h-5" /> Back to Subject
        </Link>
      </div>
      <QuestionEditor subjectId={id} />
    </AppSidebarContent>
  );
};

export default Page;
