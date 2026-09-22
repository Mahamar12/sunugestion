'use client';

import React from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  Building2,
  Home,
  Users,
  CreditCard,
  AlertTriangle,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wrench,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  DollarSign,
  PieChart
} from 'lucide-react';

export default function AgencyDashboardPage() {
  const {
    properties,
    units,
    tenants,
    rentSchedules,
    payments,
    arrears,
    expenses,
    maintenanceTickets,
    setSelectedDocumentForPrint
  } = useSunuGestion();

  // Financial calculations
  const totalProperties = properties.length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPE' || u.status === 'EN_RETARD').length;
  const availableUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 100;

  const totalTenants = tenants.length;

  const expectedRentsFCFA = rentSchedules.reduce((acc, s) => acc + s.totalDueFCFA, 0);
  const collectedRentsFCFA = payments.reduce((acc, p) => acc + p.amountFCFA, 0);
  const totalArrearsFCFA = arrears.reduce((acc, a) => acc + a.overdueAmountFCFA, 0);
  const totalExpensesFCFA = expenses.reduce((acc, e) => acc + e.amountFCFA, 0);
  const netRevenueFCFA = collectedRentsFCFA - totalExpensesFCFA;

  const urgentTickets = maintenanceTickets.filter((t) => t.priority === 'URGENCE' || t.priority === 'ELEVES');

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tableau de Bord Agence</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              SunuGestion PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aperçu temps réel du parc immobilier, des encaissements et du taux d'occupation à Dakar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/payments"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Nouveau Paiement</span>
          </Link>
          <Link
            href="/app/properties"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Bien</span>
          </Link>
        </div>
      </div>

      {/* Top 10 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Properties */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Biens Immobiliers</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalProperties}</div>
          <p className="text-[10px] text-slate-400">Immeubles, Villas & Locaux</p>
        </div>

        {/* Card 2: Total Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Logements Totaux</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalUnits}</div>
          <div className="flex items-center text-[11px] gap-2 text-slate-500">
            <span className="text-emerald-600 font-bold">{occupiedUnits} occupés</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{availableUnits} vacants</span>
          </div>
        </div>

        {/* Card 3: Occupancy Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Taux d'Occupation</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{occupancyRate}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${occupancyRate}%` }} />
          </div>
        </div>

        {/* Card 4: Total Tenants */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Locataires Actifs</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalTenants}</div>
          <p className="text-[10px] text-slate-400">Contrats de bail en cours</p>
        </div>

        {/* Card 5: Loyers Encaissés */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Loyers Encaissés</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700">
            {collectedRentsFCFA.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Encaissements Wave & Virement
          </p>
        </div>

        {/* Card 6: Loyers Impayés */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Loyers Impayés</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600">
            {totalArrearsFCFA.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
          </div>
          <p className="text-[10px] text-rose-500 font-semibold">{arrears.length} locataires en retard</p>
        </div>

        {/* Card 7: Dépenses du mois */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dépenses Immeubles</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700">
            {totalExpensesFCFA.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400">Gardiennage, travaux, SENELEC</p>
        </div>

        {/* Card 8: Revenu Net Agence */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revenu Net</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-900">
            {netRevenueFCFA.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
          </div>
          <p className="text-[10px] text-blue-600 font-semibold">Bénéfice après dépenses</p>
        </div>

        {/* Card 9: Interventions Maintenance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tickets Maintenance</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{maintenanceTickets.length}</div>
          <p className="text-[10px] text-amber-600 font-bold">{urgentTickets.length} urgences signalées</p>
        </div>

        {/* Card 10: Loyers Attendus */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Loyers Attendus</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-indigo-900">
            {expectedRentsFCFA.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400">Total prévisionnel mensuel</p>
        </div>
      </div>

      {/* SVG Financial Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenus Mensuels vs Dépenses */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Évolution des Encaissements (FCFA)</h3>
              <p className="text-[11px] text-slate-500">Loyers encaissés vs Dépenses d'exploitation</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Encaissé
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Dépenses
              </span>
            </div>
          </div>

          {/* SVG Bar Visualizer */}
          <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-slate-100">
            {[
              { month: 'Avr', collected: 2100000, expense: 200000 },
              { month: 'Mai', collected: 2350000, expense: 310000 },
              { month: 'Juin', collected: 2400000, expense: 180000 },
              { month: 'Juil', collected: 2500000, expense: 420000 },
              { month: 'Août', collected: 2530000, expense: 300000 },
              { month: 'Sept', collected: 2700000, expense: 250000 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  <div
                    className="w-1/2 bg-emerald-500 rounded-t-md group-hover:bg-emerald-600 transition-all relative"
                    style={{ height: `${(d.collected / 3000000) * 100}%` }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                      {(d.collected / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div
                    className="w-1/2 bg-rose-400 rounded-t-md group-hover:bg-rose-500 transition-all relative"
                    style={{ height: `${(d.expense / 3000000) * 100}%` }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                      {(d.expense / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Encassés vs Impayés Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Répartition des Loyers
            </h3>
            <p className="text-[11px] text-slate-500 mt-2">Paiements à jour vs En retard</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="78, 100"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900">78%</span>
                <span className="block text-[9px] font-bold text-emerald-600 uppercase">Recouvré</span>
              </div>
            </div>

            <div className="w-full space-y-2 text-xs">
              <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Payé à temps
                </span>
                <span className="font-bold text-emerald-900">{collectedRentsFCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div className="flex justify-between items-center bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Impayés & Retards
                </span>
                <span className="font-bold text-rose-900">{totalArrearsFCFA.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Activité Récente de l'Agence</h3>
            <Link href="/app/payments" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              Voir tout <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {payments.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{p.tenantName}</p>
                    <p className="text-[11px] text-slate-500">{p.propertyName} ({p.unitNumber}) • {p.method}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">
                    +{p.amountFCFA.toLocaleString('fr-FR')} FCFA
                  </span>
                  <button
                    onClick={() =>
                      setSelectedDocumentForPrint({
                        id: p.receiptNumber,
                        title: `Quittance ${p.receiptNumber} - ${p.tenantName}`,
                        category: 'QUITTANCE',
                        tenantName: p.tenantName,
                        propertyName: p.propertyName,
                        amountFCFA: p.amountFCFA,
                        date: p.date,
                      })
                    }
                    className="text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    Voir Quittance PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Alerts Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertes Prioritaires
            </h3>
            <Link href="/app/arrears" className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1">
              Gérer impayés <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {arrears.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    !
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{a.tenantName}</p>
                    <p className="text-[11px] text-slate-600">{a.propertyName} ({a.unitNumber}) • Retard de {a.daysOverdue} jours</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-rose-700 block">
                    {a.overdueAmountFCFA.toLocaleString('fr-FR')} FCFA
                  </span>
                  <Link
                    href="/app/arrears"
                    className="inline-block px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold shadow-sm mt-1"
                  >
                    Envoyer Relance
                  </Link>
                </div>
              </div>
            ))}

            {urgentTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.title}</p>
                    <p className="text-[11px] text-slate-600">{t.propertyName} • Priorité: <span className="font-bold text-amber-800">{t.priority}</span></p>
                  </div>
                </div>

                <Link
                  href="/app/maintenance"
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-sm"
                >
                  Assigner
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
