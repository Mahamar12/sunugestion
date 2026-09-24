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
  Loader2
} from 'lucide-react';

export default function TenantsPage() {
  const { tenants, units, addTenant, deleteTenant } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<typeof tenants[0] | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Tenant Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [unitId, setUnitId] = useState('type-appartement');
  const [customUnitName, setCustomUnitName] = useState('Appartement');
  const [customRent, setCustomRent] = useState<number>(400000);
  const [identityNum, setIdentityNum] = useState('');

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
      const unit = units.find((u) => u.id === unitId);

      let finalUnitNumber = customUnitName;
      let finalPropertyName = 'Patrimoine Agence Dakar';
      let finalPropertyId = 'd95c65a7-d3c6-47d2-83b1-2355f15acc7e';
      let finalRent = customRent || 300000;

      if (unit) {
        finalUnitNumber = unit.unitNumber;
        finalPropertyName = unit.propertyName;
        finalPropertyId = unit.propertyId;
        finalRent = unit.rentFCFA;
      } else if (unitId === 'type-maison') {
        finalUnitNumber = customUnitName || 'Maison';
        finalPropertyName = 'Villa Panoramique Mermoz';
        finalPropertyId = 'e12a4567-e89b-12d3-a456-426614174001';
        finalRent = customRent || 700000;
      } else if (unitId === 'type-appartement') {
        finalUnitNumber = customUnitName || 'Appartement';
        finalPropertyName = 'Résidence Teranga Almadies';
        finalPropertyId = 'd95c65a7-d3c6-47d2-83b1-2355f15acc7e';
        finalRent = customRent || 400000;
      } else if (unitId === 'type-studio') {
        finalUnitNumber = customUnitName || 'Studio';
        finalPropertyName = 'Immeuble Liberté 6 Extension';
        finalPropertyId = 'e12a4567-e89b-12d3-a456-426614174002';
        finalRent = customRent || 200000;
      } else if (unitId === 'type-magasin') {
        finalUnitNumber = customUnitName || 'Magasin';
        finalPropertyName = 'Espace Commercial Plateau';
        finalPropertyId = 'e12a4567-e89b-12d3-a456-426614174003';
        finalRent = customRent || 350000;
      } else if (unitId === 'type-bureau') {
        finalUnitNumber = customUnitName || 'Bureau';
        finalPropertyName = 'Espace Commercial Plateau';
        finalPropertyId = 'e12a4567-e89b-12d3-a456-426614174003';
        finalRent = customRent || 500000;
      }

      await addTenant({
        agencyId: '11111111-1111-1111-1111-111111111111',
        firstName,
        lastName,
        phone,
        whatsapp: phone,
        email,
        address: `${finalPropertyName}, Dakar`,
        profession,
        identityDocType: 'CNI',
        identityDocNumber: identityNum || '1 990 2026 00192',
        emergencyContact: 'Contact Famille',
        emergencyPhone: '+221 77 000 00 00',
        unitId: unit ? unit.id : `unit-custom-${Date.now()}`,
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
      setUnitId('type-appartement');
      setCustomUnitName('Appartement');
      setCustomRent(400000);
      setNotificationMsg(`Le locataire ${firstName} ${lastName} a été enregistré avec succès (${finalUnitNumber}).`);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      console.error('Erreur enregistrement locataire:', err);
      setNotificationMsg("Une erreur est survenue lors de l'enregistrement du locataire.");
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
            Répertoire complet des locataires actifs, contrats en cours, historique de paiement et relances.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
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
            placeholder="Rechercher locataire par nom, téléphone, logement..."
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
                <th className="p-4">Logement Occupe</th>
                <th className="p-4">Loyer Mensuel</th>
                <th className="p-4">Total Payé</th>
                <th className="p-4">Impayés / Retard</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20">
                        {t.firstName[0]}
                        {t.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.firstName} {t.lastName}</p>
                        <p className="text-[10px] text-slate-400">{t.profession}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {t.phone}
                      </p>
                      <p className="text-[10px] text-slate-400">{t.email}</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800">{t.unitNumber}</p>
                    <p className="text-[10px] text-slate-500">{t.propertyName}</p>
                  </td>

                  <td className="p-4 font-bold text-emerald-700">
                    {t.rentFCFA.toLocaleString('fr-FR')} FCFA
                  </td>

                  <td className="p-4 text-slate-700 font-semibold">
                    {t.totalPaidFCFA.toLocaleString('fr-FR')} FCFA
                  </td>

                  <td className="p-4">
                    {t.arrearsFCFA > 0 ? (
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                        {t.arrearsFCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">A jour (0 FCFA)</span>
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
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/app/tenants/${t.id}`}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Fiche Détaillée</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setTenantToDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title={`Supprimer ${t.firstName} ${t.lastName}`}
                        aria-label={`Supprimer ${t.firstName} ${t.lastName}`}
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Nouveau Locataire</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Logement Affecté</label>
                  <select
                    value={unitId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUnitId(val);
                      if (val === 'type-maison') {
                        setCustomRent(700000);
                        setCustomUnitName('Maison');
                      } else if (val === 'type-appartement') {
                        setCustomRent(400000);
                        setCustomUnitName('Appartement');
                      } else if (val === 'type-studio') {
                        setCustomRent(200000);
                        setCustomUnitName('Studio');
                      } else if (val === 'type-magasin') {
                        setCustomRent(350000);
                        setCustomUnitName('Magasin');
                      } else if (val === 'type-bureau') {
                        setCustomRent(500000);
                        setCustomUnitName('Bureau');
                      } else {
                        const u = units.find((x) => x.id === val);
                        if (u) {
                          setCustomRent(u.rentFCFA);
                          setCustomUnitName(u.unitNumber);
                        }
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <optgroup label="── Types de Logement ──">
                      <option value="type-maison">🏠 Maison</option>
                      <option value="type-appartement">🏢 Appartement</option>
                      <option value="type-studio">🛋️ Studio</option>
                      <option value="type-magasin">🏪 Magasin</option>
                      <option value="type-bureau">💼 Bureau</option>
                    </optgroup>

                    <optgroup label="── Maisons Disponibles ──">
                      {units.filter((u) => u.type === 'MAISON' || u.type === 'VILLA').map((u) => (
                        <option key={u.id} value={u.id}>
                          Maison : {u.unitNumber} - {u.propertyName} ({u.rentFCFA.toLocaleString('fr-FR')} FCFA)
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label="── Appartements Disponibles ──">
                      {units.filter((u) => u.type === 'APPARTEMENT').map((u) => (
                        <option key={u.id} value={u.id}>
                          Appartement : {u.unitNumber} - {u.propertyName} ({u.rentFCFA.toLocaleString('fr-FR')} FCFA)
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label="── Studios Disponibles ──">
                      {units.filter((u) => u.type === 'STUDIO').map((u) => (
                        <option key={u.id} value={u.id}>
                          Studio : {u.unitNumber} - {u.propertyName} ({u.rentFCFA.toLocaleString('fr-FR')} FCFA)
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label="── Magasins Disponibles ──">
                      {units.filter((u) => u.type === 'MAGASIN' || u.type === 'BOUTIQUE').map((u) => (
                        <option key={u.id} value={u.id}>
                          Magasin : {u.unitNumber} - {u.propertyName} ({u.rentFCFA.toLocaleString('fr-FR')} FCFA)
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label="── Bureaux Disponibles ──">
                      {units.filter((u) => u.type === 'BUREAU').map((u) => (
                        <option key={u.id} value={u.id}>
                          Bureau : {u.unitNumber} - {u.propertyName} ({u.rentFCFA.toLocaleString('fr-FR')} FCFA)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  />
                </div>
              </div>

              {unitId.startsWith('type-') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Précision / N° du bien (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder={
                        unitId === 'type-maison'
                          ? 'ex: Maison F4 Mermoz'
                          : unitId === 'type-appartement'
                          ? 'ex: Appt 2B 2ème Etage'
                          : unitId === 'type-studio'
                          ? 'ex: Studio 1A Meublé'
                          : unitId === 'type-magasin'
                          ? 'ex: Magasin N°12'
                          : 'ex: Bureau 201'
                      }
                      value={customUnitName}
                      onChange={(e) => setCustomUnitName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Loyer Mensuel (FCFA)
                    </label>
                    <input
                      type="number"
                      value={customRent || ''}
                      onChange={(e) => setCustomRent(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                      placeholder="Montant en FCFA"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">N° Pièce d'Identité (CNI/Passeport)</label>
                <input
                  type="text"
                  placeholder="ex: 1 890 1988 00123"
                  value={identityNum}
                  onChange={(e) => setIdentityNum(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer le Locataire</span>
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
                  Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-slate-800">{tenantToDelete.firstName} {tenantToDelete.lastName}</strong> ?
                </p>
              </div>
              <button
                onClick={() => setTenantToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conséquences de la suppression :</p>
                <ul className="list-disc list-inside mt-1 text-[11px] text-amber-700 space-y-0.5">
                  <li>Le logement <strong className="font-semibold">{tenantToDelete.unitNumber} ({tenantToDelete.propertyName})</strong> sera libéré et repassera au statut <strong>Disponible</strong>.</li>
                  <li>Le dossier et le contrat en cours seront archivés/supprimés.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setTenantToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-1.5"
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{notificationMsg}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
