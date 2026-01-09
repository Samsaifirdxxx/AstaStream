import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AstaStream - Watch Anime Without Limits",
  description: "Stream thousands of anime episodes in HD quality with multiple providers. The ultimate anime streaming platform.",
  keywords: ["anime", "streaming", "watch anime", "anime online", "free anime", "HD anime"],
  authors: [{ name: "Hellfirez3643", url: "https://t.me/Hellfirez3643" }],
  openGraph: {
    title: "AstaStream - Watch Anime Without Limits",
    description: "Stream thousands of anime episodes in HD quality",
    type: "website",
  },
};

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
        {children}
      </body>
    </html>
  );
}
