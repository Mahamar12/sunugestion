export type PropertyType = 'appartement' | 'studio' | 'maison' | 'villa' | 'bureau' | 'terrain';

export type ListingType = 'location' | 'vente';

export type FurnishedStatus = 'meuble' | 'non_meuble';

export type PropertyStatus = 'disponible' | 'loue' | 'vendu';

export type UserRole = 'ADMIN' | 'AGENCY' | 'CLIENT';

export type SaaSPlanTier = 'gratuit' | 'standard' | 'premium' | 'entreprise';

export interface Agency {
  id: string;
  name: string;
  logo: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  description: string;
  verified: boolean;
  plan: SaaSPlanTier;
  rating: number;
  properties_count: number;
  created_at: string;
}

export interface Property {
  id: string;
  ref: string;
  title: string;
  type: PropertyType;
  listing_type: ListingType;
  price: number; // in FCFA (XOF)
  charges?: number;
  caution?: number;
  agency_fees?: number;
  city: string;
  neighborhood: string;
  surface: number; // m²
  bedrooms: number;
  bathrooms: number;
  furnished: FurnishedStatus;
  has_pool: boolean;
  has_parking: boolean;
  has_ac: boolean;
  has_internet: boolean;
  description: string;
  images: string[];
  video_url?: string;
  map_lat: number;
  map_lng: number;
  status: PropertyStatus;
  featured: boolean;
  created_at: string;
  agency_id: string;
  agency?: Agency;
  views_count: number;
  whatsapp_clicks: number;
  call_clicks: number;
  favorites_count: number;
}

export interface VisitRequest {
  id: string;
  property_id: string;
  property_title: string;
  agency_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  preferred_date: string;
  message: string;
  status: 'en_attente' | 'confirmee' | 'annulee';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency_id?: string;
  agency?: Agency;
  created_at: string;
}

export interface SubscriptionPlan {
  id: SaaSPlanTier;
  name: string;
  price: number; // FCFA / mois
  price_eur: number;
  max_properties: number | 'Illimité';
  max_photos: number | 'Illimité';
  support: string;
  stats: string;
  featured_badge: boolean;
  ai_assistant: boolean;
  popular?: boolean;
  features: string[];
}

export interface PaymentInvoice {
  id: string;
  invoice_number: string;
  agency_id: string;
  agency_name: string;
  plan_tier: SaaSPlanTier;
  amount: number;
  currency: string;
  payment_method: 'wave' | 'orange_money' | 'carte_bancaire' | 'stripe' | 'paypal';
  transaction_id: string;
  status: 'paye' | 'en_attente' | 'echoue';
  date: string;
  pdf_url?: string;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  neighborhood?: string;
  type?: PropertyType | '';
  listing_type?: ListingType | '';
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_surface?: number;
  furnished?: FurnishedStatus | '';
  available_now?: boolean;
  has_pool?: boolean;
  has_parking?: boolean;
  has_ac?: boolean;
  has_internet?: boolean;
  featured?: boolean;
  sort_by?: 'recent' | 'price_asc' | 'price_desc' | 'surface_desc';
}
