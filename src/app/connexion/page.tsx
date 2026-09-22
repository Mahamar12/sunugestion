'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ConnexionPage() {
  const router = useRouter();
  const { switchRole } = useSunuGestion();
  const [email, setEmail] = useState('m.sy@sunugestion.sn');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<'ADMIN_AGENCE' | 'PROPRIETAIRE' | 'LOCATAIRE' | 'SUPER_ADMIN'>('ADMIN_AGENCE');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole);

    if (selectedRole === 'PROPRIETAIRE') {
      router.push('/owner/dashboard');
    } else if (selectedRole === 'LOCATAIRE') {
      router.push('/tenant/dashboard');
    } else if (selectedRole === 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/app/dashboard');
    }
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
          <p className="text-xs text-slate-400">Connectez-vous à votre espace de gestion immobilière</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Type de Compte (Rôle RBAC)</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white"
            >
              <option value="ADMIN_AGENCE">Administrateur Agence (Mamadou Sy)</option>
              <option value="PROPRIETAIRE">Propriétaire Bailleur (M. Ousmane Ndiaye)</option>
              <option value="LOCATAIRE">Locataire (Mamadou Diallo)</option>
              <option value="SUPER_ADMIN">Super Admin SaaS (Plateforme)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Se Connecter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          Vous n'avez pas d'agence ?{' '}
          <Link href="/inscription" className="text-blue-400 font-bold hover:underline">
            Inscrire mon agence
          </Link>
        </div>
      </div>
    </div>
  );
}
