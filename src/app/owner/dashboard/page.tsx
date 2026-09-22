'use client';

import React from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { Building2, CreditCard, DollarSign, FileBox, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function OwnerDashboardPage() {
  const { properties, owners, payments, setSelectedDocumentForPrint } = useSunuGestion();
  const owner = owners[0]; // M. Ousmane Ndiaye

  const ownerProps = properties.filter((p) => p.ownerId === owner.id || p.ownerName.includes(owner.lastName));
  const grossIncome = owner.totalMonthlyRevenueFCFA || 2500000;
  const commission = Math.round(grossIncome * (owner.commissionRatePercent / 100));
  const expensesAmount = 350000;
  const netRevenue = grossIncome - expensesAmount - commission;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Portail Propriétaire Bailleurs
          </span>
          <h1 className="text-3xl font-black mt-2">Bienvenue, {owner.firstName} {owner.lastName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Gestion transparente de votre patrimoine immobilier géré par Sunu Gestionbilier.
          </p>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-right">
          <span className="text-xs text-amber-300 font-medium block">Revenu Net Mensuel Attendu</span>
          <span className="text-2xl font-black text-white">{netRevenue.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Net Payout Statement Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
          Décompte Financier Mensuel (Août 2026)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">REVENUS BRUTS COLLECTÉS</span>
            <strong className="text-xl font-black text-slate-900">{grossIncome.toLocaleString('fr-FR')} FCFA</strong>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">DÉPENSES D'ENTRETIEN</span>
            <strong className="text-xl font-black text-rose-600">-{expensesAmount.toLocaleString('fr-FR')} FCFA</strong>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">COMMISSION AGENCE ({owner.commissionRatePercent}%)</span>
            <strong className="text-xl font-black text-amber-600">-{commission.toLocaleString('fr-FR')} FCFA</strong>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 font-bold block">REVENU NET À VERSER (PAYOUT)</span>
            <strong className="text-xl font-black text-emerald-700">{netRevenue.toLocaleString('fr-FR')} FCFA</strong>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() =>
              setSelectedDocumentForPrint({
                id: `owner-stmt-${owner.id}`,
                title: `Rapport Propriétaire - ${owner.firstName} ${owner.lastName}`,
                category: 'RAPPORT_PROPRIETAIRE',
                ownerName: `${owner.firstName} ${owner.lastName}`,
                amountFCFA: netRevenue,
                date: '2026-08-24',
              })
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <FileBox className="w-4 h-4" />
            <span>Télécharger Relevé Mensuel PDF</span>
          </button>
        </div>
      </div>

      {/* Owned Properties List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Vos Biens en Gestion ({ownerProps.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ownerProps.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                <p className="text-[11px] text-slate-500">{p.address}, {p.neighborhood}</p>
                <p className="text-[11px] font-bold text-emerald-700 mt-1">{p.occupiedUnits} / {p.totalUnits} Logements loués</p>
              </div>

              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
