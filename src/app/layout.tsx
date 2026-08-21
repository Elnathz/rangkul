import type { Metadata } from "next";
import React from "react";
import "./globals.css";

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
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
