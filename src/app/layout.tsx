import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "./providers";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "VERZUS",
    template: "%s | VERZUS",
  },
  description: "VERZUS competitive gaming platform rebuild.",
  applicationName: "VERZUS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
