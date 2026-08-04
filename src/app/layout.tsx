import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppHeaderGate } from "@/components/layout/AppHeaderGate";
import "./globals.css";

const geist = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conformité santé-sécurité — TPE/PME",
  description:
    "Plateforme continue d'accompagnement à la conformité santé-sécurité pour dirigeants de TPE/PME : DUERP, calendrier de vérifications, registre de sécurité, plan d'actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${jetbrains.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppHeaderGate>
          <AppHeader />
        </AppHeaderGate>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
