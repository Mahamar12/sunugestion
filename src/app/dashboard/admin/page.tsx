'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { INITIAL_AGENCIES, INITIAL_PROPERTIES, INITIAL_INVOICES } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  Trash2, 
  FileText, 
  TrendingUp, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [agencies, setAgencies] = useState(INITIAL_AGENCIES);
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<'overview' | 'agencies' | 'properties' | 'payments'>('overview');

  // Compute Platform Metrics
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalAgenciesCount = agencies.length;
  const totalPropertiesCount = properties.length;
  const verifiedAgenciesCount = agencies.filter(a => a.verified).length;

  const toggleAgencyVerification = (id: string) => {
    setAgencies(prev => prev.map(a => a.id === id ? { ...a, verified: !a.verified } : a));
  };

  const deletePropertyByAdmin = (id: string) => {
    if (confirm('Action Administrateur : Supprimer cette annonce ?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full badge-gold-gradient text-slate-950 text-xs font-black uppercase tracking-wider">
              Espace Super Admin
            </span>
            <span className="text-xs text-slate-400 font-mono">SunuGestion v1.0</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Tableau de Bord Administrateur SaaS
          </h1>
          <p className="text-slate-400 text-sm">Vue globale de la plateforme, modération et suivi des revenus d'abonnements.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('agencies')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'agencies' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Agences ({agencies.length})
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'properties' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Modération ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Paiements
          </button>
        </div>
      </div>

      {/* PLATFORM OVERVIEW STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chiffre d'Affaires SaaS</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{formatPrice(totalRevenue)}</span>
          <span className="text-xs text-emerald-400 font-medium block">Paiements Wave, OM, CB & Stripe</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Agences Partenaires</span>
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{totalAgenciesCount}</span>
          <span className="text-xs text-slate-400 block">{verifiedAgenciesCount} vérifiées par audit</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalogue Global</span>
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{totalPropertiesCount}</span>
          <span className="text-xs text-slate-400 block">Annonces actives au Sénégal</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Conversion WhatsApp</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">2 480+</span>
          <span className="text-xs text-emerald-400 font-medium block">Mises en relation réussies</span>
        </div>

      </div>

      {/* AGENCIES MANAGEMENT SECTION */}
      {(activeTab === 'overview' || activeTab === 'agencies') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Gestion & Modération des Agences Immobilières</h2>
              <p className="text-xs text-slate-400">Validez les comptes d'agences et attribuez le badge Agence Certifiée.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Agence</th>
                  <th className="p-4">Ville</th>
                  <th className="p-4">Forfait SaaS</th>
                  <th className="p-4 text-center">Biens</th>
                  <th className="p-4 text-center">Statut Certification</th>
                  <th className="p-4 text-right">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {agencies.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden relative shrink-0">
                          <Image src={ag.logo} alt={ag.name} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{ag.name}</span>
                          <span className="text-[10px] text-slate-400">{ag.email} • {ag.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-200">{ag.city}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded bg-brand-950 text-brand-300 font-bold uppercase text-[10px] border border-brand-800">
                        {ag.plan}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-white">{ag.properties_count}</td>
                    <td className="p-4 text-center">
                      {ag.verified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Vérifiée</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700 text-[10px]">
                          <span>Non vérifiée</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleAgencyVerification(ag.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          ag.verified
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        }`}
                      >
                        {ag.verified ? 'Révoquer le badge' : 'Certifier l\'Agence'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROPERTIES MODERATION SECTION */}
      {(activeTab === 'overview' || activeTab === 'properties') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Modération des Annonces de la Plateforme</h2>
              <p className="text-xs text-slate-400">Inspectez la conformité des photos, descriptions et prix affichés.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Titre & Réf</th>
                  <th className="p-4">Agence</th>
                  <th className="p-4">Emplacement</th>
                  <th className="p-4">Prix FCFA</th>
                  <th className="p-4 text-right">Action Modération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50">
                    <td className="p-4">
                      <span className="font-bold text-white block">{p.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Réf: {p.ref} • {p.type.toUpperCase()}</span>
                    </td>
                    <td className="p-4 font-semibold text-brand-300">{p.agency?.name || 'Inconnue'}</td>
                    <td className="p-4">{p.neighborhood}, {p.city}</td>
                    <td className="p-4 font-mono font-bold text-white">{formatPrice(p.price)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deletePropertyByAdmin(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 font-bold flex items-center space-x-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer l'annonce</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENTS HISTORY SECTION */}
      {(activeTab === 'overview' || activeTab === 'payments') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Historique des Paiements SaaS & Factures</h2>
              <p className="text-xs text-slate-400">Transactions enregistrées via Wave, Orange Money, Carte Bancaire et Stripe.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">N° Facture</th>
                  <th className="p-4">Agence</th>
                  <th className="p-4">Forfait</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4">Mode de Paiement</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 font-mono">
                    <td className="p-4 font-bold text-white">{inv.invoice_number}</td>
                    <td className="p-4 font-sans font-medium text-slate-200">{inv.agency_name}</td>
                    <td className="p-4 font-sans font-bold uppercase text-brand-300">{inv.plan_tier}</td>
                    <td className="p-4 font-bold text-white">{formatPrice(inv.amount)}</td>
                    <td className="p-4 uppercase text-slate-400">{inv.payment_method.replace('_', ' ')}</td>
                    <td className="p-4 text-slate-400">{inv.date}</td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 font-bold uppercase text-[10px] border border-emerald-800">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
