'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  Building2,
  MapPin,
  Home,
  UserCheck,
  CreditCard,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  Users,
  Phone,
  MessageSquare,
  Mail,
  Key,
  ArrowRight,
  Search,
  ChevronRight,
  Pencil,
  X,
  Loader2
} from 'lucide-react';
import { PropertyType, PropertyStatus, Property } from '@/types/sunugestion';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  const { properties, owners, units, tenants, maintenanceTickets, expenses, updateProperty, deleteProperty } = useSunuGestion();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OCCUPIED' | 'VACANT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Property edit modal state
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<PropertyType>('IMMEUBLE');
  const [editStatus, setEditStatus] = useState<PropertyStatus>('DISPONIBLE');
  const [editAddress, setEditAddress] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editCity, setEditCity] = useState('Dakar');
  const [editOwnerId, setEditOwnerId] = useState('');
  const [editValuation, setEditValuation] = useState(250000000);
  const [editTotalUnits, setEditTotalUnits] = useState(4);
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleOpenEditModal = (p: Property) => {
    setPropertyToEdit(p);
    setEditName(p.name);
    setEditType(p.type);
    setEditStatus(p.status);
    setEditAddress(p.address);
    setEditNeighborhood(p.neighborhood);
    setEditCity(p.city || 'Dakar');
    setEditOwnerId(p.ownerId || owners[0]?.id || '');
    setEditValuation(p.valuationFCFA || 0);
    setEditTotalUnits(p.totalUnits || 1);
    setEditDescription(p.description || '');
    setEditImage(p.image || '');
  };

  const handleSavePropertyEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyToEdit) return;

    setIsSavingEdit(true);
    try {
      const owner = owners.find((o) => o.id === editOwnerId);
      const updates: Partial<Property> = {
        name: editName.trim(),
        type: editType,
        status: editStatus,
        address: editAddress.trim(),
        neighborhood: editNeighborhood.trim(),
        city: editCity.trim(),
        ownerId: editOwnerId,
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : propertyToEdit.ownerName,
        valuationFCFA: Number(editValuation),
        totalUnits: Number(editTotalUnits),
        description: editDescription.trim(),
        image: editImage.trim() || propertyToEdit.image,
      };

      updateProperty(propertyToEdit.id, updates);

      setNotificationMsg(`Le bien "${editName}" a été modifié avec succès.`);
      setTimeout(() => setNotificationMsg(null), 4000);
      setPropertyToEdit(null);
    } catch (err) {
      console.error('Error updating property:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const property = properties.find((p) => p.id === propertyId) || properties[0];
  const propertyUnits = units.filter(
    (u) =>
      u.propertyId === property?.id ||
      (u.propertyName && property?.name && u.propertyName.trim().toLowerCase() === property?.name.trim().toLowerCase())
  );
  const propertyTickets = maintenanceTickets.filter(
    (t) => t.propertyId === property?.id || t.propertyName === property?.name
  );
  const propertyExpenses = expenses.filter(
    (e) => e.propertyId === property?.id || e.propertyName === property?.name
  );

  const propertyTenants = property
    ? tenants.filter(
        (t) =>
          t.propertyId === property.id ||
          (t.propertyName &&
            property.name &&
            t.propertyName.trim().toLowerCase() === property.name.trim().toLowerCase()) ||
          propertyUnits.some(
            (u) =>
              u.id === t.unitId ||
              (u.unitNumber && t.unitNumber && u.unitNumber.trim().toLowerCase() === t.unitNumber.trim().toLowerCase())
          )
      )
    : [];

  // Occupied list from units table
  const occupiedUnitsFromTable = propertyUnits
    .filter(
      (u) =>
        u.status === 'OCCUPE' ||
        u.status === 'EN_RETARD' ||
        Boolean(u.tenantId) ||
        Boolean(u.tenantName) ||
        propertyTenants.some(
          (t) =>
            t.unitId === u.id ||
            (u.unitNumber && t.unitNumber && u.unitNumber.trim().toLowerCase() === t.unitNumber.trim().toLowerCase())
        )
    )
    .map((u) => {
      const tenant = propertyTenants.find(
        (t) =>
          t.id === u.tenantId ||
          t.unitId === u.id ||
          (t.unitNumber && u.unitNumber && t.unitNumber.trim().toLowerCase() === u.unitNumber.trim().toLowerCase())
      );
      return {
        unit: u,
        tenant: tenant || null,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : (u.tenantName || 'Locataire actuel'),
        rentFCFA: u.rentFCFA || (tenant ? tenant.rentFCFA : 0),
      };
    });

  // Extra tenants belonging to this property
  const extraTenantsInProperty = propertyTenants
    .filter((t) => !occupiedUnitsFromTable.some((item) => item.tenant?.id === t.id))
    .map((t) => ({
      unit: {
        id: t.unitId || `synth-${t.id}`,
        propertyId: property?.id || '',
        propertyName: property?.name || '',
        unitNumber: t.unitNumber || 'Logement',
        type: 'APPARTEMENT' as any,
        floor: 'RDC / Étage',
        surfaceM2: 0,
        roomsCount: 0,
        rentFCFA: t.rentFCFA,
        chargesFCFA: 0,
        status: 'OCCUPE' as any,
        tenantId: t.id,
        tenantName: `${t.firstName} ${t.lastName}`,
        ownerId: property?.ownerId || '',
        ownerName: property?.ownerName || '',
      },
      tenant: t,
      tenantName: `${t.firstName} ${t.lastName}`,
      rentFCFA: t.rentFCFA,
    }));

  const allOccupiedUnits = [...occupiedUnitsFromTable, ...extraTenantsInProperty];
  const allVacantUnits = propertyUnits.filter(
    (u) => !occupiedUnitsFromTable.some((item) => item.unit.id === u.id)
  );

  const totalUnitsCount = Math.max(property?.totalUnits || 0, allOccupiedUnits.length + allVacantUnits.length);
  const occupiedCount = allOccupiedUnits.length;
  const vacantCount = allVacantUnits.length > 0 ? allVacantUnits.length : Math.max(0, totalUnitsCount - occupiedCount);
  const totalOccupiedRent = allOccupiedUnits.reduce((sum, item) => sum + (item.rentFCFA || 0), 0);

  // Search filter
  const filteredOccupiedUnits = allOccupiedUnits.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.tenantName.toLowerCase().includes(q) ||
      item.unit.unitNumber.toLowerCase().includes(q) ||
      (item.tenant?.profession && item.tenant.profession.toLowerCase().includes(q)) ||
      (item.tenant?.phone && item.tenant.phone.includes(q)) ||
      (item.tenant?.whatsapp && item.tenant.whatsapp.includes(q))
    );
  });

  const filteredVacantUnits = allVacantUnits.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.unitNumber.toLowerCase().includes(q) ||
      u.type.toLowerCase().includes(q) ||
      u.floor.toLowerCase().includes(q)
    );
  });

  if (!property) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500">Bien immobilier introuvable.</p>
        <Link href="/app/properties" className="text-blue-600 font-bold text-xs mt-3 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteProperty(property.id);
    router.push('/app/properties');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/properties"
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des biens</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditModal(property)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Modifier ce bien</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer ce bien</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Edit Property Modal */}
      {propertyToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Modifier le Bien Immobilier</h3>
                  <p className="text-[11px] text-slate-500">Mettre à jour les informations du bien</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPropertyToEdit(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePropertyEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du bien</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de Bien</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block font-semibold text-slate-700 mb-1">Statut</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCCUPE">Occupé</option>
                    <option value="EN_MAINTENANCE">En maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Propriétaire (Bailleur)</label>
                  <select
                    value={editOwnerId}
                    onChange={(e) => setEditOwnerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.firstName} {o.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quartier (Dakar)</label>
                  <input
                    type="text"
                    value={editNeighborhood}
                    onChange={(e) => setEditNeighborhood(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse complète</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valeur estimée (FCFA)</label>
                  <input
                    type="number"
                    value={editValuation}
                    onChange={(e) => setEditValuation(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre total de logements</label>
                  <input
                    type="number"
                    min="1"
                    value={editTotalUnits}
                    onChange={(e) => setEditTotalUnits(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL de l'image (optionnel)</label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyToEdit(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer les modifications</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Supprimer ce bien ?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement <span className="font-bold text-slate-900">"{property.name}"</span> ({property.address}) ? Toutes les unités associées seront également retirées.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Property Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        <div className="h-64 lg:h-auto relative bg-slate-100">
          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">
            {property.type}
          </div>
        </div>

        <div className="p-6 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900">{property.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                property.status === 'OCCUPE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {property.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{property.address}, {property.neighborhood} ({property.city})</span>
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{property.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Propriétaire</span>
              <strong className="text-slate-900">{property.ownerName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Logements</span>
              <strong className="text-slate-900">{occupiedCount} / {totalUnitsCount} Occupés</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Valeur estimée</span>
              <strong className="text-emerald-700 font-bold">{(property.valuationFCFA / 1000000).toFixed(0)}M FCFA</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Loyers perçus</span>
              <strong className="text-blue-700 font-bold">
                {totalOccupiedRent.toLocaleString('fr-FR')} FCFA/m
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Logements & Locataires Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with Title and Tabs */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Logements & Locataires du bien</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Détail complet des appartements occupés avec locataires et des appartements non occupés (vacants).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tab switchers */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous ({allOccupiedUnits.length + allVacantUnits.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('OCCUPIED')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'OCCUPIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Occupés ({allOccupiedUnits.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('VACANT')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'VACANT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Non occupés ({allVacantUnits.length})</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher locataire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* SECTION 1: OCCUPIED UNITS WITH FULL TENANT DETAILS */}
          {(activeTab === 'ALL' || activeTab === 'OCCUPIED') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span>Logements Occupés & Coordonnées Locataires</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">
                    {filteredOccupiedUnits.length}
                  </span>
                </h3>
              </div>

              {filteredOccupiedUnits.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  {searchQuery
                    ? 'Aucun locataire ne correspond à votre recherche.'
                    : 'Aucun appartement n\'est actuellement occupé dans ce bien.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOccupiedUnits.map((item, idx) => {
                    const t = item.tenant;
                    const isLate = t?.status === 'EN_RETARD' || (t?.arrearsFCFA && t.arrearsFCFA > 0);
                    const cleanPhone = (t?.whatsapp || t?.phone || '').replace(/[^0-9]/g, '');

                    return (
                      <div
                        key={item.unit.id || `occ-${idx}`}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* Unit info header */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-lg border border-blue-200/60">
                              {item.unit.unitNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {item.unit.type} • {item.unit.floor}
                              {item.unit.surfaceM2 ? ` • ${item.unit.surfaceM2} m²` : ''}
                            </span>
                          </div>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                            {item.rentFCFA.toLocaleString('fr-FR')} FCFA/m
                          </span>
                        </div>

                        {/* Tenant details */}
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20">
                            {item.tenantName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                                {item.tenantName}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 border ${
                                  isLate
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {isLate ? 'Paiement en retard' : 'Loyer à jour'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {t?.profession || 'Locataire occupant'}
                            </p>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium">Téléphone</span>
                            <a
                              href={`tel:${t?.phone}`}
                              className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{t?.phone || 'Non renseigné'}</span>
                            </a>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium">N° Pièce (CNI)</span>
                            <span className="font-bold text-slate-800 truncate block">
                              {t?.identityDocNumber || 'Enregistrée'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium">Date d'entrée</span>
                            <span className="font-bold text-slate-800 truncate block">
                              {t?.entryDate || 'Bail actif'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium">Arriérés</span>
                            <span className={`font-extrabold truncate block ${isLate ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {t?.arrearsFCFA ? `${t.arrearsFCFA.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                            </span>
                          </div>
                        </div>

                        {/* Quick actions: WhatsApp & Contract */}
                        <div className="flex items-center gap-2 pt-1">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          <Link
                            href="/app/contracts"
                            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                          >
                            <span>Voir Contrat</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: UNOCCUPIED / VACANT UNITS */}
          {(activeTab === 'ALL' || activeTab === 'VACANT') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span>Logements Non Occupés (Vacants / Disponibles à la location)</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold">
                    {filteredVacantUnits.length}
                  </span>
                </h3>
              </div>

              {filteredVacantUnits.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  {searchQuery
                    ? 'Aucun appartement disponible ne correspond à votre recherche.'
                    : 'Tous les appartements de ce bien sont actuellement occupés !'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVacantUnits.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {u.unitNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {u.type} • {u.floor} {u.surfaceM2 ? `• ${u.surfaceM2} m²` : ''} {u.roomsCount ? `(${u.roomsCount} pièces)` : ''}
                          </span>
                        </div>

                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-lg border border-amber-200/80">
                          DISPONIBLE
                        </span>
                      </div>

                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium block">Loyer Demandé</span>
                          <span className="font-black text-amber-900 text-sm">
                            {u.rentFCFA.toLocaleString('fr-FR')} FCFA
                          </span>
                          {u.chargesFCFA > 0 && (
                            <span className="text-[10px] text-slate-500 block">
                              + {u.chargesFCFA.toLocaleString('fr-FR')} FCFA charges
                            </span>
                          )}
                        </div>

                        <Link
                          href="/app/contracts"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Créer Bail</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
