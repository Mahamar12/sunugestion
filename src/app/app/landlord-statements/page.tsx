'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { Owner } from '@/types/sunugestion';
import {
  Calendar,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Plus,
  X,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  CreditCard,
  Building2,
  Phone,
  UserCheck
} from 'lucide-react';

interface EncaissementRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montantHT: number;
  teomAmount: number;
  tvaAmount: number;
  tvlAmount: number;
}

interface DepenseRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montant: number;
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

  // Active Month: default to "Septembre" as requested in user's image
  const [selectedMonth, setSelectedMonth] = useState<string>('Septembre');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Selected Owner: default to Yangouba Barry (or first owner)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(() => {
    const barry = owners.find(
      (o) => o.lastName?.toLowerCase().includes('barry') || o.firstName?.toLowerCase().includes('yangouba')
    );
    return barry ? barry.id : (owners[0]?.id || '');
  });

  // Ensure selectedOwnerId is valid
  useEffect(() => {
    if (owners.length > 0 && (!selectedOwnerId || !owners.some((o) => o.id === selectedOwnerId))) {
      const barry = owners.find(
        (o) => o.lastName?.toLowerCase().includes('barry') || o.firstName?.toLowerCase().includes('yangouba')
      );
      setSelectedOwnerId(barry ? barry.id : owners[0].id);
    }
  }, [owners, selectedOwnerId]);

  const currentOwner = useMemo(() => {
    return owners.find((o) => o.id === selectedOwnerId) || owners[0] || {
      id: 'yangouba-barry',
      firstName: 'Yangouba',
      lastName: 'Barry',
      phone: '+221 77 412 88 90',
      whatsapp: '+221 77 412 88 90',
      email: 'yangouba.barry@gmail.com',
      commissionRatePercent: 10,
    };
  }, [owners, selectedOwnerId]);

  // Notifications
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Inline forms
  const [showAddEncForm, setShowAddEncForm] = useState(false);
  const [encDate, setEncDate] = useState('05/09/2026');
  const [encPiece, setEncPiece] = useState('261');
  const [encDesignation, setEncDesignation] = useState('');
  const [encMontantHT, setEncMontantHT] = useState<number>(150000);
  const [encTeom, setEncTeom] = useState<number>(5400);
  const [encTva, setEncTva] = useState<number>(0);
  const [encTvl, setEncTvl] = useState<number>(0);

  const [showAddDepForm, setShowAddDepForm] = useState(false);
  const [depDate, setDepDate] = useState('15/09/2026');
  const [depPiece, setDepPiece] = useState('');
  const [depDesignation, setDepDesignation] = useState('');
  const [depMontant, setDepMontant] = useState<number>(25000);

  // Modal PDF Preview (Full Sheet Viewer)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Custom added rows storage per owner-month-year
  const [manualStore, setManualStore] = useState<Record<string, {
    encaissements: EncaissementRow[];
    depenses: DepenseRow[];
  }>>(() => {
    // Exact data for Yangouba Barry on JUILLET 2026 from first image
    const yangoubaJuilletEnc: EncaissementRow[] = [
      { id: 'yj-1', date: '03/08/2026', pieceNumber: '253', designation: 'Studio RDC (Août)', montantHT: 110000, teomAmount: 3960, tvaAmount: 0, tvlAmount: 3040 },
      { id: 'yj-2', date: '05/08/2026', pieceNumber: '254', designation: 'Appartement 2eme gauche', montantHT: 175000, teomAmount: 6300, tvaAmount: 0, tvlAmount: 0 },
      { id: 'yj-3', date: '05/08/2026', pieceNumber: '256', designation: 'Appartement 3ème gauche', montantHT: 175000, teomAmount: 6300, tvaAmount: 0, tvlAmount: 4000 },
      { id: 'yj-4', date: '07/08/2026', pieceNumber: '257', designation: 'Magasin RDC', montantHT: 100000, teomAmount: 3600, tvaAmount: 18000, tvlAmount: 2500 },
      { id: 'yj-5', date: '07/08/2026', pieceNumber: '258', designation: 'Appartement 2eme droite', montantHT: 175000, teomAmount: 6300, tvaAmount: 0, tvlAmount: 4000 },
      { id: 'yj-6', date: '10/08/2026', pieceNumber: '259', designation: 'Appartement 4eme gauche', montantHT: 171000, teomAmount: 2000, tvaAmount: 0, tvlAmount: 0 },
      { id: 'yj-7', date: '11/08/2026', pieceNumber: '260', designation: 'Appartement 1er droite', montantHT: 175000, teomAmount: 6300, tvaAmount: 0, tvlAmount: 0 },
    ];

    const yangoubaJuilletDep: DepenseRow[] = [
      { id: 'yjd-1', date: '29/08/2026', pieceNumber: '', designation: 'Achat de madar', montant: 1210 },
      { id: 'yjd-2', date: '06/08/2026', pieceNumber: '', designation: 'Salaire gardien', montant: 100000 },
      { id: 'yjd-3', date: '17/08/2026', pieceNumber: '', designation: 'Woyofal Appartement 4eme', montant: 1500 },
      { id: 'yjd-4', date: '22/08/2026', pieceNumber: '', designation: 'Achat de canon App 3eme droite', montant: 5050 },
      { id: 'yjd-5', date: '24/08/2026', pieceNumber: '', designation: 'Facture Sonatel', montant: 34900 },
      { id: 'yjd-6', date: '25/08/2026', pieceNumber: '', designation: "Facture Sen'eau", montant: 80674 },
      { id: 'yjd-7', date: '27/08/2026', pieceNumber: '', designation: 'Achat de ciment', montant: 250 },
      { id: 'yjd-8', date: '27/08/2026', pieceNumber: '', designation: "Transport + main d'œuvre électricien (branchement courant App 3eme)", montant: 10100 },
      { id: 'yjd-9', date: '27/08/2026', pieceNumber: '', designation: 'Main d’œuvre demontage clim App 3eme droite', montant: 20200 },
      { id: 'yjd-10', date: '27/08/2026', pieceNumber: '', designation: 'Transport clim App 3eme', montant: 2020 },
    ];

    return {
      'yangouba-Juillet-2026': {
        encaissements: yangoubaJuilletEnc,
        depenses: yangoubaJuilletDep
      }
    };
  });

  const storeKey = useMemo(() => {
    const isBarry = currentOwner.firstName?.toLowerCase().includes('yangouba') || currentOwner.lastName?.toLowerCase().includes('barry');
    return `${isBarry ? 'yangouba' : currentOwner.id}-${selectedMonth}-${selectedYear}`;
  }, [currentOwner, selectedMonth, selectedYear]);

  // Compute live data:
  // "Dès que je fais un encaissement, ça doit figurer ici. Dès que je fais une dépense, ça doit figurer sur ce fichier."
  const { currentEncaissements, currentDepenses } = useMemo(() => {
    // 1. Check manual store first
    const saved = manualStore[storeKey];
    const manualEnc = saved?.encaissements || [];
    const manualDep = saved?.depenses || [];

    // 2. Extract live payments from app state for this owner & month
    const ownerProperties = properties.filter(
      (p) =>
        p.ownerId === currentOwner.id ||
        (p.ownerName && `${currentOwner.firstName} ${currentOwner.lastName}`.trim().toLowerCase() === p.ownerName.trim().toLowerCase())
    );
    const ownerPropertyNames = new Set(ownerProperties.map((p) => p.name.trim().toLowerCase()));
    const ownerPropertyIds = new Set(ownerProperties.map((p) => p.id));

    const monthNum = String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0');

    // Live payments matching this landlord and month
    const livePayments = payments.filter((pay) => {
      const matchOwner =
        (pay.propertyName && ownerPropertyNames.has(pay.propertyName.trim().toLowerCase())) ||
        leases.some((l) => l.id === pay.leaseId && (l.ownerId === currentOwner.id || ownerPropertyIds.has(l.propertyId)));

      const matchPeriod =
        (pay.periodMonthYear && pay.periodMonthYear.toLowerCase().includes(selectedMonth.toLowerCase())) ||
        (pay.date && (pay.date.includes(`-${monthNum}-`) || pay.date.includes(`/${monthNum}/`)));

      return matchOwner && matchPeriod;
    });

    const liveEncRows: EncaissementRow[] = livePayments.map((p, idx) => {
      const ht = Number(p.amountFCFA) || 0;
      return {
        id: `live-pay-${p.id}`,
        date: p.date || `05/${monthNum}/${selectedYear}`,
        pieceNumber: p.receiptNumber || String(260 + idx + 1),
        designation: `${p.tenantName} - ${p.propertyName} (${p.unitNumber || 'Lot'})`,
        montantHT: ht,
        teomAmount: Math.round(ht * 0.036),
        tvaAmount: 0,
        tvlAmount: 0
      };
    });

    // Live expenses matching this landlord and month
    const liveExpenses = expenses.filter((exp) => {
      const matchOwner =
        ownerPropertyIds.has(exp.propertyId) ||
        (exp.propertyName && ownerPropertyNames.has(exp.propertyName.trim().toLowerCase()));

      const matchMonth = exp.date && (exp.date.includes(`-${monthNum}-`) || exp.date.includes(`/${monthNum}/`));
      return matchOwner && matchMonth;
    });

    const liveDepRows: DepenseRow[] = liveExpenses.map((e) => ({
      id: `live-exp-${e.id}`,
      date: e.date,
      pieceNumber: e.receiptRef || '',
      designation: `${e.description} (${e.vendorName})`,
      montant: Number(e.amountFCFA) || 0
    }));

    // Merge manual entries and live entries
    const mergedEnc = [...manualEnc, ...liveEncRows];
    const mergedDep = [...manualDep, ...liveDepRows];

    return {
      currentEncaissements: mergedEnc,
      currentDepenses: mergedDep
    };
  }, [manualStore, storeKey, properties, currentOwner, payments, expenses, leases, selectedMonth, selectedYear]);

  // Calculations for Totals
  const totalMontantHT = useMemo(() => {
    return currentEncaissements.reduce((acc, r) => acc + (r.montantHT || 0), 0);
  }, [currentEncaissements]);

  const totalTEOM = useMemo(() => {
    return currentEncaissements.reduce((acc, r) => acc + (r.teomAmount || 0), 0);
  }, [currentEncaissements]);

  const totalTVA = useMemo(() => {
    return currentEncaissements.reduce((acc, r) => acc + (r.tvaAmount || 0), 0);
  }, [currentEncaissements]);

  const totalTVL = useMemo(() => {
    return currentEncaissements.reduce((acc, r) => acc + (r.tvlAmount || 0), 0);
  }, [currentEncaissements]);

  // Red row: "Location+ TEOM" (as requested in the user's latest image)
  const totalLocationPlusTeom = useMemo(() => {
    return totalMontantHT + totalTEOM + totalTVA + totalTVL;
  }, [totalMontantHT, totalTEOM, totalTVA, totalTVL]);

  // Total Dépenses brutes
  const totalRawDepenses = useMemo(() => {
    return currentDepenses.reduce((acc, r) => acc + (r.montant || 0), 0);
  }, [currentDepenses]);

  // Commission Agence 10%
  const commissionRate = currentOwner.commissionRatePercent ?? 10;
  const commissionAmount = useMemo(() => {
    if (totalMontantHT === 0) return 0;
    return Math.round(totalMontantHT * (commissionRate / 100));
  }, [totalMontantHT, commissionRate]);

  // Total Dépenses = Dépenses + Commission
  const totalDepenses = useMemo(() => {
    return totalRawDepenses + commissionAmount;
  }, [totalRawDepenses, commissionAmount]);

  // Montant à verser = Location+TEOM - Total Dépenses
  const montantAVerser = useMemo(() => {
    if (totalLocationPlusTeom === 0 && totalDepenses === 0) return 0;
    return Math.max(0, totalLocationPlusTeom - totalDepenses);
  }, [totalLocationPlusTeom, totalDepenses]);

  // Add Encaissement
  const handleSaveEncaissement = (e: React.FormEvent) => {
    e.preventDefault();
    const newRow: EncaissementRow = {
      id: `enc-${Date.now()}`,
      date: encDate,
      pieceNumber: encPiece,
      designation: encDesignation || 'Logement / Loyer',
      montantHT: Number(encMontantHT),
      teomAmount: Number(encTeom),
      tvaAmount: Number(encTva),
      tvlAmount: Number(encTvl)
    };

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: [...(prev[storeKey]?.encaissements || []), newRow],
        depenses: prev[storeKey]?.depenses || []
      }
    }));

    setShowAddEncForm(false);
    setEncDesignation('');
    setNotificationMsg(`Encaissement de ${Number(encMontantHT).toLocaleString('fr-FR')} CFA ajouté au bordereau !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Add Depense
  const handleSaveDepense = (e: React.FormEvent) => {
    e.preventDefault();
    const newRow: DepenseRow = {
      id: `dep-${Date.now()}`,
      date: depDate,
      pieceNumber: depPiece,
      designation: depDesignation || 'Dépense / Entretien',
      montant: Number(depMontant)
    };

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: prev[storeKey]?.encaissements || [],
        depenses: [...(prev[storeKey]?.depenses || []), newRow]
      }
    }));

    setShowAddDepForm(false);
    setDepDesignation('');
    setNotificationMsg(`Dépense de ${Number(depMontant).toLocaleString('fr-FR')} CFA ajoutée au bordereau !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Clear or reset month
  const handleResetMonth = () => {
    setManualStore((prev) => {
      const copy = { ...prev };
      delete copy[storeKey];
      return copy;
    });
    setNotificationMsg(`Mois de ${selectedMonth} réinitialisé.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const title = `Situation ${currentOwner.firstName} ${currentOwner.lastName} de ${selectedMonth} ${selectedYear}`;
    let csv = `${title}\n\n`;

    csv += 'Dates,N° Pièce,Désignations,Montants HT,TEOM,TVA 18%,TVL\n';
    currentEncaissements.forEach((e) => {
      csv += `"${e.date}","${e.pieceNumber}","${e.designation}",${e.montantHT},${e.teomAmount},${e.tvaAmount},${e.tvlAmount}\n`;
    });
    csv += `Total,,,${totalMontantHT},${totalTEOM},${totalTVA},${totalTVL}\n`;
    csv += `Location+ TEOM,,,${totalLocationPlusTeom}\n\n`;

    csv += 'Dates,N°Pièce,Dépenses,Montants\n';
    currentDepenses.forEach((d) => {
      csv += `"${d.date}","${d.pieceNumber}","${d.designation}",${d.montant}\n`;
    });
    csv += `Commission Agence ${commissionRate}%,,,${commissionAmount}\n`;
    csv += `Total Dépenses,,,${totalDepenses}\n`;
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
  };

  // Share WhatsApp
  const handleSendWhatsApp = () => {
    const phone = currentOwner.whatsapp || currentOwner.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const msg = `*Situation ${currentOwner.firstName} ${currentOwner.lastName} de ${selectedMonth} ${selectedYear}*
ETAT DU COMPTE

📊 *ENCAISSEMENTS :*
• Montants HT : ${totalMontantHT.toLocaleString('fr-FR')} CFA
• TEOM : ${totalTEOM.toLocaleString('fr-FR')} CFA
• TVA (18%) : ${totalTVA.toLocaleString('fr-FR')} CFA
• TVL : ${totalTVL.toLocaleString('fr-FR')} CFA
👉 *Location+ TEOM : ${totalLocationPlusTeom.toLocaleString('fr-FR')} CFA*

📊 *DÉPENSES :*
• Dépenses & Travaux : ${totalRawDepenses.toLocaleString('fr-FR')} CFA
• Commission Agence (${commissionRate}%) : ${commissionAmount.toLocaleString('fr-FR')} CFA
👉 *Total Dépenses : ${totalDepenses.toLocaleString('fr-FR')} CFA*

━━━━━━━━━━━━━━━━━━━━
💎 *MONTANT À VERSER : ${montantAVerser.toLocaleString('fr-FR')} CFA*
━━━━━━━━━━━━━━━━━━━━
Agence : ${organization?.name || 'SunuGestion Sénégal'}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Calculate total empty rows needed to match authentic grid appearance
  const encEmptyRowsCount = Math.max(12 - currentEncaissements.length, 4);
  const depEmptyRowsCount = Math.max(10 - currentDepenses.length, 3);

  return (
    <div className="p-2 sm:p-5 space-y-4 bg-slate-100 min-h-screen">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* TOP CONTROL BAR: BAILLEURS, MOIS (Janvier à Décembre) & ACTIONS */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Landlord Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Bailleur :
            </span>
            <select
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              className="text-xs font-black bg-blue-50 border-2 border-blue-600 text-blue-900 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.firstName} {o.lastName}
                </option>
              ))}
            </select>

            <span className="text-[11px] text-slate-500 hidden lg:inline">
              (Commission : <strong>{commissionRate}%</strong>)
            </span>
          </div>

          {/* Action Buttons: RELEVÉ PDF, EXPORT, AJOUTS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddEncForm(!showAddEncForm);
                setShowAddDepForm(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Encaissement</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddDepForm(!showAddDepForm);
                setShowAddEncForm(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Dépense</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Envoyer le relevé par WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              title="Télécharger en format Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            {/* THE REQUESTED BUTTON: RELEVÉ PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Imprimer ou enregistrer le Relevé PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Relevé PDF</span>
            </button>
          </div>
        </div>

        {/* 12 MONTHS TABS (DU MOIS DE JANVIER JUSQU'AU MOIS DE DECEMBRE) */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Sélectionnez le mois ({selectedYear}) :
            </span>
            <div className="flex items-center gap-1 font-normal text-slate-500">
              <button
                type="button"
                onClick={handleResetMonth}
                className="text-[11px] text-slate-400 hover:text-rose-600 underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1">
            {MONTHS_LIST.map((m) => {
              const isSelected = selectedMonth === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`py-1.5 px-1 text-center rounded-lg text-xs font-black transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102 ring-2 ring-blue-400/40'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inline Add Encaissement Form */}
      {showAddEncForm && (
        <form onSubmit={handleSaveEncaissement} className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3 text-xs animate-in fade-in no-print">
          <div className="flex items-center justify-between font-bold text-emerald-950 pb-1 border-b border-emerald-200">
            <span className="flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4 text-emerald-700" />
              Ajouter une ligne au tableau Encaissements :
            </span>
            <button type="button" onClick={() => setShowAddEncForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: 05/09/2026"
                value={encDate}
                onChange={(e) => setEncDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                N° Pièce
              </label>
              <input
                type="text"
                placeholder="ex: 261"
                value={encPiece}
                onChange={(e) => setEncPiece(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: Appartement 3ème droite"
                value={encDesignation}
                onChange={(e) => setEncDesignation(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                Montant hors taxe <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Montant HT"
                value={encMontantHT}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEncMontantHT(val);
                  setEncTeom(Math.round(val * 0.036));
                }}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                TOM
              </label>
              <input
                type="number"
                placeholder="TOM (TEOM)"
                value={encTeom}
                onChange={(e) => setEncTeom(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                TVA
              </label>
              <input
                type="number"
                placeholder="TVA 18%"
                value={encTva}
                onChange={(e) => setEncTva(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                TVL
              </label>
              <input
                type="number"
                placeholder="TVL"
                value={encTvl}
                onChange={(e) => setEncTvl(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <button
                type="submit"
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Inline Add Depense Form */}
      {showAddDepForm && (
        <form onSubmit={handleSaveDepense} className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-3 text-xs animate-in fade-in no-print">
          <div className="flex items-center justify-between font-bold text-rose-950 pb-1 border-b border-rose-200">
            <span className="flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4 text-rose-700" />
              Ajouter une ligne au tableau Dépenses :
            </span>
            <button type="button" onClick={() => setShowAddDepForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-rose-900 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: 15/09/2026"
                value={depDate}
                onChange={(e) => setDepDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-rose-900 mb-1">
                N° Pièce
              </label>
              <input
                type="text"
                placeholder="Optionnel (ex: Facture 42)"
                value={depPiece}
                onChange={(e) => setDepPiece(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-rose-900 mb-1">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: Réparation plomberie"
                value={depDesignation}
                onChange={(e) => setDepDesignation(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-bold text-rose-900 mb-1">
                Montant (CFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Montant en FCFA"
                value={depMontant}
                onChange={(e) => setDepMontant(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-6">
              <button
                type="submit"
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
              >
                Enregistrer la dépense
              </button>
            </div>
          </div>
        </form>
      )}

      {/* THE EXACT SPREADSHEET TABLE REPLICA AS REQUESTED BY THE USER */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-x-auto print:border-none print:shadow-none p-1 sm:p-3">
        <div className="min-w-[850px]">
          <table className="w-full border-collapse text-xs font-sans">
            {/* 1. TOP TITLE HEADER */}
            <thead>
              <tr>
                <th
                  colSpan={7}
                  className="border-2 border-black py-2 px-3 text-center text-sm font-black text-slate-900 bg-white tracking-wide"
                >
                  Situation {currentOwner.firstName} {currentOwner.lastName} de {selectedMonth} {selectedYear}
                </th>
                <th
                  className="border-2 border-black py-2 px-3 text-center text-xs font-black text-slate-900 bg-white w-44 uppercase tracking-wider"
                >
                  ETAT DU COMPTE
                </th>
              </tr>

              {/* 2. ENCAISSEMENTS TABLE HEADER */}
              <tr className="bg-white font-black text-slate-900 text-center">
                <th className="border-2 border-black p-1.5 w-24">Dates</th>
                <th className="border-2 border-black p-1.5 w-20">N° Pièce</th>
                <th className="border-2 border-black p-1.5 text-center">Désignations</th>
                <th className="border-2 border-black p-1.5 w-28 text-center">Montants HT</th>
                <th className="border-2 border-black p-1.5 w-24 text-center">TEOM</th>
                <th className="border-2 border-black p-1.5 w-24 text-center">TVA 18%</th>
                <th className="border-2 border-black p-1.5 w-24 text-center">TVL</th>

                {/* THE RIGHT COLUMN: ETAT DU COMPTE (Spanning from top to bottom) */}
                <th rowSpan={24} className="border-2 border-black p-3 align-top bg-white">
                  <div className="h-full flex flex-col justify-between text-left space-y-4">
                    <div className="border-b border-black pb-2 text-center">
                      <p className="font-black text-[11px] text-slate-900 uppercase">SYNTHÈSE DE GÉRANCE</p>
                      <p className="text-[10px] text-slate-500 font-medium">{selectedMonth} {selectedYear}</p>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Total Reçu :</span>
                        <span className="text-emerald-700">+{totalLocationPlusTeom.toLocaleString('fr-FR')} CFA</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Total Débours :</span>
                        <span className="text-rose-700">-{totalDepenses.toLocaleString('fr-FR')} CFA</span>
                      </div>
                      <div className="border-t border-black pt-1.5 flex justify-between font-black text-xs text-red-600">
                        <span>Net à reverser :</span>
                        <span>{montantAVerser.toLocaleString('fr-FR')} CFA</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-2 text-[10px] space-y-1">
                      <p className="font-bold text-slate-800">Bénéficiaire :</p>
                      <p className="font-medium text-slate-700">{currentOwner.firstName} {currentOwner.lastName}</p>
                      <p className="font-mono text-slate-500 text-[9px] truncate">
                        {currentOwner.bankAccount || 'Wave / OM / Virement'}
                      </p>
                    </div>

                    <div className="border-t border-slate-300 pt-3 text-[10px] text-center space-y-6">
                      <div>
                        <p className="font-bold text-slate-800">LE GESTIONNAIRE :</p>
                        <p className="text-[9px] text-slate-400 italic">Signature certifiée</p>
                        <div className="h-10" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">LE BAILLEUR :</p>
                        <p className="text-[9px] text-slate-400 italic">Bon pour décharge</p>
                        <div className="h-10" />
                      </div>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            {/* 3. ENCAISSEMENTS ROWS */}
            <tbody>
              {currentEncaissements.map((r) => (
                <tr key={r.id} className="text-slate-900 text-center hover:bg-slate-50">
                  <td className="border border-black p-1 text-[11px] font-medium">{r.date}</td>
                  <td className="border border-black p-1 text-[11px] font-mono">{r.pieceNumber}</td>
                  <td className="border border-black p-1 text-center font-medium">{r.designation}</td>
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

              {/* Empty rows to match authentic grid from user's image */}
              {Array.from({ length: encEmptyRowsCount }).map((_, i) => (
                <tr key={`enc-empty-${i}`} className="h-6">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
              ))}

              {/* TOTAL ROW (CYAN / SKY-BLUE: #00a2e8) */}
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
                  {totalTVA > 0 ? `${totalTVA.toLocaleString('fr-FR')} CFA` : ''}
                </td>
                <td className="border-2 border-black p-1.5 text-center font-black">
                  {totalTVL.toLocaleString('fr-FR')} CFA
                </td>
              </tr>

              {/* RED BANNER ROW: LOCATION+ TEOM (EXACT LABEL FROM USER'S IMAGE) */}
              <tr className="bg-[#ed1c24] text-black font-black border-2 border-black">
                <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black tracking-wide">
                  Location+ TEOM
                </td>
                <td colSpan={4} className="border-2 border-black p-1.5 text-center font-black text-xs sm:text-sm">
                  {totalLocationPlusTeom.toLocaleString('fr-FR')} CFA
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
              {currentDepenses.map((d) => (
                <tr key={d.id} className="text-slate-900 text-center hover:bg-slate-50">
                  <td className="border border-black p-1 text-[11px] font-medium">{d.date}</td>
                  <td className="border border-black p-1 text-[11px] font-mono">{d.pieceNumber}</td>
                  <td className="border border-black p-1 text-center font-medium">{d.designation}</td>
                  <td colSpan={4} className="border border-black p-1 text-center font-bold">
                    {d.montant > 0 ? `${d.montant.toLocaleString('fr-FR')} CFA` : ''}
                  </td>
                </tr>
              ))}

              {/* Empty rows to match authentic grid */}
              {Array.from({ length: depEmptyRowsCount }).map((_, i) => (
                <tr key={`dep-empty-${i}`} className="h-6">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td colSpan={4} className="border border-black p-1"></td>
                </tr>
              ))}

              {/* COMMISSION AGENCE ROW (YELLOW / GOLD: #fff200) */}
              <tr className="bg-[#fff200] text-black font-black text-center border-2 border-black">
                <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black">
                  Commission Agence {commissionRate}%
                </td>
                <td colSpan={4} className="border-2 border-black p-1.5 text-center font-black">
                  {commissionAmount.toLocaleString('fr-FR')} CFA
                </td>
              </tr>

              {/* TOTAL DÉPENSES ROW (CYAN / SKY-BLUE: #00a2e8) */}
              <tr className="bg-[#00a2e8] text-black font-black text-center border-2 border-black">
                <td colSpan={3} className="border-2 border-black p-1.5 text-center font-black">
                  Total Dépenses
                </td>
                <td colSpan={4} className="border-2 border-black p-1.5 text-center font-black">
                  {totalDepenses.toLocaleString('fr-FR')} CFA
                </td>
              </tr>

              {/* MONTANT À VERSER ROW (RED: #ed1c24) */}
              <tr className="bg-[#ed1c24] text-black font-black text-center border-2 border-black">
                <td colSpan={3} className="border-2 border-black p-2 text-center font-black text-xs sm:text-sm tracking-wide">
                  Montant à verser
                </td>
                <td colSpan={4} className="border-2 border-black p-2 text-center font-black text-xs sm:text-sm">
                  {montantAVerser.toLocaleString('fr-FR')} CFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
