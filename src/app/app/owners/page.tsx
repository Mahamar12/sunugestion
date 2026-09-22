'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  CreditCard,
  Building2,
  DollarSign,
  FileBox,
  X
} from 'lucide-react';

export default function OwnersPage() {
  const { owners, properties, expenses, addOwner, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Owner Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Dakar');
  const [bankAccount, setBankAccount] = useState('');
  const [commissionRate, setCommissionRate] = useState(8);

  const filteredOwners = owners.filter((o) => {
    const fullName = `${o.firstName} ${o.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || o.phone.includes(search);
  });

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    addOwner({
      agencyId: 'org-1',
      firstName,
      lastName,
      phone,
      whatsapp: phone,
      email,
      address,
      identityDocNumber: '1 890 1978 00412',
      bankAccount: bankAccount || 'CBAO SN012 01001 0039281001 45',
      commissionRatePercent: Number(commissionRate),
    });

    setShowModal(false);
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Propriétaires Immobiliers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des bailleurs, calcul automatique des commissions d'agence et versements nets (Payouts).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Propriétaire</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher propriétaire par nom, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Owners Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((o) => {
          const ownerProps = properties.filter((p) => p.ownerId === o.id || p.ownerName.includes(o.lastName));
          const grossRevenue = o.totalMonthlyRevenueFCFA || 2500000;
          const commissionAmount = Math.round(grossRevenue * (o.commissionRatePercent / 100));
          const ownerExpenses = 350000;
          const netPayout = grossRevenue - ownerExpenses - commissionAmount;

          return (
            <div key={o.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-700 font-bold text-base flex items-center justify-center ring-2 ring-amber-500/20">
                    {o.firstName[0]}
                    {o.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{o.firstName} {o.lastName}</h3>
                    <p className="text-[10px] text-slate-400">{o.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  {o.commissionRatePercent}% Comm.
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {o.phone}
                </p>
                <p className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {o.bankAccount}
                </p>
              </div>

              {/* Financial Calculation Statement */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Revenus Bruts:</span>
                  <span className="font-bold text-slate-900">{grossRevenue.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dépenses Immeubles:</span>
                  <span className="font-semibold text-rose-600">-{ownerExpenses.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Commission Agence ({o.commissionRatePercent}%):</span>
                  <span className="font-semibold text-amber-600">-{commissionAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-emerald-800 text-sm">
                  <span>REVENU NET (PAYOUT):</span>
                  <span>{netPayout.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDocumentForPrint({
                    id: `statement-${o.id}`,
                    title: `Rapport Mensuel Propriétaire - ${o.firstName} ${o.lastName}`,
                    category: 'RAPPORT_PROPRIETAIRE',
                    ownerName: `${o.firstName} ${o.lastName}`,
                    amountFCFA: netPayout,
                    date: new Date().toISOString().split('T')[0],
                  })
                }
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileBox className="w-3.5 h-3.5" />
                <span>Générer Rapport Propriétaire PDF</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Owner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Ajouter un Propriétaire</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission Agence (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compte Bancaire (RIB)</label>
                  <input
                    type="text"
                    placeholder="ex: CBAO / Ecobank"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-600/20"
                >
                  Enregistrer Propriétaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
