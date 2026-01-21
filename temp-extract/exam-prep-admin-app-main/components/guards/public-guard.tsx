"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paths } from "@/config/paths";

function getDecodedRedirectPath(encodedPath: string): string {
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

export function PublicGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      setShouldRedirect(true);

      const encodedRedirectTo = searchParams.get("redirectTo");
      const redirectTo = encodedRedirectTo
        ? getDecodedRedirectPath(encodedRedirectTo)
        : null;

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(paths.app.dashboard.getHref());
      }
    }
  }, [router, searchParams]);

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
