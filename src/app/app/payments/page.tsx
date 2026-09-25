'use client';

import React, { useState, useEffect } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PaymentMethod, Payment } from '@/types/sunugestion';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  X,
  Building2,
  Calendar,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function PaymentsPage() {
  const { payments, tenants, leases, recordPayment, deletePayment, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // New Payment Form
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [amount, setAmount] = useState<number>(tenants[0]?.rentFCFA || 0);
  const [payPeriod, setPayPeriod] = useState('Septembre 2026');
  const [payDueDate, setPayDueDate] = useState('2026-09-05');
  const [payDate, setPayDate] = useState('2026-09-25');
  const [method, setMethod] = useState<PaymentMethod>('WAVE');
  const [reference, setReference] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tenants.length > 0 && (!tenantId || !tenants.some((t) => t.id === tenantId))) {
      setTenantId(tenants[0].id);
      setAmount(tenants[0].rentFCFA);
    }
  }, [tenants, tenantId]);

  const handleOpenModal = () => {
    const cur = tenants.find((t) => t.id === tenantId) || tenants[0];
    if (cur) {
      setTenantId(cur.id);
      setAmount(cur.rentFCFA);
    }
    setShowModal(true);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.propertyName.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = filterMethod === 'ALL' || p.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === tenantId) || tenants[0];
    const lease = leases.find((l) => l.tenantId === tenant?.id) || leases[0];

    recordPayment({
      tenantId: tenant?.id || tenants[0]?.id || '',
      leaseId: lease?.id || leases[0]?.id || '',
      amountFCFA: Number(amount) || tenant?.rentFCFA || 0,
      method,
      referenceNumber: reference || `REC-${Date.now().toString().slice(-6)}`,
      periodMonthYear: payPeriod,
      dueDate: payDueDate,
      paymentDate: payDate,
    });

    setShowModal(false);
    setNotificationMsg(`Paiement de ${(Number(amount) || tenant?.rentFCFA || 0).toLocaleString('fr-FR')} FCFA validé pour ${tenant ? `${tenant.firstName} ${tenant.lastName}` : 'le locataire'}. Quittance officielle générée !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const confirmDeletePayment = () => {
    if (!paymentToDelete) return;
    deletePayment(paymentToDelete.id);
    setNotificationMsg(`Le reçu de paiement "${paymentToDelete.receiptNumber}" a été supprimé.`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setPaymentToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registre des Paiements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enregistrement des encaissements par Wave, Orange Money, Virement bancaire & Espèces.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un Paiement</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par n° de quittance, locataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Moyen de paiement:</span>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
          >
            <option value="ALL">Tous les moyens</option>
            <option value="WAVE">Wave Money</option>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="VIREMENT_BANCAIRE">Virement Bancaire</option>
            <option value="ESPECES">Espèces</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">N° Quittance</th>
                <th className="p-4">Locataire</th>
                <th className="p-4">Logement & Bien</th>
                <th className="p-4">Date du Paiement</th>
                <th className="p-4">Moyen de Paiement</th>
                <th className="p-4">Référence</th>
                <th className="p-4">Montant Payé</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Aucun paiement trouvé.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{p.receiptNumber}</td>
                    <td className="p-4 font-semibold text-slate-800">{p.tenantName}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.unitNumber}</p>
                      <p className="text-[10px] text-slate-400">{p.propertyName}</p>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{p.date}</td>
                    <td className="p-4 font-bold text-slate-700">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md border text-[10px]">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{p.referenceNumber}</td>
                    <td className="p-4 font-black text-emerald-600 text-sm">
                      {p.amountFCFA.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const tenantObj = tenants.find((t) => t.id === p.tenantId || `${t.firstName} ${t.lastName}` === p.tenantName);
                            setSelectedDocumentForPrint({
                              id: p.receiptNumber,
                              title: `Quittance ${p.receiptNumber} - ${p.tenantName}`,
                              category: 'QUITTANCE',
                              tenantName: p.tenantName,
                              propertyName: p.propertyName,
                              amountFCFA: p.amountFCFA,
                              date: p.date,
                              metadata: {
                                periodMonthYear: p.periodMonthYear || 'Septembre 2026',
                                paymentDate: p.date,
                                dueDate: p.dueDate || '05 Septembre 2026',
                                paymentMethod: p.method,
                                referenceNumber: p.referenceNumber,
                                unitNumber: p.unitNumber || tenantObj?.unitNumber || 'Logement',
                                tenantPhone: tenantObj?.phone || '+221 77 000 00 00',
                              }
                            });
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer text-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Quittance</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentToDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          title="Supprimer ce paiement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Supprimer ce paiement ?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer la quittance <span className="font-bold text-slate-900">"{paymentToDelete.receiptNumber}"</span> ({paymentToDelete.amountFCFA.toLocaleString('fr-FR')} FCFA pour {paymentToDelete.tenantName}) ?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeletePayment}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Nouveau Paiement de Loyer</h3>
                  <p className="text-xs text-slate-500">Quittance officielle avec échéance & mois de loyer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              {/* Locataire */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Locataire & Logement</label>
                <select
                  value={tenantId}
                  onChange={(e) => {
                    const tid = e.target.value;
                    setTenantId(tid);
                    const selected = tenants.find((t) => t.id === tid);
                    if (selected) {
                      setAmount(selected.rentFCFA);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} — {t.unitNumber} ({t.propertyName}) • {t.rentFCFA.toLocaleString('fr-FR')} FCFA
                    </option>
                  ))}
                </select>
              </div>

              {/* Mois / Période de loyer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mois / Période de Loyer Concernée</label>
                <div className="relative">
                  <input
                    type="text"
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    placeholder="ex: Septembre 2026"
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
                      onClick={() => setPayPeriod(m)}
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

              {/* 2 dates: Échéance & Paiement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d'Échéance</label>
                  <input
                    type="date"
                    value={payDueDate}
                    onChange={(e) => setPayDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Date limite fixée au bail</span>
                </div>
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
              </div>

              {/* Montant Payé */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Montant Payé (FCFA)</label>
                  {tenantId && (
                    <button
                      type="button"
                      onClick={() => {
                        const sel = tenants.find((t) => t.id === tenantId);
                        if (sel) setAmount(sel.rentFCFA);
                      }}
                      className="text-[10px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Loyer exact: {tenants.find((t) => t.id === tenantId)?.rentFCFA.toLocaleString('fr-FR')} FCFA
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={amount === 0 ? '' : amount}
                  onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="ex: 233 100"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Moyen de Paiement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Moyen de Paiement</label>
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
                      onClick={() => setMethod(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        method === m.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Référence */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Référence / Numéro Transaction</label>
                <input
                  type="text"
                  placeholder="ex: WAVE-SN-98213490 / Virement CBAO / Reçu N° 45"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
