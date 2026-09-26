'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { PaymentMethod, Owner } from '@/types/sunugestion';
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
  Trash2
} from 'lucide-react';

interface EncaissementRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montantHT: number;
  teomPercent: number; // usually 3.6%
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
    organization
  } = useSunuGestion();

  // Active view: 'SPREADSHEET' (the exact Excel template requested) or 'CARDS'
  const [activeView, setActiveView] = useState<'SPREADSHEET' | 'CARDS'>('SPREADSHEET');

  // Selected Month & Year
  const [selectedMonth, setSelectedMonth] = useState<string>('Juillet');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Selected Owner for the Spreadsheet
  const [currentOwnerId, setCurrentOwnerId] = useState<string>(() => {
    const barry = owners.find((o) => o.lastName?.toLowerCase().includes('barry') || o.firstName?.toLowerCase().includes('yangouba'));
    return barry ? barry.id : (owners[0]?.id || '');
  });

  // Global search for cards view
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Modal Sheet State (opened when clicking on "Relevé" from cards or button)
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Dynamic rows per owner & month (initialized with Yangouba Barry Juillet 2026 data as exact default)
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
      'yangouba-Juillet': {
        encaissements: yangoubaJuilletEncaissements,
        depenses: yangoubaJuilletDepenses,
        commissionRate: 10
      }
    };
  });

  // Identify current owner
  const currentOwner = useMemo(() => {
    return owners.find((o) => o.id === currentOwnerId) || owners[0] || {
      id: 'default-owner',
      firstName: 'Yangouba',
      lastName: 'Barry',
      phone: '+221 77 412 88 90',
      whatsapp: '+221 77 412 88 90',
      email: 'yangouba.barry@gmail.com',
      commissionRatePercent: 10,
    };
  }, [owners, currentOwnerId]);

  // Key for data store lookup
  const dataKey = `${currentOwner.firstName?.toLowerCase().includes('barry') || currentOwner.lastName?.toLowerCase().includes('barry') ? 'yangouba' : currentOwner.id}-${selectedMonth}`;

  // Get or compute rows for the current owner & month
  const currentSheetData = useMemo(() => {
    if (customDataStore[dataKey]) {
      return customDataStore[dataKey];
    }

    // Otherwise, generate structured data based on the owner's real units & leases
    const ownerProperties = properties.filter(
      (p) =>
        p.ownerId === currentOwner.id ||
        (p.ownerName && `${currentOwner.firstName} ${currentOwner.lastName}`.trim().toLowerCase() === p.ownerName.trim().toLowerCase())
    );
    const ownerPropertyIds = new Set(ownerProperties.map((p) => p.id));
    const ownerUnits = units.filter((u) => u.ownerId === currentOwner.id || ownerPropertyIds.has(u.propertyId));

    const generatedEncaissements: EncaissementRow[] = ownerUnits.map((u, idx) => {
      const ht = u.rentFCFA || 150000;
      const teom = Math.round(ht * 0.036);
      const isShop = u.type === 'MAGASIN' || u.type === 'LOCAL_COMMERCIAL' || u.type === 'BOUTIQUE';
      const tva = isShop ? Math.round(ht * 0.18) : 0;
      return {
        id: `gen-e-${u.id}-${idx}`,
        date: `05/${String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0')}/${selectedYear}`,
        pieceNumber: String(250 + idx + 1),
        designation: `${u.type === 'APPARTEMENT' ? 'Appartement' : u.type} ${u.unitNumber} (${u.propertyName})`,
        montantHT: ht,
        teomPercent: 3.6,
        teomAmount: teom,
        tvaAmount: tva,
        tvlAmount: 0
      };
    });

    // Sample expenses for this landlord if none exists
    const generatedDepenses: DepenseRow[] = [
      { id: `gen-d-1`, date: `10/${String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0')}/${selectedYear}`, pieceNumber: 'FAC-01', designation: 'Salaire gardien & entretien', montant: 80000 },
      { id: `gen-d-2`, date: `15/${String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0')}/${selectedYear}`, pieceNumber: 'FAC-02', designation: "Facture Sen'eau parties communes", montant: 25400, isRedHighlight: true },
      { id: `gen-d-3`, date: `20/${String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0')}/${selectedYear}`, pieceNumber: 'FAC-03', designation: 'Maintenance électricité & ampoules LED', montant: 15000 }
    ];

    return {
      encaissements: generatedEncaissements.length > 0 ? generatedEncaissements : [
        { id: 'def-1', date: `05/08/${selectedYear}`, pieceNumber: '253', designation: 'Studio RDC', montantHT: 110000, teomPercent: 3.6, teomAmount: 3960, tvaAmount: 0, tvlAmount: 3040 },
        { id: 'def-2', date: `08/08/${selectedYear}`, pieceNumber: '254', designation: 'Appartement 2ème', montantHT: 175000, teomPercent: 3.6, teomAmount: 6300, tvaAmount: 0, tvlAmount: 4000 }
      ],
      depenses: generatedDepenses,
      commissionRate: currentOwner.commissionRatePercent ?? 10
    };
  }, [customDataStore, dataKey, currentOwner, properties, units, selectedMonth, selectedYear]);

  // Calculations for current sheet
  const totalMontantHT = useMemo(() => {
    return currentSheetData.encaissements.reduce((acc, r) => acc + (r.montantHT || 0), 0);
  }, [currentSheetData]);

  const totalTEOM = useMemo(() => {
    return currentSheetData.encaissements.reduce((acc, r) => acc + (r.teomAmount || 0), 0);
  }, [currentSheetData]);

  const totalTVA = useMemo(() => {
    return currentSheetData.encaissements.reduce((acc, r) => acc + (r.tvaAmount || 0), 0);
  }, [currentSheetData]);

  const totalTVL = useMemo(() => {
    return currentSheetData.encaissements.reduce((acc, r) => acc + (r.tvlAmount || 0), 0);
  }, [currentSheetData]);

  // Gross Total: Location + TEOM + TVA (as displayed in red row in user's image)
  const totalLocationTeomTva = useMemo(() => {
    return totalMontantHT + totalTEOM + totalTVA + totalTVL;
  }, [totalMontantHT, totalTEOM, totalTVA, totalTVL]);

  // Total raw expenses
  const totalRawDepenses = useMemo(() => {
    return currentSheetData.depenses.reduce((acc, r) => acc + (r.montant || 0), 0);
  }, [currentSheetData]);

  // Agency Commission (e.g., 10% of Montant HT)
  const commissionAgence = useMemo(() => {
    return Math.round(totalMontantHT * (currentSheetData.commissionRate / 100));
  }, [totalMontantHT, currentSheetData.commissionRate]);

  // Total Dépenses (Dépenses + Commission)
  const totalDepensesWithCommission = useMemo(() => {
    return totalRawDepenses + commissionAgence;
  }, [totalRawDepenses, commissionAgence]);

  // Montant à verser (Solde Net): Location+TEOM+TVA - Total Dépenses
  const montantAVerser = useMemo(() => {
    return Math.max(0, totalLocationTeomTva - totalDepensesWithCommission);
  }, [totalLocationTeomTva, totalDepensesWithCommission]);

  // Handle adding a new row to Encaissements
  const handleAddEncaissementRow = () => {
    const newRow: EncaissementRow = {
      id: `enc-${Date.now()}`,
      date: `05/${String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0')}/${selectedYear}`,
      pieceNumber: String(260 + currentSheetData.encaissements.length),
      designation: 'Nouveau Logement / Unité',
      montantHT: 150000,
      teomPercent: 3.6,
      teomAmount: 5400,
      tvaAmount: 0,
      tvlAmount: 0
    };

    setCustomDataStore((prev) => ({
      ...prev,
      [dataKey]: {
        ...currentSheetData,
        encaissements: [...currentSheetData.encaissements, newRow]
      }
    }));
  };

  // Handle adding a new row to Dépenses
  const handleAddDepenseRow = () => {
    const newRow: DepenseRow = {
      id: `dep-${Date.now()}`,
      date: `15/${String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0')}/${selectedYear}`,
      pieceNumber: '',
      designation: 'Nouvelle dépense / réparation',
      montant: 25000
    };

    setCustomDataStore((prev) => ({
      ...prev,
      [dataKey]: {
        ...currentSheetData,
        depenses: [...currentSheetData.depenses, newRow]
      }
    }));
  };

  // Export as CSV matching this exact sheet format
  const handleExportExcelSheet = () => {
    const title = `Situation ${currentOwner.firstName} ${currentOwner.lastName} de ${selectedMonth.toUpperCase()} ${selectedYear}`;
    let csv = `${title}\n\n`;

    csv += 'ENCAISSEMENTS\n';
    csv += 'Dates,N° Pièce,Désignations,Montants HT,TEOM 3.6%,TVA 18%,TVL\n';
    currentSheetData.encaissements.forEach((e) => {
      csv += `"${e.date}","${e.pieceNumber}","${e.designation}",${e.montantHT},${e.teomAmount},${e.tvaAmount},${e.tvlAmount}\n`;
    });
    csv += `Total,,,${totalMontantHT},${totalTEOM},${totalTVA},${totalTVL}\n`;
    csv += `Location+ TEOM+TVA,,,${totalLocationTeomTva}\n\n`;

    csv += 'DÉPENSES\n';
    csv += 'Dates,N°Pièce,Dépenses,Montants\n';
    currentSheetData.depenses.forEach((d) => {
      csv += `"${d.date}","${d.pieceNumber}","${d.designation}",${d.montant}\n`;
    });
    csv += `Commission Agence ${currentSheetData.commissionRate}%,,,${commissionAgence}\n`;
    csv += `Total Dépenses,,,${totalDepensesWithCommission}\n`;
    csv += `Montant à verser,,,${montantAVerser}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `situation-${currentOwner.lastName}-${selectedMonth}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotificationMsg(`Bordereau Excel de ${currentOwner.firstName} ${currentOwner.lastName} (${selectedMonth} ${selectedYear}) téléchargé !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Send WhatsApp matching the sheet
  const handleSendWhatsApp = () => {
    const phone = currentOwner.whatsapp || currentOwner.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const msg = `*Situation ${currentOwner.firstName} ${currentOwner.lastName} de ${selectedMonth.toUpperCase()} ${selectedYear}*
ETAT DU COMPTE DE GÉRANCE

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
• Commission Agence (${currentSheetData.commissionRate}%) : *${commissionAgence.toLocaleString('fr-FR')} CFA*
👉 *Total Dépenses Déductibles : ${totalDepensesWithCommission.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
💎 *MONTANT NET A VERSER : ${montantAVerser.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
Document officiel généré par ${organization?.name || 'SunuGestion'}.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-3 sm:p-6 space-y-5 bg-slate-100 min-h-screen">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Bar with View Switcher and Global Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Situation des Bailleurs
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  Bordereau Officiel Sénégal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Relevé mensuel conforme : <strong>Location + TEOM + TVA - Dépenses - Commission = Montant à verser</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle between Exact Sheet & Summary Cards */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveView('SPREADSHEET')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'SPREADSHEET'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Bordereau Conforme</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('CARDS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'CARDS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vue Synthèse Bailleurs</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportExcelSheet}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Télécharger en CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Imprimer ce bordereau"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* MONTHS SELECTOR BAR: DU MOIS DE JANVIER JUSQU'AU MOIS DE DECEMBRE */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Sélection du Mois (Janvier à Décembre {selectedYear}) :
            </span>
          </div>

          {/* Landlord selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Bailleur :</span>
            <select
              value={currentOwnerId}
              onChange={(e) => setCurrentOwnerId(e.target.value)}
              className="text-xs font-black bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {MONTHS_LIST.map((m) => {
            const isSelected = selectedMonth === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 ring-2 ring-blue-400/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* SPREADSHEET VIEW: EXACT REPLICA OF THE USER'S ATTACHED EXCEL SHEET */}
      {activeView === 'SPREADSHEET' && (
        <div className="space-y-4">
          {/* Quick Toolbar above sheet */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs no-print">
            <div className="flex items-center gap-2 font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Affichage actif : <strong>Situation {currentOwner.firstName} {currentOwner.lastName} de {selectedMonth.toUpperCase()} {selectedYear}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddEncaissementRow}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Ligne Loyer</span>
              </button>

              <button
                type="button"
                onClick={handleAddDepenseRow}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Ligne Dépense</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* EXACT EXCEL SPREADSHEET TABLE */}
          <div className="bg-white rounded-2xl border-2 border-black shadow-lg overflow-x-auto print:border-none print:shadow-none p-2 sm:p-4">
            <div className="min-w-[860px]">
              <table className="w-full border-collapse text-xs font-sans">
                {/* 1. TOP HEADER ROW */}
                <thead>
                  <tr>
                    <th
                      colSpan={7}
                      className="border-2 border-black py-2.5 px-4 text-center text-sm font-black text-slate-900 bg-white tracking-wide"
                    >
                      Situation {currentOwner.firstName} {currentOwner.lastName} de {selectedMonth.toUpperCase()} {selectedYear}
                    </th>
                    <th
                      className="border-2 border-black py-2.5 px-3 text-center text-xs font-black text-slate-900 bg-white w-48 uppercase tracking-wider"
                    >
                      ETAT DU COMPTE
                    </th>
                  </tr>

                  {/* 2. TABLE ENCAISSEMENTS HEADER */}
                  <tr className="bg-white font-black text-slate-900 text-center">
                    <th className="border-2 border-black p-1.5 w-24">Dates</th>
                    <th className="border-2 border-black p-1.5 w-20">N° Pièce</th>
                    <th className="border-2 border-black p-1.5 text-center">Désignations</th>
                    <th className="border-2 border-black p-1.5 w-32 text-center">Montants HT</th>
                    <th className="border-2 border-black p-1.5 w-28 text-center">TEOM 3,6%</th>
                    <th className="border-2 border-black p-1.5 w-24 text-center">TVA 18%</th>
                    <th className="border-2 border-black p-1.5 w-24 text-center">TVL</th>
                    {/* The right column spans through all rows */}
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
                            {currentOwner.bankAccount || 'Virement Wave / Orange Money'}
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

                {/* 3. ENCAISSEMENTS ROWS */}
                <tbody>
                  {currentSheetData.encaissements.map((r, idx) => (
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

                  {/* Empty rows to match authentic ledger sheet appearance */}
                  <tr className="h-6">
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                  </tr>
                  <tr className="h-6">
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1"></td>
                  </tr>

                  {/* TOTAL ENCAISSEMENTS ROW (CYAN / SKY-BLUE: #00a2e8) */}
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

                  {/* 4. DÉPENSES TABLE HEADER */}
                  <tr className="bg-white font-black text-slate-900 text-center">
                    <th className="border-2 border-black p-1.5 w-24">Dates</th>
                    <th className="border-2 border-black p-1.5 w-20">N°Pièce</th>
                    <th className="border-2 border-black p-1.5 text-center">Dépenses</th>
                    <th colSpan={4} className="border-2 border-black p-1.5 text-center">Montants</th>
                  </tr>

                  {/* DÉPENSES ROWS */}
                  {currentSheetData.depenses.map((d) => (
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

                  {/* COMMISSION AGENCE ROW (YELLOW / GOLD: #fff200 / #fef08a) */}
                  <tr className="bg-[#fff200] text-black font-black text-center border-2 border-black">
                    <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black">
                      Commission Agence {currentSheetData.commissionRate}%
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
      )}

      {/* SYNTHESIS CARDS VIEW (All landlords overview) */}
      {activeView === 'CARDS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un bailleur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">{owners.length} Bailleurs Référencés</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {owners
              .filter((o) => `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((o) => {
                const initials = `${(o.firstName?.[0] || 'B').toUpperCase()}${(o.lastName?.[0] || '').toUpperCase()}`;
                const isCurrent = o.id === currentOwnerId;

                return (
                  <div
                    key={o.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{o.firstName} {o.lastName}</h3>
                          <p className="text-[10px] text-slate-400">{o.phone}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                        {o.commissionRatePercent ?? 10}% Com.
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <p>Mois actif : <strong>{selectedMonth} {selectedYear}</strong></p>
                      <p className="text-[11px] text-slate-500 truncate">{o.notes || 'Gestion immobilière Dakar'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentOwnerId(o.id);
                          setActiveView('SPREADSHEET');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Ouvrir Bordereau ({selectedMonth})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
