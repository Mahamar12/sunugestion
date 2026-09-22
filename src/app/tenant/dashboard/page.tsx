'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { CreditCard, Home, FileText, Wrench, Printer, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function TenantDashboardPage() {
  const { tenants, payments, recordPayment, setSelectedDocumentForPrint } = useSunuGestion();
  const tenant = tenants[0]; // Mamadou Diallo

  const tenantPayments = payments.filter((p) => p.tenantId === tenant.id);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'VIREMENT_BANCAIRE' | 'ESPECES'>('WAVE');
  const [phoneInput, setPhoneInput] = useState(tenant.phone);
  const [paySuccess, setPaySuccess] = useState(false);

  const handleMobilePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaySuccess(true);
    setTimeout(() => {
      recordPayment({
        tenantId: tenant.id,
        leaseId: tenant.currentLeaseId || 'lse-1',
        amountFCFA: tenant.rentFCFA,
        method: payMethod,
        referenceNumber: `${payMethod}-SN-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setPaySuccess(false);
      setShowPayModal(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Espace Locataire SunuGestion
          </span>
          <h1 className="text-3xl font-black mt-2">Bonjour, {tenant.firstName} {tenant.lastName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Logement: <strong className="text-white">{tenant.unitNumber}</strong> — {tenant.propertyName}
          </p>
        </div>

        <button
          onClick={() => setShowPayModal(true)}
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Payer Mon Loyer (Wave / Orange Money)</span>
        </button>
      </div>

      {/* Rent Due Alert Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">Loyer Mensuel Dû (Septembre 2026)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {tenant.rentFCFA.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Échéance : 5 Septembre 2026</p>
        </div>

        <button
          onClick={() => setShowPayModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
        >
          Régler maintenant
        </button>
      </div>

      {/* Payment History & Downloadable Quittances */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3">Mes Quittances de Loyer Téléchargeables</h3>

        <div className="space-y-3 text-xs">
          {tenantPayments.map((p) => (
            <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">{p.receiptNumber}</p>
                <p className="text-slate-500 text-[11px]">Payé le {p.date} via {p.method}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-emerald-700">{p.amountFCFA.toLocaleString('fr-FR')} FCFA</span>
                <button
                  onClick={() =>
                    setSelectedDocumentForPrint({
                      id: p.receiptNumber,
                      title: `Quittance - ${tenant.firstName} ${tenant.lastName}`,
                      category: 'QUITTANCE',
                      tenantName: `${tenant.firstName} ${tenant.lastName}`,
                      propertyName: tenant.propertyName,
                      amountFCFA: p.amountFCFA,
                      date: p.date,
                    })
                  }
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Quittance PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Money Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Paiement Mobile par Wave / Orange Money</h3>
                <p className="text-xs text-slate-500">Paiement instantané sécurisé par API mobile</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Paiement Reçu avec Succès !</h4>
                <p className="text-xs text-slate-500">Votre quittance de loyer a été générée automatiquement.</p>
              </div>
            ) : (
              <form onSubmit={handleMobilePayment} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant du Loyer</label>
                  <input
                    type="text"
                    disabled
                    value={`${tenant.rentFCFA.toLocaleString('fr-FR')} FCFA`}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sélectionner Mode Mobile</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayMethod('WAVE')}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 ${
                        payMethod === 'WAVE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-sm">Wave</span>
                      <span className="text-[10px] font-normal opacity-80">Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod('ORANGE_MONEY')}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 ${
                        payMethod === 'ORANGE_MONEY' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-sm">Orange Money</span>
                      <span className="text-[10px] font-normal opacity-80">Passerelle OM</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro de Téléphone Mobile</label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                    required
                  />
                </div>

                <div className="pt-3 border-t flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md shadow-emerald-600/20"
                  >
                    Confirmer le Paiement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
