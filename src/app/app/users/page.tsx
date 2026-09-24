'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { UserRole } from '@/types/sunugestion';
import { UserPlus, Shield, Mail, Phone, Plus, X, CheckCircle2 } from 'lucide-react';

interface AgencyUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: 'ACTIF' | 'SUSPENDU';
}

export default function UsersPage() {
  const { currentUser, auditLogs } = useSunuGestion();
  const [showModal, setShowModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [agencyUsers, setAgencyUsers] = useState<AgencyUserItem[]>([
    { id: '1', name: 'Mamadou Sy', email: 'm.sy@sunugestion.sn', role: 'ADMIN_AGENCE', phone: '+221 77 654 32 10', status: 'ACTIF' },
    { id: '2', name: 'Fatou Ndiaye', email: 'f.ndiaye@sunugestion.sn', role: 'GESTIONNAIRE', phone: '+221 78 123 45 67', status: 'ACTIF' },
    { id: '3', name: 'Oumar Diop', email: 'o.diop@sunugestion.sn', role: 'COMPTABLE', phone: '+221 70 987 65 43', status: 'ACTIF' },
  ]);

  // Invite Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [role, setRole] = useState<UserRole>('GESTIONNAIRE');

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: AgencyUserItem = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role,
      status: 'ACTIF',
    };

    setAgencyUsers((prev) => [...prev, newUser]);
    setShowModal(false);
    setNotificationMsg(`L'invitation a été envoyée avec succès à ${name} (${role}).`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setName('');
    setEmail('');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Utilisateurs de l'Agence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des membres de l'équipe (Administrateur, Gestionnaires, Comptables) et contrôle d'accès RBAC.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inviter un Utilisateur</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Rôle RBAC</th>
              <th className="p-4">Email</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agencyUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-900">{u.name}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded border border-blue-200">
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4 text-slate-600">{u.phone}</td>
                <td className="p-4 font-bold text-emerald-600">{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Trail Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3">Journal d'Audit Trail & Traçabilité</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">{log.userName} ({log.userRole})</span>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-400">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Inviter un Collaborateur</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  placeholder="ex: Aminata Touré"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse Email Professionnelle</label>
                <input
                  type="email"
                  placeholder="ex: a.toure@sunugestion.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle RBAC</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    <option value="ADMIN_AGENCE">Admin Agence</option>
                    <option value="GESTIONNAIRE">Gestionnaire</option>
                    <option value="COMPTABLE">Comptable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Envoyer l'Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
