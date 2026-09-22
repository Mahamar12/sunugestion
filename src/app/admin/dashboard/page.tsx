'use client';

import React, { useState } from 'react';
import { useSunuGestion } from '@/context/SunuGestionContext';
import { ShieldCheck, Building2, Users, Crown, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const { saasPlans } = useSunuGestion();
  const [agencies, setAgencies] = useState([
    { id: '1', name: 'Sunu Gestionbilier Dakar', plan: 'PRO', status: 'ACTIVE', properties: 18, mrr: 15000, date: '15/01/2026' },
    { id: '2', name: 'Agence Immobilier Cap Vert', plan: 'STARTER', status: 'ACTIVE', properties: 6, mrr: 5000, date: '02/02/2026' },
    { id: '3', name: 'Teranga Real Estate Senegal', plan: 'BUSINESS', status: 'ACTIVE', properties: 42, mrr: 30000, date: '10/03/2026' },
    { id: '4', name: 'Dakar Prestige Immobilier', plan: 'PRO', status: 'SUSPENDED', properties: 12, mrr: 15000, date: '20/04/2026' },
  ]);

  const toggleAgencyStatus = (id: string) => {
    setAgencies((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: a.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
          };
        }
        return a;
      })
    );
  };

  const totalAgencies = agencies.length;
  const activeAgencies = agencies.filter((a) => a.status === 'ACTIVE').length;
  const totalMRR = agencies.reduce((acc, a) => acc + (a.status === 'ACTIVE' ? a.mrr : 0), 0);
  const totalProps = agencies.reduce((acc, a) => acc + a.properties, 0);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Super Admin Top Header */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-3xl font-black">Super Admin Platform — SunuGestion</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervision globale du SaaS multi-tenant, abonnements agences & croissance MRR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 rounded-xl text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Revenu Mensuel SaaS (MRR)</span>
            <strong className="text-xl font-black text-emerald-400">{totalMRR.toLocaleString('fr-FR')} FCFA / mo</strong>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Agences Immatriculées</span>
          <div className="text-2xl font-black text-slate-900">{totalAgencies} Agences</div>
          <span className="text-[10px] text-emerald-600 font-bold">{activeAgencies} actives</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Parc Immobiliers Total</span>
          <div className="text-2xl font-black text-slate-900">{totalProps} Biens</div>
          <span className="text-[10px] text-slate-400">Gérés sur la plateforme</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Taux de Rétention</span>
          <div className="text-2xl font-black text-emerald-600">96.5%</div>
          <span className="text-[10px] text-slate-400">Croissance continue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Abonnements Pro & Business</span>
          <div className="text-2xl font-black text-purple-700">75%</div>
          <span className="text-[10px] text-purple-600 font-bold">Plans premium</span>
        </div>
      </div>

      {/* Agencies Directory & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b pb-3">Agences Immobilières Inscrites</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3.5">Nom de l'Agence</th>
                <th className="p-3.5">Plan SaaS</th>
                <th className="p-3.5">Revenu MRR</th>
                <th className="p-3.5">Biens Gérés</th>
                <th className="p-3.5">Inauguration</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Action Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agencies.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{a.name}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                      {a.plan}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-700">{a.mrr.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-3.5 font-semibold text-slate-800">{a.properties} biens</td>
                  <td className="p-3.5 text-slate-500">{a.date}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => toggleAgencyStatus(a.id)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        a.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {a.status === 'ACTIVE' ? 'Suspendre' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
