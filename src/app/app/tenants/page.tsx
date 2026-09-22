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
  X
} from 'lucide-react';

export default function TenantsPage() {
  const { tenants, units, addTenant } = useSunuGestion();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Tenant Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [unitId, setUnitId] = useState(units[0]?.id || '');
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

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find((u) => u.id === unitId);

    addTenant({
      agencyId: 'org-1',
      firstName,
      lastName,
      phone,
      whatsapp: phone,
      email,
      address: unit ? `${unit.propertyName}, Dakar` : 'Dakar',
      profession,
      identityDocType: 'CNI',
      identityDocNumber: identityNum || '1 990 2026 00192',
      emergencyContact: 'Contact Famille',
      emergencyPhone: '+221 77 000 00 00',
      unitId: unitId || 'unit-101',
      unitNumber: unit ? unit.unitNumber : 'N/A',
      propertyName: unit ? unit.propertyName : 'Propriété',
      propertyId: unit ? unit.propertyId : 'prop-1',
      rentFCFA: unit ? unit.rentFCFA : 300000,
      entryDate: new Date().toISOString().split('T')[0],
      currentLeaseId: `lse-${Date.now()}`,
      status: 'ACTIF',
    });

    setShowModal(false);
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
                    <Link
                      href={`/app/tenants/${t.id}`}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <span>Fiche Détaillée</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-600/20"
                >
                  Enregistrer le Locataire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
