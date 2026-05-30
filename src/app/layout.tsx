import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { RouteMessageToast } from "@/components/route-message-toast";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Latihan CPNS",
  description: "Aplikasi latihan CPNS mobile-first dengan simulasi ujian, skor, dan pembahasan.",
  applicationName: "Latihan CPNS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Latihan CPNS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <ServiceWorkerRegister />
        <MobileBottomNav />
        <Suspense fallback={null}>
          <RouteMessageToast />
        </Suspense>
        <ToastProvider />
      </body>
    </html>
  );
}
