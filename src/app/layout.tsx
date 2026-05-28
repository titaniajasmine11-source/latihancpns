import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { RouteMessageToast } from "@/components/route-message-toast";
import { ToastProvider } from "@/components/toast-provider";
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
  title: "CPNS Practice Web",
  description: "Aplikasi latihan CPNS mobile-first dengan generator soal AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <MobileBottomNav />
        <Suspense fallback={null}>
          <RouteMessageToast />
        </Suspense>
        <ToastProvider />
      </body>
    </html>
  );
}
