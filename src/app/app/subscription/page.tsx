'use client';

import React from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { Crown, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export default function SubscriptionPage() {
  const { organization, saasPlans } = useSunuGestion();

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Active Plan Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Plan Actuel : {organization.subscriptionPlan}
          </span>
          <h1 className="text-3xl font-black mt-3">Abonnement SunuGestion {organization.subscriptionPlan}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Votre espace de travail est actif jusqu'au 31 Décembre 2026. Facturation mensuelle en FCFA.
          </p>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-right">
          <span className="text-xs text-slate-300 block">Quota Biens Utilisés</span>
          <span className="text-2xl font-black text-white">4 / 50 Biens</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {saasPlans.map((plan) => {
          const isCurrent = organization.subscriptionPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between relative transition-all ${
                isCurrent ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm">
                  Populaire
                </span>
              )}

              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-lg">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {plan.priceMonthlyFCFA.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">FCFA / mois</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                {isCurrent ? (
                  <button disabled className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                    Plan Actif
                  </button>
                ) : (
                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                    Changer pour ce plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
