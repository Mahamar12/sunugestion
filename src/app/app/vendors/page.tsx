'use client';

import React from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { UserCog, Phone, MessageSquare, MapPin, Wrench } from 'lucide-react';

export default function VendorsPage() {
  const { vendors } = useSunuGestion();

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Répertoire des Prestataires & Artisans</h1>
        <p className="text-xs text-slate-500 mt-1">
          Plombiers, Électriciens, Frigoristes, Serruriers et techniciens référencés à Dakar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((v) => (
          <div key={v.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{v.name}</h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  {v.trade}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {v.phone}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {v.zone}
              </p>
              <p className="font-bold text-emerald-700">
                Tarif horaire moyen: {v.hourlyRateFCFA.toLocaleString('fr-FR')} FCFA / h
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <a
                href={`tel:${v.phone}`}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Appel
              </a>
              <a
                href={`https://wa.me/${v.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
