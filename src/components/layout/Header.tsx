'use client';

import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Menu,
  Calendar
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
    leases,
    toggleMobileSidebar
  } = useSunuGestion();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickPaymentModal, setShowQuickPaymentModal] = useState(false);

  // Quick payment form state
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(tenants[0]?.rentFCFA || 0);
  const [payPeriod, setPayPeriod] = useState('Septembre 2026');
  const [payDueDate, setPayDueDate] = useState('2026-09-05');
  const [payDate, setPayDate] = useState('2026-09-25');
  const [payMethod, setPayMethod] = useState<'WAVE' | 'ORANGE_MONEY' | 'VIREMENT_BANCAIRE' | 'ESPECES'>('WAVE');
  const [payRef, setPayRef] = useState('');

  // Keep selected tenant & rent amount in sync with available tenants
  useEffect(() => {
    if (tenants.length > 0) {
      if (!selectedTenantId || !tenants.some((t) => t.id === selectedTenantId)) {
        setSelectedTenantId(tenants[0].id);
        setPayAmount(tenants[0].rentFCFA);
      }
    }
  }, [tenants, selectedTenantId]);

  const handleOpenQuickPayment = () => {
    const curTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
    if (curTenant) {
      setSelectedTenantId(curTenant.id);
      setPayAmount(curTenant.rentFCFA);
    }
    setShowQuickPaymentModal(true);
  };

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
    const tenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
    const lease = leases.find((l) => l.tenantId === tenant?.id) || leases[0];
    
    if (!tenant) return;

    recordPayment({
      tenantId: tenant.id,
      leaseId: lease?.id || 'lse-1',
      amountFCFA: Number(payAmount) || tenant.rentFCFA,
      method: payMethod,
      referenceNumber: payRef || `REC-${Date.now().toString().slice(-6)}`,
      periodMonthYear: payPeriod,
      dueDate: payDueDate,
      paymentDate: payDate,
    });

    setShowQuickPaymentModal(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 shadow-sm gap-2">
      {/* Left: Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden cursor-pointer shrink-0 transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher locataire, bien, contrat..."
            className="w-full pl-9 pr-3 sm:pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Fullstack Supabase Connection Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supabase Cloud Actif</span>
        </div>

        {/* Quick Action Payment Button */}
        <button
          type="button"
          onClick={handleOpenQuickPayment}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Enregistrer un Paiement</span>
          <span className="md:hidden">Paiement</span>
        </button>

        {/* Role Switcher Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleModal(!showRoleModal)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold hidden sm:inline">{currentRole}</span>
            <span className="font-semibold sm:hidden text-[10px]">{currentRole === 'ADMIN_AGENCE' ? 'Admin' : currentRole === 'PROPRIETAIRE' ? 'Bailleur' : currentRole === 'LOCATAIRE' ? 'Locataire' : 'Rôle'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {showRoleModal && (
            <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-[9999] animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">Simulateur Rôles RBAC</p>
                <p className="text-[11px] text-slate-500">Basculez instantanément de vue</p>
              </div>
              <div className="space-y-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleModal(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
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
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-[9999]">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Enregistrer un Reçu de Loyer</h3>
                  <p className="text-xs text-slate-500">Quittance officielle avec échéance & mois de loyer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPaymentSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Locataire */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Locataire & Logement</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => {
                    const tid = e.target.value;
                    setSelectedTenantId(tid);
                    const selected = tenants.find((t) => t.id === tid);
                    if (selected) {
                      setPayAmount(selected.rentFCFA);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} — {t.unitNumber} ({t.propertyName}) • {t.rentFCFA.toLocaleString('fr-FR')} FCFA
                    </option>
                  ))}
                </select>
              </div>

              {/* Mois / Période de loyer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mois / Période de Loyer Concernée</label>
                <div className="relative">
                  <input
                    type="text"
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    placeholder="ex: Septembre 2026"
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {['Août 2026', 'Septembre 2026', 'Octobre 2026', 'Novembre 2026'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayPeriod(m)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        payPeriod === m
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2 dates: Échéance & Paiement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d'Échéance</label>
                  <input
                    type="date"
                    value={payDueDate}
                    onChange={(e) => setPayDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Date limite fixée au bail</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date de Paiement</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Date effective d'encaissement</span>
                </div>
              </div>

              {/* Montant Payé */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Montant Payé (FCFA)</label>
                  {selectedTenantId && (
                    <button
                      type="button"
                      onClick={() => {
                        const sel = tenants.find((t) => t.id === selectedTenantId);
                        if (sel) setPayAmount(sel.rentFCFA);
                      }}
                      className="text-[10px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Loyer exact: {tenants.find((t) => t.id === selectedTenantId)?.rentFCFA.toLocaleString('fr-FR')} FCFA
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={payAmount === 0 ? '' : payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="ex: 233 100"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Mode de Paiement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mode d'Encaissement</label>
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
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        payMethod === m.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Référence */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Référence / Numéro Transaction</label>
                <input
                  type="text"
                  placeholder="ex: WAVE-9823190 / Virement CBAO / Reçu N° 45"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickPaymentModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Générer Quittance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
