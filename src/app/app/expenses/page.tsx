'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { ExpenseCategory, Expense } from '@/types/sunugestion';
import { Receipt, Plus, Search, Filter, X, Building2, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, properties, addExpense, deleteExpense } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // New Expense Form
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('ENTRETIEN');
  const [amount, setAmount] = useState(150000);
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      e.propertyName.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amountFCFA, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === propertyId);

    addExpense({
      agencyId: 'org-1',
      propertyId: propertyId || properties[0]?.id || '',
      propertyName: prop ? prop.name : 'Bien Immobilier',
      category,
      amountFCFA: Number(amount),
      date: new Date().toISOString().split('T')[0],
      vendorName: vendorName || 'Prestataire Dakar',
      description,
    });

    setShowModal(false);
    setNotificationMsg(`Dépense de ${Number(amount).toLocaleString('fr-FR')} FCFA (${category}) enregistrée avec succès.`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setDescription('');
  };

  const confirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    deleteExpense(expenseToDelete.id);
    setNotificationMsg(`La dépense "${expenseToDelete.description}" a été supprimée.`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setExpenseToDelete(null);
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dépenses Immobilières</h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des charges d'entretien, factures SENELEC / SDE, gardiennage SAGAM et travaux d'immeuble.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Saisir une Dépense</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-300">Total Dépenses Enregistrées</p>
          <p className="text-3xl font-black mt-1">{totalExpenses.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <Receipt className="w-10 h-10 text-amber-400 opacity-80" />
      </div>

      {/* Search & List */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher dépense, fournisseur, immeuble..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Date</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Propriété</th>
                <th className="p-4">Fournisseur / Prestataire</th>
                <th className="p-4">Description</th>
                <th className="p-4">Montant FCFA</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Aucune dépense trouvée.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700">{e.date}</td>
                    <td className="p-4 font-bold text-amber-800 uppercase text-[10px]">
                      <span className="px-2 py-0.5 bg-amber-50 rounded border border-amber-200">{e.category}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{e.propertyName}</td>
                    <td className="p-4 font-semibold text-slate-800">{e.vendorName}</td>
                    <td className="p-4 text-slate-600">{e.description}</td>
                    <td className="p-4 font-black text-rose-600 text-sm">
                      -{e.amountFCFA.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setExpenseToDelete(e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Supprimer cette dépense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Supprimer cette dépense ?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer la dépense de <span className="font-bold text-slate-900">{expenseToDelete.amountFCFA.toLocaleString('fr-FR')} FCFA</span> ({expenseToDelete.description}) ?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Enregistrer une Dépense</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Propriété concernée</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    <option value="REPARATION">Réparation</option>
                    <option value="ENTRETIEN">Entretien</option>
                    <option value="EAU">Eau (SDE)</option>
                    <option value="ELECTRICITE">Électricité (SENELEC)</option>
                    <option value="GARDIENNAGE">Gardiennage (SAGAM)</option>
                    <option value="TRAVAUX">Travaux</option>
                    <option value="TAXE">Taxe Foncier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant FCFA</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fournisseur / Prestataire</label>
                <input
                  type="text"
                  placeholder="ex: SENELEC, Plombier M. Seck"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Motif</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Facture N°..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
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
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md shadow-amber-600/20"
                >
                  Valider la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
