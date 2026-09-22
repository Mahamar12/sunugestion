'use client';

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Home, 
  DollarSign, 
  SlidersHorizontal, 
  Check, 
  X, 
  Filter,
  Sparkles,
  Bed,
  Bath,
  Maximize2,
  Tv,
  Wifi,
  Wind,
  Car,
  Waves
} from 'lucide-react';
import { SearchFilters, PropertyType, ListingType, FurnishedStatus } from '@/lib/types';

interface AdvancedSearchFormProps {
  initialFilters?: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  compact?: boolean;
}

export default function AdvancedSearchForm({
  initialFilters = {},
  onSearch,
  compact = false,
}: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    city: '',
    neighborhood: '',
    type: '',
    listing_type: '',
    min_price: undefined,
    max_price: undefined,
    min_bedrooms: undefined,
    min_bathrooms: undefined,
    min_surface: undefined,
    furnished: '',
    available_now: false,
    has_pool: false,
    has_parking: false,
    has_ac: false,
    has_internet: false,
    sort_by: 'recent',
    ...initialFilters,
  });

  const [expanded, setExpanded] = useState(!compact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const reset: SearchFilters = {
      query: '',
      city: '',
      neighborhood: '',
      type: '',
      listing_type: '',
      min_price: undefined,
      max_price: undefined,
      min_bedrooms: undefined,
      min_bathrooms: undefined,
      min_surface: undefined,
      furnished: '',
      available_now: false,
      has_pool: false,
      has_parking: false,
      has_ac: false,
      has_internet: false,
      sort_by: 'recent',
    };
    setFilters(reset);
    onSearch(reset);
  };

  const cities = ['Dakar', 'Saly', 'Mbour', 'Somone', 'Thiès', 'Saint-Louis', 'Ziguinchor'];
  const neighborhoods: Record<string, string[]> = {
    Dakar: ['Almadies', 'Ngor', 'Mermoz', 'Plateau', 'Sacré-Cœur 3', 'Fann Résidence', 'Point E', 'Yoff Virage', 'Ouakam', 'Guédiawaye'],
    Saly: ['Saly Niakh Niakhal', 'Saly Carrefour', 'Golf de Saly', 'Saly Tapada'],
    Mbour: ['Ngaparou', 'Mbour Centre', 'Saly Joseph'],
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
      
      {/* Main Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Keyword Input */}
        <div className="md:col-span-4 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Mot-clé, référence (ex: Almadies, Villa, IMMO-101)..."
            value={filters.query || ''}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* City Select */}
        <div className="md:col-span-3 relative">
          <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <select
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value, neighborhood: '' })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
          >
            <option value="">Toutes les Villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Type Select */}
        <div className="md:col-span-3 relative">
          <Home className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as PropertyType })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
          >
            <option value="">Tous les Types</option>
            <option value="appartement">Appartement</option>
            <option value="studio">Studio</option>
            <option value="maison">Maison</option>
            <option value="villa">Villa de Luxe</option>
            <option value="bureau">Bureau / Commerce</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="md:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
        </div>

      </div>

      {/* Toggle Advanced Filters Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1.5 text-brand-400 hover:text-brand-300 font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{expanded ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés (+ Équipements)'}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-white flex items-center space-x-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Expanded Filter Fields */}
      {expanded && (
        <div className="pt-3 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          
          {/* Row 2: Listing Type, Neighborhood, Furnished */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Transaction</label>
              <select
                value={filters.listing_type || ''}
                onChange={(e) => setFilters({ ...filters, listing_type: e.target.value as ListingType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Location & Vente</option>
                <option value="location">Location uniquement</option>
                <option value="vente">Vente uniquement</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Quartier</label>
              <input
                type="text"
                placeholder="Ex: Almadies, Mermoz..."
                value={filters.neighborhood || ''}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ameublement</label>
              <select
                value={filters.furnished || ''}
                onChange={(e) => setFilters({ ...filters, furnished: e.target.value as FurnishedStatus })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Meublé ou Non Meublé</option>
                <option value="meuble">Meublé</option>
                <option value="non_meuble">Non Meublé</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Trier par</label>
              <select
                value={filters.sort_by || 'recent'}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="recent">Plus récents d'abord</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="surface_desc">Surface maximale</option>
              </select>
            </div>

          </div>

          {/* Row 3: Price range & specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Prix Min (FCFA)</label>
              <input
                type="number"
                placeholder="Ex: 200 000"
                value={filters.min_price || ''}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Prix Max (FCFA)</label>
              <input
                type="number"
                placeholder="Ex: 2 000 000"
                value={filters.max_price || ''}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Chambres min.</label>
              <select
                value={filters.min_bedrooms || ''}
                onChange={(e) => setFilters({ ...filters, min_bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Indifférent</option>
                <option value="1">1 chambre minimum</option>
                <option value="2">2 chambres min.</option>
                <option value="3">3 chambres min.</option>
                <option value="4">4+ chambres</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Surface min. (m²)</label>
              <input
                type="number"
                placeholder="Ex: 100"
                value={filters.min_surface || ''}
                onChange={(e) => setFilters({ ...filters, min_surface: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Row 4: Amenities Checkboxes */}
          <div>
            <label className="block text-slate-400 font-semibold text-xs mb-2">Équipements & Options</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              
              <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                filters.has_pool ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.has_pool || false}
                  onChange={(e) => setFilters({ ...filters, has_pool: e.target.checked })}
                  className="hidden"
                />
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Piscine</span>
              </label>

              <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                filters.has_parking ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.has_parking || false}
                  onChange={(e) => setFilters({ ...filters, has_parking: e.target.checked })}
                  className="hidden"
                />
                <Car className="w-4 h-4 text-brand-400" />
                <span>Parking / Garage</span>
              </label>

              <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                filters.has_ac ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.has_ac || false}
                  onChange={(e) => setFilters({ ...filters, has_ac: e.target.checked })}
                  className="hidden"
                />
                <Wind className="w-4 h-4 text-blue-400" />
                <span>Climatisation</span>
              </label>

              <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                filters.has_internet ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={filters.has_internet || false}
                  onChange={(e) => setFilters({ ...filters, has_internet: e.target.checked })}
                  className="hidden"
                />
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Internet / Wi-Fi</span>
              </label>

            </div>
          </div>

        </div>
      )}

    </form>
  );
}
