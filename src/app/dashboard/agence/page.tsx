'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { INITIAL_PROPERTIES, INITIAL_VISITS, INITIAL_AGENCIES } from '@/lib/data';
import { Property, PropertyStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { 
  Building2, 
  PlusCircle, 
  Eye, 
  MessageSquare, 
  PhoneCall, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function AgencyDashboardPage() {
  const agency = INITIAL_AGENCIES[0]; // Teranga Prestige
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES.filter(p => p.agency_id === agency.id));
  const [visits, setVisits] = useState(INITIAL_VISITS.filter(v => v.agency_id === agency.id));

  // Compute stats totals
  const totalViews = properties.reduce((acc, p) => acc + p.views_count, 0);
  const totalWhatsappClicks = properties.reduce((acc, p) => acc + p.whatsapp_clicks, 0);
  const totalCallClicks = properties.reduce((acc, p) => acc + p.call_clicks, 0);
  const totalFavorites = properties.reduce((acc, p) => acc + p.favorites_count, 0);

  const handleStatusChange = (propertyId: string, newStatus: PropertyStatus) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Agency Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0">
            <Image src={agency.logo} alt={agency.name} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">{agency.name}</h1>
              {agency.verified && (
                <span title="Agence vérifiée SunuGestion">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Abonnement : <span className="text-brand-300 font-bold uppercase">{agency.plan}</span> • {agency.city}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/tarifs"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
          >
            Gérer mon Abonnement
          </Link>
          <Link
            href="/dashboard/agence/annonces/nouvelle"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publier un Nouveau Bien</span>
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Annonces Actives</span>
            <Building2 className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{properties.length}</span>
          <span className="text-[11px] text-emerald-400 block font-medium">Sur 50 autorisées</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Vues Totales</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{totalViews}</span>
          <span className="text-[11px] text-emerald-400 block font-medium">+14% ce mois</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Clics WhatsApp</span>
            <MessageSquare className="w-4 h-4 text-emerald-400 fill-current" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{totalWhatsappClicks}</span>
          <span className="text-[11px] text-emerald-400 block font-medium">Leads directs WhatsApp</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Appels Téléphone</span>
            <PhoneCall className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{totalCallClicks}</span>
          <span className="text-[11px] text-slate-400 block">Clics sur numéro</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Mises en Favoris</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{totalFavorites}</span>
          <span className="text-[11px] text-slate-400 block">Intérêt acheteurs</span>
        </div>

      </div>

      {/* PROPERTIES MANAGEMENT TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
        
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Gestion de vos Annonces Immobilières</h2>
            <p className="text-xs text-slate-400">Modifiez les informations, suivez les statistiques et changez le statut des biens.</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            {properties.length} biens affichés
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Bien & Référence</th>
                <th className="p-4">Quartier</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-center">Vues</th>
                <th className="p-4 text-center">Leads WhatsApp</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  
                  {/* Title & Thumbnail */}
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden relative shrink-0 border border-slate-800">
                        <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                      </div>
                      <div className="truncate max-w-[240px]">
                        <Link href={`/logements/detail/${p.id}`} className="font-bold text-white hover:text-brand-300 truncate block">
                          {p.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono">Réf : {p.ref}</span>
                      </div>
                    </div>
                  </td>

                  {/* Neighborhood */}
                  <td className="p-4 font-medium text-slate-200">
                    {p.neighborhood}, {p.city}
                  </td>

                  {/* Price */}
                  <td className="p-4 font-mono font-bold text-white">
                    {formatPrice(p.price)}
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-4">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as PropertyStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize border focus:outline-none ${
                        p.status === 'disponible' 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                          : p.status === 'loue' 
                            ? 'bg-amber-950 text-amber-300 border-amber-800' 
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="loue">Loué</option>
                      <option value="vendu">Vendu</option>
                    </select>
                  </td>

                  {/* Views */}
                  <td className="p-4 text-center font-mono font-semibold text-slate-200">
                    {p.views_count}
                  </td>

                  {/* Leads */}
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
                      {p.whatsapp_clicks} clics
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/logements/detail/${p.id}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Voir l'annonce"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(p.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* RECENT VISIT REQUESTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <span>Demandes de Visite Reçues</span>
            </h2>
            <p className="text-xs text-slate-400">Clients ayant formulé une demande de visite en ligne.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map((v) => (
            <div key={v.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{v.client_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  v.status === 'en_attente' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {v.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-300 font-medium">Bien : {v.property_title}</p>
              <p className="text-slate-400">Date souhaitée : <span className="text-white font-mono">{v.preferred_date}</span></p>
              <div className="pt-2 flex items-center justify-between text-slate-400 border-t border-slate-900">
                <span>Contact : <strong className="text-brand-300">{v.client_phone}</strong></span>
                <a href={`https://wa.me/221${v.client_phone.replace(/[^0-9]/g, '')}`} target="_blank" className="text-emerald-400 hover:underline font-bold">
                  Rappeler sur WhatsApp →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
