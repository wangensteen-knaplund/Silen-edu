"use client";

import type { ReactNode } from "react";
import MainNav from "@/components/layout/MainNav";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <MainNav />
      <main>{children}</main>
    </>
  );
}
