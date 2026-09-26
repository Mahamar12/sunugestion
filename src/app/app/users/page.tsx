'use client';

import React, { useState, useEffect } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { UserRole, AgencyUser } from '@/types/sunugestion';
import {
  getAgencyUsers,
  saveAgencyUsers,
  generateUsername,
  generatePassword,
} from '@/lib/authService';
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
  Users,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function UsersPage() {
  const { currentUser, auditLogs } = useSunuGestion();
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AgencyUser | null>(null);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<AgencyUser | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [agencyUsers, setAgencyUsers] = useState<AgencyUser[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Invite Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+221 77 ');
  const [role, setRole] = useState<UserRole>('GESTIONNAIRE');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Hydratation depuis le LocalStorage / authService
  useEffect(() => {
    const list = getAgencyUsers();
    setAgencyUsers(list);
  }, []);

  // Ouvrir le modal d'ajout avec identifiant et mot de passe générés automatiquement
  const handleOpenAddModal = () => {
    const newPass = generatePassword();
    setName('');
    setEmail('');
    setUsername('');
    setPassword(newPass);
    setPhone('+221 77 ');
    setRole('GESTIONNAIRE');
    setShowFormPassword(false);
    setShowAddModal(true);
  };

  // Mettre à jour l'identifiant automatiquement au fur et à mesure que l'admin saisit le nom
  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim().length > 1) {
      const autoId = generateUsername(val, agencyUsers);
      setUsername(autoId);
    }
  };

  const handleRegeneratePassword = () => {
    setPassword(generatePassword());
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotificationMsg(`${label} copié dans le presse-papiers !`);
      setTimeout(() => setNotificationMsg(null), 3000);
    }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = (username || generateUsername(name, agencyUsers)).trim().toLowerCase();
    const finalPassword = (password || generatePassword()).trim();

    const newUser: AgencyUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: finalUsername,
      password: finalPassword,
      phone: phone.trim(),
      role,
      status: 'ACTIF',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...agencyUsers, newUser];
    setAgencyUsers(updated);
    saveAgencyUsers(updated);

    setShowAddModal(false);
    setCreatedCredentialsModal(newUser);
    setNotificationMsg(`L'utilisateur ${newUser.name} a été créé avec son identifiant et mot de passe de connexion.`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const deletedName = userToDelete.name;
    const deletedRole = userToDelete.role;

    const updated = agencyUsers.filter((u) => u.id !== userToDelete.id);
    setAgencyUsers(updated);
    saveAgencyUsers(updated);

    setUserToDelete(null);
    setNotificationMsg(`L'utilisateur ${deletedName} (${deletedRole}) a été supprimé. Ses accès de connexion sont révoqués.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const copyFullCredentials = (user: AgencyUser) => {
    const fullText = `*Vos Accès de Connexion SunuGestion PRO*\n` +
      `👤 Nom : ${user.name}\n` +
      `🔑 Identifiant : ${user.username}\n` +
      `🔒 Mot de passe : ${user.password}\n` +
      `🏷️ Rôle : ${user.role}\n` +
      `🌐 Lien de connexion : https://sunugestion-sigma.vercel.app/connexion`;

    copyToClipboard(fullText, 'Accès complets');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Utilisateurs de l'Agence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des membres de l'équipe (Administrateur, Gestionnaires, Comptables) avec génération automatique d'identifiants et mots de passe.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un Utilisateur</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b">
                <th className="p-4">Collaborateur</th>
                <th className="p-4">Rôle RBAC</th>
                <th className="p-4">Identifiant de Connexion</th>
                <th className="p-4">Mot de Passe</th>
                <th className="p-4">Email & Contact</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agencyUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Aucun utilisateur trouvé</p>
                    <p className="text-xs text-slate-400 mt-0.5">Cliquez sur « Ajouter un Utilisateur » pour attribuer un premier accès.</p>
                  </td>
                </tr>
              ) : (
                agencyUsers.map((u) => {
                  const isPassVisible = Boolean(visiblePasswords[u.id]);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400">Créé le {u.createdAt || '2026-01-15'}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded-lg border border-blue-200 text-[11px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <code className="font-mono font-bold text-slate-800 text-xs">{u.username}</code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.username, "Identifiant")}
                            title="Copier l'identifiant"
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <code className="font-mono text-xs font-semibold text-slate-700">
                            {isPassVisible ? u.password : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            title={isPassVisible ? 'Masquer' : 'Afficher'}
                            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.password, 'Mot de passe')}
                            title="Copier le mot de passe"
                            className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-700 font-medium">{u.email}</p>
                        <p className="text-slate-400 text-[11px]">{u.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.status === 'ACTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {u.status}
                        </span>
                      </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

      {/* Modal Ajouter un Utilisateur avec génération automatique d'identifiant et mot de passe */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ajouter un Collaborateur</h3>
                  <p className="text-xs text-slate-500">Génération automatique des identifiants de connexion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet du collaborateur *</label>
                <input
                  type="text"
                  placeholder="ex: Aminata Touré"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse Email Professionnelle *</label>
                <input
                  type="email"
                  placeholder="ex: a.toure@sunugestion.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rôle RBAC *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="ADMIN_AGENCE">Admin Agence</option>
                    <option value="GESTIONNAIRE">Gestionnaire</option>
                    <option value="COMPTABLE">Comptable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Encadré d'attribution automatique d'identifiant et mot de passe */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Accès de Connexion Attribués Automatiquement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Identifiant de Connexion *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ex: a.toure"
                      className="w-full p-2 bg-white border border-blue-200 rounded-xl font-mono font-bold text-xs text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Utilisé pour se connecter au portail.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-[11px]">
                        Mot de passe *
                      </label>
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
                        title="Générer un autre mot de passe"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Régénérer</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 pr-8 bg-white border border-blue-200 rounded-xl font-mono font-bold text-xs text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mot de passe temporaire modifiable.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 cursor-pointer transition-colors"
                >
                  Créer & Attribuer les Accès
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Succès & Récapitulatif des Accès Créés */}
      {createdCredentialsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="text-center space-y-2 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">Accès Créés avec Succès !</h3>
              <p className="text-xs text-slate-500">
                L'utilisateur <strong className="text-slate-800">{createdCredentialsModal.name}</strong> peut désormais se connecter avec ses identifiants.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs mb-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Identifiant de connexion :</span>
                <div className="flex items-center gap-1.5">
                  <code className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {createdCredentialsModal.username}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentialsModal.username, 'Identifiant')}
                    className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="Copier"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Mot de passe :</span>
                <div className="flex items-center gap-1.5">
                  <code className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {createdCredentialsModal.password}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentialsModal.password, 'Mot de passe')}
                    className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                    title="Copier"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Rôle attribué :</span>
                <span className="font-bold text-slate-800">{createdCredentialsModal.role}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Page de connexion :</span>
                <span className="font-mono text-[11px] text-blue-600 truncate">/connexion</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => copyFullCredentials(createdCredentialsModal)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copier les accès complets (WhatsApp / Email)</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentialsModal(null)}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
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
                <p className="text-xs text-slate-500">Cette action révoquera immédiatement ses accès au tableau de bord.</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl mb-6 text-xs text-slate-700 space-y-1">
              <p>
                Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-slate-900 font-bold">{userToDelete.name}</strong> ?
              </p>
              <p className="text-slate-500 text-[11px]">
                Identifiant : <span className="font-mono font-bold text-slate-800">{userToDelete.username}</span> • Rôle : <span className="font-medium text-slate-700">{userToDelete.role}</span>
              </p>
              <p className="text-rose-600 text-[11px] font-semibold pt-1">
                ⚠️ Sans cet identifiant, cette personne ne pourra plus jamais se connecter au tableau de bord.
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
