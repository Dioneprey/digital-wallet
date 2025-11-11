"use client";

import { Toaster } from "sonner";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children} <Toaster theme="light" />
      </AuthProvider>
    </QueryProvider>
  );
}
