'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { Settings, Building2, CreditCard, Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { organization, updateOrganization } = useSunuGestion();
  const [name, setName] = useState(organization.name);
  const [email, setEmail] = useState(organization.email);
  const [phone, setPhone] = useState(organization.phone);
  const [address, setAddress] = useState(organization.address);
  const [ninea, setNinea] = useState(organization.ninea || '008923412 2V3');
  const [rccm, setRccm] = useState(organization.rccm || 'SN.DKR.2023.B.1450');

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name,
      email,
      phone,
      address,
      ninea,
      rccm,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres de l'Agence</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configuration du profil d'agence, identifiants fiscaux Sénégal, logos et modèles de documents.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-6 text-xs">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Modifications enregistrées avec succès !</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Profil de l'Agence</h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nom Commercial d'Agence</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Téléphone Agence</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adresse Siège Social</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>

          <h3 className="font-bold text-slate-900 text-sm border-b pt-4 pb-2">Identifiants Légaux Sénégal</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Numéro NINEA</label>
              <input
                type="text"
                value={ninea}
                onChange={(e) => setNinea(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Numéro RCCM</label>
              <input
                type="text"
                value={rccm}
                onChange={(e) => setRccm(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              Sauvegarder les Paramètres
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
