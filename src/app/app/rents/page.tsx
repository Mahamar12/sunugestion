'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { RentSchedule, PaymentMethod } from '@/types/sunugestion';
import { CalendarCheck, Search, Filter, CheckCircle2, Clock, AlertTriangle, CreditCard, X, Printer, Calendar } from 'lucide-react';

function getDatesForPeriod(periodStr?: string) {
  if (!periodStr) return { start: '2026-09-01', end: '2026-09-30' };
  const str = periodStr.toLowerCase();
  let year = '2026';
  const yearMatch = str.match(/\d{4}/);
  if (yearMatch) year = yearMatch[0];

  if (str.includes('janv')) return { start: `${year}-01-01`, end: `${year}-01-31` };
  if (str.includes('févr') || str.includes('fevr')) return { start: `${year}-02-01`, end: `${year}-02-28` };
  if (str.includes('mars')) return { start: `${year}-03-01`, end: `${year}-03-31` };
  if (str.includes('avril')) return { start: `${year}-04-01`, end: `${year}-04-30` };
  if (str.includes('mai')) return { start: `${year}-05-01`, end: `${year}-05-31` };
  if (str.includes('juin')) return { start: `${year}-06-01`, end: `${year}-06-30` };
  if (str.includes('juil')) return { start: `${year}-07-01`, end: `${year}-07-31` };
  if (str.includes('août') || str.includes('aout')) return { start: `${year}-08-01`, end: `${year}-08-31` };
  if (str.includes('sept')) return { start: `${year}-09-01`, end: `${year}-09-30` };
  if (str.includes('oct')) return { start: `${year}-10-01`, end: `${year}-10-31` };
  if (str.includes('nov')) return { start: `${year}-11-01`, end: `${year}-11-30` };
  if (str.includes('déc') || str.includes('dec')) return { start: `${year}-12-01`, end: `${year}-12-31` };
  return { start: `${year}-09-01`, end: `${year}-09-30` };
}

