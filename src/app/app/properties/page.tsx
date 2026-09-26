'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PropertyType, PropertyStatus, Property } from '@/types/sunugestion';
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
  Trash2,
  X,
  Loader2,
  Users,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Key,
  ShieldCheck,
  ExternalLink,
  UserPlus,
  Info,
  ArrowRight,
  Pencil,
  Camera,
  Upload,
  ImageIcon,
  Check,
  Sparkles
} from 'lucide-react';

const PROPERTY_IMAGE_PRESETS = [
  {
    name: 'Immeuble Moderne Standing',
    category: 'IMMEUBLE',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Résidence R+4 Almadies',
    category: 'IMMEUBLE',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Villa Prestige avec Piscine',
    category: 'VILLA',
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Villa Contemporaine',
    category: 'VILLA',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Appartement Lumineux',
    category: 'APPARTEMENT',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Salon & Intérieur Standing',
    category: 'APPARTEMENT',
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Studio Meublé Moderne',
    category: 'STUDIO',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bureaux Professionnels',
    category: 'BUREAU',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Boutique & Local Commercial',
    category: 'BOUTIQUE',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  },
];

export default function PropertiesPage() {
  const { properties, owners, units, tenants, leases, addProperty, updateProperty, deleteProperty } = useSunuGestion();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dedicated Quick Image Change Modal state
  const [propertyToChangeImage, setPropertyToChangeImage] = useState<Property | null>(null);
  const [selectedNewImage, setSelectedNewImage] = useState<string>('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [showAddPresetGallery, setShowAddPresetGallery] = useState(false);

  // Tenant / Unit inspection modal state
  const [selectedPropertyForTenants, setSelectedPropertyForTenants] = useState<Property | null>(null);
  const [tenantModalTab, setTenantModalTab] = useState<'ALL' | 'OCCUPIED' | 'VACANT'>('ALL');
  const [tenantModalSearch, setTenantModalSearch] = useState('');

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

  // New property form state
  const [name, setName] = useState('');
  const [type, setType] = useState<PropertyType>('IMMEUBLE');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Almadies');
  const [city, setCity] = useState('Dakar');
  const [ownerId, setOwnerId] = useState(owners[0]?.id || '');
  const [valuation, setValuation] = useState(250000000);
  const [description, setDescription] = useState('');
  const [newPropertyImage, setNewPropertyImage] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image sélectionnée est trop lourde (maximum 5 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenImageChangeModal = (p: Property) => {
    setPropertyToChangeImage(p);
    setSelectedNewImage(p.image || '');
    setShowPresetGallery(false);
  };

  const handleSaveImageOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyToChangeImage || !selectedNewImage) return;

    setIsSavingImage(true);
    try {
      updateProperty(propertyToChangeImage.id, { image: selectedNewImage });

      if (selectedPropertyForTenants?.id === propertyToChangeImage.id) {
        setSelectedPropertyForTenants({
          ...selectedPropertyForTenants,
          image: selectedNewImage,
        });
      }

      setNotificationMsg(`La photo du bien "${propertyToChangeImage.name}" a été mise à jour avec succès.`);
      setTimeout(() => setNotificationMsg(null), 4000);
      setPropertyToChangeImage(null);
    } catch (err) {
      console.error('Error updating property image:', err);
    } finally {
      setIsSavingImage(false);
    }
  };

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

      if (selectedPropertyForTenants?.id === propertyToEdit.id) {
        setSelectedPropertyForTenants({
          ...selectedPropertyForTenants,
          ...updates,
        } as Property);
      }

      setNotificationMsg(`Le bien "${editName}" a été modifié avec succès.`);
      setTimeout(() => setNotificationMsg(null), 4000);
      setPropertyToEdit(null);
    } catch (err) {
      console.error('Error updating property:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || p.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Computed data for the tenant & unit inspection modal
  const activePropertyUnits = selectedPropertyForTenants
    ? units.filter(
        (u) =>
          u.propertyId === selectedPropertyForTenants.id ||
          (u.propertyName &&
            selectedPropertyForTenants.name &&
            u.propertyName.trim().toLowerCase() === selectedPropertyForTenants.name.trim().toLowerCase())
      )
    : [];

  // Strictly filter tenants that belong to THIS selected property
  const activePropertyTenants = selectedPropertyForTenants
    ? tenants.filter((t) => {
        if (t.propertyId && t.propertyId === selectedPropertyForTenants.id) return true;
        if (
          t.propertyName &&
          selectedPropertyForTenants.name &&
          t.propertyName.trim().toLowerCase() === selectedPropertyForTenants.name.trim().toLowerCase()
        ) {
          return true;
        }
        return false;
      })
    : [];

  // Pair each real tenant of this property with their unit in this property
  const assignedUnitIds = new Set<string>();
  const allOccupiedUnits = activePropertyTenants.map((t) => {
    const matchedUnit = activePropertyUnits.find(
      (u) =>
        !assignedUnitIds.has(u.id) &&
        (u.id === t.unitId ||
          u.tenantId === t.id ||
          (u.unitNumber && t.unitNumber && u.unitNumber.trim().toLowerCase() === t.unitNumber.trim().toLowerCase()))
    );

    if (matchedUnit) {
      assignedUnitIds.add(matchedUnit.id);
      return {
        unit: matchedUnit,
        tenant: t,
        tenantName: `${t.firstName} ${t.lastName}`,
        rentFCFA: t.rentFCFA || matchedUnit.rentFCFA || 0,
      };
    }

    return {
      unit: {
        id: t.unitId || `synth-${t.id}`,
        propertyId: selectedPropertyForTenants?.id || '',
        propertyName: selectedPropertyForTenants?.name || '',
        unitNumber: t.unitNumber || 'Logement',
        type: (selectedPropertyForTenants?.type === 'VILLA' ? 'VILLA' : 'APPARTEMENT') as PropertyType,
        floor: 'RDC / Étage',
        surfaceM2: 0,
        roomsCount: 0,
        rentFCFA: t.rentFCFA,
        chargesFCFA: 0,
        status: 'OCCUPE' as PropertyStatus,
        tenantId: t.id,
        tenantName: `${t.firstName} ${t.lastName}`,
        ownerId: selectedPropertyForTenants?.ownerId || '',
        ownerName: selectedPropertyForTenants?.ownerName || '',
      },
      tenant: t,
      tenantName: `${t.firstName} ${t.lastName}`,
      rentFCFA: t.rentFCFA,
    };
  });

  // Vacant units: any unit belonging to this property that has no tenant assigned
  const allVacantUnits = activePropertyUnits.filter((u) => !assignedUnitIds.has(u.id));

  const totalModalUnits = Math.max(
    selectedPropertyForTenants?.totalUnits || 0,
    allOccupiedUnits.length + allVacantUnits.length
  );
  const occupiedCount = allOccupiedUnits.length;
  const vacantCount = allVacantUnits.length > 0 ? allVacantUnits.length : Math.max(0, totalModalUnits - occupiedCount);
  const totalOccupiedRent = allOccupiedUnits.reduce((sum, item) => sum + (item.rentFCFA || 0), 0);

  // Search filter inside modal
  const filteredOccupiedUnits = allOccupiedUnits.filter((item) => {
    if (!tenantModalSearch.trim()) return true;
    const q = tenantModalSearch.toLowerCase();
    return (
      item.tenantName.toLowerCase().includes(q) ||
      item.unit.unitNumber.toLowerCase().includes(q) ||
      (item.tenant?.profession && item.tenant.profession.toLowerCase().includes(q)) ||
      (item.tenant?.phone && item.tenant.phone.includes(q)) ||
      (item.tenant?.whatsapp && item.tenant.whatsapp.includes(q))
    );
  });

  const filteredVacantUnits = allVacantUnits.filter((u) => {
    if (!tenantModalSearch.trim()) return true;
    const q = tenantModalSearch.toLowerCase();
    return (
      u.unitNumber.toLowerCase().includes(q) ||
      u.type.toLowerCase().includes(q) ||
      u.floor.toLowerCase().includes(q)
    );
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
      image: newPropertyImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    });

    setShowAddModal(false);
    setNotificationMsg(`Le bien "${name}" a été ajouté avec succès au patrimoine.`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setName('');
    setDescription('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Biens Immobiliers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion du patrimoine immobilier (Immeubles, Villas, Studios, Boutiques, Bureaux à Dakar).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
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
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
            {/* Clickable Image Banner */}
            <div 
              onClick={() => {
                setSelectedPropertyForTenants(p);
                setTenantModalTab('ALL');
                setTenantModalSearch('');
              }}
              className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer group/img"
              title="Cliquer pour afficher les locataires et logements"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {p.type}
              </div>

              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${
                p.status === 'OCCUPE' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'
              }`}>
                {p.status}
              </div>

              {/* Quick Image Change Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenImageChangeModal(p);
                }}
                className="absolute bottom-2 left-2 bg-slate-900/80 hover:bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition shadow cursor-pointer border border-white/20 hover:scale-105"
                title="Modifier la photo de ce bien"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Modifier photo</span>
              </button>

              <div className="absolute bottom-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5 transition shadow">
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>Voir locataires</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div 
                  onClick={() => {
                    setSelectedPropertyForTenants(p);
                    setTenantModalTab('ALL');
                    setTenantModalSearch('');
                  }}
                  className="cursor-pointer"
                >
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{p.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{p.address}, {p.neighborhood} ({p.city})</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-2">{p.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Propriétaire</span>
                    <span className="font-bold text-slate-800 truncate block">{p.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Valeur estimée</span>
                    <span className="font-bold text-emerald-700 block">{(p.valuationFCFA / 1000000).toFixed(0)}M FCFA</span>
                  </div>
                </div>

                {/* Primary Action Button: Locataires & Logements */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPropertyForTenants(p);
                    setTenantModalTab('ALL');
                    setTenantModalSearch('');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200/80 transition-all shadow-sm cursor-pointer group/btn"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                    <span>Locataires & Appartements</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-white text-blue-700 font-black rounded-full text-[10px] shadow-sm border border-blue-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    {(() => {
                      const count = tenants.filter(
                        (t) =>
                          t.propertyId === p.id ||
                          (t.propertyName && p.name && t.propertyName.trim().toLowerCase() === p.name.trim().toLowerCase())
                      ).length;
                      const occ = count > 0 ? count : (p.occupiedUnits || 0);
                      const tot = Math.max(p.totalUnits || 0, occ);
                      return `${occ} / ${tot} occupés`;
                    })()}
                  </span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/app/properties/${p.id}`}
                    className="text-xs text-slate-500 font-bold hover:text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Fiche détaillée <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold rounded-lg border border-blue-200/80 transition-colors cursor-pointer"
                      title={`Modifier ${p.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPropertyToDelete(p)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={`Supprimer ${p.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Ajouter un nouveau Bien Immobilier</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
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

              {/* Photo du bien */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-700">Photo de couverture</label>
                
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <img src={newPropertyImage} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importer photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setNewPropertyImage)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowAddPresetGallery(!showAddPresetGallery)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer transition"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choisir un modèle</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={newPropertyImage}
                      onChange={(e) => setNewPropertyImage(e.target.value)}
                      placeholder="Ou coller le lien d'une image (https://...)"
                      className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {showAddPresetGallery && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Modèles disponibles :
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-0.5">
                      {PROPERTY_IMAGE_PRESETS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setNewPropertyImage(preset.url)}
                          className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                            newPropertyImage === preset.url ? 'border-blue-600 ring-2 ring-blue-400' : 'border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-12 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-0.5 flex flex-col justify-end">
                            <span className="text-[8px] text-white font-bold leading-tight truncate">{preset.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

              {/* Photo du bien */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-semibold text-slate-700">Photo du bien immobilier</label>
                
                {/* Image Preview & Quick Actions */}
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border-2 border-slate-300 shrink-0 relative">
                    {editImage ? (
                      <img src={editImage} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importer une photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, setEditImage)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowPresetGallery(!showPresetGallery)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer transition"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choisir un modèle</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      placeholder="Ou coller le lien d'une image (https://...)"
                      className="w-full p-2 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Preset Gallery Carousel */}
                {showPresetGallery && (
                  <div className="mt-3 p-2 bg-white rounded-xl border border-slate-200 space-y-2">
                    <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Sélectionner une photo parmi les modèles recommandés :
                    </p>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {PROPERTY_IMAGE_PRESETS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setEditImage(preset.url)}
                          className={`relative rounded-lg overflow-hidden border-2 cursor-pointer group transition-all ${
                            editImage === preset.url ? 'border-blue-600 shadow-md ring-2 ring-blue-400' : 'border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-16 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-1 flex flex-col justify-end">
                            <span className="text-[9px] text-white font-bold leading-tight truncate">{preset.name}</span>
                          </div>
                          {editImage === preset.url && (
                            <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Quick Image Change Dedicated Modal */}
      {propertyToChangeImage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Modifier la Photo</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                    {propertyToChangeImage.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPropertyToChangeImage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImageOnly} className="mt-4 space-y-4">
              {/* Large Current Preview */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                {selectedNewImage ? (
                  <img
                    src={selectedNewImage}
                    alt="Aperçu photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-1" />
                    <span className="text-xs">Aucune image sélectionnée</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                  Aperçu en direct
                </div>
              </div>

              {/* Upload from Device Button */}
              <label className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/25 transition">
                <Upload className="w-4 h-4" />
                <span>Importer une photo depuis votre appareil (téléphone / PC)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setSelectedNewImage)}
                />
              </label>

              {/* Preset Gallery Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ou choisir une photo dans la bibliothèque :
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {PROPERTY_IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedNewImage(preset.url)}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer group transition-all ${
                        selectedNewImage === preset.url
                          ? 'border-blue-600 shadow-md ring-2 ring-blue-400'
                          : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-14 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1 flex flex-col justify-end">
                        <span className="text-[8px] text-white font-bold leading-tight truncate">{preset.name}</span>
                      </div>
                      {selectedNewImage === preset.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Or manual URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ou coller l'adresse URL d'une image :
                </label>
                <input
                  type="text"
                  value={selectedNewImage}
                  onChange={(e) => setSelectedNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 border-t border-slate-100 flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPropertyToChangeImage(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingImage || !selectedNewImage}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSavingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Valider la photo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">Supprimer ce bien immobilier ?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-slate-800">{propertyToDelete.name}</strong> ({propertyToDelete.neighborhood}) ?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conséquences de la suppression :</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Les logements et baux rattachés à ce bien seront également retirés.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!propertyToDelete) return;
                  const name = propertyToDelete.name;
                  setIsDeleting(true);
                  try {
                    await deleteProperty(propertyToDelete.id);
                    setNotificationMsg(`Le bien "${name}" a été supprimé avec succès.`);
                    setPropertyToDelete(null);
                    setTimeout(() => setNotificationMsg(null), 4000);
                  } catch (err) {
                    console.error('Error deleting property:', err);
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
      {/* Property Tenants & Units Modal */}
      {selectedPropertyForTenants && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Top Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shrink-0">
                  <img
                    src={selectedPropertyForTenants.image}
                    alt={selectedPropertyForTenants.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      {selectedPropertyForTenants.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedPropertyForTenants.status === 'OCCUPE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}>
                      {selectedPropertyForTenants.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black mt-1 text-white tracking-tight">
                    {selectedPropertyForTenants.name}
                  </h2>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{selectedPropertyForTenants.address}, {selectedPropertyForTenants.neighborhood}</span>
                    <span className="text-slate-400">• Propriétaire : <strong className="text-white">{selectedPropertyForTenants.ownerName}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/app/tenants?propertyId=${selectedPropertyForTenants.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  title="Ajouter un locataire dans ce bien"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un locataire</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedPropertyForTenants)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Modifier les informations de ce bien"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-300" />
                  <span>Modifier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPropertyForTenants(null)}
                  className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-slate-500 font-semibold block text-[11px] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" /> Total Logements
                </span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{totalModalUnits}</span>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 shadow-xs">
                <span className="text-emerald-700 font-bold block text-[11px] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Occupés (avec locataires)
                </span>
                <span className="text-lg font-black text-emerald-800 mt-0.5 block">{occupiedCount}</span>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 shadow-xs">
                <span className="text-amber-800 font-bold block text-[11px] flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Non Occupés (Disponibles)
                </span>
                <span className="text-lg font-black text-amber-900 mt-0.5 block">{vacantCount}</span>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 shadow-xs">
                <span className="text-blue-700 font-bold block text-[11px] flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Total Loyers Mensuels
                </span>
                <span className="text-base font-black text-blue-900 mt-0.5 block truncate">
                  {totalOccupiedRent.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search Header */}
            <div className="p-4 sm:px-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-fit">
                <button
                  type="button"
                  onClick={() => setTenantModalTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    tenantModalTab === 'ALL'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous ({allOccupiedUnits.length + allVacantUnits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTenantModalTab('OCCUPIED')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    tenantModalTab === 'OCCUPIED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Occupés ({allOccupiedUnits.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTenantModalTab('VACANT')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                    tenantModalTab === 'VACANT'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Non occupés ({allVacantUnits.length})</span>
                </button>
              </div>

              {/* Search input in modal */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher locataire, n° d'appartement..."
                  value={tenantModalSearch}
                  onChange={(e) => setTenantModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/60">
              {/* SECTION 1: LOGEMENTS OCCUPÉS AVEC LOCATAIRES */}
              {(tenantModalTab === 'ALL' || tenantModalTab === 'OCCUPIED') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span>Appartements Occupés & Locataires Résidents</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">
                        {filteredOccupiedUnits.length}
                      </span>
                    </h3>
                  </div>

                  {filteredOccupiedUnits.length === 0 ? (
                    <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      {tenantModalSearch
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
                            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                          >
                            {/* Unit Banner */}
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

                            {/* Tenant Profile Box */}
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

                            {/* Detailed Information Grid */}
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

                            {/* Action Buttons: WhatsApp & Lease */}
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

              {/* SECTION 2: LOGEMENTS NON OCCUPÉS (VACANTS / DISPONIBLES) */}
              {(tenantModalTab === 'ALL' || tenantModalTab === 'VACANT') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span>Appartements Non Occupés (Vacants / Disponibles à la location)</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold">
                        {filteredVacantUnits.length}
                      </span>
                    </h3>
                  </div>

                  {filteredVacantUnits.length === 0 ? (
                    <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      {tenantModalSearch
                        ? 'Aucun appartement disponible ne correspond à votre recherche.'
                        : 'Tous les appartements de ce bien sont actuellement occupés !'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredVacantUnits.map((u) => (
                        <div
                          key={u.id}
                          className="bg-white rounded-2xl border border-amber-200/70 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
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
                              <span className="text-[10px] text-slate-400 font-medium block">Loyer Mensuel Estimé</span>
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

            {/* Modal Bottom Footer */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
              <Link
                href={`/app/properties/${selectedPropertyForTenants.id}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Accéder à la fiche complète du bien</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedPropertyForTenants(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
