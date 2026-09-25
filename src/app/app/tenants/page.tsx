'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  Users,
  Plus,
  Search,
  Phone,
  MessageSquare,
  Mail,
  Home,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  X,
  Trash2,
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  Pencil,
  Sparkles,
  Check,
  DoorOpen
} from 'lucide-react';
import { Tenant, Property } from '@/types/sunugestion';

export default function TenantsPage() {
  const { tenants, units, properties, addTenant, updateTenant, deleteTenant } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Tenant Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('new');
  const [customUnitName, setCustomUnitName] = useState('Appartement 1A');
  const [customRent, setCustomRent] = useState<number>(400000);
  const [identityNum, setIdentityNum] = useState('');

  // Edit Tenant Form state
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editIdentityNum, setEditIdentityNum] = useState('');
  const [editPropertyId, setEditPropertyId] = useState('');
  const [editUnitNumber, setEditUnitNumber] = useState('');
  const [editRentFCFA, setEditRentFCFA] = useState(400000);
  const [editStatus, setEditStatus] = useState<'ACTIF' | 'EN_RETARD' | 'ANCIEN'>('ACTIF');
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Units belonging to the selected property in the Add Modal
  const currentPropertyUnits = selectedProperty
    ? units.filter(
        (u) =>
          u.propertyId === selectedProperty.id ||
          (u.propertyName &&
            selectedProperty.name &&
            u.propertyName.trim().toLowerCase() === selectedProperty.name.trim().toLowerCase())
      )
    : [];

  const handleOpenAddModal = () => {
    const defaultProp = properties[0];
    if (defaultProp) {
      setSelectedPropertyId(defaultProp.id);
      applyPropertyDefaults(defaultProp);
    }
    setShowModal(true);
  };

  const applyPropertyDefaults = (prop: Property) => {
    const propUnits = units.filter(
      (u) =>
        u.propertyId === prop.id ||
        (u.propertyName && prop.name && u.propertyName.trim().toLowerCase() === prop.name.trim().toLowerCase())
    );

    const vacantUnit = propUnits.find((u) => u.status === 'DISPONIBLE');
    if (vacantUnit) {
      setSelectedUnitId(vacantUnit.id);
      setCustomUnitName(vacantUnit.unitNumber);
      setCustomRent(vacantUnit.rentFCFA);
    } else {
      setSelectedUnitId('new');
      if (prop.type === 'VILLA' || prop.type === 'MAISON') {
        setCustomUnitName('Villa entière');
        setCustomRent(750000);
      } else if (prop.type === 'STUDIO') {
        setCustomUnitName(`Studio ${propUnits.length + 1}`);
        setCustomRent(200000);
      } else if (prop.type === 'BOUTIQUE' || prop.type === 'LOCAL_COMMERCIAL') {
        setCustomUnitName(`Boutique N°${propUnits.length + 1}`);
        setCustomRent(350000);
      } else if (prop.type === 'BUREAU') {
        setCustomUnitName(`Bureau ${101 + propUnits.length}`);
        setCustomRent(500000);
      } else {
        setCustomUnitName(`Appartement ${propUnits.length + 1}`);
        setCustomRent(400000);
      }
    }
  };

  const handleSelectProperty = (propId: string) => {
    setSelectedPropertyId(propId);
    const prop = properties.find((p) => p.id === propId);
    if (prop) {
      applyPropertyDefaults(prop);
    }
  };

  const handleOpenEditModal = (t: Tenant) => {
    setTenantToEdit(t);
    setEditFirstName(t.firstName);
    setEditLastName(t.lastName);
    setEditPhone(t.phone);
    setEditEmail(t.email || '');
    setEditProfession(t.profession || '');
    setEditIdentityNum(t.identityDocNumber || '');
    const matchedProp = properties.find(
      (p) =>
        p.id === t.propertyId ||
        (p.name && t.propertyName && p.name.trim().toLowerCase() === t.propertyName.trim().toLowerCase())
    );
    setEditPropertyId(matchedProp?.id || properties[0]?.id || '');
    setEditUnitNumber(t.unitNumber || 'Logement');
    setEditRentFCFA(t.rentFCFA || 350000);
    setEditStatus(t.status || 'ACTIF');
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantToEdit) return;

    setIsUpdating(true);
    try {
      const targetProperty = properties.find((p) => p.id === editPropertyId);
      const updates: Partial<Tenant> = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim(),
        whatsapp: editPhone.trim(),
        email: editEmail.trim(),
        profession: editProfession.trim(),
        identityDocNumber: editIdentityNum.trim(),
        propertyId: targetProperty?.id || tenantToEdit.propertyId,
        propertyName: targetProperty?.name || tenantToEdit.propertyName,
        unitNumber: editUnitNumber.trim(),
        rentFCFA: Number(editRentFCFA),
        status: editStatus,
        address: `${targetProperty?.name || tenantToEdit.propertyName}, ${targetProperty?.neighborhood || 'Dakar'}`,
      };

      await updateTenant(tenantToEdit.id, updates);
      setTenantToEdit(null);
      setNotificationMsg(`Le locataire "${editFirstName} ${editLastName}" a été modifié avec succès.`);
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch (err) {
      console.error('Error updating tenant:', err);
      setNotificationMsg("Erreur lors de la modification du locataire.");
      setTimeout(() => setNotificationMsg(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      t.unitNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];
      const targetUnit = units.find((u) => u.id === selectedUnitId);

      const finalPropertyId = targetProperty?.id || 'd95c65a7-d3c6-47d2-83b1-2355f15acc7e';
      const finalPropertyName = targetProperty?.name || 'Patrimoine Agence Dakar';
      const finalUnitNumber = customUnitName.trim() || (targetProperty?.type === 'VILLA' ? 'Villa' : 'Appartement 1');
      const finalRent = Number(customRent) || targetUnit?.rentFCFA || 350000;
      const finalUnitId = targetUnit ? targetUnit.id : `unit-${Date.now()}`;

      await addTenant({
        agencyId: '11111111-1111-1111-1111-111111111111',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        email: email.trim(),
        address: `${finalPropertyName}, ${targetProperty?.neighborhood || 'Dakar'}`,
        profession: profession.trim(),
        identityDocType: 'CNI',
        identityDocNumber: identityNum.trim() || '1 990 2026 00192',
        emergencyContact: 'Contact Famille',
        emergencyPhone: '+221 77 000 00 00',
        unitId: finalUnitId,
        unitNumber: finalUnitNumber,
        propertyName: finalPropertyName,
        propertyId: finalPropertyId,
        rentFCFA: finalRent,
        entryDate: new Date().toISOString().split('T')[0],
        currentLeaseId: `lse-${Date.now()}`,
        status: 'ACTIF',
      });

      setShowModal(false);
      setFirstName('');
      setLastName('');
      setPhone('+221 77 ');
      setEmail('');
      setProfession('');
      setIdentityNum('');
      setNotificationMsg(
        `Le locataire "${firstName} ${lastName}" a été affecté à "${finalPropertyName} (${finalUnitNumber})" avec succès.`
      );
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch (err) {
      console.error('Erreur enregistrement locataire:', err);
      setNotificationMsg("Une erreur est survenue lors de l'enregistrement du locataire.");
      setTimeout(() => setNotificationMsg(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 min-h-screen">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Locataires</h1>
          <p className="text-xs text-slate-500 mt-1">
            Répertoire complet des locataires actifs, logements affectés par bien immobilier, contrats et paiements.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Locataire</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher locataire par nom, téléphone, bien immobilier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Locataire</th>
                <th className="p-4">Contact WhatsApp / Tél</th>
                <th className="p-4">Bien & Logement Affecté</th>
                <th className="p-4">Loyer Mensuel</th>
                <th className="p-4">Total Payé</th>
                <th className="p-4">Impayés / Retard</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20 shrink-0">
                        {t.firstName?.[0] || 'L'}
                        {t.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.firstName} {t.lastName}</p>
                        <p className="text-[10px] text-slate-400">{t.profession || 'Particulier'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {t.phone}
                      </p>
                      <p className="text-[10px] text-slate-400">{t.email || '-'}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.propertyName}</p>
                        <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                          <DoorOpen className="w-3 h-3" />
                          <span>{t.unitNumber}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-emerald-700">
                    {t.rentFCFA.toLocaleString('fr-FR')} FCFA
                  </td>

                  <td className="p-4 text-slate-600 font-medium">
                    {t.totalPaidFCFA ? `${t.totalPaidFCFA.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                  </td>

                  <td className="p-4">
                    {t.arrearsFCFA > 0 ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {t.arrearsFCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">À jour (0 FCFA)</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.status === 'ACTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(t)}
                        className="px-2.5 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold text-xs rounded-lg border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title={`Modifier ${t.firstName} ${t.lastName}`}
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>

                      <Link
                        href={`/app/tenants/${t.id}`}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Fiche</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setTenantToDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                        title={`Supprimer ${t.firstName} ${t.lastName}`}
                        aria-label={`Supprimer ${t.firstName} ${t.lastName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Nouveau Locataire</h3>
                  <p className="text-[11px] text-slate-500">Ajouter un locataire et l'affecter à un bien</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="ex: Moussa"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="ex: Diop"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: moussa.diop@gmail.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Logement Affecté: Sélecteur de TOUS les Biens Immobiliers */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Logement Affecté : Choix du Bien Immobilier *</span>
                  </label>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
                    {properties.length} bien(s) enregistré(s)
                  </span>
                </div>

                <div>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => handleSelectProperty(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    required
                  >
                    <option value="" disabled>-- Cliquez pour choisir le bien immobilier --</option>
                    <optgroup label="🏢 Tous les Biens Immobiliers enregistrés">
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.type === 'VILLA' || p.type === 'MAISON'
                            ? '🏡 '
                            : p.type === 'IMMEUBLE'
                            ? '🏢 '
                            : p.type === 'STUDIO'
                            ? '🛋️ '
                            : p.type === 'LOCAL_COMMERCIAL' || p.type === 'BOUTIQUE'
                            ? '🏪 '
                            : '🏠 '}
                          {p.name} — {p.neighborhood} ({p.type})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Selected Property Preview Banner */}
                {selectedProperty && (
                  <div className="p-2.5 bg-white rounded-xl border border-blue-200 shadow-sm flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {selectedProperty.image ? (
                          <img
                            src={selectedProperty.image}
                            alt={selectedProperty.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 truncate block">{selectedProperty.name}</strong>
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                            {selectedProperty.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{selectedProperty.neighborhood}, {selectedProperty.city || 'Dakar'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] shrink-0 border-l border-slate-100 pl-2">
                      <span className="text-slate-400 block">Bailleur</span>
                      <strong className="text-slate-700">{selectedProperty.ownerName}</strong>
                    </div>
                  </div>
                )}

                {/* Units within property selector (if property has existing units) */}
                {currentPropertyUnits.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Logements pré-enregistrés dans ce bien :
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedUnitId(val);
                        if (val !== 'new') {
                          const u = currentPropertyUnits.find((x) => x.id === val);
                          if (u) {
                            setCustomUnitName(u.unitNumber);
                            setCustomRent(u.rentFCFA);
                          }
                        }
                      }}
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="new">➕ Saisir un nouveau numéro / appartement dans ce bien</option>
                      {currentPropertyUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unitNumber} ({u.type} - {u.rentFCFA.toLocaleString('fr-FR')} FCFA) — {u.status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specific Unit Number & Rent */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      N° / Nom du Logement *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Appt 2B, Villa complète, 1er Étage..."
                      value={customUnitName}
                      onChange={(e) => setCustomUnitName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Loyer Mensuel (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={customRent}
                      onChange={(e) => setCustomRent(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="ex: Médecin, Enseignant, Cadre..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° CNI / Passeport</label>
                  <input
                    type="text"
                    placeholder="ex: 1 890 1988 00123"
                    value={identityNum}
                    onChange={(e) => setIdentityNum(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Affectation en cours...</span>
                    </>
                  ) : (
                    <span>Enregistrer & Affecter au Bien</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {tenantToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Modifier le Locataire</h3>
                  <p className="text-[11px] text-slate-500">Mettre à jour les informations et le bien immobilier</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTenantToEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
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
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bien Immobilier & Logement Selector */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Bien Immobilier affecté *</span>
                  </label>
                  <select
                    value={editPropertyId}
                    onChange={(e) => setEditPropertyId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    required
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.type === 'VILLA' || p.type === 'MAISON'
                          ? '🏡 '
                          : p.type === 'IMMEUBLE'
                          ? '🏢 '
                          : p.type === 'STUDIO'
                          ? '🛋️ '
                          : '🏠 '}
                        {p.name} — {p.neighborhood} ({p.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">N° / Nom du Logement *</label>
                    <input
                      type="text"
                      value={editUnitNumber}
                      onChange={(e) => setEditUnitNumber(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Loyer Mensuel (FCFA) *</label>
                    <input
                      type="number"
                      value={editRentFCFA}
                      onChange={(e) => setEditRentFCFA(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° CNI</label>
                  <input
                    type="text"
                    value={editIdentityNum}
                    onChange={(e) => setEditIdentityNum(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="EN_RETARD">En Retard</option>
                    <option value="ANCIEN">Ancien / Résilié</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTenantToEdit(null)}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isUpdating ? (
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
      {tenantToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base">Supprimer ce locataire ?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement{' '}
                  <strong className="text-slate-800">
                    {tenantToDelete.firstName} {tenantToDelete.lastName}
                  </strong>{' '}
                  ?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTenantToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conséquences de la suppression :</p>
                <ul className="list-disc list-inside mt-1 text-[11px] text-amber-700 space-y-0.5">
                  <li>
                    Le logement{' '}
                    <strong className="font-semibold">
                      {tenantToDelete.unitNumber} ({tenantToDelete.propertyName})
                    </strong>{' '}
                    sera libéré et repassera au statut <strong>Disponible</strong>.
                  </li>
                  <li>Le dossier et le contrat en cours seront archivés/supprimés.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setTenantToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!tenantToDelete) return;
                  setIsDeleting(true);
                  try {
                    const name = `${tenantToDelete.firstName} ${tenantToDelete.lastName}`;
                    await deleteTenant(tenantToDelete.id);
                    setNotificationMsg(`Le locataire ${name} a été supprimé avec succès.`);
                    setTenantToDelete(null);
                    setTimeout(() => setNotificationMsg(null), 4000);
                  } catch (err) {
                    console.error('Erreur suppression locataire:', err);
                    setNotificationMsg("Erreur lors de la suppression du locataire.");
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{notificationMsg}</span>
          <button
            type="button"
            onClick={() => setNotificationMsg(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
