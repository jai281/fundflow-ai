import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FundFlow AI - AI Fundraising Automation",
  description: "Analyze pitch decks, match investors, and automate fundraising outreach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
