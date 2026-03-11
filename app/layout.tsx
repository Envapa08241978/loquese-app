import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cerebro — Tu Memoria Técnica Multipotencial',
  description:
    'Almacena, busca y consulta tus conocimientos técnicos con IA. Tu segundo cerebro para Programación, Diseño, Soldadura, Electricidad y más.',
  keywords: [
    'conocimientos',
    'memoria técnica',
    'multipotencial',
    'asistente IA',
    'base de datos personal',
  ],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
