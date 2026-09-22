'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSunuGestion } from '@/context/SunuGestionContext';
import {
  Building2,
  MapPin,
  Home,
  UserCheck,
  CreditCard,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Plus
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params?.id as string;
  const { properties, units, tenants, maintenanceTickets, expenses } = useSunuGestion();

  const property = properties.find((p) => p.id === propertyId) || properties[0];
  const propertyUnits = units.filter((u) => u.propertyId === property.id || u.propertyName === property.name);
  const propertyTickets = maintenanceTickets.filter((t) => t.propertyId === property.id || t.propertyName === property.name);
  const propertyExpenses = expenses.filter((e) => e.propertyId === property.id || e.propertyName === property.name);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/properties"
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des biens</span>
        </Link>
      </div>

      {/* Hero Property Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        <div className="h-64 lg:h-auto relative bg-slate-100">
          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">
            {property.type}
          </div>
        </div>

        <div className="p-6 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900">{property.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                property.status === 'OCCUPE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {property.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{property.address}, {property.neighborhood} ({property.city})</span>
            </p>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{property.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Propriétaire</span>
              <strong className="text-slate-900">{property.ownerName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Logements</span>
              <strong className="text-slate-900">{property.occupiedUnits} / {property.totalUnits} Occupés</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Valeur estimée</span>
              <strong className="text-emerald-700 font-bold">{(property.valuationFCFA / 1000000).toFixed(0)}M FCFA</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Taux occupation</span>
              <strong className="text-blue-700 font-bold">
                {property.totalUnits > 0 ? Math.round((property.occupiedUnits / property.totalUnits) * 100) : 100}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Units Table Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-600" /> Logements & Unités rattachés
          </h2>
          <Link href="/app/units" className="text-xs font-bold text-blue-600 hover:underline">
            Gérer logements
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3">Numéro / N° Unit</th>
                <th className="p-3">Type</th>
                <th className="p-3">Étage</th>
                <th className="p-3">Superficie</th>
                <th className="p-3">Loyer Mensuel</th>
                <th className="p-3">Locataire Actuel</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyUnits.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{u.unitNumber}</td>
                  <td className="p-3 text-slate-600">{u.type}</td>
                  <td className="p-3 text-slate-600">{u.floor}</td>
                  <td className="p-3 text-slate-600">{u.surfaceM2} m² ({u.roomsCount} pièces)</td>
                  <td className="p-3 font-bold text-emerald-700">{u.rentFCFA.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-3 font-semibold text-slate-800">{u.tenantName || 'Aucun (Vacant)'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'OCCUPE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
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
