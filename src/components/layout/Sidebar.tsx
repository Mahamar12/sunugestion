'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  UserCheck,
  FileText,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  Receipt,
  Wrench,
  UserCog,
  FileBox,
  BarChart3,
  Bell,
  UserPlus,
  Crown,
  Settings,
  ShieldCheck,
  Sparkles,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, organization, isMobileSidebarOpen, setIsMobileSidebarOpen } = useSunuGestion();

  // Define navigation links based on RBAC role
  let navItems = [
    { label: 'Tableau de bord', href: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Biens immobiliers', href: '/app/properties', icon: Building2 },
    { label: 'Logements & Unités', href: '/app/units', icon: Home },
    { label: 'Locataires', href: '/app/tenants', icon: Users },
    { label: 'Propriétaires', href: '/app/owners', icon: UserCheck },
    { label: 'Contrats de location', href: '/app/contracts', icon: FileText },
    { label: 'Échéances Loyers', href: '/app/rents', icon: CalendarCheck },
    { label: 'Paiements', href: '/app/payments', icon: CreditCard },
    { label: 'Impayés & Relances', href: '/app/arrears', icon: AlertTriangle, badge: 'Urgent' },
    { label: 'Dépenses', href: '/app/expenses', icon: Receipt },
    { label: 'Prestataires', href: '/app/vendors', icon: UserCog },
    { label: 'Documents & PDF', href: '/app/documents', icon: FileBox },
    { label: 'Rapports & Comptabilité', href: '/app/reports', icon: BarChart3 },
    { label: 'Utilisateurs Agence', href: '/app/users', icon: UserPlus },
    { label: 'Mon Abonnement', href: '/app/subscription', icon: Crown },
    { label: 'Paramètres Agence', href: '/app/settings', icon: Settings },
  ];

  if (currentRole === 'PROPRIETAIRE') {
    navItems = [
      { label: 'Mon Espace Propriétaire', href: '/owner/dashboard', icon: LayoutDashboard },
      { label: 'Mes Biens Immobiliers', href: '/owner/properties', icon: Building2 },
      { label: 'Revenus & Payouts', href: '/owner/payments', icon: CreditCard },
      { label: 'Rapports Financiers', href: '/owner/reports', icon: BarChart3 },
      { label: 'Mes Documents', href: '/owner/documents', icon: FileBox },
    ];
  } else if (currentRole === 'LOCATAIRE') {
    navItems = [
      { label: 'Mon Logement & Loyer', href: '/tenant/dashboard', icon: LayoutDashboard },
      { label: 'Mon Contrat', href: '/tenant/lease', icon: FileText },
      { label: 'Historique Paiements', href: '/tenant/payments', icon: CreditCard },
      { label: 'Mes Quittances PDF', href: '/tenant/receipts', icon: FileBox },
    ];
  } else if (currentRole === 'SUPER_ADMIN') {
    navItems = [
      { label: 'Super Admin Dashboard', href: '/admin/dashboard', icon: ShieldCheck },
      { label: 'Gestion Agences SaaS', href: '/admin/organizations', icon: Building2 },
      { label: 'Utilisateurs Plateforme', href: '/admin/users', icon: Users },
      { label: 'Abonnements & MRR', href: '/admin/subscriptions', icon: Crown },
      { label: 'Paiements SaaS', href: '/admin/payments', icon: CreditCard },
      { label: 'Plans Tarifaires', href: '/admin/plans', icon: Settings },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 w-72 md:w-64 max-w-[85vw] md:max-w-none bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0 h-screen z-50 md:z-30 shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <Link
              href="/app/dashboard"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  SunuGestion
                </div>
                <div className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
                  La gestion immobilière, simplement
                </div>
              </div>
            </Link>

            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Agency Badge */}
          <div className="mt-4 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs text-slate-400 font-medium">Espace de travail</p>
              <p className="text-xs font-semibold text-slate-200 truncate">{organization.name}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {organization.subscriptionPlan}
            </span>
          </div>
        </div>

        {/* Role Notice */}
        <div className="px-4 py-2 bg-blue-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs text-blue-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Vue: {currentRole}
          </span>
          <span className="text-[10px] text-slate-400">Multi-Tenant RBAC</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/30">
                MS
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">Mamadou Sy</p>
                <p className="text-[10px] text-slate-400 truncate">Sunu Gestion Dakar</p>
              </div>
            </div>
            <Link
              href="/"
              onClick={() => setIsMobileSidebarOpen(false)}
              title="Déconnexion"
              className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
