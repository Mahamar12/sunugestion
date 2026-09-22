'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, CreditCard, FileText, Wrench, Users, ShieldCheck } from 'lucide-react';

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 space-y-12">
      <div className="max-w-5xl mx-auto space-y-6 text-center pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400">
          <Building2 className="w-4 h-4" /> SunuGestion
        </Link>

        <h1 className="text-4xl font-black text-white">Fonctionnalités de SunuGestion</h1>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Toutes les fonctionnalités indispensables pour gérer facilement vos biens et loyers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6">
          {[
            { title: 'Gestion des Biens & Logements', desc: 'Arborescence Immeuble -> Étage -> Appartement / Studio / Local avec surfaces, loyers et charges.' },
            { title: 'Suivi des Loyers & Impayés', desc: 'Échéancier automatique, classification des retards et relances multicanaux (WhatsApp, SMS).' },
            { title: 'Encaissements Mobile Money', desc: 'Enregistrement Wave, Orange Money, virement bancaire et génération de quittances PDF.' },
            { title: 'Portails Propriétaires & Locataires', desc: 'Accès dédiés pour que les locataires visualisent leurs contrats et les propriétaires leurs décomptes.' },
            { title: 'Gestion de la Maintenance', desc: 'Tickets d’incident technique avec urgence et assignation aux artisans référencés.' },
            { title: 'Sécurité & Isolation Multi-Tenant', desc: 'Architecture SaaS étanche garantissant la confidentialité des agences.' },
          ].map((f, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="font-bold text-white text-base">{f.title}</h3>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