export default function RentSchedulesPage() {
  const { rentSchedules, recordPayment, leases, tenants, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedSchedule, setSelectedSchedule] = useState<RentSchedule | null>(null);

  // Collect Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payPeriod, setPayPeriod] = useState('Septembre 2026');
  const [payPeriodStart, setPayPeriodStart] = useState('2026-09-01');
  const [payPeriodEnd, setPayPeriodEnd] = useState('2026-09-30');
  const [payDate, setPayDate] = useState('2026-09-25');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('WAVE');
  const [payRef, setPayRef] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleOpenCollect = (s: RentSchedule) => {
    const dates = getDatesForPeriod(s.periodMonthYear);
    setSelectedSchedule(s);
    setPayPeriod(s.periodMonthYear);
    setPayPeriodStart(dates.start);
    setPayPeriodEnd(dates.end);
    setPayDate('2026-09-25');
    setPayAmount(s.remainingFCFA);
    setPayMethod('WAVE');
    setPayRef('');
  };

  const handleSelectPeriod = (m: string) => {
    setPayPeriod(m);
    const dates = getDatesForPeriod(m);
    setPayPeriodStart(dates.start);
    setPayPeriodEnd(dates.end);
  };

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
    const amountToPay = Number(payAmount) || selectedSchedule.remainingFCFA;

    recordPayment({
      tenantId: selectedSchedule.tenantId,
      leaseId: lease ? lease.id : 'lse-1',
      amountFCFA: amountToPay,
      method: payMethod,
      referenceNumber: payMethod === 'ESPECES' ? '' : payRef,
      periodMonthYear: payPeriod,
      dueDate: `Du ${payPeriodStart} au ${payPeriodEnd}`,
      periodStartDate: payPeriodStart,
      periodEndDate: payPeriodEnd,
      paymentDate: payDate,
    });

    const tenantName = selectedSchedule.tenantName;
    setSelectedSchedule(null);
    setPayRef('');
    setNotificationMsg(`Loyer de ${amountToPay.toLocaleString('fr-FR')} FCFA encaissé avec succès pour ${tenantName}. Quittance officielle générée !`);
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
                        onClick={() => handleOpenCollect(s)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Encaisser</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const tenantObj = tenants.find((t) => t.id === s.tenantId || `${t.firstName} ${t.lastName}` === s.tenantName);
                          const dates = getDatesForPeriod(s.periodMonthYear);
                          setSelectedDocumentForPrint({
                            id: `QUITT-${s.id.slice(-6)}`,
                            title: `Quittance de Loyer • ${s.periodMonthYear} • ${s.tenantName}`,
                            category: 'QUITTANCE',
                            tenantName: s.tenantName,
                            propertyName: s.propertyName,
                            amountFCFA: s.paidAmountFCFA || s.totalDueFCFA,
                            date: '2026-09-25',
                            metadata: {
                              receiptNumber: `QUITT-${s.id.slice(-6)}`,
                              periodMonthYear: s.periodMonthYear,
                              paymentDate: '2026-09-25',
                              dueDate: `Du ${dates.start} au ${dates.end}`,
                              periodStartDate: dates.start,
                              periodEndDate: dates.end,
                              method: 'WAVE',
                              referenceNumber: 'ENC-SOLDE-VALIDÉ',
                              unitNumber: s.unitNumber || tenantObj?.unitNumber || 'Logement',
                              tenantPhone: tenantObj?.phone || '+221 77 000 00 00',
                              rentFCFA: s.paidAmountFCFA || s.totalDueFCFA,
                              chargesFCFA: 0,
                            }
                          });
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer text-xs ml-auto"
                        title="Voir la quittance officielle"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Quittance</span>
                      </button>
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Encaisser l'Échéance de Loyer</h3>
                  <p className="text-xs text-slate-500">
                    {selectedSchedule.tenantName} • {selectedSchedule.unitNumber} ({selectedSchedule.propertyName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchedule(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectRent} className="mt-4 space-y-3.5 text-xs">
              {/* Mois / Période de loyer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mois / Période de Loyer Concernée</label>
                <div className="relative">
                  <input
                    type="text"
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    placeholder="ex: Août 2026"
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {['Août 2026', 'Septembre 2026', 'Octobre 2026', 'Novembre 2026'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectPeriod(m)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        payPeriod === m
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date d'Échéance : Commençant le ... Finissant le ... */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Date d'Échéance (Période Couverte)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Commençant le :
                    </label>
                    <input
                      type="date"
                      value={payPeriodStart}
                      onChange={(e) => setPayPeriodStart(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Finissant le :
                    </label>
                    <input
                      type="date"
                      value={payPeriodEnd}
                      onChange={(e) => setPayPeriodEnd(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date de Paiement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date de Paiement</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
                <span className="text-[10px] text-slate-400">Date effective d'encaissement</span>
              </div>

              {/* Montant Payé */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Montant à Régler (FCFA)</label>
                  <button
                    type="button"
                    onClick={() => setPayAmount(selectedSchedule.remainingFCFA)}
                    className="text-[10px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Restant dû : {selectedSchedule.remainingFCFA.toLocaleString('fr-FR')} FCFA
                  </button>
                </div>
                <input
                  type="number"
                  value={payAmount === 0 ? '' : payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="ex: 215 000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Mode de Paiement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Moyen d'Encaissement</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'WAVE', label: 'Wave Money' },
                    { id: 'ORANGE_MONEY', label: 'Orange Money' },
                    { id: 'VIREMENT_BANCAIRE', label: 'Virement Bancaire' },
                    { id: 'ESPECES', label: 'Espèces' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        payMethod === m.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Référence / Numéro Transaction (Masqué si Espèces) */}
              {payMethod !== 'ESPECES' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Numéro de Référence / Transaction ({payMethod === 'WAVE' ? 'Wave' : payMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Virement'})
                  </label>
                  <input
                    type="text"
                    placeholder={
                      payMethod === 'WAVE'
                        ? 'ex: WAVE-98213490'
                        : payMethod === 'ORANGE_MONEY'
                        ? 'ex: OM-SN-78412093'
                        : 'ex: VIR-CBAO-84920'
                    }
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Paiement en espèces sélectionné : aucun numéro de référence requis.</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSchedule(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Générer Quittance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
