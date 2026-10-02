import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meeting Management System (MMS) | Smart Room Booking & Logistics",
  description:
    "Centralized platform for real-time room booking, conflict detection, material tracking, and staff scheduling.",
  icons: {
    icon: "/default logo/meeting-time.svg",
    shortcut: "/default logo/meeting-time.svg",
    apple: "/default logo/meeting-time.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white relative">
        {/* Ambient background subtle pastel glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full blur-[128px]" />
          <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] bg-violet-200/30 rounded-full blur-[128px]" />
          <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-sky-200/30 rounded-full blur-[128px]" />
        </div>

        <ToastProvider>
          <AuthProvider>
            <div className="relative z-10 flex-1 flex flex-col">{children}</div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
