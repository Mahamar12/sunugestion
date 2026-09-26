'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { Vendor } from '@/types/sunugestion';
import { UserCog, Phone, MessageSquare, MapPin, Wrench, Plus, X, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';

export default function VendorsPage() {
  const { vendors, addVendor, deleteVendor } = useSunuGestion();
  const [showAddModal, setShowAddModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [whatsapp, setWhatsapp] = useState('+221 77 ');
  const [trade, setTrade] = useState<Vendor['trade']>('PLOMBIER');
  const [zone, setZone] = useState('Dakar Plateau, Almadies, Mermoz');
  const [notes, setNotes] = useState('');

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({
      name,
      phone,
      whatsapp: whatsapp || phone,
      trade,
      zone,
      interventionsCount: 0,
      notes,
    });

    setShowAddModal(false);
    setNotificationMsg(`Le prestataire "${name}" (${trade}) a été ajouté au répertoire avec succès.`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setName('');
    setNotes('');
  };

  const confirmDeleteVendor = () => {
    if (!vendorToDelete) return;
    deleteVendor(vendorToDelete.id);
    setNotificationMsg(`Le prestataire "${vendorToDelete.name}" a été supprimé du répertoire.`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setVendorToDelete(null);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Répertoire des Prestataires & Artisans</h1>
          <p className="text-xs text-slate-500 mt-1">
            Plombiers, Électriciens, Frigoristes, Serruriers et techniciens qualifiés référencés à Dakar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Prestataire</span>
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((v) => (
          <div key={v.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{v.name}</h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  {v.trade}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVendorToDelete(v)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Supprimer ce prestataire"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {v.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {v.zone}
              </p>
              {v.notes && (
                <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                  {v.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <a
                href={`tel:${v.phone}`}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Appel
              </a>
              <a
                href={`https://wa.me/${v.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Supprimer ce prestataire ?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer <span className="font-bold text-slate-900">"{vendorToDelete.name}"</span> ({vendorToDelete.trade}) du répertoire des prestataires ?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setVendorToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteVendor}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Ajouter un Prestataire / Artisan</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom / Entreprise</label>
                <input
                  type="text"
                  placeholder="ex: Plomberie Express Dakar (M. Seck)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corps de Métier</label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  <option value="PLOMBIER">Plombier</option>
                  <option value="ELECTRICIEN">Électricien</option>
                  <option value="FRIGORISTE">Frigoriste</option>
                  <option value="SERRURIER">Serrurier</option>
                  <option value="MENUISIER">Menuisier</option>
                  <option value="PEINTRE">Peintre</option>
                  <option value="AUTRE">Autre Artisan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zones d'intervention Dakar</label>
                <input
                  type="text"
                  placeholder="ex: Almadies, Ngor, Ouakam, Dakar Plateau"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Disponibilité</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Réactif le week-end, équipement certifié..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Enregistrer l'Artisan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
