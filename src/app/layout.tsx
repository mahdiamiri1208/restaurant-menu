import type { Metadata } from "next";
import localFont from "next/font/local";
import ServiceWorkerRegister from "@/components/service-worker-register";
import "./globals.css";

const vazirmatn = localFont({ src: "../../public/fonts/vazirmatn.woff2", variable: "--font-vazirmatn", display: "swap" });

export const metadata: Metadata = {
  title: "منوی رستوران نارنج",
  description: "منوی دیجیتال رستوران نارنج",
  applicationName: "رستوران نارنج",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>{children}<ServiceWorkerRegister /></body>
    </html>
  );
}
