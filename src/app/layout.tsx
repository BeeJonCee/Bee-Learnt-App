import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BeeLearnt",
  description: "CAPS-aligned learning platform with tutoring and AI support.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
