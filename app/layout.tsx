import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XanScope | Xandeum Network Command Center",
  description:
    "Real-time analytics, filesystem intelligence, and operator tooling for the Xandeum decentralized storage network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-brand-black text-white min-h-screen`}
      >
        <SiteHeader />
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
