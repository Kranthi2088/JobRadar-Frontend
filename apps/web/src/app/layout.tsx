import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { normalizeAbsoluteSiteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "JobRadar — Real-Time Job Alerts",
  description:
    "Be the first to apply. JobRadar monitors company career pages and alerts you within 90 seconds of a new posting.",
  metadataBase: new URL(normalizeAbsoluteSiteUrl(process.env.NEXTAUTH_URL)),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-surface-bg text-jr-text1">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
