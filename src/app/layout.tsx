import type { Metadata } from "next";
import React from "react";
import { Plus_Jakarta_Sans, Instrument_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rangkul",
  description:
    "Rangkul menghubungkan lansia dengan pendamping lokal terverifikasi komunitas RT/RW. Booking kunjungan, pantau kondisi, dan jaga orang tersayangmu dari mana saja.",
  keywords: ["pendamping lansia", "jasa kunjungan lansia", "care elderly Indonesia", "RT RW"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Rangkul — Merangkul Jarak, Menjaga yang Tersayang",
    description:
      "Platform pendampingan lansia berbasis kepercayaan komunitas. SDG 11 & SDG 8.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
