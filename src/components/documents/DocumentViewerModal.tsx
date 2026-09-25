'use client';

import React from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { AppDocument } from '@/types/sunugestion';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Check,
  CreditCard,
  MapPin,
  User,
  Share2,
  Phone,
  FileCheck
} from 'lucide-react';
import { numberToWordsFR } from '@/lib/utils';

interface DocumentViewerModalProps {
  document: AppDocument;
  onClose: () => void;
}

export default function DocumentViewerModal({ document: doc, onClose }: DocumentViewerModalProps) {
  const { organization } = useSunuGestion();

  const handlePrint = () => {
    window.print();
  };

  // Safe data extraction for Quittance / Receipt
  const metadata = doc.metadata || {};
  const receiptNum = metadata.receiptNumber || doc.id || `QUIT-${Date.now()}`;

  // Month / Period
  const periodMonthYear =
    metadata.periodMonthYear ||
    (() => {
      try {
        const d = new Date(doc.date);
        const m = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return m.charAt(0).toUpperCase() + m.slice(1);
      } catch (e) {
        return 'Septembre 2026';
      }
    })();

  // Date formatter helper (e.g. 2026-09-01 -> 01/09/2026)
  function formatDateFR(str?: string) {
    if (!str) return '';
    if (str.includes('/')) return str;
    try {
      const parts = str.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('fr-FR');
      }
    } catch (e) {}
    return str;
  }

  // Payment Date
  const paymentDate = metadata.paymentDate || doc.date || new Date().toISOString().split('T')[0];

  // Period Start and End Dates (Commençant le ... Finissant le ...)
  const periodStartDate = metadata.periodStartDate || '2026-09-01';
  const periodEndDate = metadata.periodEndDate || '2026-09-30';
  const dueDate = metadata.dueDate || `Du ${formatDateFR(periodStartDate)} au ${formatDateFR(periodEndDate)}`;

  // Tenant & Property
  const tenantName = doc.tenantName || 'Locataire';
  const tenantPhone = metadata.tenantPhone || '';
  const propertyName = doc.propertyName || metadata.propertyName || 'Bien Immobilier Dakar';
  const unitNumber = metadata.unitNumber || 'Logement';
  const ownerName = doc.ownerName || metadata.ownerName || 'Propriétaire Bailleur';
  const paymentMethod = metadata.method || metadata.paymentMethod || 'WAVE';
  const referenceNumber = metadata.referenceNumber || 'N/A';
  const amountFCFA = Number(doc.amountFCFA || 0);

  const amountInWords = numberToWordsFR(amountFCFA);

  // WhatsApp share link generator
  const handleWhatsAppShare = () => {
    const cleanPhone = tenantPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('221')
      ? cleanPhone
      : cleanPhone.length === 9
      ? `221${cleanPhone}`
      : '221770000000';

    const methodText = paymentMethod === 'ESPECES' ? 'Espèces (Comptant)' : `${paymentMethod} (Réf : ${referenceNumber})`;

    const msg = `*QUITTANCE DE LOYER OFFICIELLE*\nAgence : ${organization.name}\n\nBonjour M./Mme *${tenantName}*,\nNous confirmons la bonne réception de votre paiement de loyer pour :\n\n- *Période / Échéance* : Commençant le ${formatDateFR(periodStartDate)} — Finissant le ${formatDateFR(periodEndDate)}\n- *Mois* : ${periodMonthYear}\n- *Bien / Logement* : ${propertyName} (${unitNumber})\n- *Montant réglé* : ${amountFCFA.toLocaleString('fr-FR')} FCFA\n- *Mode de règlement* : ${methodText}\n- *Date de paiement* : ${formatDateFR(paymentDate)}\n- *N° Quittance* : ${receiptNum}\n- *Solde restant* : 0 FCFA (Entièrement soldé)\n\nMerci pour votre ponctualité !\n${organization.name} - ${organization.phone}`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{doc.title}</h3>
              <p className="text-[11px] text-slate-400">
                Quittance N° {receiptNum} • {periodMonthYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doc.category === 'QUITTANCE' && (
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                title="Envoyer la quittance au locataire par WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-4 sm:p-8 bg-slate-100/70 font-sans text-slate-800" id="printable-area">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 max-w-2xl mx-auto space-y-6">
            {/* Header: Agence Branding + Legal IDs */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    SG
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{organization.name}</h1>
                </div>
                <p className="text-[11px] font-bold text-blue-600 tracking-wide uppercase mt-1">
                  Gestion Immobilière & Syndic Professionnel
                </p>
                <p className="text-xs text-slate-600 mt-2">{organization.address}, {organization.city || 'Dakar'}</p>
                <p className="text-xs text-slate-600">Tél: {organization.phone} • Email: {organization.email}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  NINEA : {organization.ninea || '004928192 2G3'} • RCCM : {organization.rccm || 'SN.DKR.2024.B.1293'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  QUITTANCE LIBÉRATOIRE
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-2">
                  RÉF : {receiptNum}
                </p>
                <p className="text-xs text-slate-500">
                  Délivrée le {paymentDate} à Dakar
                </p>
              </div>
            </div>

            {/* Document Body: Quittance de Loyer */}
            {doc.category === 'QUITTANCE' && (
              <div className="space-y-5">
                {/* Title */}
                <div className="text-center py-2 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                    QUITTANCE DE LOYER & REÇU DE PAIEMENT
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Attestation officielle de règlement locatif intégral
                  </p>
                </div>

                {/* 3 Key Dates Banner: Month, Due Dates Range, Payment Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Mois / Période de Loyer
                    </span>
                    <strong className="text-sm font-black text-blue-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{periodMonthYear}</span>
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Terme de location</span>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Date d'Échéance (Période)
                    </span>
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">Commençant le :</span>
                        <strong className="font-extrabold text-slate-900">{formatDateFR(periodStartDate)}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-medium">Finissant le :</span>
                        <strong className="font-extrabold text-slate-900">{formatDateFR(periodEndDate)}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold block">Période d'occupation couverte</span>
                  </div>

                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Date de Paiement
                    </span>
                    <strong className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{formatDateFR(paymentDate)}</span>
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold block">Encaissé avec succès</span>
                  </div>
                </div>

                {/* Parties Details Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Bailleur / Agence */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bailleur & Propriété
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{ownerName}</p>
                    <p className="text-slate-600 text-xs">
                      Représenté par l'Agence <strong>{organization.name}</strong>
                    </p>
                    <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-700">{propertyName}</span>
                    </div>
                  </div>

                  {/* Locataire */}
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      Locataire Bénéficiaire
                    </span>
                    <p className="font-extrabold text-blue-900 text-sm flex items-center gap-1">
                      <User className="w-4 h-4 text-blue-700" />
                      <span>{tenantName}</span>
                    </p>
                    <p className="text-slate-700 text-xs font-bold">
                      Logement : <span className="text-blue-700 font-black">{unitNumber}</span>
                    </p>
                    {tenantPhone && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{tenantPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3">Désignation</th>
                        <th className="p-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">
                            Loyer principal — {periodMonthYear}
                          </p>
                          <p className="text-[10px] text-slate-400">{propertyName} • {unitNumber}</p>
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-800">
                          {amountFCFA.toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-slate-600">Charges communes & prestations</td>
                        <td className="p-3 text-right text-slate-600 font-medium">Incluses (0 FCFA)</td>
                      </tr>
                      <tr className="bg-emerald-50/80 border-t-2 border-emerald-600">
                        <td className="p-3">
                          <strong className="text-emerald-950 font-black text-sm block">
                            TOTAL PAYÉ & ENCAISSÉ
                          </strong>
                          <span className="text-[10px] text-emerald-800 font-medium">
                            {paymentMethod === 'ESPECES' ? (
                              <span>Règlement en Espèces (Paiement comptant en caisse • Sans référence)</span>
                            ) : (
                              <span>
                                Règlement par {paymentMethod} {referenceNumber && referenceNumber !== 'N/A' && `(Réf : ${referenceNumber})`}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <strong className="text-emerald-700 font-black text-lg">
                            {amountFCFA.toLocaleString('fr-FR')} FCFA
                          </strong>
                        </td>
                      </tr>
                      <tr className="bg-slate-50 text-[11px]">
                        <td className="p-2.5 text-slate-500">Solde restant dû au titre de ce mois</td>
                        <td className="p-2.5 text-right font-black text-emerald-600">
                          0 FCFA (Entièrement soldé)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Amount in Words */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Montant arrêté en toutes lettres :
                  </span>
                  <p className="font-bold text-slate-900 italic mt-0.5">
                    « {amountInWords} »
                  </p>
                </div>

                {/* Legal Discharge Clause */}
                <div className="text-[10px] text-slate-500 italic border-l-2 border-emerald-600 pl-3 py-1 leading-relaxed">
                  Cette quittance annule tous les reçus provisoires délivrés précédemment et vaut décharge pleine et entière du paiement du loyer et des charges pour la période susmentionnée, sous réserve de tout encaissement effectif. Elle ne vaut pas présomption de paiement pour les termes postérieurs.
                </div>
              </div>
            )}

            {/* Other Document Categories (Relance, Contrat...) */}
            {doc.category === 'RELANCE' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="text-center py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <h2 className="text-lg font-black text-amber-800 tracking-wide uppercase">
                    LETTRE DE RELANCE — LOYER EN RETARD
                  </h2>
                </div>
                <p>Objet : <strong>Rappel d'échéance de loyer non réglé</strong></p>
                <p>Cher(e) <strong>{tenantName}</strong>,</p>
                <p>
                  Sauf erreur ou omission de notre part, nous constatons que votre loyer du bien{' '}
                  <strong>{propertyName}</strong> pour un montant de{' '}
                  <strong className="text-rose-600">{amountFCFA.toLocaleString('fr-FR')} FCFA</strong> n'a pas encore été crédité.
                </p>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-semibold text-center">
                  Montant total exigible : {amountFCFA.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            )}

            {doc.category === 'CONTRAT' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="text-center py-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <h2 className="text-lg font-black text-blue-900 tracking-wide uppercase">
                    CONTRAT DE BAIL À USAGE D'HABITATION
                  </h2>
                </div>
                <p>Entre l'Agence <strong>{organization.name}</strong> et le locataire <strong>{tenantName}</strong> pour le bien <strong>{propertyName}</strong> ({unitNumber}).</p>
                <p>Loyer mensuel : <strong>{amountFCFA.toLocaleString('fr-FR')} FCFA</strong> / mois payable avant le 5 de chaque mois.</p>
              </div>
            )}

            {/* Stamp & Certified Signature Section */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <p className="font-bold text-slate-700">Le Locataire</p>
                <p className="text-[10px] text-slate-400">Pour acquit et décharge</p>
                <div className="h-16 mt-2 border border-dashed border-slate-300 rounded-xl w-40 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                  {tenantName}
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-700">Pour l'Agence {organization.name}</p>
                <p className="text-[10px] text-slate-400">Cachet officiel & signature autorisée</p>

                {/* Professional Certified Round Stamp */}
                <div className="mt-2 inline-flex items-center gap-3">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-600/80 p-1 flex flex-col items-center justify-center text-center bg-emerald-50/30 rotate-[-4deg] shadow-sm">
                    <span className="text-[7px] font-black text-emerald-800 tracking-tighter uppercase">
                      ★ SUNUGESTION SÉNÉGAL ★
                    </span>
                    <span className="text-[9px] font-black text-emerald-700 uppercase my-0.5">
                      ACQUITTÉ
                    </span>
                    <span className="text-[6.5px] font-bold text-slate-600">
                      {paymentDate}
                    </span>
                    <span className="text-[6px] text-emerald-800 font-bold uppercase tracking-widest mt-0.5">
                      VISA DIRECTION
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
