import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analyse des Séries Chronologiques",
  description: "Analyse des Séries Chronologiques - Ventes Trimestrielles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
