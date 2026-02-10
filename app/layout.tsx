// app/layout.tsx
import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Dubaï Launchers - Votre société à Dubaï en un temps record",
  description:
    "On s'occupe de tout: licence de votre société, visa, comptes bancaires et plus encore. Lancez votre société sans effort, sans paperasse et en un temps record.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="fade-in" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/2.png" sizes="any" />
        {/* Preload */}
        <link
          rel="preload"
          href="https://scripts.converteai.net/00710b14-4a11-4585-ada8-40c6ac67fe1a/players/6989c9f8d023abad66c626df/v4/player.js"
          as="script"
        />
        <link
          rel="preload"
          href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js"
          as="script"
        />
        <link
          rel="preload"
          href="https://cdn.converteai.net/00710b14-4a11-4585-ada8-40c6ac67fe1a/6989c8d4d023abad66c624ef/main.m3u8"
          as="fetch"
          crossOrigin="anonymous"
        />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://cdn.converteai.net" />
        <link rel="dns-prefetch" href="https://scripts.converteai.net" />
        <link rel="dns-prefetch" href="https://images.converteai.net" />
        <link rel="dns-prefetch" href="https://api.vturb.com.br" />
      </head>

      <body>
        <ClientLayout>{children}</ClientLayout>
        <Script
          src="https://app.iclosed.io/assets/widget.js"
          strategy="afterInteractive"
          async
        />
      </body>
    </html>
  );
}
