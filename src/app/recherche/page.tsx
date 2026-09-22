'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INITIAL_PROPERTIES } from '@/lib/data';
import PropertyCard from '@/components/property/PropertyCard';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { filterProperties } from '@/lib/utils';
import { SearchFilters, PropertyType, ListingType } from '@/lib/types';
import { Search, Building2 } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('query') || '',
    city: searchParams.get('city') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    type: (searchParams.get('type') as PropertyType) || '',
    listing_type: (searchParams.get('listing_type') as ListingType) || '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
  });

  useEffect(() => {
    setFilters({
      query: searchParams.get('query') || '',
      city: searchParams.get('city') || '',
      neighborhood: searchParams.get('neighborhood') || '',
      type: (searchParams.get('type') as PropertyType) || '',
      listing_type: (searchParams.get('listing_type') as ListingType) || '',
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
    });
  }, [searchParams]);

  let results = filterProperties(INITIAL_PROPERTIES, filters);

  if (filters.featured) {
    results = results.filter(p => p.featured);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Moteur de Recherche</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-brand-400" />
          <span>Résultats de Recherche</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Ajustez les critères ci-dessous pour affiner la liste des logements disponibles au Sénégal.
        </p>
      </div>

      <AdvancedSearchForm initialFilters={filters} onSearch={(f) => setFilters(f)} compact={false} />

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span className="font-semibold text-white font-mono">
          {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
        </span>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">Aucun logement trouvé avec ces paramètres</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Veuillez élargir votre plage de prix ou supprimer certains filtres de ville/quartier.
          </p>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Chargement des résultats...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
