'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { LeaseStatus } from '@/types/sunugestion';
import {
  FileText,
  Plus,
  Search,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  X
} from 'lucide-react';

export default function ContractsPage() {
  const { leases, tenants, units, properties, createLease, setSelectedDocumentForPrint } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  // New Lease form state
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2027-08-31');
  const [rentAmount, setRentAmount] = useState(400000);
  const [depositAmount, setDepositAmount] = useState(800000);
  const [dueDay, setDueDay] = useState(5);

  const filteredLeases = leases.filter((l) => {
    const matchesSearch =
      l.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      l.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      l.unitNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateLease = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === tenantId);
    const unit = units.find((u) => u.id === unitId);
    const property = properties.find((p) => p.id === unit?.propertyId);

    createLease({
      agencyId: 'org-1',
      propertyId: property?.id || 'prop-1',
      propertyName: property ? property.name : 'Résidence Les Almadies',
      unitId: unit?.id || 'unit-101',
      unitNumber: unit ? unit.unitNumber : 'Appt 1A',
      tenantId: tenant?.id || 'ten-1',
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire',
      ownerId: property?.ownerId || 'own-1',
      ownerName: property?.ownerName || 'M. Ousmane Ndiaye',
      startDate,
      endDate,
      rentAmountFCFA: Number(rentAmount),
      chargesAmountFCFA: 30000,
      depositAmountFCFA: Number(depositAmount),
      paymentFrequency: 'MENSUEL',
      dueDayOfMonth: Number(dueDay),
      status: 'ACTIF',
    });

    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contrats de Location</h1>
          <p className="text-xs text-slate-500 mt-1">
            Édition des baux d'habitation, suivi des renouvellements et alertes automatiques avant expiration.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Établir un Nouveau Contrat</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par locataire, bien, logement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Statut:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="EXPIRANT_BIENTOT">Expirant Bientôt</option>
            <option value="EXPIRE">Expiré</option>
            <option value="BROUILLON">Brouillon</option>
          </select>
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Locataire & Logement</th>
                <th className="p-4">Propriété</th>
                <th className="p-4">Période du Bail</th>
                <th className="p-4">Loyer Mensuel</th>
                <th className="p-4">Dépôt Garantie</th>
                <th className="p-4">Jour Échéance</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeases.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{l.tenantName}</p>
                    <p className="text-[10px] text-blue-600 font-semibold">{l.unitNumber}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{l.propertyName}</td>
                  <td className="p-4 text-slate-600">
                    {l.startDate} au {l.endDate}
                  </td>
                  <td className="p-4 font-bold text-emerald-700">
                    {l.rentAmountFCFA.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="p-4 text-slate-600">
                    {l.depositAmountFCFA.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    Le {l.dueDayOfMonth} du mois
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      l.status === 'ACTIF'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'EXPIRANT_BIENTOT'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        setSelectedDocumentForPrint({
                          id: l.id,
                          title: `Contrat de Location - ${l.tenantName}`,
                          category: 'CONTRAT',
                          tenantName: l.tenantName,
                          propertyName: l.propertyName,
                          amountFCFA: l.rentAmountFCFA,
                          date: l.startDate,
                        })
                      }
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer Contrat</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lease Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Nouveau Contrat de Location (Bail)</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLease} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Locataire Titulaire</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.unitNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logement / Unité</label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} - {u.propertyName} ({u.rentFCFA.toLocaleString('fr-FR')} FCFA)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Début du Bail</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Fin du Bail</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loyer Mensuel FCFA</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dépôt de Garantie FCFA</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
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
                  Générer Contrat & Échéances
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
