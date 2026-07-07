import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "../components/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoPulse",
  description: "Self-hosted GitHub analytics dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
