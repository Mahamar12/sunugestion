import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SunuGestionProvider } from '@/context/SunuGestionContext';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SunuGestion — La gestion immobilière, simplement.',
  description: 'Plateforme SaaS de gestion immobilière multi-tenant pour agences, propriétaires et locataires au Sénégal et en Afrique Francophone.',
  keywords: [
    'SunuGestion',
    'Gestion immobilière Sénégal',
    'SaaS immobilier Dakar',
    'Wave Orange Money loyer',
    'Quittance de loyer Sénégal',
    'Contrat de bail Dakar',
  ],
  openGraph: {
    title: 'SunuGestion — La gestion immobilière, simplement.',
    description: 'Centralisez vos immeubles, locataires, loyers, versements et tickets de maintenance.',
    url: 'https://sunugestion.sn',
    siteName: 'SunuGestion SaaS',
    locale: 'fr_SN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <SunuGestionProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </SunuGestionProvider>
      </body>
    </html>
  );
}
