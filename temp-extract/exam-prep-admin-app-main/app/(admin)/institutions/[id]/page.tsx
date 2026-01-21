import { AppSidebarContent } from "@/components/globals";
import InstitutionDetail from "@/features/institutions/components/institution-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { paths } from "@/config/paths";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <AppSidebarContent>
      <Link
        href={paths.app.institutions.getHref()}
        className="font-medium flex items-center gap-2"
      >
        <ArrowLeft className="h-5" /> Back
      </Link>

      <InstitutionDetail universityId={id} />
    </AppSidebarContent>
  );
};

export default Page;
