import type { Metadata } from "next";
import "./globals.css";
import { siteBasePath } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      `https://ahstream.github.io${siteBasePath}`,
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
