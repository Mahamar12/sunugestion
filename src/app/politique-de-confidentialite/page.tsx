import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PolitiquePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-slate-300 text-sm leading-relaxed">
      
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-brand-400" />
          <span>Politique de Confidentialité</span>
        </h1>
        <p className="text-slate-400 text-xs">Dernière mise à jour : 10 Août 2026 • SunuGestion Sénégal</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Collecte des Données Personnel</h2>
          <p>
            SunuGestion s'engage à protéger les données personnelles des utilisateurs et agences partenaires conformément à la réglementation sénégalaise relative à la protection des données à caractère personnel (CDP). Nous collectons les informations strictement nécessaires à la mise en relation (nom, téléphone WhatsApp, e-mail, préférences de logement).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Utilisation des Données & Contact WhatsApp</h2>
          <p>
            Lorsque vous cliquez sur le bouton "Contacter sur WhatsApp", votre numéro de téléphone et la référence du logement sélectionné sont transmis à l'agence immobilière émettrice pour vous fournir des renseignements d'urgence ou organiser une visite.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Paiements & Sécurité</h2>
          <p>
            Les transactions financières effectuées pour les souscriptions d'abonnements SaaS (Wave, Orange Money, Stripe, PayPal) sont traitées via des passerelles sécurisées cryptées SSL/TLS. Aucune donnée de carte bancaire sensible n'est enregistrée sur nos serveurs.
          </p>
        </section>
      </div>

    </div>
  );
}
