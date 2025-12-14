"use client";

import type { ReactNode } from "react";
import MainNav from "@/components/layout/MainNav";
import AuthProvider from "@/components/AuthProvider";
import AppInitializer from "@/components/AppInitializer";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <AppInitializer />
      <MainNav />
      <main>{children}</main>
    </AuthProvider>
  );
}
