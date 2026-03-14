import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI/UX Audit Agent",
  description: "Multimodal UI/UX audit with competitor research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
