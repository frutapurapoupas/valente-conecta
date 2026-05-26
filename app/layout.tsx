import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/app/context/AppContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Valente Conecta",
  description: "A economia da cidade na palma da sua mão",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-950 text-white">
        <AppProvider>
          {children}
          <Toaster position="bottom-center" />
        </AppProvider>
      </body>
    </html>
  );
}
