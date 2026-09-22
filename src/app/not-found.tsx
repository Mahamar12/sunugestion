import React from 'react';
import Link from 'next/link';
import { Home, Search, Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-brand-400 font-mono text-3xl font-black shadow-2xl">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Page introuvable</h1>
        <p className="text-slate-400 text-sm">
          Désolé, la page ou le logement que vous recherchez semble introuvable ou a été déplacé.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Retour à l'Accueil</span>
        </Link>
        <Link
          href="/logements"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Explorer les Logements</span>
        </Link>
      </div>
    </div>
  );
}
