'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PropertyType } from '@/types/sunugestion';
import {
  Home,
  Plus,
  Search,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function UnitsPage() {
  const { units, properties, owners, addUnit } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Unit creation state
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [unitNumber, setUnitNumber] = useState('');
  const [unitType, setUnitType] = useState<PropertyType>('APPARTEMENT');
  const [floor, setFloor] = useState('1er étage');
  const [surfaceM2, setSurfaceM2] = useState(90);
  const [roomsCount, setRoomsCount] = useState(3);
  const [rentFCFA, setRentFCFA] = useState(350000);
  const [chargesFCFA, setChargesFCFA] = useState(25000);

  const filteredUnits = units.filter(
    (u) =>
      u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      u.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      (u.tenantName && u.tenantName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === propertyId);
    const owner = owners.find((o) => o.id === prop?.ownerId);

    addUnit({
      propertyId: propertyId || 'prop-1',
      propertyName: prop ? prop.name : 'Résidence Les Almadies',
      unitNumber,
      type: unitType,
      floor,
      surfaceM2: Number(surfaceM2),
      roomsCount: Number(roomsCount),
      rentFCFA: Number(rentFCFA),
      chargesFCFA: Number(chargesFCFA),
      status: 'DISPONIBLE',
      ownerId: owner?.id || 'own-1',
      ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'M. Ousmane Ndiaye',
    });

    setShowAddModal(false);
    setUnitNumber('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Logements & Unités</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion fine de la hiérarchie Immeuble → Étage → Appartement / Studio / Local commercial.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Unité</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par n° d'appartement, immeuble, locataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3.5">Numéro & Type</th>
                <th className="p-3.5">Immeuble Rattaché</th>
                <th className="p-3.5">Étage & Surface</th>
                <th className="p-3.5">Loyer Hors Charges</th>
                <th className="p-3.5">Charges</th>
                <th className="p-3.5">Locataire Actuel</th>
                <th className="p-3.5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{u.unitNumber}</p>
                    <p className="text-[10px] text-slate-400">{u.type}</p>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">{u.propertyName}</td>
                  <td className="p-3.5 text-slate-600">
                    {u.floor} • {u.surfaceM2} m² ({u.roomsCount} pièces)
                  </td>
                  <td className="p-3.5 font-bold text-emerald-700">{u.rentFCFA.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-3.5 text-slate-500">{u.chargesFCFA.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-3.5 font-medium text-slate-800">
                    {u.tenantName ? (
                      <span className="text-blue-700 font-semibold">{u.tenantName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Vacant</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.status === 'OCCUPE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Ajouter un nouveau Logement / Unité</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Immeuble de rattachement</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro d'Unité / Porte</label>
                  <input
                    type="text"
                    placeholder="ex: Appt 2B"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Étage</label>
                  <input
                    type="text"
                    placeholder="ex: 2ème étage"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={surfaceM2}
                    onChange={(e) => setSurfaceM2(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loyer Mensuel FCFA</label>
                  <input
                    type="number"
                    value={rentFCFA}
                    onChange={(e) => setRentFCFA(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-600/20"
                >
                  Créer le Logement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
