import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "./provider";
import WhatsappButton from "@/components/ui/WhatsappButton";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo/2.png" sizes="any" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <WhatsappButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
