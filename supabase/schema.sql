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

-- ==============================================================================
-- DONNÉES COMPLÈTES DE DÉMARRAGE (PATRIMOINE IMMOBILIER DAKAR)
-- ==============================================================================

-- 1. Propriétaire principal
INSERT INTO public.owners (id, organization_id, first_name, last_name, email, phone, address, city, cni_number, payment_preference, bank_name, bank_rib, commission_rate, notes)
VALUES (
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  '11111111-1111-1111-1111-111111111111',
  'Ousmane',
  'Ndiaye',
  'ousmane.ndiaye@teranga-invest.sn',
  '+221 77 638 12 45',
  'Route des Almadies, Dakar',
  'Dakar',
  '1 759 1978 00412',
  'WAVE',
  'CBAO Groupe Attijariwafa Bank',
  'SN012 01001 02345678901 45',
  8.0,
  'Bailleur de la Résidence Teranga et de locaux commerciaux au Plateau'
) ON CONFLICT (id) DO NOTHING;

-- 2. Biens Immobiliers
INSERT INTO public.properties (id, organization_id, owner_id, name, type, address, neighborhood, city, country, description, total_units, occupied_units, image_url)
VALUES 
(
  'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
  '11111111-1111-1111-1111-111111111111',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Résidence Teranga Almadies',
  'IMMEUBLE',
  'Route des Almadies, en face Hôtel King Fahd',
  'Almadies',
  'Dakar',
  'Sénégal',
  'Immeuble moderne R+4 de haut standing, ascenseur, groupe électrogène automatique, réserve d’eau, gardiennage 24/7.',
  4,
  3,
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
),
(
  'e12a4567-e89b-12d3-a456-426614174001',
  '11111111-1111-1111-1111-111111111111',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Villa Panoramique Mermoz',
  'VILLA',
  'Mermoz Pyrotechnie, Rue MZ-45',
  'Mermoz',
  'Dakar',
  'Sénégal',
  'Villa de luxe R+1 avec piscine privative, jardin paysager, 5 chambres avec salles d’eau, garage 2 véhicules.',
  1,
  1,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
),
(
  'e12a4567-e89b-12d3-a456-426614174002',
  '11111111-1111-1111-1111-111111111111',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Immeuble Liberté 6 Extension',
  'IMMEUBLE',
  'Liberté 6 Extension, près Rond-point 2 Voies',
  'Liberté 6',
  'Dakar',
  'Sénégal',
  'Immeuble résidentiel R+3 composé de 6 appartements F3 et F4, proche commodités et VDN.',
  6,
  5,
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
),
(
  'e12a4567-e89b-12d3-a456-426614174003',
  '11111111-1111-1111-1111-111111111111',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Espace Commercial Plateau',
  'COMMERCIAL',
  'Boulevard de la République x Rue Huart',
  'Plateau',
  'Dakar',
  'Sénégal',
  'Immeuble de bureaux et commerces de standing, fibre optique, climatisation centrale, sécurité incendie.',
  4,
  4,
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Unités / Logements
INSERT INTO public.units (id, property_id, owner_id, unit_number, type, floor, rooms, bathrooms, surface_sqm, monthly_rent_fcfa, charges_fcfa, deposit_fcfa, status, features)
VALUES
(
  '365199fb-2624-4b1b-989d-130e6f3ecd9b',
  'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Appartement 1A',
  'APPARTEMENT',
  1,
  4,
  3,
  145.0,
  450000,
  35000,
  900000,
  'OCCUPE',
  ARRAY['Climatisation', 'Balcon', 'Vue mer', 'Parking réservé']
),
(
  '365199fb-2624-4b1b-989d-130e6f3ecd9c',
  'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Appartement 2B',
  'APPARTEMENT',
  2,
  3,
  2,
  110.0,
  380000,
  30000,
  760000,
  'OCCUPE',
  ARRAY['Climatisation', 'Cuisine équipée', 'Ascenseur']
),
(
  '365199fb-2624-4b1b-989d-130e6f3ecd9d',
  'e12a4567-e89b-12d3-a456-426614174001',
  '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
  'Villa Complète Mermoz',
  'VILLA',
  0,
  6,
  5,
  350.0,
  1200000,
  80000,
  2400000,
  'OCCUPE',
  ARRAY['Piscine', 'Jardin', 'Groupe électrogène', 'Poste de garde']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Locataires
INSERT INTO public.tenants (id, organization_id, first_name, last_name, email, phone, cni_number, profession, employer, emergency_contact_name, emergency_contact_phone)
VALUES
(
  'afd3365b-cd0e-4a8c-a531-140da3df29f3',
  '11111111-1111-1111-1111-111111111111',
  'Mamadou Lamine',
  'Diallo',
  'm.diallo@sonatel.sn',
  '+221 77 554 20 18',
  '1 759 1986 00319',
  'Ingénieur Télécom Senior (Sonatel Orange)',
  'Sonatel Dakar',
  'Awa Diallo (Épouse)',
  '+221 77 640 11 22'
),
(
  'afd3365b-cd0e-4a8c-a531-140da3df29f4',
  '11111111-1111-1111-1111-111111111111',
  'Aïssatou',
  'Kane',
  'aissatou.kane@bceao.int',
  '+221 78 234 56 78',
  '2 759 1991 00824',
  'Analyste Financière',
  'BCEAO Siège Dakar',
  'Dr. Kane (Père)',
  '+221 77 500 12 34'
),
(
  'afd3365b-cd0e-4a8c-a531-140da3df29f5',
  '11111111-1111-1111-1111-111111111111',
  'Cheikh',
  'Faye',
  'cheikh.faye@invest-senegal.com',
  '+221 76 345 67 89',
  '1 759 1975 00198',
  'Directeur Général',
  'Invest Sénégal Consulting',
  'Aminata Faye',
  '+221 77 622 33 44'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Baux / Contrats de location
INSERT INTO public.leases (id, organization_id, property_id, unit_id, tenant_id, start_date, end_date, rent_amount_fcfa, charges_amount_fcfa, deposit_amount_fcfa, payment_day, status)
VALUES
(
  'd6530fc7-9a6c-4025-b145-0bf074dcfa0b',
  '11111111-1111-1111-1111-111111111111',
  'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
  '365199fb-2624-4b1b-989d-130e6f3ecd9b',
  'afd3365b-cd0e-4a8c-a531-140da3df29f3',
  '2026-01-01',
  '2027-12-31',
  450000,
  35000,
  900000,
  5,
  'ACTIF'
),
(
  'd6530fc7-9a6c-4025-b145-0bf074dcfa0c',
  '11111111-1111-1111-1111-111111111111',
  'e12a4567-e89b-12d3-a456-426614174001',
  '365199fb-2624-4b1b-989d-130e6f3ecd9d',
  'afd3365b-cd0e-4a8c-a531-140da3df29f5',
  '2026-02-01',
  '2028-01-31',
  1200000,
  80000,
  2400000,
  5,
  'ACTIF'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Paiements & Quittances
INSERT INTO public.payments (id, organization_id, tenant_id, lease_id, amount_fcfa, payment_date, method, reference_number, status, receipt_number, notes)
VALUES
(
  '7cf567c7-611b-4233-bcdc-e03753e6c343',
  '11111111-1111-1111-1111-111111111111',
  'afd3365b-cd0e-4a8c-a531-140da3df29f3',
  'd6530fc7-9a6c-4025-b145-0bf074dcfa0b',
  485000,
  '2026-09-04',
  'WAVE',
  'WAVE-SN-20260904-7819',
  'VALIDE',
  'REC-2026-09-001',
  'Loyer Septembre 2026 (450 000 FCFA + 35 000 FCFA charges)'
),
(
  '7cf567c7-611b-4233-bcdc-e03753e6c344',
  '11111111-1111-1111-1111-111111111111',
  'afd3365b-cd0e-4a8c-a531-140da3df29f5',
  'd6530fc7-9a6c-4025-b145-0bf074dcfa0c',
  1280000,
  '2026-09-02',
  'VIREMENT',
  'VIR-CBAO-20260902-145',
  'VALIDE',
  'REC-2026-09-002',
  'Loyer Septembre 2026 Villa Mermoz'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Dépenses & Charges
INSERT INTO public.expenses (id, organization_id, property_id, category, description, amount_fcfa, expense_date, payment_method, recorded_by)
VALUES
(
  '7045f8a4-5241-4f9e-93d1-d9d8588631ae',
  '11111111-1111-1111-1111-111111111111',
  'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
  'SECURITE',
  'Facture mensuelle gardiennage jour & nuit - Résidence Teranga',
  180000,
  '2026-09-02',
  'ESPECES',
  'Sécurité Teranga Pro'
),
(
  '7045f8a4-5241-4f9e-93d1-d9d8588631af',
  '11111111-1111-1111-1111-111111111111',
  'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
  'MAINTENANCE',
  'Entretien mensuel ascenseur et vérification groupe électrogène',
  65000,
  '2026-09-03',
  'WAVE',
  'Ascenseurs du Sénégal'
)
ON CONFLICT (id) DO NOTHING;
