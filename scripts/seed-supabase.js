const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hvmznbgxsmtssstmkbiu.supabase.co';
const supabaseKey = 'sb_publishable_SBDC8YLDpCbSECpgqe_m1w_UqOH9JgI';
const DEFAULT_ORG_ID = '11111111-1111-1111-1111-111111111111';

const client = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Initialisation et Seeding Supabase Cloud pour SunuGestion ---');

  // 1. Check properties
  const { data: existingProps, error: propErr } = await client.from('properties').select('id');
  if (propErr) {
    console.error('Erreur lecture properties:', propErr);
    return;
  }

  if (existingProps && existingProps.length > 0) {
    console.log(`La base contient déjà ${existingProps.length} biens immobiliers. Pas besoin de ré-ensemencer.`);
    return;
  }

  console.log('Base de données vide. Démarrage de l\'insertion des données initiales...');

  // 1. Insertion des Bailleurs (Owners)
  const ownersToInsert = [
    {
      organization_id: DEFAULT_ORG_ID,
      first_name: 'Ousmane',
      last_name: 'Ndiaye',
      phone: '+221 77 638 90 12',
      email: 'o.ndiaye@terangaimmo.sn',
      address: 'Route des Almadies, Dakar',
      cni_number: '1 751 1980 04512',
      commission_rate: 8.0,
      notes: 'Propriétaire de la Résidence Les Almadies et Villa Fann',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      first_name: 'Mariama',
      last_name: 'Ba',
      phone: '+221 78 440 22 11',
      email: 'm.ba@kebemer-invest.sn',
      address: 'Point E, Boulevard de l\'Est',
      cni_number: '2 751 1985 00921',
      commission_rate: 7.5,
      notes: 'Investisseuse basée à Dakar',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      first_name: 'Cheikh',
      last_name: 'Tidiane Tall',
      phone: '+221 76 890 34 56',
      email: 'tall.invest@sentoo.sn',
      address: 'Mamelles Aviation, Dakar',
      cni_number: '1 751 1974 08842',
      commission_rate: 8.5,
    }
  ];

  const { data: createdOwners, error: ownErr } = await client
    .from('owners')
    .insert(ownersToInsert)
    .select('id, first_name, last_name');

  if (ownErr) {
    console.error('Erreur insertion owners:', ownErr);
    return;
  }
  console.log(`-> ${createdOwners.length} propriétaires insérés.`);

  const owner1Id = createdOwners[0]?.id;
  const owner2Id = createdOwners[1]?.id;

  // 2. Insertion des Biens Immobiliers (Properties)
  const propertiesToInsert = [
    {
      organization_id: DEFAULT_ORG_ID,
      owner_id: owner1Id,
      name: 'Résidence Les Almadies',
      type: 'IMMEUBLE',
      address: 'Route des Almadies, en face King Fahd Palace',
      neighborhood: 'Almadies',
      city: 'Dakar',
      country: 'Sénégal',
      description: 'Immeuble standing R+4 sécurisé avec groupe électrogène, ascenseur et gardiennage 24h/24.',
      total_units: 4,
      occupied_units: 3,
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      owner_id: owner1Id,
      name: 'Villa Prestige Fann Résidence',
      type: 'VILLA',
      address: 'Corniche Ouest, Fann Résidence',
      neighborhood: 'Fann Résidence',
      city: 'Dakar',
      country: 'Sénégal',
      description: 'Villa de maître avec piscine privative, jardin arboré et dépendances pour personnel.',
      total_units: 1,
      occupied_units: 1,
      image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      owner_id: owner2Id,
      name: 'Immeuble Liberté 6 Extension',
      type: 'IMMEUBLE',
      address: 'Voie de Dégagement Nord (VDN), Liberté 6',
      neighborhood: 'Liberté 6',
      city: 'Dakar',
      country: 'Sénégal',
      description: 'Immeuble moderne à proximité immédiate de l\'hypermarché Auchan et des transports BRT.',
      total_units: 6,
      occupied_units: 5,
      image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      owner_id: owner2Id,
      name: 'Espace Commercial Plateau',
      type: 'COMMERCIAL',
      address: 'Avenue Peytavin angle Boulevard de la République',
      neighborhood: 'Dakar Plateau',
      city: 'Dakar',
      country: 'Sénégal',
      description: 'Plateau de bureaux et commerces au cœur du quartier des affaires de Dakar.',
      total_units: 4,
      occupied_units: 4,
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const { data: createdProps, error: propInsertErr } = await client
    .from('properties')
    .insert(propertiesToInsert)
    .select('id, name');

  if (propInsertErr) {
    console.error('Erreur insertion properties:', propInsertErr);
    return;
  }
  console.log(`-> ${createdProps.length} biens immobiliers insérés.`);

  const propAlmadiesId = createdProps[0]?.id;

  // 3. Insertion des Logements (Units)
  const unitsToInsert = [
    {
      property_id: propAlmadiesId,
      owner_id: owner1Id,
      unit_number: 'Appt 1A - 1er Étage',
      type: 'APPARTEMENT',
      floor: 1,
      surface_sqm: 120,
      rooms: 4,
      bathrooms: 3,
      monthly_rent_fcfa: 400000,
      charges_fcfa: 30000,
      deposit_fcfa: 800000,
      status: 'OCCUPE',
    },
    {
      property_id: propAlmadiesId,
      owner_id: owner1Id,
      unit_number: 'Appt 2B - 2ème Étage',
      type: 'APPARTEMENT',
      floor: 2,
      surface_sqm: 110,
      rooms: 3,
      bathrooms: 2,
      monthly_rent_fcfa: 380000,
      charges_fcfa: 25000,
      deposit_fcfa: 760000,
      status: 'OCCUPE',
    },
    {
      property_id: propAlmadiesId,
      owner_id: owner1Id,
      unit_number: 'Studio 3C - 3ème Étage',
      type: 'STUDIO',
      floor: 3,
      surface_sqm: 55,
      rooms: 1,
      bathrooms: 1,
      monthly_rent_fcfa: 200000,
      charges_fcfa: 15000,
      deposit_fcfa: 400000,
      status: 'DISPONIBLE',
    }
  ];

  const { data: createdUnits, error: unitErr } = await client
    .from('units')
    .insert(unitsToInsert)
    .select('id, unit_number');

  if (unitErr) {
    console.error('Erreur insertion units:', unitErr);
    return;
  }
  console.log(`-> ${createdUnits.length} unités / logements insérés.`);

  // 4. Insertion des Locataires (Tenants)
  const tenantsToInsert = [
    {
      organization_id: DEFAULT_ORG_ID,
      first_name: 'Mamadou',
      last_name: 'Diallo',
      phone: '+221 77 123 45 67',
      email: 'm.diallo@sonatel.sn',
      cni_number: '1 751 1988 02451',
      profession: 'Ingénieur Télécoms',
      employer: 'Sonatel Orange',
      emergency_contact_name: 'Aminata Diallo',
      emergency_contact_phone: '+221 77 987 65 43',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      first_name: 'Aïssatou',
      last_name: 'Kane',
      phone: '+221 78 555 43 21',
      email: 'aissatou.kane@ecobank.com',
      cni_number: '2 751 1992 01842',
      profession: 'Analyste Financière',
      employer: 'Ecobank Sénégal',
      emergency_contact_name: 'Moussa Kane',
      emergency_contact_phone: '+221 76 333 22 11',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      first_name: 'Ibrahima',
      last_name: 'Sow',
      phone: '+221 70 888 12 34',
      email: 'ibrahima.sow@afdb.org',
      cni_number: '1 751 1983 09142',
      profession: 'Consultant BAD',
      employer: 'Banque Africaine de Développement',
    }
  ];

  const { data: createdTenants, error: tenErr } = await client
    .from('tenants')
    .insert(tenantsToInsert)
    .select('id, first_name, last_name');

  if (tenErr) {
    console.error('Erreur insertion tenants:', tenErr);
    return;
  }
  console.log(`-> ${createdTenants.length} locataires insérés.`);

  // 5. Insertion des Prestataires (Vendors)
  const vendorsToInsert = [
    {
      organization_id: DEFAULT_ORG_ID,
      name: 'Plomberie Express Dakar (M. Seck)',
      trade: 'PLOMBIER',
      phone: '+221 77 555 12 34',
      address: 'Almadies, Ngor, Ouakam, Mermoz',
      status: 'DISPONIBLE',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      name: 'ClimAfrik Services',
      trade: 'FRIGORISTE',
      phone: '+221 78 444 99 88',
      address: 'Dakar Plateau, Fann, Point E',
      status: 'DISPONIBLE',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      name: 'Serrurerie Moderne Dakar',
      trade: 'SERRURIER',
      phone: '+221 70 333 22 11',
      address: 'Toute la région de Dakar',
      status: 'DISPONIBLE',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      name: 'Électricité Générale Fall & Frères',
      trade: 'ELECTRICIEN',
      phone: '+221 76 888 77 66',
      address: 'Dakar & Banlieue',
      status: 'DISPONIBLE',
    }
  ];

  await client.from('vendors').insert(vendorsToInsert);
  console.log('-> Prestataires et artisans insérés.');

  // 6. Insertion des Dépenses (Expenses)
  const expensesToInsert = [
    {
      organization_id: DEFAULT_ORG_ID,
      property_id: propAlmadiesId,
      category: 'SENELEC',
      description: 'Facture électricité des parties communes (Ascenseur & Éclairage hall)',
      amount_fcfa: 185000,
      expense_date: '2026-08-05',
      payment_method: 'WAVE',
      recorded_by: 'Mamadou Sy',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      property_id: propAlmadiesId,
      category: 'SECURITE',
      description: 'Contrat gardiennage mensuel SAGAM (2 agents jour/nuit)',
      amount_fcfa: 250000,
      expense_date: '2026-08-01',
      payment_method: 'VIREMENT',
      recorded_by: 'Mamadou Sy',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      property_id: propAlmadiesId,
      category: 'MAINTENANCE',
      description: 'Entretien mensuel préventif ascenseur OTIS',
      amount_fcfa: 120000,
      expense_date: '2026-08-10',
      payment_method: 'CHEQUE',
      recorded_by: 'Mamadou Sy',
    }
  ];

  await client.from('expenses').insert(expensesToInsert);
  console.log('-> Dépenses d\'immeubles insérées.');

  // 7. Insertion de Paiements (Payments)
  const paymentsToInsert = [
    {
      organization_id: DEFAULT_ORG_ID,
      tenant_id: createdTenants[0]?.id,
      amount_fcfa: 430000,
      payment_date: '2026-08-03',
      method: 'WAVE',
      reference_number: 'WAVE-SN-98213490',
      status: 'VALIDE',
      receipt_number: 'REC-2026-08-001',
      notes: 'Loyer Août 2026 réglé via Wave',
    },
    {
      organization_id: DEFAULT_ORG_ID,
      tenant_id: createdTenants[1]?.id,
      amount_fcfa: 250000,
      payment_date: '2026-08-04',
      method: 'ORANGE_MONEY',
      reference_number: 'OM-SN-44318902',
      status: 'VALIDE',
      receipt_number: 'REC-2026-08-002',
      notes: 'Loyer Août 2026 réglé via Orange Money',
    }
  ];

  await client.from('payments').insert(paymentsToInsert);
  console.log('-> Paiements récents insérés.');

  console.log('=== SUCCÈS : BASE DE DONNÉES SUPABASE FULLSTACK INITIALISÉE ET PRÊTE ! ===');
}

main().catch(console.error);
