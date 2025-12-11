import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "StudyApp - AI-drevet studieplattform",
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
        {children}
      </body>
    </html>
  );
}
