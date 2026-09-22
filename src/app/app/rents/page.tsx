'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { RentScheduleStatus } from '@/types/sunugestion';
import { CalendarCheck, Search, Filter, CheckCircle2, Clock, AlertTriangle, CreditCard } from 'lucide-react';

export default function RentSchedulesPage() {
  const { rentSchedules } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredSchedules = rentSchedules.filter((s) => {
    const matchesSearch =
      s.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      s.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      s.unitNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Échéances de Loyers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Génération automatique des échéances selon les termes des contrats de bail.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par locataire, bien, logement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="font-semibold text-slate-500">Statut Échéance:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PAYE">Payé</option>
            <option value="EN_RETARD">En Retard</option>
            <option value="A_VENIR">À Venir</option>
            <option value="PARTIEL">Partiellement Payé</option>
          </select>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Locataire & Logement</th>
                <th className="p-4">Propriété</th>
                <th className="p-4">Période</th>
                <th className="p-4">Date Limite Échéance</th>
                <th className="p-4">Montant Loyer + Charges</th>
                <th className="p-4">Montant Réglé</th>
                <th className="p-4">Reste à Payer</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{s.tenantName}</p>
                    <p className="text-[10px] text-blue-600 font-semibold">{s.unitNumber}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{s.propertyName}</td>
                  <td className="p-4 font-bold text-slate-800">{s.periodMonthYear}</td>
                  <td className="p-4 text-slate-600 font-medium">{s.dueDate}</td>
                  <td className="p-4 font-bold text-slate-900">{s.totalDueFCFA.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4 font-bold text-emerald-700">{s.paidAmountFCFA.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4">
                    {s.remainingFCFA > 0 ? (
                      <span className="font-bold text-rose-600">{s.remainingFCFA.toLocaleString('fr-FR')} FCFA</span>
                    ) : (
                      <span className="text-slate-400">0 FCFA</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      s.status === 'PAYE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'EN_RETARD'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
