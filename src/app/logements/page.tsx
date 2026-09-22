'use client';

import React, { useState } from 'react';
import { INITIAL_PROPERTIES } from '@/lib/data';
import PropertyCard from '@/components/property/PropertyCard';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { filterProperties } from '@/lib/utils';
import { SearchFilters } from '@/lib/types';
import { Building2, SlidersHorizontal } from 'lucide-react';

export default function LogementsPage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const filteredListings = filterProperties(INITIAL_PROPERTIES, filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tous Nos Logements au Sénégal
        </h1>
        <p className="text-slate-400 text-sm">
          Parcourez la totalité de nos appartements, villas, studios, bureaux et terrains disponibles à la location et vente.
        </p>
      </div>

      {/* Advanced Search Form */}
      <AdvancedSearchForm onSearch={(f) => setFilters(f)} compact={true} />

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span className="font-semibold text-white font-mono">
          {filteredListings.length} bien{filteredListings.length > 1 ? 's' : ''} disponible{filteredListings.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Property Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">Aucun bien ne correspond à ces critères</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Essayez de modifier vos filtres ou de réinitialiser la recherche pour afficher plus de résultats.
          </p>
          <button
            onClick={() => setFilters({})}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}

    </div>
  );
}
