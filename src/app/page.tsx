'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Wrench,
  Users,
  FileText,
  Smartphone,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white">SunuGestion</span>
              <span className="block text-[10px] text-blue-400 font-medium">La gestion immobilière, simplement.</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <Link href="/fonctionnalites" className="hover:text-blue-400 transition-colors">Fonctionnalités</Link>
            <Link href="/tarifs" className="hover:text-blue-400 transition-colors">Tarifs</Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-bold transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              Démo / Essai Gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> La plateforme SaaS immobilière référence au Sénégal & en Afrique
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            La gestion immobilière, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">simplement.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Centralisez vos immeubles, appartements, villas, locataires, loyers, versements Wave & Orange Money, contrats et tickets de maintenance dans une seule plateforme SaaS sécurisée.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/app/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Accéder à l'Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm rounded-xl transition-all"
            >
              Lancer l'Assistant de Configuration
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-24 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Tout ce dont votre agence a besoin</h2>
            <p className="text-xs text-slate-400">Une suite complète conçue pour simplifier la gestion locative africaine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CreditCard,
                title: 'Encaissements Mobile Money',
                desc: 'Intégration ready Wave & Orange Money avec mise à jour automatique des échéances et quittances PDF.',
              },
              {
                icon: FileText,
                title: 'Génération de Quittances & Contrats',
                desc: 'Édition instantanée des baux d’habitation et quittances officielles aux normes sénégalaises.',
              },
              {
                icon: TrendingUp,
                title: 'Comptabilité & Payouts Propriétaires',
                desc: 'Calcul automatique des commissions agence, dépenses et reversements nets aux propriétaires.',
              },
              {
                icon: Wrench,
                title: 'Gestion de la Maintenance',
                desc: 'Suivi des pannes par ticket (plomberie, climatisation, électricité) et assignation aux artisans.',
              },
              {
                icon: Smartphone,
                title: 'Portails Propriétaires & Locataires',
                desc: 'Des accès dédiés pour que les locataires paient leurs loyers et les propriétaires consultent leurs revenus.',
              },
              {
                icon: ShieldCheck,
                title: 'Sécurité & Isolation Multi-Tenant',
                desc: 'Contrôle RBAC strict garantissant l’isolation étanche des données de chaque agence.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-blue-500/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Des tarifs simples & adaptés en FCFA</h2>
            <p className="text-xs text-slate-400">Évoluez sereinement du petit bailleur à la grande agence immobilière.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'STARTER', price: '5 000 FCFA / mo', desc: 'Jusqu’à 10 biens & 20 locataires' },
              { name: 'PRO', price: '15 000 FCFA / mo', desc: 'Jusqu’à 50 biens & locataires illimités', pop: true },
              { name: 'BUSINESS', price: '30 000 FCFA / mo', desc: 'Jusqu’à 150 biens & portails propriétaires' },
            ].map((p, idx) => (
              <div key={idx} className={`p-8 rounded-2xl bg-slate-900 border space-y-4 ${p.pop ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800'}`}>
                <h3 className="font-bold text-white text-lg">{p.name}</h3>
                <p className="text-2xl font-black text-blue-400">{p.price}</p>
                <p className="text-xs text-slate-400">{p.desc}</p>
                <Link
                  href="/tarifs"
                  className="block text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  Voir tous les détails
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SunuGestion — La gestion immobilière, simplement. Dakar, Sénégal.</p>
          <div className="flex gap-6">
            <Link href="/tarifs">Tarifs</Link>
            <Link href="/fonctionnalites">Fonctionnalités</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
