'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 space-y-12">
      <div className="max-w-xl mx-auto space-y-6 text-center pt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400">
          <Building2 className="w-4 h-4" /> SunuGestion
        </Link>

        <h1 className="text-3xl font-black text-white">Contactez l'Équipe SunuGestion</h1>
        <p className="text-xs text-slate-400">Des questions sur la plateforme ? Notre équipe commerciale à Dakar est à votre écoute.</p>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-left space-y-4 text-xs">
          {sent ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-center">
              Message envoyé avec succès ! Nous vous recontacterons sous 24h.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nom Complet</label>
                <input type="text" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" required />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email / Téléphone</label>
                <input type="text" className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" required />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Message</label>
                <textarea rows={4} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" required />
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg">
                Envoyer le Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
