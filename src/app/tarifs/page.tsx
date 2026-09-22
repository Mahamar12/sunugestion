'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 space-y-12">
      <div className="max-w-5xl mx-auto space-y-6 text-center pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400">
          <Building2 className="w-4 h-4" /> SunuGestion
        </Link>

        <h1 className="text-4xl font-black text-white">Tarification Transparente en FCFA</h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Choisissez le forfait adapté à la taille de votre parc immobilier au Sénégal & en Afrique Francophone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 text-left">
          {[
            { name: 'STARTER', price: '5 000 FCFA', desc: '10 biens max • 20 locataires' },
            { name: 'PRO', price: '15 000 FCFA', desc: '50 biens max • Locataires illimités', pop: true },
            { name: 'BUSINESS', price: '30 000 FCFA', desc: '150 biens max • Multi-utilisateurs' },
            { name: 'ENTERPRISE', price: 'Sur Devise', desc: 'Biens illimités • Support dédié 24/7' },
          ].map((p, idx) => (
            <div key={idx} className={`p-6 rounded-2xl bg-slate-900 border ${p.pop ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800'} space-y-4`}>
              <h3 className="font-bold text-white text-base">{p.name}</h3>
              <p className="text-xl font-black text-blue-400">{p.price} / mo</p>
              <p className="text-xs text-slate-400">{p.desc}</p>
              <Link
                href="/onboarding"
                className="block text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Démarrer
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
