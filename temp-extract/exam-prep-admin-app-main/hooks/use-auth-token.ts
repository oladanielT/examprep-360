"use client";

import { tokenManager } from "@/lib/api-client";
import { useEffect, useState } from "react";

/**
 * Utility hook to get current token (useful for debugging)
 */
export const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(tokenManager.getAccessToken());
  }, []);

  return token;
};
