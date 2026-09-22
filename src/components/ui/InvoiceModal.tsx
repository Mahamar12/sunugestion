'use client';

import React from 'react';
import { PaymentInvoice } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaymentInvoice | null;
}

export default function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6">
        
        {/* Modal Action Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Paiement Confirmé • Facture N° {invoice.invoice_number}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 space-y-8 bg-slate-900 text-slate-200">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-sm">
                  IS
                </div>
                <span className="text-xl font-black text-white">SunuGestion SaaS</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Plateforme SaaS Immobilière Afrique</p>
              <p className="text-xs text-slate-400">NINEA / RCCM : SN-DKR-2025-B-10928</p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Facture Officielle</span>
              <p className="text-sm font-mono font-bold text-white">{invoice.invoice_number}</p>
              <p className="text-xs text-slate-400">Date : {invoice.date}</p>
            </div>
          </div>

          {/* Agency Details */}
          <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-bold text-slate-400 uppercase block mb-1">Émis par :</span>
              <p className="font-bold text-white">SunuGestion Sénégal SARL</p>
              <p className="text-slate-400">Almadies, Route du Méridien, Dakar</p>
              <p className="text-slate-400">support@sunugestion.sn</p>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase block mb-1">Facturé à :</span>
              <p className="font-bold text-white">{invoice.agency_name}</p>
              <p className="text-slate-400">Réf Agence : {invoice.agency_id}</p>
              <p className="text-slate-400">Mode : {invoice.payment_method.toUpperCase().replace('_', ' ')}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Période</th>
                  <th className="p-3 text-right">Montant (XOF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-3">
                    <span className="font-bold text-white block">Abonnement SunuGestion SaaS - Forfait {invoice.plan_tier.toUpperCase()}</span>
                    <span className="text-slate-400 text-[11px]">Accès complet aux fonctionnalités de l'espace agence</span>
                  </td>
                  <td className="p-3 text-slate-300">1 Mois (30 jours)</td>
                  <td className="p-3 text-right font-mono font-bold text-white">{formatPrice(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-between items-end pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400 space-y-1">
              <p>ID Transaction : <span className="font-mono text-slate-200 font-semibold">{invoice.transaction_id}</span></p>
              <p className="text-[11px] text-emerald-400">Statut : PAYÉ ET VALIDE</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total TTC à payer</span>
              <span className="text-2xl font-black text-white font-mono">{formatPrice(invoice.amount)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
