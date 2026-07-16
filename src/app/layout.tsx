import type { Metadata } from "next";
import { Fraunces, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { AnnouncementBar } from "@/components/announcement-bar";
import { FirstVisitOffer } from "@/components/first-visit-offer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Amber Hour",
  description: "Small-batch homemade THC/CBD products for everyday use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${spaceMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-transparent text-cream">
        <AnnouncementBar />
        <FirstVisitOffer />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
