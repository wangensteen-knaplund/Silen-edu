import type { Metadata } from "next";
import "../styles/globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
