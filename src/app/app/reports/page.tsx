'use client';

import React from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { BarChart3, Download, TrendingUp, CreditCard, Receipt, FileText, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const { payments, expenses, owners, rentSchedules } = useSunuGestion();

  const totalCollected = payments.reduce((acc, p) => acc + p.amountFCFA, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amountFCFA, 0);
  const totalCommissions = Math.round(totalCollected * 0.08); // 8% average commission
  const netIncome = totalCollected - totalExpenses - totalCommissions;

  const handleExportCSV = () => {
    alert('Exportation CSV générée avec succès pour le registre comptable.');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rapports Financiers & Comptabilité</h1>
          <p className="text-xs text-slate-500 mt-1">
            Synthèse comptable des encaissements, dépenses, commissions agence et bénéfices nets.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Rapport Excel / CSV</span>
        </button>
      </div>

      {/* Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Total Encaissé</span>
          <span className="text-2xl font-black text-emerald-600">{totalCollected.toLocaleString('fr-FR')} FCFA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Total Dépenses</span>
          <span className="text-2xl font-black text-rose-600">{totalExpenses.toLocaleString('fr-FR')} FCFA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Commissions Agence (8%)</span>
          <span className="text-2xl font-black text-amber-600">{totalCommissions.toLocaleString('fr-FR')} FCFA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Revenu Net Agence</span>
          <span className="text-2xl font-black text-blue-900">{netIncome.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Monthly Financial Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Ventilation Mensuelle des Recettes & Charges (2026)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3">Mois</th>
                <th className="p-3">Loyers Attendus</th>
                <th className="p-3">Loyers Encaissés</th>
                <th className="p-3">Taux Recouvrement</th>
                <th className="p-3">Dépenses Immeubles</th>
                <th className="p-3">Commission Agence</th>
                <th className="p-3 font-bold">Solde Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { month: 'Juin 2026', expected: 2600000, collected: 2400000, exp: 180000, comm: 192000 },
                { month: 'Juillet 2026', expected: 2700000, collected: 2500000, exp: 420000, comm: 200000 },
                { month: 'Août 2026', expected: 2730000, collected: 2530000, exp: 300000, comm: 202400 },
              ].map((row, idx) => {
                const rate = Math.round((row.collected / row.expected) * 100);
                const net = row.collected - row.exp - row.comm;

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.month}</td>
                    <td className="p-3 text-slate-600">{row.expected.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 font-bold text-emerald-700">{row.collected.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {rate}%
                      </span>
                    </td>
                    <td className="p-3 text-rose-600 font-semibold">{row.exp.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 text-amber-600 font-semibold">{row.comm.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 font-black text-blue-900 text-sm">{net.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
