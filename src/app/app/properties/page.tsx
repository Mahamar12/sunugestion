'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PropertyType, PropertyStatus } from '@/types/sunugestion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Home,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Wrench,
  DollarSign,
  ChevronRight,
  X
} from 'lucide-react';

export default function PropertiesPage() {
  const { properties, owners, addProperty } = useSunuGestion();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New property form state
  const [name, setName] = useState('');
  const [type, setType] = useState<PropertyType>('IMMEUBLE');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Almadies');
  const [city, setCity] = useState('Dakar');
  const [ownerId, setOwnerId] = useState(owners[0]?.id || '');
  const [valuation, setValuation] = useState(250000000);
  const [description, setDescription] = useState('');

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || p.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const owner = owners.find((o) => o.id === ownerId);

    addProperty({
      agencyId: 'org-1',
      name,
      type,
      address,
      neighborhood,
      city,
      region: 'Dakar',
      description,
      ownerId: ownerId || 'own-1',
      ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'M. Ousmane Ndiaye',
      status: 'DISPONIBLE',
      valuationFCFA: Number(valuation),
      totalUnits: 4,
      occupiedUnits: 0,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    });

    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Biens Immobiliers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion du patrimoine immobilier (Immeubles, Villas, Studios, Boutiques, Bureaux à Dakar).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Bien</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, quartier, propriétaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Type:
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tous les types</option>
            <option value="IMMEUBLE">Immeuble</option>
            <option value="VILLA">Villa</option>
            <option value="APPARTEMENT">Appartement</option>
            <option value="STUDIO">Studio</option>
            <option value="LOCAL_COMMERCIAL">Local Commercial / Bureau</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="OCCUPE">Occupé</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="EN_MAINTENANCE">En maintenance</option>
          </select>
        </div>
      </div>

      {/* Properties Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
            {/* Image Banner */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {p.type}
              </div>

              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${
                p.status === 'OCCUPE' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'
              }`}>
                {p.status}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{p.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{p.address}, {p.neighborhood} ({p.city})</span>
                </p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Propriétaire</span>
                  <span className="font-bold text-slate-800 truncate block">{p.ownerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Valeur estimée</span>
                  <span className="font-bold text-emerald-700 block">{(p.valuationFCFA / 1000000).toFixed(0)}M FCFA</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span>{p.occupiedUnits} / {p.totalUnits} Logements occupés</span>
                </div>
                <Link
                  href={`/app/properties/${p.id}`}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  Voir fiche <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Ajouter un nouveau Bien Immobilier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du bien</label>
                <input
                  type="text"
                  placeholder="ex: Immeuble Résidence Les Almadies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de Bien</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    <option value="IMMEUBLE">Immeuble</option>
                    <option value="VILLA">Villa</option>
                    <option value="APPARTEMENT">Appartement</option>
                    <option value="STUDIO">Studio</option>
                    <option value="BOUTIQUE">Boutique</option>
                    <option value="BUREAU">Bureau</option>
                    <option value="LOCAL_COMMERCIAL">Local Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quartier (Dakar)</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse complète</label>
                <input
                  type="text"
                  placeholder="ex: Route des Almadies, en face King Fahd Palace"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Propriétaire</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.firstName} {o.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valeur estimée (FCFA)</label>
                  <input
                    type="number"
                    value={valuation}
                    onChange={(e) => setValuation(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Caractéristiques du bien, équipements..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
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
                  Enregistrer le Bien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
