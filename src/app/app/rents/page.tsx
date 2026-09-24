'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { RentSchedule, PaymentMethod } from '@/types/sunugestion';
import { CalendarCheck, Search, Filter, CheckCircle2, Clock, AlertTriangle, CreditCard, X, Printer } from 'lucide-react';

export default function RentSchedulesPage() {
  const { rentSchedules, recordPayment, leases, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedSchedule, setSelectedSchedule] = useState<RentSchedule | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('WAVE');
  const [payRef, setPayRef] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const filteredSchedules = rentSchedules.filter((s) => {
    const matchesSearch =
      s.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      s.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      s.unitNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCollectRent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    const lease = leases.find((l) => l.tenantId === selectedSchedule.tenantId) || leases[0];

    recordPayment({
      tenantId: selectedSchedule.tenantId,
      leaseId: lease ? lease.id : 'lse-1',
      amountFCFA: selectedSchedule.remainingFCFA,
      method: payMethod,
      referenceNumber: payRef || `PAY-ECH-${Date.now()}`,
    });

    const tenantName = selectedSchedule.tenantName;
    const amount = selectedSchedule.remainingFCFA;
    setSelectedSchedule(null);
    setPayRef('');
    setNotificationMsg(`Loyer de ${amount.toLocaleString('fr-FR')} FCFA encaissé avec succès pour ${tenantName}. Quittance générée !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Échéances de Loyers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Génération automatique des échéances selon les termes des contrats de bail et encaissement direct.
          </p>
        </div>
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
                <th className="p-4 text-right">Actions</th>
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
                  <td className="p-4 text-right">
                    {s.status !== 'PAYE' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSchedule(s)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Encaisser</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Soldé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Collect Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Encaisser l'Échéance</h3>
                <p className="text-xs text-slate-500">
                  {selectedSchedule.tenantName} • {selectedSchedule.unitNumber} ({selectedSchedule.periodMonthYear})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectRent} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <span className="font-semibold text-emerald-800">Montant à Régler :</span>
                <span className="text-base font-black text-emerald-700">
                  {selectedSchedule.remainingFCFA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Moyen de Paiement</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  <option value="WAVE">Wave Money</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="VIREMENT_BANCAIRE">Virement Bancaire</option>
                  <option value="ESPECES">Espèces</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Référence / Numéro Transaction</label>
                <input
                  type="text"
                  placeholder="ex: WAVE-98213490 / Reçu N°..."
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSchedule(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
