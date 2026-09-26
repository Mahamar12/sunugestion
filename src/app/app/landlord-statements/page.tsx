'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  Calendar,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  RefreshCw,
  CreditCard,
  Banknote,
  UserCheck,
  Edit2,
  FileText,
  Check
} from 'lucide-react';

export interface EncaissementRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montantHT: number;
  teomAmount: number;
  tvaAmount: number;
  tvlAmount: number;
}

export interface DepenseRow {
  id: string;
  date: string;
  pieceNumber: string;
  designation: string;
  montant: number;
}

export interface VersementRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes?: string;
  status: 'VERSÉ' | 'PARTIEL' | 'EN_ATTENTE';
}

interface MonthStoreData {
  encaissements: EncaissementRow[];
  depenses: DepenseRow[];
  versement?: VersementRecord;
  isCustomized?: boolean;
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
      bankAccount: 'BHS SN079 01001 0001234567 89'
    };
  }, [owners, selectedOwnerId]);

  // Notifications
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Inline Add Forms
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

  // Modals for "Modifier"
  const [editingEncRow, setEditingEncRow] = useState<EncaissementRow | null>(null);
  const [editEncDate, setEditEncDate] = useState('');
  const [editEncPiece, setEditEncPiece] = useState('');
  const [editEncDesignation, setEditEncDesignation] = useState('');
  const [editEncMontantHT, setEditEncMontantHT] = useState<number>(0);
  const [editEncTeom, setEditEncTeom] = useState<number>(0);
  const [editEncTva, setEditEncTva] = useState<number>(0);
  const [editEncTvl, setEditEncTvl] = useState<number>(0);

  const [editingDepRow, setEditingDepRow] = useState<DepenseRow | null>(null);
  const [editDepDate, setEditDepDate] = useState('');
  const [editDepPiece, setEditDepPiece] = useState('');
  const [editDepDesignation, setEditDepDesignation] = useState('');
  const [editDepMontant, setEditDepMontant] = useState<number>(0);

  // Modals for "Option Versement" & "Reçu Décharge"
  const [isVersementModalOpen, setIsVersementModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [versDate, setVersDate] = useState('28/08/2026');
  const [versAmount, setVersAmount] = useState<number>(0);
  const [versMethod, setVersMethod] = useState('Virement bancaire');
  const [versReference, setVersReference] = useState('');
  const [versNotes, setVersNotes] = useState('');
  const [versStatus, setVersStatus] = useState<'VERSÉ' | 'PARTIEL' | 'EN_ATTENTE'>('VERSÉ');

  // Persistence: Custom added & modified rows storage per owner-month-year
  const [isHydrated, setIsHydrated] = useState(false);
  const [manualStore, setManualStore] = useState<Record<string, MonthStoreData>>(() => {
    // Default initial template data for Yangouba Barry on JUILLET 2026
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
        depenses: yangoubaJuilletDep,
        versement: {
          id: 'yj-vers-1',
          date: '28/08/2026',
          amount: 783296,
          paymentMethod: 'Virement bancaire',
          reference: 'VIR-BHS-2026-08',
          notes: 'Versement net après déduction des travaux et commission',
          status: 'VERSÉ'
        },
        isCustomized: true
      }
    };
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sunu_landlord_statements_store_v3');
      if (saved) {
        setManualStore(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('sunu_landlord_statements_store_v3', JSON.stringify(manualStore));
      } catch (e) {
        console.error(e);
      }
    }
  }, [manualStore, isHydrated]);

  const storeKey = useMemo(() => {
    const isBarry = currentOwner.firstName?.toLowerCase().includes('yangouba') || currentOwner.lastName?.toLowerCase().includes('barry');
    return `${isBarry ? 'yangouba' : currentOwner.id}-${selectedMonth}-${selectedYear}`;
  }, [currentOwner, selectedMonth, selectedYear]);

  // Compute live data merged with store
  const { currentEncaissements, currentDepenses } = useMemo(() => {
    const saved = manualStore[storeKey];
    if (saved && saved.isCustomized) {
      return {
        currentEncaissements: saved.encaissements || [],
        currentDepenses: saved.depenses || []
      };
    }

    const manualEnc = saved?.encaissements || [];
    const manualDep = saved?.depenses || [];

    // Extract live payments from app state for this owner & month
    const ownerProperties = properties.filter(
      (p) =>
        p.ownerId === currentOwner.id ||
        (p.ownerName && `${currentOwner.firstName} ${currentOwner.lastName}`.trim().toLowerCase() === p.ownerName.trim().toLowerCase())
    );
    const ownerPropertyNames = new Set(ownerProperties.map((p) => p.name.trim().toLowerCase()));
    const ownerPropertyIds = new Set(ownerProperties.map((p) => p.id));
    const monthNum = String(MONTHS_LIST.indexOf(selectedMonth) + 1).padStart(2, '0');

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

    return {
      currentEncaissements: [...manualEnc, ...liveEncRows],
      currentDepenses: [...manualDep, ...liveDepRows]
    };
  }, [manualStore, storeKey, properties, currentOwner, payments, expenses, leases, selectedMonth, selectedYear]);

  // Current Versement
  const currentVersement = manualStore[storeKey]?.versement;

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

  // Red row: "Location+ TEOM"
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

  // Solde restant dû au bailleur (après déduction du versement)
  const soldeRestant = useMemo(() => {
    if (!currentVersement) return montantAVerser;
    return Math.max(0, montantAVerser - currentVersement.amount);
  }, [montantAVerser, currentVersement]);

  // ADD ENCAISSEMENT
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
        encaissements: [...currentEncaissements, newRow],
        depenses: currentDepenses,
        versement: prev[storeKey]?.versement,
        isCustomized: true
      }
    }));

    setShowAddEncForm(false);
    setEncDesignation('');
    setNotificationMsg(`Encaissement de ${Number(encMontantHT).toLocaleString('fr-FR')} CFA ajouté !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // ADD DÉPENSE
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
        encaissements: currentEncaissements,
        depenses: [...currentDepenses, newRow],
        versement: prev[storeKey]?.versement,
        isCustomized: true
      }
    }));

    setShowAddDepForm(false);
    setDepDesignation('');
    setNotificationMsg(`Dépense de ${Number(depMontant).toLocaleString('fr-FR')} CFA ajoutée !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // START EDIT ENCAISSEMENT
  const handleStartEditEnc = (row: EncaissementRow) => {
    setEditingEncRow(row);
    setEditEncDate(row.date);
    setEditEncPiece(row.pieceNumber);
    setEditEncDesignation(row.designation);
    setEditEncMontantHT(row.montantHT);
    setEditEncTeom(row.teomAmount);
    setEditEncTva(row.tvaAmount);
    setEditEncTvl(row.tvlAmount);
  };

  // SAVE EDITED ENCAISSEMENT
  const handleSaveEditedEnc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEncRow) return;

    const updatedList = currentEncaissements.map((r) =>
      r.id === editingEncRow.id
        ? {
            ...r,
            date: editEncDate,
            pieceNumber: editEncPiece,
            designation: editEncDesignation,
            montantHT: Number(editEncMontantHT),
            teomAmount: Number(editEncTeom),
            tvaAmount: Number(editEncTva),
            tvlAmount: Number(editEncTvl)
          }
        : r
    );

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: updatedList,
        depenses: currentDepenses,
        versement: prev[storeKey]?.versement,
        isCustomized: true
      }
    }));

    setEditingEncRow(null);
    setNotificationMsg("Ligne d'encaissement modifiée avec succès !");
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // DELETE ENCAISSEMENT
  const handleDeleteEnc = (id: string) => {
    if (!confirm("Voulez-vous supprimer cette ligne d'encaissement ?")) return;
    const updatedList = currentEncaissements.filter((r) => r.id !== id);

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: updatedList,
        depenses: currentDepenses,
        versement: prev[storeKey]?.versement,
        isCustomized: true
      }
    }));

    setEditingEncRow(null);
    setNotificationMsg('Ligne supprimée.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // START EDIT DÉPENSE
  const handleStartEditDep = (row: DepenseRow) => {
    setEditingDepRow(row);
    setEditDepDate(row.date);
    setEditDepPiece(row.pieceNumber);
    setEditDepDesignation(row.designation);
    setEditDepMontant(row.montant);
  };

  // SAVE EDITED DÉPENSE
  const handleSaveEditedDep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepRow) return;

    const updatedList = currentDepenses.map((d) =>
      d.id === editingDepRow.id
        ? {
            ...d,
            date: editDepDate,
            pieceNumber: editDepPiece,
            designation: editDepDesignation,
            montant: Number(editDepMontant)
          }
        : d
    );

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: currentEncaissements,
        depenses: updatedList,
        versement: prev[storeKey]?.versement,
        isCustomized: true
      }
    }));

    setEditingDepRow(null);
    setNotificationMsg('Dépense modifiée avec succès !');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // DELETE DÉPENSE
  const handleDeleteDep = (id: string) => {
    if (!confirm('Voulez-vous supprimer cette dépense ?')) return;
    const updatedList = currentDepenses.filter((d) => d.id !== id);

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: currentEncaissements,
        depenses: updatedList,
        versement: prev[storeKey]?.versement,
        isCustomized: true
      }
    }));

    setEditingDepRow(null);
    setNotificationMsg('Dépense supprimée.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // OPEN VERSEMENT MODAL
  const handleOpenVersementModal = () => {
    if (currentVersement) {
      setVersDate(currentVersement.date);
      setVersAmount(currentVersement.amount);
      setVersMethod(currentVersement.paymentMethod);
      setVersReference(currentVersement.reference || '');
      setVersNotes(currentVersement.notes || '');
      setVersStatus(currentVersement.status);
    } else {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      setVersDate(`${dd}/${mm}/${yyyy}`);
      setVersAmount(montantAVerser);
      setVersMethod('Virement bancaire');
      setVersReference(`VIR-${currentOwner.lastName?.toUpperCase() || 'BAILLEUR'}-${selectedMonth.substring(0, 3).toUpperCase()}`);
      setVersNotes(`Versement net des loyers de ${selectedMonth} ${selectedYear}`);
      setVersStatus('VERSÉ');
    }
    setIsVersementModalOpen(true);
  };

  // SAVE VERSEMENT
  const handleSaveVersement = (e: React.FormEvent) => {
    e.preventDefault();
    const versementData: VersementRecord = {
      id: currentVersement?.id || `vers-${Date.now()}`,
      date: versDate,
      amount: Number(versAmount),
      paymentMethod: versMethod,
      reference: versReference,
      notes: versNotes,
      status: versStatus
    };

    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: currentEncaissements,
        depenses: currentDepenses,
        versement: versementData,
        isCustomized: true
      }
    }));

    setIsVersementModalOpen(false);
    setNotificationMsg(`Versement de ${Number(versAmount).toLocaleString('fr-FR')} CFA enregistré avec succès !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // DELETE VERSEMENT
  const handleDeleteVersement = () => {
    if (!confirm('Voulez-vous supprimer ce versement ?')) return;
    setManualStore((prev) => ({
      ...prev,
      [storeKey]: {
        encaissements: currentEncaissements,
        depenses: currentDepenses,
        versement: undefined,
        isCustomized: true
      }
    }));
    setIsVersementModalOpen(false);
    setNotificationMsg('Versement supprimé.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // RESET MONTH
  const handleResetMonth = () => {
    if (!confirm(`Réinitialiser les données de ${selectedMonth} ${selectedYear} ?`)) return;
    setManualStore((prev) => {
      const copy = { ...prev };
      delete copy[storeKey];
      return copy;
    });
    setNotificationMsg(`Mois de ${selectedMonth} réinitialisé.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // EXPORT CSV
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
    if (currentVersement) {
      csv += `Versement (${currentVersement.date} - ${currentVersement.paymentMethod}),,,${currentVersement.amount}\n`;
      csv += `Solde restant,,,${soldeRestant}\n`;
    }

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

  // SHARE WHATSAPP
  const handleSendWhatsApp = () => {
    const phone = currentOwner.whatsapp || currentOwner.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const versMsg = currentVersement
      ? `\n💳 *VERSEMENT EFFECTUÉ :* ${currentVersement.amount.toLocaleString('fr-FR')} CFA\n• Date : ${currentVersement.date} (${currentVersement.paymentMethod})\n• Solde restant : ${soldeRestant.toLocaleString('fr-FR')} CFA`
      : `\n⏳ *VERSEMENT :* En attente`;

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
💎 *MONTANT À VERSER : ${montantAVerser.toLocaleString('fr-FR')} CFA*${versMsg}
━━━━━━━━━━━━━━━━━━━━
Agence : ${organization?.name || 'SunuGestion Sénégal'}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Calculate total empty rows needed to match authentic grid appearance
  const encEmptyRowsCount = Math.max(10 - currentEncaissements.length, 3);
  const depEmptyRowsCount = Math.max(8 - currentDepenses.length, 2);

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

          {/* Action Buttons: AJOUTS, MODIFIER, VERSEMENT, RELEVÉ PDF */}
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

            {/* THE REQUESTED: OPTION VERSEMENT BUTTON */}
            <button
              type="button"
              onClick={handleOpenVersementModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              title="Enregistrer ou modifier le versement au bailleur"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Option Versement</span>
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

            {/* RELEVÉ PDF BUTTON */}
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
                title="Rétablir les données d'origine"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Réinitialiser ce mois</span>
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
        <div className="min-w-[850px] flex border-2 border-black">
          {/* LEFT: MAIN BORDEREAU SPREADSHEET */}
          <div className="flex-1">
            <table className="w-full border-collapse text-xs font-sans">
              <thead>
                {/* 1. TOP TITLE HEADER */}
                <tr>
                  <th
                    colSpan={8}
                    className="border-b-2 border-black py-2 px-3 text-center text-sm font-black text-slate-900 bg-white tracking-wide"
                  >
                    Situation {currentOwner.firstName} {currentOwner.lastName} de {selectedMonth} {selectedYear}
                  </th>
                </tr>

                {/* 2. ENCAISSEMENTS TABLE HEADER */}
                <tr className="bg-white font-black text-slate-900 text-center border-b-2 border-black">
                  <th className="border-r-2 border-black py-1.5 px-2 w-24">Dates</th>
                  <th className="border-r-2 border-black py-1.5 px-2 w-20">N° Pièce</th>
                  <th className="border-r-2 border-black py-1.5 px-2 text-center">Désignations</th>
                  <th className="border-r-2 border-black py-1.5 px-2 w-28 text-center">Montants HT</th>
                  <th className="border-r-2 border-black py-1.5 px-2 w-24 text-center">TEOM</th>
                  <th className="border-r-2 border-black py-1.5 px-2 w-24 text-center">TVA 18%</th>
                  <th className="border-r-2 border-black py-1.5 px-2 w-24 text-center">TVL</th>
                  <th className="py-1.5 px-2 w-16 text-center text-[10px] text-blue-800 print:hidden">Action</th>
                </tr>
              </thead>

              {/* 3. ENCAISSEMENTS ROWS */}
              <tbody>
                {currentEncaissements.map((r) => (
                  <tr key={r.id} className="text-slate-900 text-center hover:bg-slate-50 border-b border-black">
                    <td className="border-r border-black py-1 px-1.5 text-[11px] font-medium">{r.date}</td>
                    <td className="border-r border-black py-1 px-1.5 text-[11px] font-mono">{r.pieceNumber}</td>
                    <td className="border-r border-black py-1 px-2 text-center font-medium">{r.designation}</td>
                    <td className="border-r border-black py-1 px-1.5 text-center font-bold">
                      {r.montantHT > 0 ? `${r.montantHT.toLocaleString('fr-FR')} CFA` : ''}
                    </td>
                    <td className="border-r border-black py-1 px-1.5 text-center font-medium">
                      {r.teomAmount > 0 ? `${r.teomAmount.toLocaleString('fr-FR')} CFA` : ''}
                    </td>
                    <td className="border-r border-black py-1 px-1.5 text-center font-medium">
                      {r.tvaAmount > 0 ? `${r.tvaAmount.toLocaleString('fr-FR')} CFA` : ''}
                    </td>
                    <td className="border-r border-black py-1 px-1.5 text-center font-medium">
                      {r.tvlAmount > 0 ? `${r.tvlAmount.toLocaleString('fr-FR')} CFA` : ''}
                    </td>
                    <td className="py-1 px-1 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleStartEditEnc(r)}
                        className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-[10px] font-bold rounded border border-blue-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Modifier cette ligne d'encaissement"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Modif.</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Empty rows to match authentic grid from user's image */}
                {Array.from({ length: encEmptyRowsCount }).map((_, i) => (
                  <tr key={`enc-empty-${i}`} className="h-6 border-b border-black">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1 print:hidden"></td>
                  </tr>
                ))}

                {/* TOTAL ROW (CYAN / SKY-BLUE: #00a2e8) */}
                <tr className="bg-[#00a2e8] text-black font-black text-center border-y-2 border-black">
                  <td colSpan={3} className="border-r-2 border-black py-1 px-2 text-center font-black">
                    Total
                  </td>
                  <td className="border-r-2 border-black py-1 px-1.5 text-center font-black">
                    {totalMontantHT.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="border-r-2 border-black py-1 px-1.5 text-center font-black">
                    {totalTEOM.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="border-r-2 border-black py-1 px-1.5 text-center font-black">
                    {totalTVA > 0 ? `${totalTVA.toLocaleString('fr-FR')} CFA` : ''}
                  </td>
                  <td className="border-r-2 border-black py-1 px-1.5 text-center font-black">
                    {totalTVL.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="p-1 print:hidden"></td>
                </tr>

                {/* RED BANNER ROW: LOCATION+ TEOM (EXACT LABEL FROM USER'S IMAGE) */}
                <tr className="bg-[#ed1c24] text-black font-black border-b-2 border-black">
                  <td colSpan={3} className="border-r-2 border-black py-1 px-2 text-center font-black tracking-wide">
                    Location+ TEOM
                  </td>
                  <td colSpan={4} className="border-r-2 border-black py-1 px-2 text-center font-black text-xs sm:text-sm">
                    {totalLocationPlusTeom.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="p-1 print:hidden"></td>
                </tr>

                {/* 4. DÉPENSES TABLE HEADER */}
                <tr className="bg-white font-black text-slate-900 text-center border-b-2 border-black">
                  <th className="border-r-2 border-black py-1.5 px-2 w-24">Dates</th>
                  <th className="border-r-2 border-black py-1.5 px-2 w-20">N°Pièce</th>
                  <th className="border-r-2 border-black py-1.5 px-2 text-center">Dépenses</th>
                  <th colSpan={4} className="border-r-2 border-black py-1.5 px-2 text-center">Montants</th>
                  <th className="py-1.5 px-2 w-16 text-center text-[10px] text-rose-800 print:hidden">Action</th>
                </tr>

                {/* DÉPENSES ROWS */}
                {currentDepenses.map((d) => (
                  <tr key={d.id} className="text-slate-900 text-center hover:bg-slate-50 border-b border-black">
                    <td className="border-r border-black py-1 px-1.5 text-[11px] font-medium">{d.date}</td>
                    <td className="border-r border-black py-1 px-1.5 text-[11px] font-mono">{d.pieceNumber}</td>
                    <td className="border-r border-black py-1 px-2 text-center font-medium">{d.designation}</td>
                    <td colSpan={4} className="border-r border-black py-1 px-2 text-center font-bold">
                      {d.montant > 0 ? `${d.montant.toLocaleString('fr-FR')} CFA` : ''}
                    </td>
                    <td className="py-1 px-1 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => handleStartEditDep(d)}
                        className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-[10px] font-bold rounded border border-rose-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Modifier cette dépense"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Modif.</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Empty rows to match authentic grid */}
                {Array.from({ length: depEmptyRowsCount }).map((_, i) => (
                  <tr key={`dep-empty-${i}`} className="h-6 border-b border-black">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td colSpan={4} className="border-r border-black p-1"></td>
                    <td className="p-1 print:hidden"></td>
                  </tr>
                ))}

                {/* COMMISSION AGENCE ROW (YELLOW / GOLD: #fff200) */}
                <tr className="bg-[#fff200] text-black font-black text-center border-y-2 border-black">
                  <td colSpan={3} className="border-r-2 border-black py-1 px-2 text-center font-black">
                    Commission Agence {commissionRate}%
                  </td>
                  <td colSpan={4} className="border-r-2 border-black py-1 px-2 text-center font-black">
                    {commissionAmount.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="p-1 print:hidden"></td>
                </tr>

                {/* TOTAL DÉPENSES ROW (CYAN / SKY-BLUE: #00a2e8) */}
                <tr className="bg-[#00a2e8] text-black font-black text-center border-b-2 border-black">
                  <td colSpan={3} className="border-r-2 border-black py-1 px-2 text-center font-black">
                    Total Dépenses
                  </td>
                  <td colSpan={4} className="border-r-2 border-black py-1 px-2 text-center font-black">
                    {totalDepenses.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="p-1 print:hidden"></td>
                </tr>

                {/* MONTANT À VERSER ROW (RED: #ed1c24) */}
                <tr className="bg-[#ed1c24] text-black font-black text-center border-b border-black">
                  <td colSpan={3} className="border-r-2 border-black py-1.5 px-2 text-center font-black text-xs sm:text-sm tracking-wide">
                    Montant à verser
                  </td>
                  <td colSpan={4} className="border-r-2 border-black py-1.5 px-2 text-center font-black text-xs sm:text-sm">
                    {montantAVerser.toLocaleString('fr-FR')} CFA
                  </td>
                  <td className="p-1 print:hidden"></td>
                </tr>

                {/* VERSEMENT EFFECTUÉ ROW (GREEN IF RECORDED) */}
                {currentVersement && (
                  <>
                    <tr className="bg-emerald-100 text-emerald-950 font-bold text-center border-b border-black">
                      <td colSpan={3} className="border-r-2 border-black py-1.5 px-2 text-center font-black text-xs">
                        Versement effectué le {currentVersement.date} ({currentVersement.paymentMethod})
                        {currentVersement.reference ? ` - Réf: ${currentVersement.reference}` : ''}
                      </td>
                      <td colSpan={4} className="border-r-2 border-black py-1.5 px-2 text-center font-black text-xs text-emerald-800">
                        - {currentVersement.amount.toLocaleString('fr-FR')} CFA
                      </td>
                      <td className="p-1 print:hidden"></td>
                    </tr>
                    <tr className={`text-black font-black text-center ${soldeRestant === 0 ? 'bg-slate-100' : 'bg-amber-100'}`}>
                      <td colSpan={3} className="border-r-2 border-black py-1.5 px-2 text-center font-black text-xs">
                        Solde restant dû au bailleur
                      </td>
                      <td colSpan={4} className={`border-r-2 border-black py-1.5 px-2 text-center font-black text-xs ${soldeRestant === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {soldeRestant === 0 ? '0 CFA (COMPTE SOLDÉ ✓)' : `${soldeRestant.toLocaleString('fr-FR')} CFA`}
                      </td>
                      <td className="p-1 print:hidden"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* RIGHT: ETAT DU COMPTE COLUMN */}
          <div className="w-52 sm:w-60 border-l-2 border-black flex flex-col bg-white">
            <div className="border-b-2 border-black py-2 px-2 text-center text-xs font-black text-slate-900 bg-white uppercase tracking-wider">
              ETAT DU COMPTE
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between text-left space-y-3">
              <div className="border-b border-black pb-2 text-center">
                <p className="font-black text-[11px] text-slate-900 uppercase">SYNTHÈSE DE GÉRANCE</p>
                <p className="text-[10px] text-slate-500 font-medium">{selectedMonth} {selectedYear}</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
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

              {/* SUIVI DU VERSEMENT AU BAILLEUR */}
              <div className="border-t-2 border-black pt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[10px] text-slate-900 uppercase">SUIVI VERSEMENT</span>
                  {currentVersement ? (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] rounded border border-emerald-300">
                      {currentVersement.status === 'VERSÉ' ? 'RÉGLÉ ✓' : currentVersement.status}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-black text-[9px] rounded border border-amber-300">
                      EN ATTENTE
                    </span>
                  )}
                </div>

                {currentVersement ? (
                  <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 text-[10px] space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Versé :</span>
                      <span className="text-emerald-700 font-black">
                        {currentVersement.amount.toLocaleString('fr-FR')} CFA
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[9px]">
                      <span>Date :</span>
                      <span>{currentVersement.date}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[9px]">
                      <span>Mode :</span>
                      <span className="font-semibold">{currentVersement.paymentMethod}</span>
                    </div>
                    {currentVersement.reference && (
                      <div className="flex justify-between text-slate-500 text-[9px] truncate">
                        <span>Réf :</span>
                        <span className="font-mono">{currentVersement.reference}</span>
                      </div>
                    )}
                    <div className="border-t border-emerald-200 pt-1 flex justify-between font-bold text-[10px]">
                      <span>Solde restant :</span>
                      <span className={soldeRestant === 0 ? 'text-emerald-700' : 'text-amber-700'}>
                        {soldeRestant.toLocaleString('fr-FR')} CFA
                      </span>
                    </div>

                    <div className="pt-1 flex gap-1 print:hidden">
                      <button
                        type="button"
                        onClick={handleOpenVersementModal}
                        className="flex-1 py-1 text-center bg-white hover:bg-slate-50 text-indigo-700 font-bold border border-indigo-200 rounded text-[9px] cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="flex-1 py-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[9px] cursor-pointer shadow-xs"
                      >
                        Reçu Décharge
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-1 print:hidden">
                    <button
                      type="button"
                      onClick={handleOpenVersementModal}
                      className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black rounded-lg text-[10px] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Banknote className="w-3 h-3" />
                      <span>Enregistrer Versement</span>
                    </button>
                  </div>
                )}
              </div>

              {/* BÉNÉFICIAIRE & COMPTE */}
              <div className="border-t border-slate-300 pt-2 text-[10px] space-y-0.5">
                <p className="font-bold text-slate-800">Bénéficiaire :</p>
                <p className="font-medium text-slate-700">{currentOwner.firstName} {currentOwner.lastName}</p>
                <p className="font-mono text-slate-500 text-[9px] truncate">
                  {currentOwner.bankAccount || currentOwner.phone || 'Wave / Orange Money'}
                </p>
              </div>

              {/* SIGNATURES */}
              <div className="border-t border-slate-300 pt-2 text-[10px] text-center space-y-4">
                <div>
                  <p className="font-bold text-slate-800">LE GESTIONNAIRE :</p>
                  <p className="text-[9px] text-slate-400 italic">Signature certifiée</p>
                  <div className="h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">LE BAILLEUR :</p>
                  <p className="text-[9px] text-slate-400 italic">Bon pour décharge</p>
                  <div className="h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: MODIFIER ENCAISSEMENT */}
      {editingEncRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 no-print animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between font-black text-sm">
              <span className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier la ligne d&apos;encaissement
              </span>
              <button
                type="button"
                onClick={() => setEditingEncRow(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedEnc} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editEncDate}
                    onChange={(e) => setEditEncDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    N° Pièce
                  </label>
                  <input
                    type="text"
                    value={editEncPiece}
                    onChange={(e) => setEditEncPiece(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Désignation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editEncDesignation}
                  onChange={(e) => setEditEncDesignation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Montant hors taxe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editEncMontantHT}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditEncMontantHT(val);
                      setEditEncTeom(Math.round(val * 0.036));
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-black text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    TOM (3,6%)
                  </label>
                  <input
                    type="number"
                    value={editEncTeom}
                    onChange={(e) => setEditEncTeom(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    TVA 18%
                  </label>
                  <input
                    type="number"
                    value={editEncTva}
                    onChange={(e) => setEditEncTva(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    TVL
                  </label>
                  <input
                    type="number"
                    value={editEncTvl}
                    onChange={(e) => setEditEncTvl(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteEnc(editingEncRow.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEncRow(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MODIFIER DÉPENSE */}
      {editingDepRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 no-print animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between font-black text-sm">
              <span className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier la ligne de dépense
              </span>
              <button
                type="button"
                onClick={() => setEditingDepRow(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedDep} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editDepDate}
                    onChange={(e) => setEditDepDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    N° Pièce
                  </label>
                  <input
                    type="text"
                    value={editDepPiece}
                    onChange={(e) => setEditDepPiece(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Désignation de la dépense <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDepDesignation}
                  onChange={(e) => setEditDepDesignation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Montant (CFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={editDepMontant}
                  onChange={(e) => setEditDepMontant(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-black text-xs text-rose-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteDep(editingDepRow.id)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDepRow(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: OPTION VERSEMENT AU BAILLEUR */}
      {isVersementModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 no-print animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between font-black text-sm">
              <span className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Option Versement au Bailleur
              </span>
              <button
                type="button"
                onClick={() => setIsVersementModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVersement} className="p-5 space-y-4 text-xs">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-2 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Bailleur</span>
                  <span className="font-black text-slate-900 text-xs">
                    {currentOwner.firstName} {currentOwner.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Période</span>
                  <span className="font-black text-slate-900 text-xs">
                    {selectedMonth} {selectedYear}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-indigo-100 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Net calculé à reverser :</span>
                  <span className="font-black text-red-600 text-sm">
                    {montantAVerser.toLocaleString('fr-FR')} CFA
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Montant du Versement (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={versAmount}
                    onChange={(e) => setVersAmount(Number(e.target.value))}
                    className="w-full p-2.5 border-2 border-indigo-200 rounded-lg font-black text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Date du Versement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="JJ/MM/AAAA"
                    value={versDate}
                    onChange={(e) => setVersDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Mode de règlement
                  </label>
                  <select
                    value={versMethod}
                    onChange={(e) => setVersMethod(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Wave">Wave</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Référence / N° Pièce / N° Chèque
                  </label>
                  <input
                    type="text"
                    placeholder="ex: VIR-BHS-2026-08"
                    value={versReference}
                    onChange={(e) => setVersReference(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Statut du versement
                  </label>
                  <select
                    value={versStatus}
                    onChange={(e) => setVersStatus(e.target.value as 'VERSÉ' | 'PARTIEL' | 'EN_ATTENTE')}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="VERSÉ">VERSÉ (Réglement intégral)</option>
                    <option value="PARTIEL">PARTIEL (Acompte / Reliquat)</option>
                    <option value="EN_ATTENTE">EN ATTENTE (À exécuter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Compte / Coordonnées bénéficiaire
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentOwner.bankAccount || currentOwner.phone || 'Non renseigné'}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Notes / Observations pour la décharge
                </label>
                <textarea
                  rows={2}
                  value={versNotes}
                  onChange={(e) => setVersNotes(e.target.value)}
                  placeholder="ex: Règlement par virement bancaire du solde net des loyers de Juillet après déduction de la commission d'agence."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {currentVersement ? (
                  <button
                    type="button"
                    onClick={handleDeleteVersement}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVersementModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider le versement</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REÇU OFFICIEL DE DÉCHARGE DE VERSEMENT */}
      {isReceiptModalOpen && currentVersement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-300">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between font-black text-sm no-print">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Reçu de Décharge de Versement
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CONTENT */}
            <div className="p-6 sm:p-8 space-y-6 font-sans text-slate-900 bg-white">
              {/* Header Agency */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {organization?.name || 'SAMA GESTION IMMOBILIÈRE'}
                  </h2>
                  <p className="text-xs text-slate-600">Cabinet de Gérance, Transactions & Syndic de Copropriété</p>
                  <p className="text-xs text-slate-500">Dakar, Sénégal • Tél : +221 77 412 88 90</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-black text-xs uppercase">
                    Décharge Officielle
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Réf : {currentVersement.reference || `REC-${Date.now().toString().slice(-6)}`}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2 bg-slate-50 border border-slate-300 rounded-lg">
                <h3 className="text-base font-black uppercase tracking-wide text-slate-900">
                  REÇU DE DÉCHARGE DE VERSEMENT DE LOYERS
                </h3>
                <p className="text-xs font-bold text-blue-700">
                  Période de gérance : {selectedMonth} {selectedYear}
                </p>
              </div>

              {/* Landlord & Payment details */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-black p-4 rounded-lg bg-white">
                <div className="space-y-1.5">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Bénéficiaire (Propriétaire / Bailleur) :</p>
                  <p className="font-black text-sm text-slate-900">{currentOwner.firstName} {currentOwner.lastName}</p>
                  <p className="text-slate-600">Tél : {currentOwner.phone || 'Non renseigné'}</p>
                  <p className="text-slate-600 font-mono text-[11px]">Compte : {currentOwner.bankAccount || 'Wave / OM'}</p>
                </div>
                <div className="space-y-1.5 border-l border-slate-300 pl-4">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Modalités du versement :</p>
                  <p className="font-bold text-slate-900">Date : <strong>{currentVersement.date}</strong></p>
                  <p className="font-bold text-slate-900">Mode : <strong>{currentVersement.paymentMethod}</strong></p>
                  <p className="font-mono text-slate-700 text-[11px]">Réf transaction : {currentVersement.reference || 'N/A'}</p>
                </div>
              </div>

              {/* Amount Highlight */}
              <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Montant Net Versé au Bailleur</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                  {currentVersement.amount.toLocaleString('fr-FR')} FCFA
                </p>
                {currentVersement.notes && (
                  <p className="text-xs text-slate-600 italic pt-1">{currentVersement.notes}</p>
                )}
              </div>

              {/* Financial Recap */}
              <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 bg-slate-50">
                <p className="font-black text-[11px] text-slate-800 uppercase border-b border-slate-200 pb-1">Détail du Relevé de Compte :</p>
                <div className="flex justify-between text-slate-700">
                  <span>Total Loyers & Charges encaissés :</span>
                  <span className="font-bold">+{totalLocationPlusTeom.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Dépenses, travaux & débours déductibles :</span>
                  <span className="font-bold text-rose-700">-{totalRawDepenses.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Commission d&apos;agence ({commissionRate}%) :</span>
                  <span className="font-bold text-rose-700">-{commissionAmount.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="border-t border-slate-300 pt-1 flex justify-between font-black text-slate-900">
                  <span>Solde restant dû après ce versement :</span>
                  <span className={soldeRestant === 0 ? 'text-emerald-700' : 'text-amber-700'}>
                    {soldeRestant === 0 ? '0 CFA (COMPTE SOLDÉ ✓)' : `${soldeRestant.toLocaleString('fr-FR')} CFA`}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-black text-center text-xs">
                <div>
                  <p className="font-black text-slate-900 uppercase">LE GESTIONNAIRE</p>
                  <p className="text-[10px] text-slate-500 italic">Signature & Cachet de l&apos;Agence</p>
                  <div className="h-16" />
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase">LE BAILLEUR</p>
                  <p className="text-[10px] text-slate-500 italic">Bon pour décharge & acquit</p>
                  <div className="h-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
