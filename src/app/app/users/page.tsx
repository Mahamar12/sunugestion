'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { UserPlus, Shield, Mail, Phone, Plus, X } from 'lucide-react';

export default function UsersPage() {
  const { currentUser, auditLogs } = useSunuGestion();
  const [showModal, setShowModal] = useState(false);

  const agencyUsers = [
    { id: '1', name: 'Mamadou Sy', email: 'm.sy@sunugestion.sn', role: 'ADMIN_AGENCE', phone: '+221 77 654 32 10', status: 'ACTIF' },
    { id: '2', name: 'Fatou Ndiaye', email: 'f.ndiaye@sunugestion.sn', role: 'GESTIONNAIRE', phone: '+221 78 123 45 67', status: 'ACTIF' },
    { id: '3', name: 'Oumar Diop', email: 'o.diop@sunugestion.sn', role: 'COMPTABLE', phone: '+221 70 987 65 43', status: 'ACTIF' },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Utilisateurs de l'Agence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des membres de l'équipe (Administrateur, Gestionnaires, Comptables) et contrôle d'accès RBAC.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
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
    </div>
  );
}
