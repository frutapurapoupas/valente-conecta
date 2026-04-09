import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Valente Conecta - Admin Master',
  description: 'Sistema de Inteligência e Conexão Local',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Otimização para dispositivos móveis (Celular/Tablet) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="antialiased">
        {/* O container principal que garante o fundo gradiente em todas as páginas */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}