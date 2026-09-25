'use client';

import React, { useState, useEffect } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { UserRole } from '@/types/sunugestion';
import {
  UserPlus,
  Shield,
  Mail,
  Phone,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Users
} from 'lucide-react';

interface AgencyUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: 'ACTIF' | 'SUSPENDU';
}

const DEFAULT_AGENCY_USERS: AgencyUserItem[] = [
  { id: '1', name: 'Mamadou Sy', email: 'm.sy@sunugestion.sn', role: 'ADMIN_AGENCE', phone: '+221 77 654 32 10', status: 'ACTIF' },
  { id: '2', name: 'Fatou Ndiaye', email: 'f.ndiaye@sunugestion.sn', role: 'GESTIONNAIRE', phone: '+221 78 123 45 67', status: 'ACTIF' },
  { id: '3', name: 'Oumar Diop', email: 'o.diop@sunugestion.sn', role: 'COMPTABLE', phone: '+221 70 987 65 43', status: 'ACTIF' },
];

export default function UsersPage() {
  const { currentUser, auditLogs } = useSunuGestion();
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AgencyUserItem | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [agencyUsers, setAgencyUsers] = useState<AgencyUserItem[]>(DEFAULT_AGENCY_USERS);

  // Hydratation depuis le LocalStorage pour persister les ajouts et suppressions
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sunu_agency_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAgencyUsers(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Erreur lecture localStorage agency_users:', e);
    }
  }, []);

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

    setAgencyUsers((prev) => {
      const updated = [...prev, newUser];
      try {
        localStorage.setItem('sunu_agency_users', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setShowModal(false);
    setNotificationMsg(`L'invitation a été envoyée avec succès à ${name} (${role}).`);
    setTimeout(() => setNotificationMsg(null), 4000);
    setName('');
    setEmail('');
    setPhone('+221 77 ');
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const deletedName = userToDelete.name;
    const deletedRole = userToDelete.role;

    setAgencyUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userToDelete.id);
      try {
        localStorage.setItem('sunu_agency_users', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setUserToDelete(null);
    setNotificationMsg(`L'utilisateur ${deletedName} (${deletedRole}) a été supprimé avec succès.`);
    setTimeout(() => setNotificationMsg(null), 4000);
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
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agencyUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Aucun utilisateur trouvé</p>
                  <p className="text-xs text-slate-400 mt-0.5">Invitez un nouveau membre pour débuter.</p>
                </td>
              </tr>
            ) : (
              agencyUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{u.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded border border-blue-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4 text-slate-600">{u.phone}</td>
                  <td className="p-4 font-bold text-emerald-600">{u.status}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(u)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-all font-semibold text-xs border border-rose-200 hover:border-rose-600 cursor-pointer shadow-sm"
                      title="Supprimer cet utilisateur"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
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

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Supprimer l'utilisateur</h3>
                <p className="text-xs text-slate-500">Cette action révoquera les accès de ce collaborateur.</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl mb-6 text-xs text-slate-700 space-y-1">
              <p>
                Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-slate-900 font-bold">{userToDelete.name}</strong> ?
              </p>
              <p className="text-slate-500 text-[11px]">
                Email : <span className="font-medium text-slate-700">{userToDelete.email}</span> • Rôle : <span className="font-medium text-slate-700">{userToDelete.role}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
