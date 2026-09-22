import React from 'react';
import { FileText } from 'lucide-react';

export default function ConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-300 text-sm leading-relaxed">
      
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-brand-400" />
          <span>Conditions Générales d'Utilisation (CGU)</span>
        </h1>
        <p className="text-slate-400 text-xs">Applicables aux visiteurs et agences sur SunuGestion SaaS</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Objet du Service</h2>
          <p>
            SunuGestion édite une plateforme SaaS de publication et de recherche de biens immobiliers au Sénégal (Dakar, Petite Côte, Thiès). Elle permet aux agences de diffuser leurs annonces et d'interagir directement avec les clients via WhatsApp ou téléphone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Engagements des Agences Immobilières</h2>
          <p>
            Toute agence s'engage à publier des annonces exactes, conformes à la réalité du bien et de son prix en FCFA. Tout démarchage frauduleux ou fausse référence entraînera la suspension immédiate du compte agence sans remboursement.
          </p>
        </section>
      </div>

    </div>
  );
}
