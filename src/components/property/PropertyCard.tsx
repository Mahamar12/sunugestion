'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/types';
import { formatPrice, formatPriceEUR } from '@/lib/utils';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldCheck, 
  Heart, 
  Eye, 
  Sparkles,
  ArrowRight,
  Armchair
} from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import PhoneButton from './PhoneButton';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col h-full">
      
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <Image
          src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              property.listing_type === 'location' 
                ? 'bg-brand-600/90 text-white backdrop-blur-md' 
                : 'bg-emerald-600/90 text-white backdrop-blur-md'
            }`}>
              {property.listing_type === 'location' ? 'Location' : 'Vente'}
            </span>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 text-slate-200 border border-slate-700/80 backdrop-blur-md uppercase">
              {property.type}
            </span>

            {property.featured && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" /> Vedette
              </span>
            )}
          </div>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isFavorite 
                ? 'bg-rose-500 border-rose-400 text-white' 
                : 'bg-slate-900/60 border-white/20 text-white hover:bg-slate-900/90'
            }`}
            title="Ajouter aux favoris"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
          <div className="flex items-center space-x-1.5 text-xs text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate">{property.neighborhood}, {property.city}</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded font-mono">
            Réf: {property.ref}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Price Header */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-black text-white tracking-tight">
                {formatPrice(property.price)}
              </span>
              {property.listing_type === 'location' && (
                <span className="text-xs text-slate-400 font-normal"> / mois</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              ~{formatPriceEUR(property.price)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/logements/detail/${property.id}`}>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
              {property.title}
            </h3>
          </Link>
        </div>

        {/* Specs Pills Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs text-slate-300">
          {property.type !== 'terrain' && (
            <div className="flex items-center space-x-1.5">
              <Bed className="w-4 h-4 text-brand-400" />
              <span>{property.bedrooms} ch.</span>
            </div>
          )}
          {property.type !== 'terrain' && (
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-brand-400" />
              <span>{property.bathrooms} sdb.</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5">
            <Maximize2 className="w-4 h-4 text-brand-400" />
            <span>{property.surface} m²</span>
          </div>
        </div>

        {/* Agency Tag & Actions */}
        <div className="space-y-3 pt-1">
          {property.agency && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-brand-300 uppercase shrink-0">
                  {property.agency.name.charAt(0)}
                </div>
                <span className="truncate font-medium text-slate-300">{property.agency.name}</span>
              </div>
              {property.agency.verified && (
                <span title="Agence vérifiée SunuGestion">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <WhatsAppButton
                phone={property.agency?.whatsapp || '+221770000000'}
                propertyRef={property.ref}
                propertyTitle={property.title}
                variant="full"
              />
            </div>
            <PhoneButton
              phone={property.agency?.phone || '+221770000000'}
              variant="compact"
            />
            <Link
              href={`/logements/detail/${property.id}`}
              className="p-3 rounded-xl bg-slate-800 hover:bg-brand-600/30 border border-slate-700 hover:border-brand-500/40 text-slate-200 hover:text-brand-300 transition-all flex items-center justify-center"
              title="Voir l'annonce complète"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
