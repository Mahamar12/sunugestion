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
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';

export default function OwnersPage() {
  const { owners, properties, addOwner, deleteOwner, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<typeof owners[0] | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Owner Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Dakar');
  const [bankAccount, setBankAccount] = useState('');
  const [commissionRate, setCommissionRate] = useState(8);
  const [estimatedRevenue, setEstimatedRevenue] = useState(1500000);

  const filteredOwners = owners.filter((o) => {
    const fullName = `${o.firstName || ''} ${o.lastName || ''}`.toLowerCase();
    const phoneMatch = o.phone ? o.phone.includes(search) : false;
    return fullName.includes(search.toLowerCase()) || phoneMatch;
  });

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const newFirstName = firstName.trim();
    const newLastName = lastName.trim();

    setIsSubmitting(true);
    try {
      await addOwner({
        agencyId: 'org-1',
        firstName: newFirstName,
        lastName: newLastName,
        phone: phone.trim() || '+221 77 000 00 00',
        whatsapp: phone.trim() || '+221 77 000 00 00',
        email: email.trim() || `${newFirstName.toLowerCase()}.${newLastName.toLowerCase()}@gmail.com`,
        address: address.trim() || 'Dakar',
        identityDocNumber: '1 890 1978 00412',
        bankAccount: bankAccount.trim() || 'CBAO SN012 01001 0039281001 45',
        commissionRatePercent: Number(commissionRate) || 8,
        totalMonthlyRevenueFCFA: Number(estimatedRevenue) || 1500000,
        propertiesCount: 1,
      });

      setShowModal(false);
      setFirstName('');
      setLastName('');
      setPhone('+221 77 ');
      setEmail('');
      setBankAccount('');
      setEstimatedRevenue(1500000);
      setNotificationMsg(`Le propriétaire ${newFirstName} ${newLastName} a été enregistré avec succès.`);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      console.error('Error creating owner:', err);
      setNotificationMsg(`Erreur lors de l'enregistrement du propriétaire.`);
      setTimeout(() => setNotificationMsg(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Propriétaires Immobiliers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des bailleurs, calcul automatique des commissions d'agence et versements nets (Payouts).
          </p>
        </div>

        <button
          type="button"
          id="btn-ajouter-proprietaire"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
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
      {filteredOwners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Aucun propriétaire trouvé</h3>
            <p className="text-xs text-slate-500 mt-1">Commencez par ajouter votre premier bailleur.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
          >
            Ajouter un Propriétaire
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((o) => {
            const grossRevenue = o.totalMonthlyRevenueFCFA || 2500000;
            const commPercent = o.commissionRatePercent ?? 8;
            const commissionAmount = Math.round(grossRevenue * (commPercent / 100));
            const ownerExpenses = 350000;
            const netPayout = Math.max(0, grossRevenue - ownerExpenses - commissionAmount);
            const initials = `${(o.firstName?.[0] || 'P').toUpperCase()}${(o.lastName?.[0] || '').toUpperCase()}`;

            return (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-700 font-bold text-base flex items-center justify-center ring-2 ring-amber-500/20">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{o.firstName} {o.lastName}</h3>
                        <p className="text-[10px] text-slate-400">{o.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {commPercent}% Comm.
                      </span>
                      <button
                        type="button"
                        onClick={() => setOwnerToDelete(o)}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer ce propriétaire"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {o.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {o.bankAccount}
                    </p>
                  </div>

                  {/* Financial Calculation Statement */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs mt-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Revenus Bruts:</span>
                      <span className="font-bold text-slate-900">{grossRevenue.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Dépenses Immeubles:</span>
                      <span className="font-semibold text-rose-600">-{ownerExpenses.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Commission Agence ({commPercent}%):</span>
                      <span className="font-semibold text-amber-600">-{commissionAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-emerald-800 text-sm">
                      <span>REVENU NET (PAYOUT):</span>
                      <span>{netPayout.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
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
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <FileBox className="w-3.5 h-3.5" />
                  <span>Générer Rapport Propriétaire PDF</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Owner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Ajouter un Propriétaire</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOwner} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    placeholder="ex: Ousmane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    placeholder="ex: Ndiaye"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone / WhatsApp *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="ex: bailleur@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Revenus Mensuels Estimés (FCFA)</label>
                  <input
                    type="number"
                    value={estimatedRevenue || ''}
                    onChange={(e) => setEstimatedRevenue(Number(e.target.value))}
                    placeholder="ex: 1500000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission Agence (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compte Bancaire (RIB / Wave)</label>
                  <input
                    type="text"
                    placeholder="ex: CBAO SN012 / Ecobank"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adresse / Ville</label>
                  <input
                    type="text"
                    placeholder="ex: Dakar, Almadies"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Enregistrer Propriétaire</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Owner Modal */}
      {ownerToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">Supprimer ce propriétaire ?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Êtes-vous sûr de vouloir retirer <strong className="text-slate-800">{ownerToDelete.firstName} {ownerToDelete.lastName}</strong> de vos bailleurs enregistrés ?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOwnerToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Attention :</p>
                <p className="mt-0.5 text-[11px] text-amber-700">
                  Cette action retirera ce bailleur de la liste et clôturera le suivi automatique de ses reversements de commissions.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setOwnerToDelete(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  const name = `${ownerToDelete.firstName} ${ownerToDelete.lastName}`;
                  setIsDeleting(true);
                  try {
                    await deleteOwner(ownerToDelete.id);
                    setNotificationMsg(`Le propriétaire ${name} a été supprimé.`);
                    setOwnerToDelete(null);
                    setTimeout(() => setNotificationMsg(null), 4000);
                  } catch (err) {
                    console.error('Error deleting owner:', err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirmer la suppression</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{notificationMsg}</span>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
