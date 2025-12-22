import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-start justify-center">
          <div className="w-full max-w-2xl font-sans">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/auth/authlayout.svg"
          alt="Image"
          width={5000}
          height={5000}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
