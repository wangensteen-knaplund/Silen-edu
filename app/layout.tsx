import type { Metadata } from "next";
import "../styles/globals.css";
import MainNav from "@/components/layout/MainNav";

export const metadata: Metadata = {
  title: "Silen-Edu - AI-drevet studieplattform",
  description: "Organiser notater, planlegg studier, og bruk AI til å oppsummere og lage quiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="antialiased">
        <MainNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
