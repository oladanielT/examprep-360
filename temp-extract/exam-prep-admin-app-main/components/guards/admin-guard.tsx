"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { paths } from "@/config/paths";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setShouldRedirect(true);

      const encodedRedirectTo = encodeURIComponent(pathname);
      const signInUrl = `${paths.auth.signIn.getHref()}?redirectTo=${encodedRedirectTo}`;
      router.push(signInUrl);
    }
  }, [router, pathname]);

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
