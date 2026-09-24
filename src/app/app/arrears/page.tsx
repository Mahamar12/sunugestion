'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  AlertTriangle,
  Send,
  MessageSquare,
  Phone,
  Mail,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  X
} from 'lucide-react';

export default function ArrearsPage() {
  const { arrears, sendRelance, setSelectedDocumentForPrint } = useSunuGestion();
  const [filterAging, setFilterAging] = useState<string>('ALL');
  const [selectedArrear, setSelectedArrear] = useState<any | null>(null);
  const [relanceChannel, setRelanceChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [relanceMessage, setRelanceMessage] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const filteredArrears = arrears.filter((a) => {
    if (filterAging === 'ALL') return true;
    return a.agingCategory === filterAging;
  });

  const handleOpenRelanceModal = (arrear: any) => {
    setSelectedArrear(arrear);
    setRelanceMessage(
      `Bonjour M./Mme ${arrear.tenantName}, sauf erreur de notre part, votre loyer pour le logement ${arrear.unitNumber} (${arrear.propertyName}) d'un montant de ${arrear.overdueAmountFCFA.toLocaleString('fr-FR')} FCFA présente un retard de ${arrear.daysOverdue} jours. Merci de régulariser via Wave, Orange Money ou virement. Agence SunuGestion.`
    );
  };

  const handleSendRelanceSubmit = () => {
    if (!selectedArrear) return;
    const name = selectedArrear.tenantName;
    const channel = relanceChannel;
    sendRelance(selectedArrear.id, relanceChannel);
    setSelectedArrear(null);
    setNotificationMsg(`Relance envoyée par ${channel} à ${name} avec succès !`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Impayés & Relances</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {arrears.length} Retards Actifs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des retards de paiement, classement par ancienneté (1-7j, 8-30j, 31-60j, +60j) et relances multicanaux.
          </p>
        </div>
      </div>

      {/* Aging Filters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'ALL', label: 'Tous les retards', count: arrears.length },
          { id: '1-7_JOURS', label: '1 à 7 jours', count: arrears.filter((a) => a.agingCategory === '1-7_JOURS').length },
          { id: '8-30_JOURS', label: '8 à 30 jours', count: arrears.filter((a) => a.agingCategory === '8-30_JOURS').length },
          { id: '31-60_JOURS', label: '31 à 60 jours', count: arrears.filter((a) => a.agingCategory === '31-60_JOURS').length },
          { id: 'PLUS_60_JOURS', label: '+60 jours', count: arrears.filter((a) => a.agingCategory === 'PLUS_60_JOURS').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterAging(f.id)}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
              filterAging === f.id
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{f.label}</span>
            <span className={`text-base font-black mt-0.5 ${filterAging === f.id ? 'text-white' : 'text-rose-600'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Arrears List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-4">Locataire</th>
                <th className="p-4">Téléphone / WhatsApp</th>
                <th className="p-4">Bien & Logement</th>
                <th className="p-4">Montant Dû (FCFA)</th>
                <th className="p-4">Nombre de Jours de Retard</th>
                <th className="p-4">Dernière Relance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArrears.map((a) => (
                <tr key={a.id} className="hover:bg-rose-50/40">
                  <td className="p-4 font-bold text-slate-900">{a.tenantName}</td>
                  <td className="p-4 font-semibold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {a.tenantPhone}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{a.unitNumber}</p>
                    <p className="text-[10px] text-slate-500">{a.propertyName}</p>
                  </td>
                  <td className="p-4 font-black text-rose-600 text-sm">
                    {a.overdueAmountFCFA.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded font-extrabold bg-rose-100 text-rose-800">
                      {a.daysOverdue} jours
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {a.remindersSentCount > 0 ? `${a.remindersSentCount} relances (${a.lastReminderDate})` : 'Aucune relance'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRelanceModal(a)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer Relance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relance Modal */}
      {selectedArrear && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Relance - {selectedArrear.tenantName}</h3>
                <p className="text-xs text-rose-600 font-semibold">{selectedArrear.overdueAmountFCFA.toLocaleString('fr-FR')} FCFA en retard</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArrear(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Canal de Relance</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'WHATSAPP', label: 'WhatsApp' },
                    { id: 'SMS', label: 'SMS' },
                    { id: 'EMAIL', label: 'Email' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRelanceChannel(c.id as any)}
                      className={`p-2 rounded-lg font-bold border transition-all ${
                        relanceChannel === c.id
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Professionnel de Relance</label>
                <textarea
                  rows={4}
                  value={relanceMessage}
                  onChange={(e) => setRelanceMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedArrear(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSendRelanceSubmit}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer la Relance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
