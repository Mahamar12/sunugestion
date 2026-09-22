'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { INITIAL_PROPERTIES } from '@/lib/data';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyType } from '@/lib/types';
import { Building2 } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const rawCat = params?.category as string;
  const categoryType = rawCat?.toLowerCase() as PropertyType;

  const categoryTitles: Record<string, { title: string; subtitle: string }> = {
    appartement: {
      title: 'Appartements à Louer & Vendre',
      subtitle: 'Découvrez nos appartements meublés et non-meublés du F2 au F5 à Dakar (Almadies, Mermoz, Plateau, Sacré-Cœur).',
    },
    studio: {
      title: 'Studios Meublés & Américains',
      subtitle: 'Studios modernes et fonctionnels idéaux pour étudiants, cadres et séjours temporaires.',
    },
    maison: {
      title: 'Maisons Indépendantes & R+1',
      subtitle: 'Maisons avec cour, jardin et terrasse familiale à Yoff, Ouakam, Ngor et Thiès.',
    },
    villa: {
      title: 'Villas de Luxe avec Piscine',
      subtitle: 'Villas d\'exception et résidences pieds dans l\'eau aux Almadies, Ngor et Saly Portudal.',
    },
    bureau: {
      title: 'Bureaux & Local Commercial',
      subtitle: 'Espaces professionnels et plateaux d\'offices modulaires au cœur des affaires de Dakar Plateau.',
    },
    terrain: {
      title: 'Terrains Viabilisés avec Titre Foncier',
      subtitle: 'Parcelles et terrains d\'exception prêts à bâtir à Ngaparou, Somone, Mbour et Rufisque.',
    },
  };

  const currentMeta = categoryTitles[categoryType] || {
    title: `Logements de type ${rawCat}`,
    subtitle: `Toutes les annonces vérifiées de la catégorie ${rawCat}.`,
  };

  const filteredProperties = INITIAL_PROPERTIES.filter(p => p.type === categoryType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Catégorie Spécifique</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {currentMeta.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Count Header */}
      <div className="text-sm font-semibold text-slate-400 font-mono">
        {filteredProperties.length} bien{filteredProperties.length > 1 ? 's' : ''} trouvé{filteredProperties.length > 1 ? 's' : ''}
      </div>

      {/* Property Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">Aucun bien disponible dans cette catégorie pour le moment</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Consultez les autres types de biens ou utilisez la recherche globale pour trouver des offres similaires.
          </p>
        </div>
      )}

    </div>
  );
}
