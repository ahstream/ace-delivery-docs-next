import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://docs.example.com",
  ),
  title: {
    default: "Telia ACE Delivery Docs",
    template: "%s | Northstar Docs",
  },
  description:
    "Versioned engineering documentation for identity and platform teams.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
