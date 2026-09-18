import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InlineScript } from "@/components/inline-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arise Admin — Habit Gamification Dashboard",
  description: "Admin portal for managing users, tasks, and progression in the Arise habit gamification ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InlineScript
          id="theme-init"
          html={`(function(){try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");var a=localStorage.getItem("accentColor");if(a&&a!=="violet")document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`}
        />
      </head>
      <body className="min-h-full flex flex-col bg-app text-ink">{children}</body>
    </html>
  );
}
