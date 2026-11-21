import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskVault — Personal Task & Learning Productivity Vault",
  description:
    "Save unfinished coding challenges, course lessons, tutorials, and documentation in one centralized productivity hub.",
  authors: [{ name: "TaskVault" }],
  keywords: [
    "productivity",
    "leetcode",
    "bookmarks",
    "tasks",
    "tutorials",
    "developer vault",
    "learning manager",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
