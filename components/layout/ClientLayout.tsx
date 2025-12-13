"use client";

import type { ReactNode } from "react";
import MainNav from "@/components/layout/MainNav";
import AuthProvider from "@/components/AuthProvider";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <MainNav />
      <main>{children}</main>
    </AuthProvider>
  );
}
