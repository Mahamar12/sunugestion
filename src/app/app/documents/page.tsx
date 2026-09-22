'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { DocumentCategory } from '@/types/sunugestion';
import { FileBox, Printer, Search, Plus, Filter, FileText } from 'lucide-react';

export default function DocumentsPage() {
  const { documents, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('ALL');

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'ALL' || d.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Générateur & Gestionnaire de Documents PDF</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quittances de loyer, Contrats de bail, Avis d'échéance, Lettres de relance et Rapports propriétaires exportables en PDF.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Catégorie:</span>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="QUITTANCE">Quittance de Loyer</option>
            <option value="CONTRAT">Contrat de Location</option>
            <option value="RELANCE">Lettre de Relance</option>
            <option value="RAPPORT_PROPRIETAIRE">Rapport Propriétaire</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((d) => (
          <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                  {d.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{d.date}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">{d.title}</h3>
              {d.amountFCFA && (
                <p className="text-xs font-black text-emerald-700">{d.amountFCFA.toLocaleString('fr-FR')} FCFA</p>
              )}
            </div>

            <button
              onClick={() => setSelectedDocumentForPrint(d)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Aperçu & Imprimer PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
