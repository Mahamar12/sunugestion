'use client';

import React from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { AppDocument } from '@/types/sunugestion';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface DocumentViewerModalProps {
  document: AppDocument;
  onClose: () => void;
}

export default function DocumentViewerModal({ document: doc, onClose }: DocumentViewerModalProps) {
  const { organization } = useSunuGestion();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{doc.title}</h3>
              <p className="text-[11px] text-slate-400">Catégorie: {doc.category} • Date: {doc.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-10 bg-slate-50 min-h-[550px] font-sans text-slate-800" id="printable-area">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto space-y-6">
            {/* Header with Agency Branding */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-2xl font-black text-blue-900 tracking-tight">{organization.name}</h1>
                <p className="text-xs text-slate-500 font-medium">SUNUGESTION — La gestion immobilière, simplement.</p>
                <p className="text-xs text-slate-600 mt-2">{organization.address}, {organization.city}</p>
                <p className="text-xs text-slate-600">Tél: {organization.phone} • Email: {organization.email}</p>
                <p className="text-[10px] text-slate-400 mt-1">NINEA: {organization.ninea} | RCCM: {organization.rccm}</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {doc.category}
                </div>
                <p className="text-xs text-slate-400 mt-2">N° Document: {doc.id}</p>
                <p className="text-xs text-slate-500">Fait à Dakar, le {doc.date}</p>
              </div>
            </div>

            {/* Document Body depending on Category */}
            {doc.category === 'QUITTANCE' && (
              <div className="space-y-5">
                <div className="text-center py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h2 className="text-lg font-black text-emerald-800 tracking-wide uppercase">QUITTANCE DE LOYER</h2>
                  <p className="text-xs text-emerald-700 font-medium">Preuve de paiement libératoire</p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Je soussigné, gérant de l'agence <strong>{organization.name}</strong>, reconnaît avoir reçu de M./Mme{' '}
                  <strong className="text-blue-900">{doc.tenantName}</strong> la somme de :
                </p>

                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-3xl font-black text-emerald-600 tracking-tight">
                    {(doc.amountFCFA || 430000).toLocaleString('fr-FR')} FCFA
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">
                    (Somme réglée intégralement et sans réserve)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium block">Désignation du bien:</span>
                    <strong className="text-slate-800">{doc.propertyName || 'Résidence Les Almadies'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Période concernée:</span>
                    <strong className="text-slate-800">Mois d'Août 2026</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Mode de règlement:</span>
                    <strong className="text-emerald-700 font-bold">Wave Mobile Money / Virement</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Statut du solde:</span>
                    <strong className="text-emerald-600 font-bold">SOLDE REGLÉ (0 FCFA restant)</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic border-l-2 border-blue-600 pl-3 py-1">
                  Cette quittance annule tous les reçus provisoires délivrés précédemment et vaut décharge pour la période susmentionnée.
                </div>
              </div>
            )}

            {doc.category === 'RELANCE' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="text-center py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <h2 className="text-lg font-black text-amber-800 tracking-wide uppercase">LETTRE DE RELANCE — LOYER EN RETARD</h2>
                </div>

                <p>
                  Objet : <strong>Rappel d'échéance de loyer non réglé</strong>
                </p>

                <p>Cher(e) <strong>{doc.tenantName}</strong>,</p>

                <p>
                  Sauf erreur ou omission de notre part, nous constatons que votre loyer du bien{' '}
                  <strong>{doc.propertyName}</strong> pour un montant de{' '}
                  <strong className="text-rose-600">{(doc.amountFCFA || 215000).toLocaleString('fr-FR')} FCFA</strong> n'a pas encore été crédité à ce jour.
                </p>

                <p>
                  Nous vous prions de bien vouloir régulariser cette situation dans les plus brefs délais via Wave, Orange Money ou virement bancaire sur le compte de l'agence.
                </p>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-semibold text-center">
                  Montant total dû : {(doc.amountFCFA || 215000).toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            )}

            {doc.category === 'CONTRAT' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="text-center py-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <h2 className="text-lg font-black text-blue-900 tracking-wide uppercase">CONTRAT DE BAIL A USAGE D'HABITATION</h2>
                </div>

                <p>Entre les soussignés :</p>
                <p><strong>L'AGENCE :</strong> {organization.name}, agissant au nom et pour le compte du propriétaire.</p>
                <p><strong>LE LOCATAIRE :</strong> {doc.tenantName}.</p>
                <p><strong>LE BIEN :</strong> {doc.propertyName}, Dakar, Sénégal.</p>
                <p><strong>LOYER MENSUEL :</strong> {(doc.amountFCFA || 400000).toLocaleString('fr-FR')} FCFA / mois payable avant le 5 de chaque mois.</p>
              </div>
            )}

            {/* Stamp & Signature Section */}
            <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-700">Le Locataire</p>
                <p className="text-[10px] text-slate-400">Lu et approuvé</p>
                <div className="h-16 mt-2 border border-dashed border-slate-200 rounded-lg w-40 flex items-center justify-center text-[10px] text-slate-400">
                  Signature
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-700">Pour l'Agence {organization.name}</p>
                <p className="text-[10px] text-slate-400">Cachet officiel & signature</p>
                <div className="h-16 mt-2 border-2 border-blue-600/30 rounded-lg w-44 bg-blue-50/50 flex flex-col items-center justify-center p-2 text-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-[9px] font-bold text-blue-900 uppercase">SUNUGESTION SÉNÉGAL</span>
                  <span className="text-[8px] text-blue-700">DOCUMENT OFFICIEL CERTIFIÉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
