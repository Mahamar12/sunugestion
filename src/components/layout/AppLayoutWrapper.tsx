'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { User } from '@/types/sunugestion';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedDocumentForPrint, setSelectedDocumentForPrint } = useSunuGestion();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isAppRoute =
    pathname.startsWith('/app') ||
    pathname.startsWith('/owner') ||
    pathname.startsWith('/tenant') ||
    pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAppRoute) {
      setIsAuthenticated(true);
      return;
    }

    try {
      const isLoggedOut = localStorage.getItem('sunu_logged_out') === 'true';
      const session = localStorage.getItem('sunu_session_user');

      if (isLoggedOut) {
        setIsAuthenticated(false);
      } else if (!session) {
        // Initialiser la session par défaut pour Mamadou Sy
        const defaultAdmin: User = {
          id: 'usr-admin-1',
          name: 'Mamadou Sy',
          email: 'm.sy@sunugestion.sn',
          username: 'm.sy',
          phone: '+221 77 654 32 10',
          role: 'ADMIN_AGENCE',
          agencyId: 'org-1',
          status: 'ACTIVE',
          createdAt: '2026-01-15',
        };
        localStorage.setItem('sunu_session_user', JSON.stringify(defaultAdmin));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(true);
      }
    } catch (e) {
      setIsAuthenticated(true);
    }
  }, [pathname, isAppRoute]);

  if (!isAppRoute) {
    return (
      <>
        {children}
        {selectedDocumentForPrint && (
          <DocumentViewerModal
            document={selectedDocumentForPrint}
            onClose={() => setSelectedDocumentForPrint(null)}
          />
        )}
      </>
    );
  }

  // Si l'utilisateur est déconnecté et n'a pas fourni d'identifiant valide
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Accès Restreint</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Sans un identifiant et un mot de passe valides attribués par l'agence, vous ne pouvez pas accéder à ce tableau de bord.
            </p>
          </div>
          <Link
            href="/connexion"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
          >
            <span>Se Connecter avec mon Identifiant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {selectedDocumentForPrint && (
        <DocumentViewerModal
          document={selectedDocumentForPrint}
          onClose={() => setSelectedDocumentForPrint(null)}
        />
      )}
    </div>
  );
}
