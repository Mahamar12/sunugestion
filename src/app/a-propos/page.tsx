import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, ShieldCheck, MessageSquare, Zap, Target, Award, Users } from 'lucide-react';

export default function AProposPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-4 py-1.5 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-300 text-xs font-bold uppercase tracking-wider">
          Notre Histoire & Vision
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          La plateforme SaaS immobilière modernisée pour l'Afrique
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          SunuGestion a été créée avec l'ambition de transformer la recherche et la gestion de biens immobiliers au Sénégal. Nous connectons en temps réel les chercheurs de logements et les agences certifiées.
        </p>
      </div>

      {/* Grid Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Transparence Absolue</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Nous luttons contre les fausses annonces et les intermédiaires informels en auditant rigoureusement chaque agence immobilière enregistrée.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7 fill-current" />
          </div>
          <h3 className="text-xl font-bold text-white">Instantanéité WhatsApp</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            En Afrique de l'Ouest, WhatsApp est le canal de communication privilégié. Notre plateforme intègre le pré-remplissage automatique des annonces.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Inclusion Financière</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Paiement autonome des forfaits SaaS via Wave et Orange Money sans nécessiter obligatoirement de carte bancaire internationale.
          </p>
        </div>

      </div>

    </div>
  );
}
