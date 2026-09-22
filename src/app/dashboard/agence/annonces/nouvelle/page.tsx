'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyType, ListingType, FurnishedStatus } from '@/lib/types';
import { PlusCircle, ArrowLeft, Image as ImageIcon, Video, CheckCircle2 } from 'lucide-react';

export default function NewPropertyPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    ref: `IMMO-DKR-${Math.floor(100 + Math.random() * 900)}`,
    type: 'appartement' as PropertyType,
    listing_type: 'location' as ListingType,
    price: '',
    charges: '',
    caution: '',
    agency_fees: '',
    city: 'Dakar',
    neighborhood: '',
    surface: '',
    bedrooms: '2',
    bathrooms: '2',
    furnished: 'non_meuble' as FurnishedStatus,
    has_pool: false,
    has_parking: false,
    has_ac: false,
    has_internet: false,
    description: '',
    image1: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    image2: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    video_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push('/dashboard/agence');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au tableau de bord</span>
      </button>

      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Publier une Nouvelle Annonce</h1>
        <p className="text-slate-400 text-sm">Renseignez les détails précis de votre bien pour attirer des leads qualifiés.</p>
      </div>

      {success ? (
        <div className="p-8 text-center bg-slate-900 border border-emerald-800 rounded-3xl space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-2xl font-bold text-white">Annonce Publiée avec Succès !</h3>
          <p className="text-slate-300 text-sm">Redirection vers votre tableau de bord...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Informations Générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Titre de l'Annonce *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Superbe Appartement F4 avec Vue Mer aux Almadies"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Référence du Bien</label>
                <input
                  type="text"
                  readOnly
                  value={formData.ref}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type de Bien *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="appartement">Appartement</option>
                  <option value="studio">Studio</option>
                  <option value="maison">Maison</option>
                  <option value="villa">Villa de Luxe</option>
                  <option value="bureau">Bureau / Commerce</option>
                  <option value="terrain">Terrain</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transaction *</label>
                <select
                  value={formData.listing_type}
                  onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as ListingType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="location">Location</option>
                  <option value="vente">Vente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Meublé / Non Meublé</label>
                <select
                  value={formData.furnished}
                  onChange={(e) => setFormData({ ...formData, furnished: e.target.value as FurnishedStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="non_meuble">Non Meublé</option>
                  <option value="meuble">Meublé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Prix & Conditions Financières (FCFA)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prix (FCFA) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex : 750000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Charges (FCFA)</label>
                <input
                  type="number"
                  placeholder="Ex : 50000"
                  value={formData.charges}
                  onChange={(e) => setFormData({ ...formData, charges: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Caution (FCFA)</label>
                <input
                  type="number"
                  placeholder="Ex : 1500000"
                  value={formData.caution}
                  onChange={(e) => setFormData({ ...formData, caution: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Frais d'agence (FCFA)</label>
                <input
                  type="number"
                  placeholder="Ex : 750000"
                  value={formData.agency_fees}
                  onChange={(e) => setFormData({ ...formData, agency_fees: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Localisation & Caractéristiques</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ville *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Dakar">Dakar</option>
                  <option value="Saly">Saly</option>
                  <option value="Mbour">Mbour</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quartier *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Almadies, Mermoz, Virage..."
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Surface (m²) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex : 150"
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nb. Chambres / SDB</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Ch."
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="number"
                    placeholder="SDB"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Description & Médias</h3>
            
            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description détaillée *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Décrivez les atouts de l'immeuble, le système de sécurité, le groupe électrogène, le balcon, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Photo Principale</label>
                  <input
                    type="url"
                    value={formData.image1}
                    onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Vidéo YouTube (Optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-bold text-xs shadow-lg hover:opacity-95"
            >
              Publier l'annonce maintenant
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
