"use client";

import type { ReactNode } from "react";
import MainNav from "@/components/layout/MainNav";
import AuthProvider from "@/components/AuthProvider";
import SubjectsInitializer from "@/components/subjects/SubjectsInitializer";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <SubjectsInitializer />
      <MainNav />
      <main>{children}</main>
    </AuthProvider>
  );
}
