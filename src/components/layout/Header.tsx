'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { UserRole } from '@/types/sunugestion';
import {
  Search,
  Bell,
  Plus,
  Shield,
  UserCheck,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  CreditCard,
  Building2,
  Wrench,
  UserPlus
} from 'lucide-react';

export default function Header() {
  const {
    currentRole,
    switchRole,
    notifications,
    searchQuery,
    setSearchQuery,
    recordPayment,
    tenants,
    leases
  } = useSunuGestion();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickPaymentModal, setShowQuickPaymentModal] = useState(false);

  // Quick payment form state
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [payAmount, setPayAmount] = useState(430000);
  const [payMethod, setPayMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'VIREMENT_BANCAIRE' | 'ESPECES'>('WAVE');
  const [payRef, setPayRef] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const rolesList: { role: UserRole; title: string; desc: string; color: string }[] = [
    { role: 'SUPER_ADMIN', title: 'Super Admin', desc: 'Gestion multi-agences SaaS et abonnements', color: 'bg-purple-600' },
    { role: 'ADMIN_AGENCE', title: 'Admin Agence', desc: 'Accès complet aux données de l\'agence', color: 'bg-blue-600' },
    { role: 'GESTIONNAIRE', title: 'Gestionnaire', desc: 'Gestion des biens, locataires & tickets', color: 'bg-indigo-600' },
    { role: 'COMPTABLE', title: 'Comptable', desc: 'Suivi des loyers, paiements & dépenses', color: 'bg-emerald-600' },
    { role: 'PROPRIETAIRE', title: 'Portail Propriétaire', desc: 'Aperçu des revenus & états propriétaires', color: 'bg-amber-600' },
    { role: 'LOCATAIRE', title: 'Portail Locataire', desc: 'Paiement du loyer & demandes de travaux', color: 'bg-teal-600' },
  ];

  const handleQuickPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === selectedTenantId);
    const lease = leases.find((l) => l.tenantId === selectedTenantId) || leases[0];
    
    if (!tenant) return;

    recordPayment({
      tenantId: tenant.id,
      leaseId: lease?.id || 'lse-1',
      amountFCFA: Number(payAmount),
      method: payMethod,
      referenceNumber: payRef || `PAY-${Date.now()}`,
    });

    setShowQuickPaymentModal(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 shadow-sm">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un locataire, bien, logement, contrat..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Quick Action Payment Button */}
        <button
          onClick={() => setShowQuickPaymentModal(true)}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-600/20 transition-all"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Enregistrer un Paiement</span>
        </button>

        {/* Role Switcher Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleModal(!showRoleModal)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {showRoleModal && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">Simulateur Rôles RBAC</p>
                <p className="text-[11px] text-slate-500">Basculez instantanément de vue</p>
              </div>
              <div className="space-y-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleModal(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentRole === r.role ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span>{r.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal pl-4">{r.desc}</p>
                    </div>
                    {currentRole === r.role && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Centre de notifications</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {notifications.length} nouvelles
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2 text-xs">
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Payment Modal */}
      {showQuickPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Nouveau Paiement de Loyer</h3>
                <p className="text-xs text-slate-500">Saisie directe & génération de quittance</p>
              </div>
              <button onClick={() => setShowQuickPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPaymentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Locataire</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.unitNumber} - {t.rentFCFA.toLocaleString('fr-FR')} FCFA)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montant Payé (FCFA)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mode de Paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'WAVE', label: 'Wave Money' },
                    { id: 'ORANGE_MONEY', label: 'Orange Money' },
                    { id: 'VIREMENT_BANCAIRE', label: 'Virement Bancaire' },
                    { id: 'ESPECES', label: 'Espèces' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                        payMethod === m.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Référence / Reçu</label>
                <input
                  type="text"
                  placeholder="ex: WAVE-9823190 / Vir CBAO"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickPaymentModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Valider & Générer Quittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
