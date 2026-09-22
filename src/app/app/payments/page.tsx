'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PaymentMethod } from '@/types/sunugestion';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  X,
  Building2,
  Calendar
} from 'lucide-react';

export default function PaymentsPage() {
  const { payments, tenants, leases, recordPayment, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  // New Payment Form
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [amount, setAmount] = useState(430000);
  const [method, setMethod] = useState<PaymentMethod>('WAVE');
  const [reference, setReference] = useState('');

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
    const tenant = tenants.find((t) => t.id === tenantId);
    const lease = leases.find((l) => l.tenantId === tenantId) || leases[0];

    recordPayment({
      tenantId: tenant?.id || 'ten-1',
      leaseId: lease?.id || 'lse-1',
      amountFCFA: Number(amount),
      method,
      referenceNumber: reference || `PAY-SN-${Date.now()}`,
    });

    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registre des Paiements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enregistrement des encaissements par Wave, Orange Money, Virement bancaire & Espèces.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
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
                <th className="p-4 text-right">Quittance PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
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
                    <button
                      onClick={() =>
                        setSelectedDocumentForPrint({
                          id: p.receiptNumber,
                          title: `Quittance ${p.receiptNumber} - ${p.tenantName}`,
                          category: 'QUITTANCE',
                          tenantName: p.tenantName,
                          propertyName: p.propertyName,
                          amountFCFA: p.amountFCFA,
                          date: p.date,
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer Quittance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Nouveau Paiement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sélectionner Locataire</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.unitNumber} - {t.rentFCFA.toLocaleString('fr-FR')} FCFA)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant Payé FCFA</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Moyen de Paiement</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
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
                  placeholder="ex: WAVE-SN-98213490"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md shadow-emerald-600/20"
                >
                  Valider & Générer Quittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
