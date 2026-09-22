'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { INITIAL_PROPERTIES, INITIAL_AGENCIES } from '@/lib/data';
import { formatPrice, formatPriceEUR } from '@/lib/utils';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  Play, 
  Waves, 
  Car, 
  Wind, 
  Wifi, 
  Sparkles,
  ArrowLeft,
  Building2,
  DollarSign,
  Info,
  ChevronRight,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import WhatsAppButton from '@/components/property/WhatsAppButton';
import PhoneButton from '@/components/property/PhoneButton';
import VisitModal from '@/components/property/VisitModal';
import PropertyCard from '@/components/property/PropertyCard';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const property = INITIAL_PROPERTIES.find(p => p.id === id) || INITIAL_PROPERTIES[0];
  const agency = property.agency || INITIAL_AGENCIES[0];

  const [selectedImage, setSelectedImage] = useState(property.images[0]);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const similarProperties = INITIAL_PROPERTIES.filter(p => p.id !== property.id && (p.city === property.city || p.type === property.type)).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1.5 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux annonces</span>
        </button>

        <div className="flex items-center space-x-2 font-medium">
          <Link href="/" className="hover:text-white">Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/logements" className="hover:text-white">Logements</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 truncate max-w-[200px]">{property.title}</span>
        </div>
      </div>

      {/* Main Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              property.listing_type === 'location' ? 'bg-brand-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {property.listing_type === 'location' ? 'À Louer' : 'À Vendre'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 uppercase">
              {property.type}
            </span>
            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              Réf : {property.ref}
            </span>
            {property.status === 'disponible' ? (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Disponible
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800 uppercase">
                {property.status}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {property.title}
          </h1>

          <div className="flex items-center space-x-2 text-slate-400 text-sm font-medium">
            <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
            <span>{property.neighborhood}, {property.city}, Sénégal</span>
          </div>
        </div>

        {/* Price Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:text-right shrink-0 space-y-1">
          <span className="text-xs text-slate-400 block font-medium">Prix demandé</span>
          <span className="text-3xl font-black text-white tracking-tight block">
            {formatPrice(property.price)}
            {property.listing_type === 'location' && <span className="text-sm font-normal text-slate-400"> / mois</span>}
          </span>
          <span className="text-xs text-slate-400 font-mono block">
            ~{formatPriceEUR(property.price)}
          </span>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="space-y-4">
        {/* Main Featured Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
          <Image
            src={selectedImage}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
          
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                isFavorite ? 'bg-rose-500 border-rose-400 text-white' : 'bg-slate-900/80 border-slate-700 text-white hover:bg-slate-900'
              }`}
              title="Ajouter aux favoris"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-900 transition-all"
              title="Partager l'annonce"
            >
              <Share2 className="w-5 h-5 text-brand-300" />
            </button>
            {copiedLink && (
              <span className="absolute top-14 right-0 text-[11px] font-bold bg-emerald-500 text-white px-2.5 py-1 rounded shadow">
                Lien copié !
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Carousel */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {property.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedImage === img ? 'border-brand-400 scale-105 shadow-lg' : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMNS CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Details, Specifications, Video, Map */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Key Specs Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center">
            {property.type !== 'terrain' && (
              <div className="space-y-1">
                <Bed className="w-6 h-6 text-brand-400 mx-auto" />
                <span className="block text-lg font-bold text-white">{property.bedrooms}</span>
                <span className="text-xs text-slate-400">Chambres</span>
              </div>
            )}
            {property.type !== 'terrain' && (
              <div className="space-y-1">
                <Bath className="w-6 h-6 text-brand-400 mx-auto" />
                <span className="block text-lg font-bold text-white">{property.bathrooms}</span>
                <span className="text-xs text-slate-400">Salles de bain</span>
              </div>
            )}
            <div className="space-y-1">
              <Maximize2 className="w-6 h-6 text-brand-400 mx-auto" />
              <span className="block text-lg font-bold text-white">{property.surface} m²</span>
              <span className="text-xs text-slate-400 font-medium">Surface utile</span>
            </div>
            <div className="space-y-1">
              <Building2 className="w-6 h-6 text-brand-400 mx-auto" />
              <span className="block text-lg font-bold text-white capitalize">{property.furnished.replace('_', ' ')}</span>
              <span className="text-xs text-slate-400">Ameublement</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-brand-400" />
              <span>Détails Financiers & Conditions de Bail</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
              {property.charges !== undefined && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Charges mensuelles</span>
                  <span className="font-bold text-white font-mono">{formatPrice(property.charges)}</span>
                </div>
              )}
              {property.caution !== undefined && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Caution à prévoir</span>
                  <span className="font-bold text-white font-mono">{formatPrice(property.caution)}</span>
                </div>
              )}
              {property.agency_fees !== undefined && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Frais d'agence</span>
                  <span className="font-bold text-white font-mono">{formatPrice(property.agency_fees)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Description du Bien</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
              {property.description}
            </p>
          </div>

          {/* Amenities & Equipments */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Équipements & Prestations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                property.has_pool ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50'
              }`}>
                <Waves className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Piscine</span>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                property.has_parking ? 'bg-brand-950/40 border-brand-800 text-brand-300' : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50'
              }`}>
                <Car className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Parking / Garage</span>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                property.has_ac ? 'bg-blue-950/40 border-blue-800 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50'
              }`}>
                <Wind className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Climatisation</span>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                property.has_internet ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500 opacity-50'
              }`}>
                <Wifi className="w-5 h-5 shrink-0" />
                <span className="font-semibold">Internet Wi-Fi</span>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          {property.video_url && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Vidéo de Présentation</h3>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group">
                <Image
                  src={property.images[1] || property.images[0]}
                  alt="Vidéo miniature"
                  fill
                  className="object-cover opacity-50 group-hover:scale-105 transition-transform"
                />
                <a
                  href={property.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </a>
              </div>
            </div>
          )}

          {/* Location & Map Simulator */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Localisation du Quartier</h3>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-white">{property.neighborhood}, {property.city}</span>
                <span className="font-mono">GPS: {property.map_lat}, {property.map_lng}</span>
              </div>
              <div className="relative aspect-[16/8] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-950/80 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                <div className="z-10 text-center space-y-2 p-4">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-white block">{property.neighborhood}</span>
                  <span className="text-xs text-slate-400 block">Proche des écoles, commerces et axes principaux</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sticky Sidebar: Agency Card & Direct Contact CTAs */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            
            {/* Agency Info Header */}
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative shrink-0">
                {agency.logo ? (
                  <Image src={agency.logo} alt={agency.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-brand-300 text-lg">
                    {agency.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{agency.name}</span>
                  {agency.verified && (
                    <span title="Agence vérifiée">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{agency.city} • {agency.properties_count} annonces</p>
                <div className="flex items-center space-x-1 text-amber-400 text-xs mt-1 font-bold">
                  <span>★ {agency.rating}</span>
                  <span className="text-slate-500 font-normal">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-3">
              <WhatsAppButton
                phone={agency.whatsapp}
                propertyRef={property.ref}
                propertyTitle={property.title}
                variant="full"
              />

              <PhoneButton
                phone={agency.phone}
                variant="full"
              />

              <button
                onClick={() => setIsVisitModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Demander une visite</span>
              </button>
            </div>

            {/* Safety Note */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-200 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Conseil de Sécurité SunuGestion
              </span>
              <p>Ne versez aucun acompte sans avoir visité le logement et signé un bail formel auprès de l'agence.</p>
            </div>

          </div>
        </div>

      </div>

      {/* SIMILAR PROPERTIES SECTION */}
      {similarProperties.length > 0 && (
        <div className="pt-10 border-t border-slate-800 space-y-6">
          <h2 className="text-2xl font-bold text-white">Biens Similaires Recommandés</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* VISIT REQUEST MODAL */}
      <VisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        propertyTitle={property.title}
        propertyRef={property.ref}
        agencyName={agency.name}
      />

    </div>
  );
}
