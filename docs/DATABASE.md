# Modèle de Base de Données - PostgreSQL / Supabase

## Schéma Relationnel & Tables

```sql
-- 1. Table Utilisateurs (Users & RBAC)
CREATE TYPE user_role AS ENUM ('ADMIN', 'AGENCY', 'CLIENT');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'CLIENT',
    agency_id UUID REFERENCES agences(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Agences Immobilières
CREATE TYPE saas_plan AS ENUM ('gratuit', 'standard', 'premium', 'entreprise');

CREATE TABLE agences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100) DEFAULT 'Dakar',
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    plan saas_plan DEFAULT 'gratuit',
    rating NUMERIC(2, 1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table Biens Immobiliers (Properties)
CREATE TYPE property_type AS ENUM ('appartement', 'studio', 'maison', 'villa', 'bureau', 'terrain');
CREATE TYPE listing_type AS ENUM ('location', 'vente');
CREATE TYPE property_status AS ENUM ('disponible', 'loue', 'vendu');
CREATE TYPE furnished_type AS ENUM ('meuble', 'non_meuble');

CREATE TABLE biens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type property_type NOT NULL,
    listing_type listing_type NOT NULL,
    price NUMERIC(12, 2) NOT NULL, -- en FCFA
    charges NUMERIC(12, 2) DEFAULT 0,
    caution NUMERIC(12, 2) DEFAULT 0,
    agency_fees NUMERIC(12, 2) DEFAULT 0,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    surface NUMERIC(8, 2) NOT NULL, -- m²
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    furnished furnished_type DEFAULT 'non_meuble',
    has_pool BOOLEAN DEFAULT FALSE,
    has_parking BOOLEAN DEFAULT FALSE,
    has_ac BOOLEAN DEFAULT FALSE,
    has_internet BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    images TEXT[] NOT NULL,
    video_url TEXT,
    map_lat NUMERIC(9, 6),
    map_lng NUMERIC(9, 6),
    status property_status DEFAULT 'disponible',
    featured BOOLEAN DEFAULT FALSE,
    agency_id UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
    views_count INT DEFAULT 0,
    whatsapp_clicks INT DEFAULT 0,
    call_clicks INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table Factures & Paiements SaaS
CREATE TYPE payment_method AS ENUM ('wave', 'orange_money', 'carte_bancaire', 'stripe', 'paypal');
CREATE TYPE payment_status AS ENUM ('paye', 'en_attente', 'echoue');

CREATE TABLE factures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    agency_id UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
    plan_tier saas_plan NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XOF',
    payment_method payment_method NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    status payment_status DEFAULT 'paye',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table Demandes de Visites
CREATE TABLE demandes_visites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_email VARCHAR(255),
    preferred_date TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'en_attente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
