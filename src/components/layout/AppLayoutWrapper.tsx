'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DocumentViewerModal from '@/components/documents/DocumentViewerModal';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedDocumentForPrint, setSelectedDocumentForPrint } = useSunuGestion();

  const isAppRoute =
    pathname.startsWith('/app') ||
    pathname.startsWith('/owner') ||
    pathname.startsWith('/tenant') ||
    pathname.startsWith('/admin');

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
