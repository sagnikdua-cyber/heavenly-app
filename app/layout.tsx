import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Heavenly",
  description: "Your safe haven, your closest friend",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0a0e27",
              color: "#fcf6ba",
              border: "1px solid rgba(212,175,55,0.1)",
              borderRadius: "16px",
              fontSize: "12px",
              letterSpacing: "0.05em",
            }
          }}
        />
      </body>
    </html>
  );
}
