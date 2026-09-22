'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { MaintenancePriority, MaintenanceStatus } from '@/types/sunugestion';
import { Wrench, Plus, Search, CheckCircle2, Clock, AlertTriangle, UserCheck, X } from 'lucide-react';

export default function MaintenancePage() {
  const { maintenanceTickets, properties, tenants, vendors, createMaintenanceTicket, updateTicketStatus } = useSunuGestion();
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  // New ticket state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'PLOMBERIE' | 'ELECTRICITE' | 'CLIMATISATION' | 'SERRURE' | 'PEINTURE'>('PLOMBERIE');
  const [priority, setPriority] = useState<MaintenancePriority>('ELEVES');
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [description, setDescription] = useState('');

  const filteredTickets = maintenanceTickets.filter((t) => {
    if (filterUrgency === 'ALL') return true;
    return t.priority === filterUrgency;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === tenantId);
    const prop = properties.find((p) => p.id === tenant?.propertyId) || properties[0];

    createMaintenanceTicket({
      agencyId: 'org-1',
      title,
      description,
      category,
      priority,
      status: 'NOUVEAU',
      propertyId: prop.id,
      propertyName: prop.name,
      unitNumber: tenant?.unitNumber || 'Appt 1A',
      tenantId: tenant?.id || 'ten-1',
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire',
    });

    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance & Signalements de Pannes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des tickets d'intervention technique (Plomberie, Climatisation, Électricité, Serrurerie).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Signaler une Panne</span>
        </button>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500">Filtrer par urgence:</span>
        {['ALL', 'URGENCE', 'ELEVES', 'MOYENNE', 'FAIBLE'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterUrgency(p)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              filterUrgency === p
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p === 'ALL' ? 'Toutes' : p}
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  {t.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  t.priority === 'URGENCE' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                }`}>
                  Urgence: {t.priority}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
              <p className="text-[11px] text-slate-500">
                Logement: <strong className="text-slate-800">{t.unitNumber}</strong> ({t.propertyName})
              </p>
              <p className="text-[11px] text-slate-400">Locataire: {t.tenantName}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Prestataire:</span>
                <strong className="text-slate-800">{t.vendorName || 'Non assigné'}</strong>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-500">Statut: {t.status}</span>
                <select
                  value={t.status}
                  onChange={(e) => updateTicketStatus(t.id, e.target.value as any)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800"
                >
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="ASSIGNE">Assigné</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="FERME">Fermé</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Signaler un Problème Technique</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Locataire / Logement</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.unitNumber} - {t.propertyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre de la Panne</label>
                <input
                  type="text"
                  placeholder="ex: Fuite d'eau canalisation cuisine"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    <option value="PLOMBERIE">Plomberie</option>
                    <option value="ELECTRICITE">Électricité</option>
                    <option value="CLIMATISATION">Climatisation</option>
                    <option value="SERRURE">Serrurerie</option>
                    <option value="PEINTURE">Peinture</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Niveau d'Urgence</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    <option value="FAIBLE">Faible</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="ELEVES">Élevée</option>
                    <option value="URGENCE">Urgence Absolue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description Détaillée</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Précisez le problème..."
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-600/20"
                >
                  Créer Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
