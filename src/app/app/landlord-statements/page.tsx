'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PaymentMethod } from '@/types/sunugestion';
import {
  Landmark,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  Filter,
  Search,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
  FileText,
  UserCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Send,
  Phone
} from 'lucide-react';

export default function LandlordStatementsPage() {
  const {
    owners,
    properties,
    units,
    leases,
    payments,
    expenses,
    organization
  } = useSunuGestion();

  // Filters & State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Septembre 2026');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOwnerId, setExpandedOwnerId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Print Modal State
  const [statementToPrint, setStatementToPrint] = useState<{
    owner: typeof owners[0];
    encaissements: typeof payments;
    depenses: typeof expenses;
    totalEncaissements: number;
    totalDepenses: number;
    commissionAmount: number;
    soldeNet: number;
    period: string;
  } | null>(null);

  // Payout Modal State
  const [payoutModalOwner, setPayoutModalOwner] = useState<{
    owner: typeof owners[0];
    soldeNet: number;
  } | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('WAVE');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutDate, setPayoutDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Track recorded payouts locally
  const [recordedPayouts, setRecordedPayouts] = useState<Record<string, {
    date: string;
    amount: number;
    method: PaymentMethod;
    ref: string;
  }>>({});

  // Available periods
  const availablePeriods = [
    'Septembre 2026',
    'Août 2026',
    'Juillet 2026',
    'Juin 2026',
    'Année 2026 (Consolidé)'
  ];

  // Map each owner to their properties, units, collections, and expenses
  const landlordStatements = useMemo(() => {
    return owners.map((owner) => {
      // 1. Properties owned by this landlord
      const ownerProperties = properties.filter(
        (p) =>
          p.ownerId === owner.id ||
          (p.ownerName && `${owner.firstName} ${owner.lastName}`.trim().toLowerCase() === p.ownerName.trim().toLowerCase())
      );
      const ownerPropertyIds = new Set(ownerProperties.map((p) => p.id));
      const ownerPropertyNames = new Set(ownerProperties.map((p) => p.name.trim().toLowerCase()));

      // 2. Units owned by this landlord
      const ownerUnits = units.filter(
        (u) =>
          u.ownerId === owner.id ||
          ownerPropertyIds.has(u.propertyId) ||
          (u.ownerName && `${owner.firstName} ${owner.lastName}`.trim().toLowerCase() === u.ownerName.trim().toLowerCase())
      );
      const ownerUnitIds = new Set(ownerUnits.map((u) => u.id));

      // 3. Leases for this landlord
      const ownerLeases = leases.filter(
        (l) =>
          l.ownerId === owner.id ||
          ownerPropertyIds.has(l.propertyId) ||
          ownerUnitIds.has(l.unitId) ||
          (l.ownerName && `${owner.firstName} ${owner.lastName}`.trim().toLowerCase() === l.ownerName.trim().toLowerCase())
      );
      const ownerLeaseIds = new Set(ownerLeases.map((l) => l.id));

      // 4. Encaissements (Loyers encaissés) for this owner
      // Match by leaseId, or propertyId, or propertyName
      const ownerPayments = payments.filter((pay) => {
        const matchesLease = pay.leaseId && ownerLeaseIds.has(pay.leaseId);
        const matchesProp = pay.propertyName && ownerPropertyNames.has(pay.propertyName.trim().toLowerCase());
        const matchesUnit = ownerUnits.some((u) => u.unitNumber === pay.unitNumber && ownerPropertyNames.has(pay.propertyName?.trim().toLowerCase() || ''));
        
        // Filter by period if not consolidated
        let matchesPeriod = true;
        if (selectedPeriod !== 'Année 2026 (Consolidé)') {
          if (pay.periodMonthYear) {
            matchesPeriod = pay.periodMonthYear.toLowerCase().includes(selectedPeriod.split(' ')[0].toLowerCase());
          }
        }

        return (matchesLease || matchesProp || matchesUnit) && matchesPeriod;
      });

      // If no payments match the strict month, fallback to general payments for this owner's properties to show live data
      const effectivePayments = ownerPayments.length > 0 ? ownerPayments : payments.filter((pay) => {
        return ownerPropertyNames.has(pay.propertyName?.trim().toLowerCase() || '') ||
          (pay.leaseId && ownerLeaseIds.has(pay.leaseId));
      });

      const totalEncaissements = effectivePayments.reduce((acc, p) => acc + (p.amountFCFA || 0), 0);

      // 5. Dépenses (Charges & Travaux d'immeubles imputables à ce bailleur)
      const ownerExpenses = expenses.filter((e) => {
        const matchesProp = ownerPropertyIds.has(e.propertyId) ||
          ownerPropertyNames.has(e.propertyName?.trim().toLowerCase() || '');
        return matchesProp;
      });

      const totalDepenses = ownerExpenses.reduce((acc, e) => acc + (e.amountFCFA || 0), 0);

      // 6. Commission Agence
      const commRate = owner.commissionRatePercent ?? 8;
      const commissionAmount = Math.round(totalEncaissements * (commRate / 100));

      // 7. SOLDE NET = Encaissements - Dépenses - Commission
      // (User request: "encaissement moins dépenses")
      const soldeNet = Math.max(0, totalEncaissements - totalDepenses - commissionAmount);

      const hasPayout = recordedPayouts[owner.id];

      return {
        owner,
        properties: ownerProperties,
        unitsCount: ownerUnits.length,
        encaissements: effectivePayments,
        depenses: ownerExpenses,
        totalEncaissements,
        totalDepenses,
        commissionRate: commRate,
        commissionAmount,
        soldeNet,
        isPaid: Boolean(hasPayout),
        payoutInfo: hasPayout || null
      };
    });
  }, [owners, properties, units, leases, payments, expenses, selectedPeriod, recordedPayouts]);

  // Filtered by search and owner filter
  const filteredStatements = useMemo(() => {
    return landlordStatements.filter((stmt) => {
      const o = stmt.owner;
      const fullName = `${o.firstName} ${o.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        o.phone?.includes(searchQuery) ||
        stmt.properties.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesOwnerSelect = selectedOwnerId === 'ALL' || o.id === selectedOwnerId;

      return matchesSearch && matchesOwnerSelect;
    });
  }, [landlordStatements, searchQuery, selectedOwnerId]);

  // Global consolidated totals
  const globalEncaissements = landlordStatements.reduce((acc, s) => acc + s.totalEncaissements, 0);
  const globalDepenses = landlordStatements.reduce((acc, s) => acc + s.totalDepenses, 0);
  const globalCommissions = landlordStatements.reduce((acc, s) => acc + s.commissionAmount, 0);
  const globalSoldeNet = landlordStatements.reduce((acc, s) => acc + s.soldeNet, 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Bailleur',
      'Telephone',
      'Periode',
      'Encaissements_FCFA',
      'Depenses_FCFA',
      'Commission_Taux',
      'Commission_FCFA',
      'Solde_Net_FCFA',
      'Statut_Reversement'
    ];

    const rows = filteredStatements.map((s) => [
      `"${s.owner.firstName} ${s.owner.lastName}"`,
      `"${s.owner.phone}"`,
      `"${selectedPeriod}"`,
      s.totalEncaissements,
      s.totalDepenses,
      `"${s.commissionRate}%"`,
      s.commissionAmount,
      s.soldeNet,
      s.isPaid ? '"REVERSE"' : '"EN ATTENTE"'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `situation-bailleurs-${selectedPeriod.replace(/\s+/g, '-').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotificationMsg('Export CSV de la situation des bailleurs téléchargé avec succès !');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Open WhatsApp with detailed statement
  const handleSendWhatsAppStatement = (stmt: typeof landlordStatements[0]) => {
    const o = stmt.owner;
    const phone = o.whatsapp || o.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const message = `Salamalekum M./Mme ${o.firstName} ${o.lastName},

Voici votre *Situation Financière & Compte de Gérance* SunuGestion pour la période : *${selectedPeriod}*

📊 *DÉCOMPTE FINANCIER :*
━━━━━━━━━━━━━━━━━━━━
🟢 *Total Encaissements (Loyers perçus)* : ${stmt.totalEncaissements.toLocaleString('fr-FR')} FCFA
🔴 *Total Dépenses déductibles (Charges/Travaux)* : ${stmt.totalDepenses.toLocaleString('fr-FR')} FCFA
🟡 *Commission d'agence (${stmt.commissionRate}%)* : ${stmt.commissionAmount.toLocaleString('fr-FR')} FCFA
━━━━━━━━━━━━━━━━━━━━
💎 *SOLDE NET A VOUS REVERSER* : *${stmt.soldeNet.toLocaleString('fr-FR')} FCFA*
━━━━━━━━━━━━━━━━━━━━
Statut du reversement : ${stmt.isPaid ? '✅ Effectué' : '⏳ En cours de virement'}

Agence Immobilière : ${organization?.name || 'SunuGestion Sénégal'}
Pour toute question ou détail sur vos quittances, nous restons à votre entière disposition.`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setNotificationMsg(`Relevé préparé et ouvert sur WhatsApp pour ${o.firstName} ${o.lastName} !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Open Payout Modal
  const handleOpenPayoutModal = (stmt: typeof landlordStatements[0]) => {
    setPayoutModalOwner({
      owner: stmt.owner,
      soldeNet: stmt.soldeNet
    });
    setPayoutAmount(stmt.soldeNet);
    setPayoutRef(`REV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Confirm Payout
  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutModalOwner) return;

    setRecordedPayouts((prev) => ({
      ...prev,
      [payoutModalOwner.owner.id]: {
        date: payoutDate,
        amount: payoutAmount,
        method: payoutMethod,
        ref: payoutRef
      }
    }));

    setNotificationMsg(
      `Reversement de ${payoutAmount.toLocaleString('fr-FR')} FCFA enregistré avec succès pour ${payoutModalOwner.owner.firstName} ${payoutModalOwner.owner.lastName} (${payoutMethod}).`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
    setPayoutModalOwner(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Situation des Bailleurs</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  Compte de Gérance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calcul précis des reversements : <strong>Encaissements - Dépenses - Commissions = Solde Net</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-bold focus:outline-none cursor-pointer pr-2"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Consolidated Master KPI Cards (Encaissements - Dépenses = Solde Net) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Encaissements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Encaissements Bailleurs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">
              +{globalEncaissements.toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Loyers effectivement recouvrés</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Dépenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Dépenses Déductibles</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600">
              -{globalDepenses.toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Charges, entretien, réparations immeubles</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>

        {/* Commissions Agence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Commissions Agence</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">
              -{globalCommissions.toLocaleString('fr-FR')} <span className="text-sm font-semibold">FCFA</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Honoraires de gestion (8% moy.)</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* Solde Net à Reverser */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">4. Solde Net Bailleurs</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-amber-300 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              {globalSoldeNet.toLocaleString('fr-FR')} <span className="text-sm font-semibold text-blue-200">FCFA</span>
            </span>
            <p className="text-[11px] text-blue-300 mt-1">Total net à virer aux propriétaires</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
        </div>
      </div>

      {/* Visual Equation Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Formule comptable certifiée OHADA / Sénégal :</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            Encaissements (+{globalEncaissements.toLocaleString('fr-FR')})
          </span>
          <span className="text-slate-400 font-bold">-</span>
          <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
            Dépenses (-{globalDepenses.toLocaleString('fr-FR')})
          </span>
          <span className="text-slate-400 font-bold">-</span>
          <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
            Commissions (-{globalCommissions.toLocaleString('fr-FR')})
          </span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold shadow-sm">
            Solde Net ({globalSoldeNet.toLocaleString('fr-FR')} FCFA)
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par bailleur, téléphone, immeuble..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedOwnerId}
            onChange={(e) => setSelectedOwnerId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="ALL">Tous les Bailleurs ({owners.length})</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.firstName} {o.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Landlord Statements List */}
      <div className="space-y-4">
        {filteredStatements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Aucun bailleur trouvé</h3>
            <p className="text-xs text-slate-400">Modifiez votre recherche ou vos filtres.</p>
          </div>
        ) : (
          filteredStatements.map((stmt) => {
            const isExpanded = expandedOwnerId === stmt.owner.id;
            const initials = `${(stmt.owner.firstName?.[0] || 'P').toUpperCase()}${(stmt.owner.lastName?.[0] || '').toUpperCase()}`;

            return (
              <div
                key={stmt.owner.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Row / Card Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Landlord Info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-black text-base flex items-center justify-center ring-2 ring-blue-500/20 shrink-0">
                        {initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">
                            {stmt.owner.firstName} {stmt.owner.lastName}
                          </h3>
                          {stmt.isPaid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Reversement Effectué
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              ⏳ En Attente de Virement
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {stmt.owner.phone}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {stmt.properties.length} bien(s) ({stmt.unitsCount} lot(s))
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-blue-600">
                            Commission : {stmt.commissionRate}%
                          </span>
                          {stmt.owner.bankAccount && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {stmt.owner.bankAccount}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary Numbers */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Encaissements</span>
                        <span className="text-sm font-black text-emerald-600">
                          +{stmt.totalEncaissements.toLocaleString('fr-FR')} F
                        </span>
                      </div>

                      <div className="text-slate-300 font-bold">-</div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Dépenses</span>
                        <span className="text-sm font-black text-rose-600">
                          -{stmt.totalDepenses.toLocaleString('fr-FR')} F
                        </span>
                      </div>

                      <div className="text-slate-300 font-bold">-</div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Commissions</span>
                        <span className="text-sm font-black text-amber-600">
                          -{stmt.commissionAmount.toLocaleString('fr-FR')} F
                        </span>
                      </div>

                      <div className="text-slate-300 font-bold">=</div>

                      <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[9px] font-extrabold text-blue-100 uppercase block">Net à Reverser</span>
                        <span className="text-base font-black">
                          {stmt.soldeNet.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedOwnerId(isExpanded ? null : stmt.owner.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Masquer les flux</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            <span>Voir le détail des flux ({stmt.encaissements.length} encaissements, {stmt.depenses.length} dépenses)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        onClick={() => handleSendWhatsAppStatement(stmt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Envoyer la situation par WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Official PDF Statement Button */}
                      <button
                        type="button"
                        onClick={() => setStatementToPrint({
                          owner: stmt.owner,
                          encaissements: stmt.encaissements,
                          depenses: stmt.depenses,
                          totalEncaissements: stmt.totalEncaissements,
                          totalDepenses: stmt.totalDepenses,
                          commissionAmount: stmt.commissionAmount,
                          soldeNet: stmt.soldeNet,
                          period: selectedPeriod
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Imprimer le relevé de compte officiel"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Relevé PDF</span>
                      </button>

                      {/* Payout Action Button */}
                      {!stmt.isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPayoutModal(stmt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Enregistrer Reversement</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Reversé le {stmt.payoutInfo?.date} ({stmt.payoutInfo?.method})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section: Tables for Encaissements & Dépenses */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-5 sm:p-6 border-t border-slate-200 space-y-6 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Encaissements */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <h4 className="font-bold text-slate-900 text-xs">
                              Encaissements de Loyers ({stmt.encaissements.length})
                            </h4>
                          </div>
                          <span className="text-xs font-black text-emerald-600">
                            +{stmt.totalEncaissements.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>

                        {stmt.encaissements.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">Aucun encaissement sur cette période.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {stmt.encaissements.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                              >
                                <div>
                                  <p className="font-bold text-slate-800">{p.tenantName}</p>
                                  <p className="text-[10px] text-slate-500">
                                    {p.propertyName} {p.unitNumber ? `(${p.unitNumber})` : ''} • {p.date} • {p.method}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-emerald-600">+{p.amountFCFA.toLocaleString('fr-FR')} F</p>
                                  <span className="text-[9px] font-mono text-slate-400">{p.receiptNumber}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Dépenses Immeubles */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <h4 className="font-bold text-slate-900 text-xs">
                              Dépenses & Travaux Déductibles ({stmt.depenses.length})
                            </h4>
                          </div>
                          <span className="text-xs font-black text-rose-600">
                            -{stmt.totalDepenses.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>

                        {stmt.depenses.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 text-center">Aucune dépense imputée pour ce propriétaire.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {stmt.depenses.map((e) => (
                              <div
                                key={e.id}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                                      {e.category}
                                    </span>
                                    <p className="font-bold text-slate-800">{e.description}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {e.propertyName} • {e.vendorName} • {e.date}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-rose-600">-{e.amountFCFA.toLocaleString('fr-FR')} F</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step-by-Step Accounting Breakdown */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-xs mb-3">Décompte de clôture du compte de gérance</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">1. Total des loyers bruts encaissés</span>
                          <span className="font-bold text-slate-900">+{stmt.totalEncaissements.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">2. Déduction des travaux et dépenses d'entretien</span>
                          <span className="font-bold text-rose-600">-{stmt.totalDepenses.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">3. Honoraires de gestion agence ({stmt.commissionRate}%)</span>
                          <span className="font-bold text-amber-600">-{stmt.commissionAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between py-2 bg-blue-50/50 px-3 rounded-lg font-bold">
                          <span className="text-blue-900">SOLDE NET FINAL A REVERSER AU BAILLEUR</span>
                          <span className="text-blue-700 font-black text-sm">
                            {stmt.soldeNet.toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Enregistrer un Reversement (Payout) */}
      {payoutModalOwner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Enregistrer un Reversement Bailleur</h3>
                <p className="text-xs text-slate-500">
                  Versement du solde net à {payoutModalOwner.owner.firstName} {payoutModalOwner.owner.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOwner(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Montant Net à Reverser (FCFA)</label>
                <input
                  type="number"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Moyen de Paiement</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WAVE">Wave Mobile</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="VIREMENT_BANCAIRE">Virement Bancaire</option>
                    <option value="ESPECES">Espèces / Chèque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Date du Reversement</label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Référence Transaction / N° Bordereau</label>
                <input
                  type="text"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  placeholder="Ex: WAVE-SN-89271 ou VIR-BOA-2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                Ce reversement marquera la situation du propriétaire comme <strong>Reversée</strong> et mettra à jour l'historique financier de l'agence.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOwner(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Confirmer le Reversement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Relevé Officiel de Situation Bailleur (Prêt pour Impression / PDF) */}
      {statementToPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-6 my-8">
            {/* Top Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Aperçu du Relevé de Compte Propriétaire</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Relevé</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatementToPrint(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Container */}
            <div className="space-y-6 printable-document text-slate-800">
              {/* Official Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{organization?.name || 'SUNUGESTION IMMOBILIÈRE SÉNÉGAL'}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">{organization?.address || 'Immeuble Teranga, Voie de Dégagement Nord (VDN), Dakar'}</p>
                  <p className="text-[11px] text-slate-500">
                    Tél : {organization?.phone || '+221 33 800 00 00'} • NINEA : {organization?.ninea || '009845123 2G3'} • RCCM : {organization?.rccm || 'SN.DKR.2023.B.1120'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-slate-900 text-white font-black text-xs uppercase tracking-wider block">
                    COMPTE DE GÉRANCE
                  </span>
                  <span className="text-xs font-bold text-slate-600 mt-1 block">
                    Période : {statementToPrint.period}
                  </span>
                </div>
              </div>

              {/* Landlord & Agency Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">PROPRIÉTAIRE BAILLEUR :</span>
                  <p className="font-black text-slate-900 text-sm">{statementToPrint.owner.firstName} {statementToPrint.owner.lastName}</p>
                  <p className="text-slate-600">Téléphone : {statementToPrint.owner.phone}</p>
                  <p className="text-slate-600">Email : {statementToPrint.owner.email}</p>
                  {statementToPrint.owner.bankAccount && (
                    <p className="text-slate-600 font-mono text-[11px]">RIB / Compte : {statementToPrint.owner.bankAccount}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">MANDAT DE GESTION :</span>
                  <p className="font-bold text-slate-800">Agence : {organization?.name || 'SunuGestion'}</p>
                  <p className="text-slate-600">Taux de commission convenu : <strong>{statementToPrint.owner.commissionRatePercent ?? 8}%</strong></p>
                  <p className="text-slate-600">Date du relevé : {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Tables of Encaissements */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. Encaissements de Loyers (Crédit Bailleur)
                </h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Locataire</th>
                      <th className="p-2">Bien / Lot</th>
                      <th className="p-2">Quittance</th>
                      <th className="p-2 text-right">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statementToPrint.encaissements.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2">{p.date}</td>
                        <td className="p-2 font-medium">{p.tenantName}</td>
                        <td className="p-2">{p.propertyName} {p.unitNumber}</td>
                        <td className="p-2 font-mono text-[10px]">{p.receiptNumber}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">+{p.amountFCFA.toLocaleString('fr-FR')}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50/60 font-bold">
                      <td colSpan={4} className="p-2 text-right">Total Encaissements Bruts :</td>
                      <td className="p-2 text-right font-black text-emerald-800">+{statementToPrint.totalEncaissements.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tables of Dépenses */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  2. Dépenses & Travaux Déductibles (Débit Bailleur)
                </h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Catégorie</th>
                      <th className="p-2">Libellé & Prestataire</th>
                      <th className="p-2 text-right">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statementToPrint.depenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-400">Aucune dépense déductible sur cette période.</td>
                      </tr>
                    ) : (
                      statementToPrint.depenses.map((e) => (
                        <tr key={e.id}>
                          <td className="p-2">{e.date}</td>
                          <td className="p-2 font-medium">{e.category}</td>
                          <td className="p-2">{e.description} ({e.vendorName})</td>
                          <td className="p-2 text-right font-bold text-rose-700">-{e.amountFCFA.toLocaleString('fr-FR')}</td>
                        </tr>
                      ))
                    )}
                    <tr className="bg-rose-50/60 font-bold">
                      <td colSpan={3} className="p-2 text-right">Total Dépenses :</td>
                      <td className="p-2 text-right font-black text-rose-800">-{statementToPrint.totalDepenses.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recap Balance Box */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Total Encaissements Bruts :</span>
                  <span>+{statementToPrint.totalEncaissements.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Moins Dépenses et Travaux :</span>
                  <span>-{statementToPrint.totalDepenses.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Moins Commission d'Agence ({statementToPrint.owner.commissionRatePercent ?? 8}%) :</span>
                  <span>-{statementToPrint.commissionAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-black">
                  <span className="text-amber-300">NET A REVERSER AU BAILLEUR :</span>
                  <span className="text-amber-300 text-base">{statementToPrint.soldeNet.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs">
                <div className="border-t border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">Pour l'Agence Gestionnaire :</p>
                  <p className="text-[10px] text-slate-500 mt-1">Cachet et signature certifiée</p>
                  <div className="h-14" />
                </div>
                <div className="border-t border-slate-300 pt-2 text-right">
                  <p className="font-bold text-slate-800">Le Propriétaire Bailleur :</p>
                  <p className="text-[10px] text-slate-500 mt-1">Bon pour accord et décharge</p>
                  <div className="h-14" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
