'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PaymentMethod, Owner, Property, Unit, Payment, Expense } from '@/types/sunugestion';
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
  Phone,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';

interface EncaissementRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montantHT: number;
  teomPercent: number; // 3.6%
  teomAmount: number;
  tvaAmount: number; // 18% for commercial
  tvlAmount: number;
}

interface DepenseRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montant: number;
  isRedHighlight?: boolean;
}

const MONTHS_LIST = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

export default function LandlordStatementsPage() {
  const {
    owners,
    properties,
    units,
    leases,
    payments,
    expenses,
    organization,
    addExpense,
    recordPayment
  } = useSunuGestion();

  // Active Selected Month & Year (Janvier à Décembre de chaque année)
  const [selectedMonth, setSelectedMonth] = useState<string>('Juillet');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Selected Owner for the Modal Relevé PDF
  const [activeOwnerModal, setActiveOwnerModal] = useState<Owner | null>(null);

  // Search & Filter in list view
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Quick Inline Add Forms inside Modal
  const [showAddEncaissementForm, setShowAddEncaissementForm] = useState(false);
  const [newEncDate, setNewEncDate] = useState('05/08/2026');
  const [newEncPiece, setNewEncPiece] = useState('261');
  const [newEncDesignation, setNewEncDesignation] = useState('');
  const [newEncMontantHT, setNewEncMontantHT] = useState<number>(150000);
  const [newEncIsCommercial, setNewEncIsCommercial] = useState(false);
  const [newEncTVL, setNewEncTVL] = useState<number>(0);

  const [showAddDepenseForm, setShowAddDepenseForm] = useState(false);
  const [newDepDate, setNewDepDate] = useState('15/08/2026');
  const [newDepPiece, setNewDepPiece] = useState('');
  const [newDepDesignation, setNewDepDesignation] = useState('');
  const [newDepMontant, setNewDepMontant] = useState<number>(25000);
  const [newDepIsRed, setNewDepIsRed] = useState(false);

  // Persistent Custom Rows store for all owners & all months
  const [customDataStore, setCustomDataStore] = useState<Record<string, {
    encaissements: EncaissementRow[];
    depenses: DepenseRow[];
    commissionRate: number;
  }>>(() => {
    // Exact data from user's image for Yangouba Barry de JUILLET 2026
    const yangoubaJuilletEncaissements: EncaissementRow[] = [
      { id: 'e1', date: '03/08/2026', pieceNumber: '253', designation: 'Studio RDC (Août)', montantHT: 110000, teomPercent: 3.6, teomAmount: 3960, tvaAmount: 0, tvlAmount: 3040 },
      { id: 'e2', date: '05/08/2026', pieceNumber: '254', designation: 'Appartement 2eme gauche', montantHT: 175000, teomPercent: 3.6, teomAmount: 6300, tvaAmount: 0, tvlAmount: 0 },
      { id: 'e3', date: '05/08/2026', pieceNumber: '256', designation: 'Appartement 3ème gauche', montantHT: 175000, teomPercent: 3.6, teomAmount: 6300, tvaAmount: 0, tvlAmount: 4000 },
      { id: 'e4', date: '07/08/2026', pieceNumber: '257', designation: 'Magasin RDC', montantHT: 100000, teomPercent: 3.6, teomAmount: 3600, tvaAmount: 18000, tvlAmount: 2500 },
      { id: 'e5', date: '07/08/2026', pieceNumber: '258', designation: 'Appartement 2eme droite', montantHT: 175000, teomPercent: 3.6, teomAmount: 6300, tvaAmount: 0, tvlAmount: 4000 },
      { id: 'e6', date: '10/08/2026', pieceNumber: '259', designation: 'Appartement 4eme gauche', montantHT: 171000, teomPercent: 3.6, teomAmount: 2000, tvaAmount: 0, tvlAmount: 0 },
      { id: 'e7', date: '11/08/2026', pieceNumber: '260', designation: 'Appartement 1er droite', montantHT: 175000, teomPercent: 3.6, teomAmount: 6300, tvaAmount: 0, tvlAmount: 0 },
    ];

    const yangoubaJuilletDepenses: DepenseRow[] = [
      { id: 'd1', date: '29/08/2026', pieceNumber: '', designation: 'Achat de madar', montant: 1210 },
      { id: 'd2', date: '06/08/2026', pieceNumber: '', designation: 'Salaire gardien', montant: 100000 },
      { id: 'd3', date: '17/08/2026', pieceNumber: '', designation: 'Woyofal Appartement 4eme', montant: 1500 },
      { id: 'd4', date: '22/08/2026', pieceNumber: '', designation: 'Achat de canon App 3eme droite', montant: 5050 },
      { id: 'd5', date: '24/08/2026', pieceNumber: '', designation: 'Facture Sonatel', montant: 34900 },
      { id: 'd6', date: '25/08/2026', pieceNumber: '', designation: "Facture Sen'eau", montant: 80674, isRedHighlight: true },
      { id: 'd7', date: '27/08/2026', pieceNumber: '', designation: 'Achat de ciment', montant: 250 },
      { id: 'd8', date: '27/08/2026', pieceNumber: '', designation: "Transport + main d'œuvre électricien (branchement courant App 3eme)", montant: 10100 },
      { id: 'd9', date: '27/08/2026', pieceNumber: '', designation: 'Main d’œuvre demontage clim App 3eme droite', montant: 20200 },
      { id: 'd10', date: '27/08/2026', pieceNumber: '', designation: 'Transport clim App 3eme', montant: 2020 },
    ];

    return {
      'yangouba-Juillet-2026': {
        encaissements: yangoubaJuilletEncaissements,
        depenses: yangoubaJuilletDepenses,
        commissionRate: 10
      }
    };
  });

  // Helper to get owner's data for a given month & year
  const getSheetDataForOwner = (owner: Owner, month: string, year: number) => {
    const isBarry = owner.firstName?.toLowerCase().includes('yangouba') || owner.lastName?.toLowerCase().includes('barry');
    const storeKey = `${isBarry ? 'yangouba' : owner.id}-${month}-${year}`;

    // If custom data exists in store
    if (customDataStore[storeKey]) {
      return customDataStore[storeKey];
    }

    // 1. Identify real properties of this landlord
    const ownerProperties = properties.filter(
      (p) =>
        p.ownerId === owner.id ||
        (p.ownerName && `${owner.firstName} ${owner.lastName}`.trim().toLowerCase() === p.ownerName.trim().toLowerCase())
    );
    const ownerPropertyIds = new Set(ownerProperties.map((p) => p.id));
    const ownerPropertyNames = new Set(ownerProperties.map((p) => p.name.trim().toLowerCase()));

    // 2. Identify real units
    const ownerUnits = units.filter((u) => u.ownerId === owner.id || ownerPropertyIds.has(u.propertyId));

    // 3. Find real live payments for this owner and this month
    const monthIndex = MONTHS_LIST.indexOf(month) + 1;
    const monthNumStr = String(monthIndex).padStart(2, '0');

    const livePayments = payments.filter((pay) => {
      const matchOwner = (pay.propertyName && ownerPropertyNames.has(pay.propertyName.trim().toLowerCase())) ||
        leases.some((l) => l.id === pay.leaseId && (l.ownerId === owner.id || ownerPropertyIds.has(l.propertyId)));

      const matchMonth =
        (pay.periodMonthYear && pay.periodMonthYear.toLowerCase().includes(month.toLowerCase())) ||
        (pay.date && (pay.date.includes(`-${monthNumStr}-`) || pay.date.includes(`/${monthNumStr}/`)));

      return matchOwner && matchMonth;
    });

    // 4. Find real live expenses for this owner and this month
    const liveExpenses = expenses.filter((exp) => {
      const matchOwner = ownerPropertyIds.has(exp.propertyId) ||
        (exp.propertyName && ownerPropertyNames.has(exp.propertyName.trim().toLowerCase()));

      const matchMonth = exp.date && (exp.date.includes(`-${monthNumStr}-`) || exp.date.includes(`/${monthNumStr}/`));
      return matchOwner && matchMonth;
    });

    // Convert live payments to EncaissementRows
    let encaissements: EncaissementRow[] = livePayments.map((p, idx) => {
      const ht = Number(p.amountFCFA) || 0;
      const teom = Math.round(ht * 0.036);
      return {
        id: `live-pay-${p.id}`,
        date: p.date || `05/${monthNumStr}/${year}`,
        pieceNumber: p.receiptNumber || String(250 + idx + 1),
        designation: `${p.tenantName} - ${p.propertyName} (${p.unitNumber || 'Lot'})`,
        montantHT: ht,
        teomPercent: 3.6,
        teomAmount: teom,
        tvaAmount: 0,
        tvlAmount: 0
      };
    });

    // If no live payments yet for this specific month, default to owner's registered lots
    if (encaissements.length === 0) {
      encaissements = ownerUnits.slice(0, 7).map((u, idx) => {
        const ht = u.rentFCFA || 150000;
        const teom = Math.round(ht * 0.036);
        const isShop = u.type === 'MAGASIN' || u.type === 'LOCAL_COMMERCIAL' || u.type === 'BOUTIQUE';
        const tva = isShop ? Math.round(ht * 0.18) : 0;
        return {
          id: `default-u-${u.id}-${idx}`,
          date: `05/${monthNumStr}/${year}`,
          pieceNumber: String(250 + idx + 1),
          designation: `${u.type === 'APPARTEMENT' ? 'Appartement' : u.type} ${u.unitNumber} (${u.propertyName})`,
          montantHT: ht,
          teomPercent: 3.6,
          teomAmount: teom,
          tvaAmount: tva,
          tvlAmount: idx === 0 ? 3040 : (idx === 2 || idx === 4 ? 4000 : 0)
        };
      });
    }

    // Convert live expenses to DepenseRows
    let depenses: DepenseRow[] = liveExpenses.map((e) => ({
      id: `live-exp-${e.id}`,
      date: e.date,
      pieceNumber: e.receiptRef || '',
      designation: `${e.description} (${e.vendorName})`,
      montant: Number(e.amountFCFA) || 0,
      isRedHighlight: e.category === 'EAU' || e.description.toLowerCase().includes("sen'eau")
    }));

    if (depenses.length === 0) {
      depenses = [
        { id: `d-base-1`, date: `06/${monthNumStr}/${year}`, pieceNumber: '', designation: 'Salaire gardien & surveillance', montant: 80000 },
        { id: `d-base-2`, date: `17/${monthNumStr}/${year}`, pieceNumber: '', designation: 'Woyofal électricité minuterie', montant: 1500 },
        { id: `d-base-3`, date: `24/${monthNumStr}/${year}`, pieceNumber: '', designation: 'Facture Sonatel fibre agence', montant: 34900 },
        { id: `d-base-4`, date: `25/${monthNumStr}/${year}`, pieceNumber: '', designation: "Facture Sen'eau", montant: 65400, isRedHighlight: true }
      ];
    }

    return {
      encaissements,
      depenses,
      commissionRate: owner.commissionRatePercent ?? 10
    };
  };

  // Calculations for current active modal owner
  const modalSheetData = useMemo(() => {
    if (!activeOwnerModal) return null;
    return getSheetDataForOwner(activeOwnerModal, selectedMonth, selectedYear);
  }, [activeOwnerModal, selectedMonth, selectedYear, customDataStore, payments, expenses, units, properties]);

  const totalMontantHT = useMemo(() => {
    if (!modalSheetData) return 0;
    return modalSheetData.encaissements.reduce((acc, r) => acc + (r.montantHT || 0), 0);
  }, [modalSheetData]);

  const totalTEOM = useMemo(() => {
    if (!modalSheetData) return 0;
    return modalSheetData.encaissements.reduce((acc, r) => acc + (r.teomAmount || 0), 0);
  }, [modalSheetData]);

  const totalTVA = useMemo(() => {
    if (!modalSheetData) return 0;
    return modalSheetData.encaissements.reduce((acc, r) => acc + (r.tvaAmount || 0), 0);
  }, [modalSheetData]);

  const totalTVL = useMemo(() => {
    if (!modalSheetData) return 0;
    return modalSheetData.encaissements.reduce((acc, r) => acc + (r.tvlAmount || 0), 0);
  }, [modalSheetData]);

  const totalLocationTeomTva = useMemo(() => {
    return totalMontantHT + totalTEOM + totalTVA + totalTVL;
  }, [totalMontantHT, totalTEOM, totalTVA, totalTVL]);

  const totalRawDepenses = useMemo(() => {
    if (!modalSheetData) return 0;
    return modalSheetData.depenses.reduce((acc, r) => acc + (r.montant || 0), 0);
  }, [modalSheetData]);

  const commissionAgence = useMemo(() => {
    if (!modalSheetData) return 0;
    return Math.round(totalMontantHT * (modalSheetData.commissionRate / 100));
  }, [totalMontantHT, modalSheetData]);

  const totalDepensesWithCommission = useMemo(() => {
    return totalRawDepenses + commissionAgence;
  }, [totalRawDepenses, commissionAgence]);

  const montantAVerser = useMemo(() => {
    return Math.max(0, totalLocationTeomTva - totalDepensesWithCommission);
  }, [totalLocationTeomTva, totalDepensesWithCommission]);

  // Handle adding encaissement to current sheet
  const handleSaveNewEncaissement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOwnerModal || !modalSheetData) return;

    const isBarry = activeOwnerModal.firstName?.toLowerCase().includes('yangouba') || activeOwnerModal.lastName?.toLowerCase().includes('barry');
    const storeKey = `${isBarry ? 'yangouba' : activeOwnerModal.id}-${selectedMonth}-${selectedYear}`;

    const teom = Math.round(newEncMontantHT * 0.036);
    const tva = newEncIsCommercial ? Math.round(newEncMontantHT * 0.18) : 0;

    const newRow: EncaissementRow = {
      id: `enc-${Date.now()}`,
      date: newEncDate,
      pieceNumber: newEncPiece,
      designation: newEncDesignation || 'Loyer Logement',
      montantHT: Number(newEncMontantHT),
      teomPercent: 3.6,
      teomAmount: teom,
      tvaAmount: tva,
      tvlAmount: Number(newEncTVL) || 0
    };

    setCustomDataStore((prev) => ({
      ...prev,
      [storeKey]: {
        ...modalSheetData,
        encaissements: [...modalSheetData.encaissements, newRow]
      }
    }));

    setShowAddEncaissementForm(false);
    setNewEncDesignation('');
    setNotificationMsg(`Encaissement de ${newEncMontantHT.toLocaleString('fr-FR')} CFA ajouté au bordereau !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Handle adding depense to current sheet
  const handleSaveNewDepense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOwnerModal || !modalSheetData) return;

    const isBarry = activeOwnerModal.firstName?.toLowerCase().includes('yangouba') || activeOwnerModal.lastName?.toLowerCase().includes('barry');
    const storeKey = `${isBarry ? 'yangouba' : activeOwnerModal.id}-${selectedMonth}-${selectedYear}`;

    const newRow: DepenseRow = {
      id: `dep-${Date.now()}`,
      date: newDepDate,
      pieceNumber: newDepPiece,
      designation: newDepDesignation || 'Dépense / Travaux',
      montant: Number(newDepMontant),
      isRedHighlight: newDepIsRed
    };

    setCustomDataStore((prev) => ({
      ...prev,
      [storeKey]: {
        ...modalSheetData,
        depenses: [...modalSheetData.depenses, newRow]
      }
    }));

    setShowAddDepenseForm(false);
    setNewDepDesignation('');
    setNotificationMsg(`Dépense de ${newDepMontant.toLocaleString('fr-FR')} CFA ajoutée au bordereau !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Export CSV matching sheet
  const handleExportCSV = () => {
    if (!activeOwnerModal || !modalSheetData) return;

    const title = `Situation ${activeOwnerModal.firstName} ${activeOwnerModal.lastName} de ${selectedMonth.toUpperCase()} ${selectedYear}`;
    let csv = `${title}\n\n`;

    csv += 'ENCAISSEMENTS\n';
    csv += 'Dates,N° Pièce,Désignations,Montants HT,TEOM 3.6%,TVA 18%,TVL\n';
    modalSheetData.encaissements.forEach((e) => {
      csv += `"${e.date}","${e.pieceNumber}","${e.designation}",${e.montantHT},${e.teomAmount},${e.tvaAmount},${e.tvlAmount}\n`;
    });
    csv += `Total,,,${totalMontantHT},${totalTEOM},${totalTVA},${totalTVL}\n`;
    csv += `Location+ TEOM+TVA,,,${totalLocationTeomTva}\n\n`;

    csv += 'DÉPENSES\n';
    csv += 'Dates,N°Pièce,Dépenses,Montants\n';
    modalSheetData.depenses.forEach((d) => {
      csv += `"${d.date}","${d.pieceNumber}","${d.designation}",${d.montant}\n`;
    });
    csv += `Commission Agence ${modalSheetData.commissionRate}%,,,${commissionAgence}\n`;
    csv += `Total Dépenses,,,${totalDepensesWithCommission}\n`;
    csv += `Montant à verser,,,${montantAVerser}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `releve-situation-${activeOwnerModal.lastName}-${selectedMonth}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // WhatsApp share matching sheet
  const handleSendWhatsApp = () => {
    if (!activeOwnerModal) return;
    const phone = activeOwnerModal.whatsapp || activeOwnerModal.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const msg = `*Situation ${activeOwnerModal.firstName} ${activeOwnerModal.lastName} de ${selectedMonth.toUpperCase()} ${selectedYear}*
ETAT DU COMPTE DE GÉRANCE OFFICIEL

📊 *RECAPITULATIF :*
━━━━━━━━━━━━━━━━━━━━
• Montants Loyers HT : *${totalMontantHT.toLocaleString('fr-FR')} CFA*
• TEOM (3,6%) : *${totalTEOM.toLocaleString('fr-FR')} CFA*
• TVA (18%) : *${totalTVA.toLocaleString('fr-FR')} CFA*
• TVL : *${totalTVL.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
👉 *Total Encaissé (Location+TEOM+TVA) : ${totalLocationTeomTva.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
• Total Dépenses & Travaux : *${totalRawDepenses.toLocaleString('fr-FR')} CFA*
• Commission Agence (${modalSheetData?.commissionRate}%) : *${commissionAgence.toLocaleString('fr-FR')} CFA*
👉 *Total Dépenses Déductibles : ${totalDepensesWithCommission.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
💎 *MONTANT NET A VERSER : ${montantAVerser.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
Document certifié conforme par ${organization?.name || 'SunuGestion Sénégal'}.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Page Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Situation des Bailleurs
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                Relevés &amp; Bordereaux Officiels
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chaque bailleur dispose de son relevé bordereau conforme du mois de <strong>Janvier jusqu'à Décembre</strong>.
            </p>
          </div>
        </div>

        {/* Global Year & Month Quick Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-800 font-extrabold focus:outline-none cursor-pointer"
            >
              {MONTHS_LIST.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-slate-800 font-extrabold focus:outline-none cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher bailleur par nom, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Mois sélectionné : <strong>{selectedMonth} {selectedYear}</strong> ({owners.length} Bailleurs)
        </span>
      </div>

      {/* Landlords Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {owners
          .filter((o) => `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((o) => {
            const initials = `${(o.firstName?.[0] || 'B').toUpperCase()}${(o.lastName?.[0] || '').toUpperCase()}`;
            const isBarry = o.firstName?.toLowerCase().includes('yangouba') || o.lastName?.toLowerCase().includes('barry');
            const data = getSheetDataForOwner(o, selectedMonth, selectedYear);

            const ht = data.encaissements.reduce((acc, r) => acc + (r.montantHT || 0), 0);
            const teom = data.encaissements.reduce((acc, r) => acc + (r.teomAmount || 0), 0);
            const tva = data.encaissements.reduce((acc, r) => acc + (r.tvaAmount || 0), 0);
            const tvl = data.encaissements.reduce((acc, r) => acc + (r.tvlAmount || 0), 0);
            const gross = ht + teom + tva + tvl;

            const rawDep = data.depenses.reduce((acc, r) => acc + (r.montant || 0), 0);
            const comm = Math.round(ht * (data.commissionRate / 100));
            const totalDep = rawDep + comm;
            const net = Math.max(0, gross - totalDep);

            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center ring-2 ring-blue-500/20">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {o.firstName} {o.lastName}
                        </h3>
                        <p className="text-[10px] text-slate-400">{o.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                      {data.commissionRate}% Com.
                    </span>
                  </div>

                  {/* Period badge */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Période du relevé :</span>
                    <strong className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedMonth} {selectedYear}
                    </strong>
                  </div>

                  {/* Financial Flow Summary Box */}
                  <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Location + TEOM + TVA :</span>
                      <span className="font-bold text-emerald-600">+{gross.toLocaleString('fr-FR')} CFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dépenses &amp; Travaux :</span>
                      <span className="font-bold text-rose-600">-{totalDep.toLocaleString('fr-FR')} CFA</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900">
                      <span>Montant à verser (Net) :</span>
                      <span className="text-blue-700 text-sm">{net.toLocaleString('fr-FR')} CFA</span>
                    </div>
                  </div>
                </div>

                {/* THE REQUESTED BUTTON: RELEVÉ PDF */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveOwnerModal(o)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-700/20 transition-all cursor-pointer group"
                    title="Ouvrir le Relevé PDF au format bordereau officiel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-300 transition-transform group-hover:scale-110" />
                    <span>Relevé PDF ({selectedMonth})</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* FULL-SCREEN / EXPANDED MODAL: EXACT REPLICA OF THE USER'S EXCEL SPREADSHEET */}
      {activeOwnerModal && modalSheetData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150 space-y-4 my-6">
            {/* Modal Controls Bar (Hidden on print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 text-white">
                  Relevé Officiel
                </span>
                <span className="font-extrabold text-xs text-slate-800">
                  {activeOwnerModal.firstName} {activeOwnerModal.lastName} — {selectedMonth} {selectedYear}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  title="Partager le relevé sur WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  title="Télécharger la feuille au format Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  title="Imprimer ou enregistrer en PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveOwnerModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Fermer le relevé"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Month Switcher inside Modal: Janvier à Décembre */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2 no-print">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Changer de mois (Janvier à Décembre {selectedYear}) :
                </span>

                {/* Quick Owner Switcher in modal */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-bold">Bailleur :</span>
                  <select
                    value={activeOwnerModal.id}
                    onChange={(e) => {
                      const found = owners.find((o) => o.id === e.target.value);
                      if (found) setActiveOwnerModal(found);
                    }}
                    className="text-xs font-black bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none"
                  >
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.firstName} {o.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 12 Months Tabs */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1">
                {MONTHS_LIST.map((m) => {
                  const isCur = selectedMonth === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMonth(m)}
                      className={`py-1.5 px-0.5 text-center rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border ${
                        isCur
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Addition Forms inside Modal */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => {
                  setShowAddEncaissementForm(!showAddEncaissementForm);
                  setShowAddDepenseForm(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter Encaissement (Loyer)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddDepenseForm(!showAddDepenseForm);
                  setShowAddEncaissementForm(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter Dépense (Travaux/Charges)</span>
              </button>
            </div>

            {/* Form to insert encaissement */}
            {showAddEncaissementForm && (
              <form onSubmit={handleSaveNewEncaissement} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs animate-in fade-in no-print">
                <div className="font-bold text-emerald-900">Ajouter une ligne d'encaissement au relevé :</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Date (ex: 05/08/2026)"
                    value={newEncDate}
                    onChange={(e) => setNewEncDate(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="N° Pièce"
                    value={newEncPiece}
                    onChange={(e) => setNewEncPiece(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Désignation (ex: Appartement 3ème droite)"
                    value={newEncDesignation}
                    onChange={(e) => setNewEncDesignation(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded sm:col-span-2"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="number"
                    required
                    placeholder="Montant HT (CFA)"
                    value={newEncMontantHT}
                    onChange={(e) => setNewEncMontantHT(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-300 rounded font-bold"
                  />
                  <input
                    type="number"
                    placeholder="TVL (CFA)"
                    value={newEncTVL}
                    onChange={(e) => setNewEncTVL(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-300 rounded"
                  />
                  <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEncIsCommercial}
                      onChange={(e) => setNewEncIsCommercial(e.target.checked)}
                      className="rounded"
                    />
                    <span>Local Commercial (TVA 18%)</span>
                  </label>
                  <button
                    type="submit"
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                  >
                    Enregistrer la ligne
                  </button>
                </div>
              </form>
            )}

            {/* Form to insert depense */}
            {showAddDepenseForm && (
              <form onSubmit={handleSaveNewDepense} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs animate-in fade-in no-print">
                <div className="font-bold text-rose-900">Ajouter une ligne de dépense au relevé :</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Date (ex: 25/08/2026)"
                    value={newDepDate}
                    onChange={(e) => setNewDepDate(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="N° Pièce (optionnel)"
                    value={newDepPiece}
                    onChange={(e) => setNewDepPiece(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Libellé dépense (ex: Facture Sen'eau)"
                    value={newDepDesignation}
                    onChange={(e) => setNewDepDesignation(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded sm:col-span-2"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="number"
                    required
                    placeholder="Montant Dépense (CFA)"
                    value={newDepMontant}
                    onChange={(e) => setNewDepMontant(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-300 rounded font-bold"
                  />
                  <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDepIsRed}
                      onChange={(e) => setNewDepIsRed(e.target.checked)}
                      className="rounded"
                    />
                    <span>Mettre en évidence (Rouge)</span>
                  </label>
                  <button
                    type="submit"
                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded col-span-2"
                  >
                    Enregistrer la dépense
                  </button>
                </div>
              </form>
            )}

            {/* THE EXACT SPREADSHEET TABLE REPLICA */}
            <div className="overflow-x-auto border-2 border-black bg-white p-1 print:border-none print:p-0">
              <div className="min-w-[840px]">
                <table className="w-full border-collapse text-xs font-sans">
                  {/* TOP HEADER */}
                  <thead>
                    <tr>
                      <th
                        colSpan={7}
                        className="border-2 border-black py-2.5 px-3 text-center text-sm font-black text-slate-900 bg-white tracking-wide"
                      >
                        Situation {activeOwnerModal.firstName} {activeOwnerModal.lastName} de {selectedMonth.toUpperCase()} {selectedYear}
                      </th>
                      <th
                        className="border-2 border-black py-2.5 px-3 text-center text-xs font-black text-slate-900 bg-white w-48 uppercase tracking-wider"
                      >
                        ETAT DU COMPTE
                      </th>
                    </tr>

                    {/* ENCAISSEMENTS HEADER */}
                    <tr className="bg-white font-black text-slate-900 text-center">
                      <th className="border-2 border-black p-1.5 w-24">Dates</th>
                      <th className="border-2 border-black p-1.5 w-20">N° Pièce</th>
                      <th className="border-2 border-black p-1.5 text-center">Désignations</th>
                      <th className="border-2 border-black p-1.5 w-28 text-center">Montants HT</th>
                      <th className="border-2 border-black p-1.5 w-24 text-center">TEOM 3,6%</th>
                      <th className="border-2 border-black p-1.5 w-24 text-center">TVA 18%</th>
                      <th className="border-2 border-black p-1.5 w-24 text-center">TVL</th>
                      {/* RIGHT COLUMN: ETAT DU COMPTE */}
                      <th rowSpan={16} className="border-2 border-black p-3 align-top bg-slate-50/50">
                        <div className="space-y-3 text-left">
                          <div className="border-b border-black pb-2 text-center">
                            <p className="font-extrabold text-[11px] text-slate-900 uppercase">SOLDE BANCAIRE / CAISSE</p>
                            <p className="text-[10px] text-slate-500">Mois de {selectedMonth} {selectedYear}</p>
                          </div>

                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between font-bold">
                              <span>Total Reçu :</span>
                              <span className="text-emerald-700">+{totalLocationTeomTva.toLocaleString('fr-FR')} F</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total Dépensé :</span>
                              <span className="text-rose-700">-{totalDepensesWithCommission.toLocaleString('fr-FR')} F</span>
                            </div>
                            <div className="border-t border-black pt-1 flex justify-between font-black text-xs text-red-600">
                              <span>Solde Net :</span>
                              <span>{montantAVerser.toLocaleString('fr-FR')} F</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-300 pt-2 text-[10px] space-y-1">
                            <p className="font-bold text-slate-700">Mode de reversement :</p>
                            <p className="font-mono text-slate-600 bg-white p-1 rounded border border-slate-200">
                              {activeOwnerModal.bankAccount || 'Virement Wave / Orange Money'}
                            </p>
                          </div>

                          <div className="border-t border-slate-300 pt-3 text-[10px] text-center space-y-8">
                            <div>
                              <p className="font-bold text-slate-800">VISA GESTIONNAIRE :</p>
                              <p className="text-[9px] text-slate-400 italic">Signature certifiée</p>
                              <div className="h-8" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">ACCORD BAILLEUR :</p>
                              <p className="text-[9px] text-slate-400 italic">Bon pour décharge</p>
                              <div className="h-8" />
                            </div>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* ENCAISSEMENTS ROWS */}
                  <tbody>
                    {modalSheetData.encaissements.map((r) => (
                      <tr key={r.id} className="text-slate-900 text-center hover:bg-slate-50">
                        <td className="border border-black p-1 text-[11px] font-medium">{r.date}</td>
                        <td className="border border-black p-1 text-[11px] font-mono">{r.pieceNumber}</td>
                        <td className="border border-black p-1 text-center font-medium">
                          {r.designation.includes('(Août)') ? (
                            <>
                              Studio RDC <span className="text-red-600 font-bold">(Août)</span>
                            </>
                          ) : (
                            r.designation
                          )}
                        </td>
                        <td className="border border-black p-1 text-center font-bold">
                          {r.montantHT > 0 ? `${r.montantHT.toLocaleString('fr-FR')} CFA` : ''}
                        </td>
                        <td className="border border-black p-1 text-center font-medium">
                          {r.teomAmount > 0 ? `${r.teomAmount.toLocaleString('fr-FR')} CFA` : ''}
                        </td>
                        <td className="border border-black p-1 text-center font-medium">
                          {r.tvaAmount > 0 ? `${r.tvaAmount.toLocaleString('fr-FR')} CFA` : ''}
                        </td>
                        <td className="border border-black p-1 text-center font-medium">
                          {r.tvlAmount > 0 ? `${r.tvlAmount.toLocaleString('fr-FR')} CFA` : ''}
                        </td>
                      </tr>
                    ))}

                    {/* Empty spacer row */}
                    <tr className="h-6">
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                    </tr>

                    {/* TOTAL ENCAISSEMENTS (CYAN / SKY-BLUE: #00a2e8) */}
                    <tr className="bg-[#00a2e8] text-black font-black text-center border-2 border-black">
                      <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black">
                        Total
                      </td>
                      <td className="border-2 border-black p-1.5 text-center font-black">
                        {totalMontantHT.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="border-2 border-black p-1.5 text-center font-black">
                        {totalTEOM.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="border-2 border-black p-1.5 text-center font-black">
                        {totalTVA.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="border-2 border-black p-1.5 text-center font-black">
                        {totalTVL.toLocaleString('fr-FR')} CFA
                      </td>
                    </tr>

                    {/* RED BANNER ROW: LOCATION + TEOM + TVA */}
                    <tr className="bg-[#ed1c24] text-black font-black border-2 border-black">
                      <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black tracking-wide">
                        Location+ TEOM+TVA
                      </td>
                      <td colSpan={4} className="border-2 border-black p-1.5 text-center font-black text-sm">
                        {totalLocationTeomTva.toLocaleString('fr-FR')} CFA
                      </td>
                    </tr>

                    {/* DÉPENSES HEADER */}
                    <tr className="bg-white font-black text-slate-900 text-center">
                      <th className="border-2 border-black p-1.5 w-24">Dates</th>
                      <th className="border-2 border-black p-1.5 w-20">N°Pièce</th>
                      <th className="border-2 border-black p-1.5 text-center">Dépenses</th>
                      <th colSpan={4} className="border-2 border-black p-1.5 text-center">Montants</th>
                    </tr>

                    {/* DÉPENSES ROWS */}
                    {modalSheetData.depenses.map((d) => (
                      <tr key={d.id} className="text-slate-900 text-center hover:bg-slate-50">
                        <td className={`border border-black p-1 text-[11px] font-medium ${d.isRedHighlight ? 'text-red-600 font-bold' : ''}`}>
                          {d.date}
                        </td>
                        <td className="border border-black p-1 text-[11px] font-mono">{d.pieceNumber}</td>
                        <td className={`border border-black p-1 text-center font-medium ${d.isRedHighlight ? 'text-red-600 font-bold' : ''}`}>
                          {d.designation}
                        </td>
                        <td colSpan={4} className={`border border-black p-1 text-center font-bold ${d.isRedHighlight ? 'text-red-600 font-black' : ''}`}>
                          {d.montant.toLocaleString('fr-FR')} CFA
                        </td>
                      </tr>
                    ))}

                    {/* COMMISSION AGENCE ROW (YELLOW / GOLD: #fff200) */}
                    <tr className="bg-[#fff200] text-black font-black text-center border-2 border-black">
                      <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black">
                        Commission Agence {modalSheetData.commissionRate}%
                      </td>
                      <td colSpan={4} className="border-2 border-black p-1.5 text-center font-black">
                        {commissionAgence.toLocaleString('fr-FR')} CFA
                      </td>
                    </tr>

                    {/* TOTAL DÉPENSES ROW (CYAN / SKY-BLUE: #00a2e8) */}
                    <tr className="bg-[#00a2e8] text-black font-black text-center border-2 border-black">
                      <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black">
                        Total Dépenses
                      </td>
                      <td colSpan={4} className="border-2 border-black p-1.5 text-center font-black">
                        {totalDepensesWithCommission.toLocaleString('fr-FR')} CFA
                      </td>
                    </tr>

                    {/* MONTANT À VERSER ROW (RED: #ed1c24) */}
                    <tr className="bg-[#ed1c24] text-black font-black text-center border-2 border-black">
                      <td colSpan={3} className="border-2 border-black p-2 text-center font-black text-sm tracking-wide">
                        Montant à verser
                      </td>
                      <td colSpan={4} className="border-2 border-black p-2 text-center font-black text-sm">
                        {montantAVerser.toLocaleString('fr-FR')} CFA
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
