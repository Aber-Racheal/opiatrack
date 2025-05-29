import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SyncProvider from "./components/SyncProvider"; // 👈 import it here

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OpiaTrack",
  description: "Track your financial goals and expenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2937" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SyncProvider /> {/* ✅ Hook logic runs here */}
        {children}
      </body>
    </html>
  );
}
