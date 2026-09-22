-- ==============================================================================
-- SUNUGESTION — SCHÉMA COMPLET BASE DE DONNÉES SUPABASE (POSTGRESQL)
-- Plateforme SaaS de Gestion Immobilière & Locative (Sénégal & Afrique de l'Ouest)
-- ==============================================================================

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ORGANISATIONS (Agences Immobilières & Cabinets de Gestion)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dakar',
  country TEXT NOT NULL DEFAULT 'Sénégal',
  ninea TEXT,
  rccm TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'PRO' CHECK (subscription_plan IN ('STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE')),
  subscription_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFILS UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN_AGENCE' CHECK (role IN ('SUPER_ADMIN', 'ADMIN_AGENCE', 'GESTIONNAIRE', 'COMPTABLE', 'PROPRIETAIRE', 'LOCATAIRE')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROPRIÉTAIRES (BAILLEURS)
CREATE TABLE IF NOT EXISTS public.owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT DEFAULT 'Dakar',
  cni_number TEXT,
  payment_preference TEXT DEFAULT 'WAVE' CHECK (payment_preference IN ('WAVE', 'ORANGE_MONEY', 'VIREMENT', 'ESPECES')),
  bank_name TEXT,
  bank_rib TEXT,
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 8.0, -- % commission agence
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BIENS IMMOBILIERS (IMMEUBLES, RÉSIDENCES, VILLAS)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'IMMEUBLE' CHECK (type IN ('IMMEUBLE', 'APPARTEMENT', 'VILLA', 'COMMERCIAL', 'TERRAIN')),
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dakar',
  country TEXT NOT NULL DEFAULT 'Sénégal',
  description TEXT,
  total_units INTEGER NOT NULL DEFAULT 0,
  occupied_units INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. UNITÉS / LOGEMENTS INDIVIDUELS
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'APPARTEMENT' CHECK (type IN ('APPARTEMENT', 'STUDIO', 'MAGASIN', 'BUREAU', 'CHAMBRE', 'VILLA')),
  floor INTEGER DEFAULT 0,
  rooms INTEGER NOT NULL DEFAULT 2,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  surface_sqm NUMERIC(7, 2),
  monthly_rent_fcfa INTEGER NOT NULL,
  charges_fcfa INTEGER NOT NULL DEFAULT 0,
  deposit_fcfa INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK (status IN ('DISPONIBLE', 'OCCUPE', 'EN_RENOVATION', 'RESERVE')),
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LOCATAIRES
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cni_number TEXT,
  profession TEXT,
  employer TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  guarantor_name TEXT,
  guarantor_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CONTRATS DE BAIL (LEASES)
CREATE TABLE IF NOT EXISTS public.leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount_fcfa INTEGER NOT NULL,
  charges_amount_fcfa INTEGER NOT NULL DEFAULT 0,
  deposit_amount_fcfa INTEGER NOT NULL DEFAULT 0,
  payment_day INTEGER NOT NULL DEFAULT 5, -- jour du mois d'exigibilité (ex: 5)
  status TEXT NOT NULL DEFAULT 'ACTIF' CHECK (status IN ('ACTIF', 'TERMINE', 'RESILIE', 'EN_ATTENTE')),
  contract_pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ÉCHÉANCIER DE LOYERS (RENT SCHEDULES)
CREATE TABLE IF NOT EXISTS public.rent_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL, -- Ex: "Septembre 2026"
  due_date DATE NOT NULL,
  rent_fcfa INTEGER NOT NULL,
  charges_fcfa INTEGER NOT NULL DEFAULT 0,
  total_due_fcfa INTEGER NOT NULL,
  paid_amount_fcfa INTEGER NOT NULL DEFAULT 0,
  remaining_fcfa INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'A_VENIR' CHECK (status IN ('PAYE', 'PARTIEL', 'EN_RETARD', 'A_VENIR')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PAIEMENTS & ENCAISSEMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES public.rent_schedules(id) ON DELETE SET NULL,
  amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL DEFAULT 'WAVE' CHECK (method IN ('WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'VIREMENT', 'ESPECES', 'CHEQUE')),
  reference_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'VALIDE' CHECK (status IN ('VALIDE', 'EN_ATTENTE', 'REJETE')),
  receipt_number TEXT UNIQUE,
  receipt_url TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. IMPAYÉS & SUIVI DES RELANCES
CREATE TABLE IF NOT EXISTS public.arrears (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  overdue_amount_fcfa INTEGER NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  reminders_sent_count INTEGER NOT NULL DEFAULT 0,
  last_reminder_date DATE,
  status TEXT NOT NULL DEFAULT 'ACTIF' CHECK (status IN ('ACTIF', 'CONTENTIEUX', 'REGULARISE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DÉPENSES & CHARGES D'EXPLOITATION
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('REPARATION', 'MAINTENANCE', 'SENELEC', 'SEN_EAU', 'SECURITE', 'NETTOYAGE', 'TAXE_FONCIERE', 'GESTION', 'AUTRE')),
  description TEXT NOT NULL,
  amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'ESPECES',
  invoice_url TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PRESTATAIRES & ARTISANS (VENDORS / BTP)
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trade TEXT NOT NULL, -- Plombier, Électricien, Maçon, Climatisation, Peintre
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  status TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK (status IN ('DISPONIBLE', 'OCCUPE', 'INACTIF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. TICKETS DE MAINTENANCE & RÉCLAMATIONS
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MOYENNE' CHECK (priority IN ('URGENTE', 'ELEVEE', 'MOYENNE', 'FAIBLE')),
  status TEXT NOT NULL DEFAULT 'NOUVEAU' CHECK (status IN ('NOUVEAU', 'ASSIGNE', 'EN_COURS', 'RESOLU', 'ANNULE')),
  estimated_cost_fcfa INTEGER DEFAULT 0,
  actual_cost_fcfa INTEGER DEFAULT 0,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. DOCUMENTS ARCHIVÉS & QUITTANCES (GED)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('QUITTANCE', 'CONTRAT', 'ETAT_DES_LIEUX', 'RELANCE', 'FACTURE', 'REGLEMENT')),
  title TEXT NOT NULL,
  file_url TEXT,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  amount_fcfa INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. JOURNAUX D'AUDIT (AUDIT LOGS)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  target_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- BUCKET SUPABASE STORAGE (sunugestion)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sunugestion', 'sunugestion', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politiques de lecture et d'upload pour le bucket sunugestion
CREATE POLICY "Public read sunugestion bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'sunugestion');

CREATE POLICY "Authenticated upload sunugestion bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sunugestion');

CREATE POLICY "Authenticated update sunugestion bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sunugestion');

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arrears ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques ouvertes pour l'application SunuGestion (mode multi-tenant & API)
CREATE POLICY "Public read properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public read units" ON public.units FOR SELECT USING (true);
CREATE POLICY "Public read organizations" ON public.organizations FOR SELECT USING (true);

-- Politiques d'accès par organisation
CREATE POLICY "Manage organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Manage profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Manage owners" ON public.owners FOR ALL USING (true);
CREATE POLICY "Manage properties" ON public.properties FOR ALL USING (true);
CREATE POLICY "Manage units" ON public.units FOR ALL USING (true);
CREATE POLICY "Manage tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Manage leases" ON public.leases FOR ALL USING (true);
CREATE POLICY "Manage rent_schedules" ON public.rent_schedules FOR ALL USING (true);
CREATE POLICY "Manage payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Manage arrears" ON public.arrears FOR ALL USING (true);
CREATE POLICY "Manage expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Manage vendors" ON public.vendors FOR ALL USING (true);
CREATE POLICY "Manage maintenance_tickets" ON public.maintenance_tickets FOR ALL USING (true);
CREATE POLICY "Manage documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Manage audit_logs" ON public.audit_logs FOR ALL USING (true);

-- ==============================================================================
-- DONNÉES INITIALES (SEED DE DÉMARRAGE SUNUGESTION)
-- ==============================================================================
INSERT INTO public.organizations (id, name, slug, email, phone, address, city, country, ninea, rccm, subscription_plan, subscription_status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'SunuGestion Immobilier Dakar',
  'sunugestion-dakar',
  'contact@sunugestion.sn',
  '+221 33 824 10 10',
  'Avenue Léopold Sédar Senghor, Immeuble Horizon',
  'Dakar',
  'Sénégal',
  '008923412 2V3',
  'SN.DKR.2023.B.1450',
  'PRO',
  'ACTIVE'
) ON CONFLICT (id) DO NOTHING;
