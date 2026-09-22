'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight } from 'lucide-react';

export default function InscriptionPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-black text-2xl text-white">SunuGestion</span>
          </Link>
          <p className="text-xs text-slate-400">Créer un espace de travail pour votre agence immobilière</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nom de l'Agence Immobilière</label>
            <input
              type="text"
              placeholder="ex: Dakar Immobilier Prestige"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Administrateur</label>
            <input type="email" placeholder="contact@votreagence.sn" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white" required />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Mot de passe</label>
            <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white" required />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <span>Créer mon Agence & Démarrer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
