"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageUiLayout from "@/components/layout/pageUiLayout";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>
          <PageUiLayout>{children}</PageUiLayout>
        </Providers>
      </body>
    </html>
  );
}
