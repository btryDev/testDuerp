import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
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
      className={`${geist.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppHeader />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
