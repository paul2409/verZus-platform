import "@fontsource/rajdhani/300.css";
import "@fontsource/rajdhani/400.css";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "./providers";

import "@/styles/globals.css";
import "@/styles/verzus-retro-system.css";
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
    <html lang="en" data-theme="retro-competitive">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
