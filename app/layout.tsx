import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valente Conecta - Master Admin",
  description: "Marketplace Inteligente",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.8,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}