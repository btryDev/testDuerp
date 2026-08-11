import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  Instrument_Sans,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppHeaderGate } from "@/components/layout/AppHeaderGate";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Face de titrage. IBM Plex Sans tient l'interface ; les titres de la page
// publique et les chiffres du cadran sont posés en Instrument Sans — grotesque
// serré, même atelier qu'Instrument Serif déjà présent. La marque parle d'une
// voix un peu plus haute que l'application, sans en changer.
const instrumentSans = Instrument_Sans({
  variable: "--font-titre",
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
  title: "Rojer — Conformité santé-sécurité TPE/PME",
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
      className={`${plexSans.variable} ${instrumentSans.variable} ${jetbrains.variable} ${instrument.variable} h-full antialiased`}
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
