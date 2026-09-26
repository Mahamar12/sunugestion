'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { verifyCredentials, getAgencyUsers, AgencyUser } from '@/lib/authService';
import {
  Building2,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function ConnexionPage() {
  const router = useRouter();
  const { switchRole, setCurrentUser } = useSunuGestion();

  const [identifier, setIdentifier] = useState('m.sy');
  const [password, setPassword] = useState('Passer123!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountsHelper, setShowAccountsHelper] = useState(false);
  const [agencyUsersList, setAgencyUsersList] = useState<AgencyUser[]>([]);

  useEffect(() => {
    setAgencyUsersList(getAgencyUsers());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = verifyCredentials(identifier, password);

    if (!result.success || !result.user) {
      setIsLoading(false);
      setErrorMessage(
        result.error ||
          "Identifiant ou mot de passe incorrect. Sans identifiant et mot de passe valides attribués par l'agence, l'accès au tableau de bord est refusé."
      );
      return;
    }

    // Connexion réussie
    const user = result.user;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sunu_logged_out');
    }
    switchRole(user.role);
    setCurrentUser(user);

    setTimeout(() => {
      setIsLoading(false);
      if (user.role === 'PROPRIETAIRE') {
        router.push('/owner/dashboard');
      } else if (user.role === 'LOCATAIRE') {
        router.push('/tenant/dashboard');
      } else if (user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/app/dashboard');
      }
    }, 400);
  };

  const handleSelectQuickAccount = (user: AgencyUser) => {
    setIdentifier(user.username);
    setPassword(user.password);
    setErrorMessage(null);
    setShowAccountsHelper(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6 animate-in fade-in">
        {/* Logo & Titre */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-black text-2xl text-white tracking-tight">SunuGestion</span>
          </Link>
          <p className="text-xs text-slate-400">
            Espace Sécurisé — Connexion par Identifiant & Mot de Passe
          </p>
        </div>

        {/* Message d'erreur de connexion stricte */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-rose-300">Accès Refusé</p>
              <p className="text-[11px] leading-relaxed text-rose-200">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Identifiant */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Identifiant de Connexion (ou Email)
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="ex: m.sy ou f.ndiaye"
                className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-300">
                Mot de Passe Attribué
              </label>
              <button
                type="button"
                onClick={() => setShowAccountsHelper(!showAccountsHelper)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Identifiants actifs</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Votre mot de passe"
                className="w-full p-3 pl-10 pr-10 bg-slate-950 border border-slate-800 rounded-xl font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bouton Se Connecter */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Vérification des accès...</span>
            ) : (
              <>
                <span>Se Connecter au Tableau de Bord</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Aide / Liste des comptes disponibles (Très utile pour tester) */}
        {showAccountsHelper && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Collaborateurs enregistrés dans l'agence :
              </span>
              <button
                type="button"
                onClick={() => setShowAccountsHelper(false)}
                className="text-slate-500 hover:text-slate-300 text-[10px]"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {agencyUsersList.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectQuickAccount(u)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-blue-950/50 border border-slate-800 hover:border-blue-700/50 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-blue-300 text-xs">
                      {u.name} ({u.role})
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Identifiant: <strong className="text-white">{u.username}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                    Utiliser
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          Vous n'avez pas encore d'agence ?{' '}
          <Link href="/inscription" className="text-blue-400 font-bold hover:underline">
            Inscrire mon agence
          </Link>
        </div>
      </div>
    </div>
  );
}
