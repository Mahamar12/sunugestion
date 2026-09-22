'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  User,
  Organization,
  Property,
  Unit,
  Owner,
  Tenant,
  Lease,
  RentSchedule,
  Payment,
  Arrear,
  Expense,
  MaintenanceTicket,
  Vendor,
  AppDocument,
  NotificationItem,
  AuditLog,
  SaaSPlan,
  PaymentMethod
} from '@/types/sunugestion';
import { SupabaseDbService } from '@/lib/supabase/db';

export interface SunuGestionContextType {
  currentUser: User;
  organization: Organization;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  
  properties: Property[];
  units: Unit[];
  owners: Owner[];
  tenants: Tenant[];
  leases: Lease[];
  rentSchedules: RentSchedule[];
  payments: Payment[];
  arrears: Arrear[];
  expenses: Expense[];
  maintenanceTickets: MaintenanceTicket[];
  vendors: Vendor[];
  documents: AppDocument[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  saasPlans: SaaSPlan[];

  // Mutators & Actions
  recordPayment: (data: {
    tenantId: string;
    leaseId: string;
    amountFCFA: number;
    method: PaymentMethod;
    referenceNumber: string;
    notes?: string;
  }) => void;

  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'totalPaidFCFA' | 'arrearsFCFA'>) => void;
  addOwner: (owner: Omit<Owner, 'id' | 'createdAt' | 'propertiesCount' | 'totalMonthlyRevenueFCFA'>) => void;
  createLease: (lease: Omit<Lease, 'id' | 'createdAt'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'>) => void;
  createMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicketStatus: (ticketId: string, status: MaintenanceTicket['status'], vendorId?: string) => void;
  sendRelance: (arrearId: string, channel: 'SMS' | 'WHATSAPP' | 'EMAIL') => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Document preview trigger
  selectedDocumentForPrint: AppDocument | null;
  setSelectedDocumentForPrint: (doc: AppDocument | null) => void;
}

export const SunuGestionContext = createContext<SunuGestionContextType | undefined>(undefined);
export const SamaImmoContext = SunuGestionContext;
export type SamaImmoContextType = SunuGestionContextType;

const INITIAL_ORGANIZATION: Organization = {
  id: 'org-1',
  name: 'SunuGestion Immobilier Dakar',
  logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
  email: 'contact@sunugestion.sn',
  phone: '+221 33 824 10 10',
  address: 'Avenue Léopold Sédar Senghor, Immeuble Horizon',
  city: 'Dakar',
  country: 'Sénégal',
  ninea: '008923412 2V3',
  rccm: 'SN.DKR.2023.B.1450',
  subscriptionPlan: 'PRO',
  subscriptionStatus: 'ACTIVE',
  createdAt: '2026-01-15',
};

const INITIAL_USER: User = {
  id: 'usr-admin-1',
  name: 'Mamadou Sy',
  email: 'm.sy@sunugestion.sn',
  phone: '+221 77 654 32 10',
  role: 'ADMIN_AGENCE',
  agencyId: 'org-1',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  status: 'ACTIVE',
  createdAt: '2026-01-15',
};

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    agencyId: 'org-1',
    name: 'Résidence Les Almadies',
    type: 'IMMEUBLE',
    address: 'Route des Almadies, en face King Fahd',
    neighborhood: 'Almadies',
    city: 'Dakar',
    region: 'Dakar',
    description: 'Immeuble standing R+4 de luxe avec ascenseur, gardiennage 24h/24 et groupe électrogène.',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
    status: 'OCCUPE',
    valuationFCFA: 450000000,
    totalUnits: 8,
    occupiedUnits: 7,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    notes: 'Excellente rentabilité locative.',
    createdAt: '2026-01-20',
  },
  {
    id: 'prop-2',
    agencyId: 'org-1',
    name: 'Villa Panoramique Mermoz',
    type: 'VILLA',
    address: 'Mermoz Pyrotechnie, Rue MZ-12',
    neighborhood: 'Mermoz',
    city: 'Dakar',
    region: 'Dakar',
    description: 'Villa de prestige 6 pièces avec piscine privative, garage 3 voitures et jardin paysager.',
    ownerId: 'own-2',
    ownerName: 'Mme Aminata Sow',
    status: 'OCCUPE',
    valuationFCFA: 280000000,
    totalUnits: 1,
    occupiedUnits: 1,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-02-01',
  },
  {
    id: 'prop-3',
    agencyId: 'org-1',
    name: 'Immeuble Liberté 6 Extension',
    type: 'IMMEUBLE',
    address: 'Liberté 6 Extension, VDN',
    neighborhood: 'Liberté 6',
    city: 'Dakar',
    region: 'Dakar',
    description: 'Immeuble mixte de 6 appartements standing et 2 studios.',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
    status: 'OCCUPE',
    valuationFCFA: 320000000,
    totalUnits: 8,
    occupiedUnits: 6,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-02-10',
  },
  {
    id: 'prop-4',
    agencyId: 'org-1',
    name: 'Espace Commercial Plateau',
    type: 'LOCAL_COMMERCIAL',
    address: 'Avenue William Ponty, angle Rue Raffenel',
    neighborhood: 'Plateau',
    city: 'Dakar',
    region: 'Dakar',
    description: 'Bureaux professionnels et boutiques en plein cœur du centre des affaires.',
    ownerId: 'own-3',
    ownerName: 'M. El Hadji Diop',
    status: 'OCCUPE',
    valuationFCFA: 390000000,
    totalUnits: 4,
    occupiedUnits: 4,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-01',
  },
];

const INITIAL_UNITS: Unit[] = [
  {
    id: 'unit-101',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 1A - RDC',
    type: 'APPARTEMENT',
    floor: 'RDC',
    surfaceM2: 120,
    roomsCount: 3,
    rentFCFA: 400000,
    chargesFCFA: 30000,
    status: 'OCCUPE',
    tenantId: 'ten-1',
    tenantName: 'Mamadou Diallo',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
  },
  {
    id: 'unit-102',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 3B - 3ème Etage',
    type: 'APPARTEMENT',
    floor: '3ème étage',
    surfaceM2: 145,
    roomsCount: 4,
    rentFCFA: 500000,
    chargesFCFA: 40000,
    status: 'EN_RETARD',
    tenantId: 'ten-5',
    tenantName: 'Ibrahima Ba',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
  },
  {
    id: 'unit-201',
    propertyId: 'prop-2',
    propertyName: 'Villa Panoramique Mermoz',
    unitNumber: 'Villa Complète',
    type: 'VILLA',
    floor: 'Rez-de-chaussée + 1',
    surfaceM2: 350,
    roomsCount: 6,
    rentFCFA: 1200000,
    chargesFCFA: 100000,
    status: 'OCCUPE',
    tenantId: 'ten-3',
    tenantName: 'Cheikh Faye',
    ownerId: 'own-2',
    ownerName: 'Mme Aminata Sow',
  },
  {
    id: 'unit-301',
    propertyId: 'prop-3',
    propertyName: 'Immeuble Liberté 6 Extension',
    unitNumber: 'Studio 1A - 1er Etage',
    type: 'STUDIO',
    floor: '1er étage',
    surfaceM2: 45,
    roomsCount: 1,
    rentFCFA: 200000,
    chargesFCFA: 15000,
    status: 'EN_RETARD',
    tenantId: 'ten-2',
    tenantName: 'Aïssatou Kane',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
  },
  {
    id: 'unit-401',
    propertyId: 'prop-4',
    propertyName: 'Espace Commercial Plateau',
    unitNumber: 'Bureau 201',
    type: 'BUREAU',
    floor: '2ème étage',
    surfaceM2: 110,
    roomsCount: 3,
    rentFCFA: 750000,
    chargesFCFA: 50000,
    status: 'OCCUPE',
    tenantId: 'ten-4',
    tenantName: 'Fatou Bintou Seck',
    ownerId: 'own-3',
    ownerName: 'M. El Hadji Diop',
  },
  {
    id: 'unit-402',
    propertyId: 'prop-4',
    propertyName: 'Espace Commercial Plateau',
    unitNumber: 'Boutique B02',
    type: 'BOUTIQUE',
    floor: 'RDC',
    surfaceM2: 60,
    roomsCount: 2,
    rentFCFA: 350000,
    chargesFCFA: 25000,
    status: 'OCCUPE',
    tenantId: 'ten-6',
    tenantName: 'Mariama Sy',
    ownerId: 'own-3',
    ownerName: 'M. El Hadji Diop',
  },
];

const INITIAL_OWNERS: Owner[] = [
  {
    id: 'own-1',
    agencyId: 'org-1',
    firstName: 'Ousmane',
    lastName: 'Ndiaye',
    phone: '+221 77 634 12 89',
    whatsapp: '+221 77 634 12 89',
    email: 'o.ndiaye@gmail.com',
    address: 'Les Almadies, Zone 3, Dakar',
    identityDocNumber: '1 756 1982 00192',
    bankAccount: 'CBAO SN012 01001 0039281001 45',
    notes: 'Propriétaire de plusieurs immeubles à Dakar.',
    propertiesCount: 2,
    totalMonthlyRevenueFCFA: 2500000,
    commissionRatePercent: 8,
    createdAt: '2026-01-10',
  },
  {
    id: 'own-2',
    agencyId: 'org-1',
    firstName: 'Aminata',
    lastName: 'Sow',
    phone: '+221 78 450 33 21',
    whatsapp: '+221 78 450 33 21',
    email: 'aminata.sow@yahoo.fr',
    address: 'Mermoz Pyrotechnie, Dakar',
    identityDocNumber: '2 890 1978 00412',
    bankAccount: 'Ecobank SN089 01002 991823001 12',
    notes: 'Paiements réguliers des commissions.',
    propertiesCount: 1,
    totalMonthlyRevenueFCFA: 1200000,
    commissionRatePercent: 10,
    createdAt: '2026-01-12',
  },
  {
    id: 'own-3',
    agencyId: 'org-1',
    firstName: 'El Hadji',
    lastName: 'Diop',
    phone: '+221 70 891 44 55',
    whatsapp: '+221 70 891 44 55',
    email: 'elhadj.diop@diopholding.sn',
    address: 'Dakar Plateau, Rue de Thiong',
    identityDocNumber: '1 654 1969 00892',
    bankAccount: 'BOA SN045 01003 441098234 89',
    notes: 'Locaux commerciaux du Plateau.',
    propertiesCount: 1,
    totalMonthlyRevenueFCFA: 1100000,
    commissionRatePercent: 7,
    createdAt: '2026-02-01',
  },
];

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'ten-1',
    agencyId: 'org-1',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    phone: '+221 77 123 45 67',
    whatsapp: '+221 77 123 45 67',
    email: 'm.diallo@outlook.com',
    birthDate: '1988-04-14',
    address: 'Almadies, Dakar',
    profession: 'Ingénieur Télécom',
    identityDocType: 'CNI',
    identityDocNumber: '1 890 1988 00123',
    emergencyContact: 'Samba Diallo (Frère)',
    emergencyPhone: '+221 77 999 88 77',
    unitId: 'unit-101',
    unitNumber: 'Appt 1A - RDC',
    propertyName: 'Résidence Les Almadies',
    propertyId: 'prop-1',
    rentFCFA: 400000,
    entryDate: '2026-02-01',
    currentLeaseId: 'lse-1',
    totalPaidFCFA: 2800000,
    arrearsFCFA: 0,
    status: 'ACTIF',
    createdAt: '2026-02-01',
  },
  {
    id: 'ten-2',
    agencyId: 'org-1',
    firstName: 'Aïssatou',
    lastName: 'Kane',
    phone: '+221 78 234 56 78',
    whatsapp: '+221 78 234 56 78',
    email: 'aissatou.kane@gmail.com',
    birthDate: '1993-09-22',
    address: 'Liberté 6, Dakar',
    profession: 'Comptable',
    identityDocType: 'CNI',
    identityDocNumber: '2 930 1993 00456',
    emergencyContact: 'Oumy Kane (Sœur)',
    emergencyPhone: '+221 78 888 77 66',
    unitId: 'unit-301',
    unitNumber: 'Studio 1A - 1er Etage',
    propertyName: 'Immeuble Liberté 6 Extension',
    propertyId: 'prop-3',
    rentFCFA: 200000,
    entryDate: '2026-03-01',
    currentLeaseId: 'lse-2',
    totalPaidFCFA: 1000000,
    arrearsFCFA: 200000,
    status: 'EN_RETARD',
    createdAt: '2026-03-01',
  },
  {
    id: 'ten-3',
    agencyId: 'org-1',
    firstName: 'Cheikh',
    lastName: 'Faye',
    phone: '+221 76 345 67 89',
    whatsapp: '+221 76 345 67 89',
    email: 'c.faye@invest.sn',
    birthDate: '1979-11-05',
    address: 'Mermoz Pyrotechnie',
    profession: 'Directeur Général',
    identityDocType: 'PASSPORT',
    identityDocNumber: 'A04918239',
    emergencyContact: 'Seynabou Faye (Epouse)',
    emergencyPhone: '+221 77 555 44 33',
    unitId: 'unit-201',
    unitNumber: 'Villa Complète',
    propertyName: 'Villa Panoramique Mermoz',
    propertyId: 'prop-2',
    rentFCFA: 1200000,
    entryDate: '2026-01-15',
    currentLeaseId: 'lse-3',
    totalPaidFCFA: 8400000,
    arrearsFCFA: 0,
    status: 'ACTIF',
    createdAt: '2026-01-15',
  },
  {
    id: 'ten-4',
    agencyId: 'org-1',
    firstName: 'Fatou Bintou',
    lastName: 'Seck',
    phone: '+221 77 456 78 90',
    whatsapp: '+221 77 456 78 90',
    email: 'fb.seck@seckconsulting.sn',
    address: 'Dakar Plateau',
    profession: 'Avocate d\'affaires',
    identityDocType: 'CNI',
    identityDocNumber: '2 850 1985 00789',
    emergencyContact: 'Modou Seck (Frère)',
    emergencyPhone: '+221 77 222 33 44',
    unitId: 'unit-401',
    unitNumber: 'Bureau 201',
    propertyName: 'Espace Commercial Plateau',
    propertyId: 'prop-4',
    rentFCFA: 750000,
    entryDate: '2026-02-15',
    currentLeaseId: 'lse-4',
    totalPaidFCFA: 4500000,
    arrearsFCFA: 0,
    status: 'ACTIF',
    createdAt: '2026-02-15',
  },
  {
    id: 'ten-5',
    agencyId: 'org-1',
    firstName: 'Ibrahima',
    lastName: 'Ba',
    phone: '+221 78 567 89 01',
    whatsapp: '+221 78 567 89 01',
    email: 'ibrahima.ba@gmail.com',
    address: 'Les Almadies',
    profession: 'Consultant IT',
    identityDocType: 'CNI',
    identityDocNumber: '1 910 1991 00234',
    emergencyContact: 'Khadija Ba (Mère)',
    emergencyPhone: '+221 78 111 22 33',
    unitId: 'unit-102',
    unitNumber: 'Appt 3B - 3ème Etage',
    propertyName: 'Résidence Les Almadies',
    propertyId: 'prop-1',
    rentFCFA: 500000,
    entryDate: '2026-01-01',
    currentLeaseId: 'lse-5',
    totalPaidFCFA: 3500000,
    arrearsFCFA: 500000,
    status: 'EN_RETARD',
    createdAt: '2026-01-01',
  },
  {
    id: 'ten-6',
    agencyId: 'org-1',
    firstName: 'Mariama',
    lastName: 'Sy',
    phone: '+221 70 678 90 12',
    whatsapp: '+221 70 678 90 12',
    email: 'mariama.fashion@gmail.com',
    address: 'Plateau',
    profession: 'Commerçante',
    identityDocType: 'CNI',
    identityDocNumber: '2 940 1994 00987',
    emergencyContact: 'Abdoulaye Sy',
    emergencyPhone: '+221 70 333 44 55',
    unitId: 'unit-402',
    unitNumber: 'Boutique B02',
    propertyName: 'Espace Commercial Plateau',
    propertyId: 'prop-4',
    rentFCFA: 350000,
    entryDate: '2026-03-15',
    currentLeaseId: 'lse-6',
    totalPaidFCFA: 1750000,
    arrearsFCFA: 0,
    status: 'ACTIF',
    createdAt: '2026-03-15',
  },
];

const INITIAL_LEASES: Lease[] = [
  {
    id: 'lse-1',
    agencyId: 'org-1',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    unitId: 'unit-101',
    unitNumber: 'Appt 1A - RDC',
    tenantId: 'ten-1',
    tenantName: 'Mamadou Diallo',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    rentAmountFCFA: 400000,
    chargesAmountFCFA: 30000,
    depositAmountFCFA: 800000,
    paymentFrequency: 'MENSUEL',
    dueDayOfMonth: 5,
    status: 'ACTIF',
    createdAt: '2026-02-01',
  },
  {
    id: 'lse-2',
    agencyId: 'org-1',
    propertyId: 'prop-3',
    propertyName: 'Immeuble Liberté 6 Extension',
    unitId: 'unit-301',
    unitNumber: 'Studio 1A - 1er Etage',
    tenantId: 'ten-2',
    tenantName: 'Aïssatou Kane',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    rentAmountFCFA: 200000,
    chargesAmountFCFA: 15000,
    depositAmountFCFA: 400000,
    paymentFrequency: 'MENSUEL',
    dueDayOfMonth: 5,
    status: 'EXPIRANT_BIENTOT',
    createdAt: '2026-03-01',
  },
  {
    id: 'lse-3',
    agencyId: 'org-1',
    propertyId: 'prop-2',
    propertyName: 'Villa Panoramique Mermoz',
    unitId: 'unit-201',
    unitNumber: 'Villa Complète',
    tenantId: 'ten-3',
    tenantName: 'Cheikh Faye',
    ownerId: 'own-2',
    ownerName: 'Mme Aminata Sow',
    startDate: '2026-01-15',
    endDate: '2027-01-14',
    rentAmountFCFA: 1200000,
    chargesAmountFCFA: 100000,
    depositAmountFCFA: 2400000,
    paymentFrequency: 'MENSUEL',
    dueDayOfMonth: 5,
    status: 'ACTIF',
    createdAt: '2026-01-15',
  },
  {
    id: 'lse-5',
    agencyId: 'org-1',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    unitId: 'unit-102',
    unitNumber: 'Appt 3B - 3ème Etage',
    tenantId: 'ten-5',
    tenantName: 'Ibrahima Ba',
    ownerId: 'own-1',
    ownerName: 'M. Ousmane Ndiaye',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    rentAmountFCFA: 500000,
    chargesAmountFCFA: 40000,
    depositAmountFCFA: 1000000,
    paymentFrequency: 'MENSUEL',
    dueDayOfMonth: 5,
    status: 'ACTIF',
    createdAt: '2026-01-01',
  },
];

const INITIAL_RENT_SCHEDULES: RentSchedule[] = [
  {
    id: 'sch-01',
    leaseId: 'lse-1',
    tenantId: 'ten-1',
    tenantName: 'Mamadou Diallo',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 1A - RDC',
    periodMonthYear: 'Août 2026',
    dueDate: '2026-08-05',
    rentFCFA: 400000,
    chargesFCFA: 30000,
    totalDueFCFA: 430000,
    paidAmountFCFA: 430000,
    remainingFCFA: 0,
    status: 'PAYE',
  },
  {
    id: 'sch-02',
    leaseId: 'lse-2',
    tenantId: 'ten-2',
    tenantName: 'Aïssatou Kane',
    propertyName: 'Immeuble Liberté 6 Extension',
    unitNumber: 'Studio 1A - 1er Etage',
    periodMonthYear: 'Août 2026',
    dueDate: '2026-08-05',
    rentFCFA: 200000,
    chargesFCFA: 15000,
    totalDueFCFA: 215000,
    paidAmountFCFA: 0,
    remainingFCFA: 215000,
    status: 'EN_RETARD',
  },
  {
    id: 'sch-03',
    leaseId: 'lse-3',
    tenantId: 'ten-3',
    tenantName: 'Cheikh Faye',
    propertyName: 'Villa Panoramique Mermoz',
    unitNumber: 'Villa Complète',
    periodMonthYear: 'Août 2026',
    dueDate: '2026-08-05',
    rentFCFA: 1200000,
    chargesFCFA: 100000,
    totalDueFCFA: 1300000,
    paidAmountFCFA: 1300000,
    remainingFCFA: 0,
    status: 'PAYE',
  },
  {
    id: 'sch-04',
    leaseId: 'lse-5',
    tenantId: 'ten-5',
    tenantName: 'Ibrahima Ba',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 3B - 3ème Etage',
    periodMonthYear: 'Août 2026',
    dueDate: '2026-08-05',
    rentFCFA: 500000,
    chargesFCFA: 40000,
    totalDueFCFA: 540000,
    paidAmountFCFA: 0,
    remainingFCFA: 540000,
    status: 'EN_RETARD',
  },
  {
    id: 'sch-05',
    leaseId: 'lse-1',
    tenantId: 'ten-1',
    tenantName: 'Mamadou Diallo',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 1A - RDC',
    periodMonthYear: 'Septembre 2026',
    dueDate: '2026-09-05',
    rentFCFA: 400000,
    chargesFCFA: 30000,
    totalDueFCFA: 430000,
    paidAmountFCFA: 0,
    remainingFCFA: 430000,
    status: 'A_VENIR',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-101',
    agencyId: 'org-1',
    receiptNumber: 'QUITT-2026-0801',
    tenantId: 'ten-1',
    tenantName: 'Mamadou Diallo',
    leaseId: 'lse-1',
    unitNumber: 'Appt 1A - RDC',
    propertyName: 'Résidence Les Almadies',
    amountFCFA: 430000,
    date: '2026-08-03',
    method: 'WAVE',
    referenceNumber: 'WAVE-SN-98213490',
    recordedBy: 'Mamadou Sy',
    notes: 'Paiement reçu via Wave Money.',
    createdAt: '2026-08-03 14:20',
  },
  {
    id: 'pay-102',
    agencyId: 'org-1',
    receiptNumber: 'QUITT-2026-0802',
    tenantId: 'ten-3',
    tenantName: 'Cheikh Faye',
    leaseId: 'lse-3',
    unitNumber: 'Villa Complète',
    propertyName: 'Villa Panoramique Mermoz',
    amountFCFA: 1300000,
    date: '2026-08-04',
    method: 'VIREMENT_BANCAIRE',
    referenceNumber: 'VIR-CBAO-20260804',
    recordedBy: 'Mamadou Sy',
    notes: 'Virement bancaire direct CBAO.',
    createdAt: '2026-08-04 09:15',
  },
  {
    id: 'pay-103',
    agencyId: 'org-1',
    receiptNumber: 'QUITT-2026-0705',
    tenantId: 'ten-4',
    tenantName: 'Fatou Bintou Seck',
    leaseId: 'lse-4',
    unitNumber: 'Bureau 201',
    propertyName: 'Espace Commercial Plateau',
    amountFCFA: 800000,
    date: '2026-07-31',
    method: 'ORANGE_MONEY',
    referenceNumber: 'OM-SN-7789021',
    recordedBy: 'Mamadou Sy',
    createdAt: '2026-07-31 16:45',
  },
];

const INITIAL_ARREARS: Arrear[] = [
  {
    id: 'arr-1',
    tenantId: 'ten-2',
    tenantName: 'Aïssatou Kane',
    tenantPhone: '+221 78 234 56 78',
    tenantWhatsapp: '+221 78 234 56 78',
    propertyName: 'Immeuble Liberté 6 Extension',
    unitNumber: 'Studio 1A - 1er Etage',
    overdueAmountFCFA: 215000,
    daysOverdue: 19,
    lastPaymentDate: '2026-07-05',
    remindersSentCount: 2,
    lastReminderDate: '2026-08-18',
    agingCategory: '8-30_JOURS',
  },
  {
    id: 'arr-2',
    tenantId: 'ten-5',
    tenantName: 'Ibrahima Ba',
    tenantPhone: '+221 78 567 89 01',
    tenantWhatsapp: '+221 78 567 89 01',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 3B - 3ème Etage',
    overdueAmountFCFA: 540000,
    daysOverdue: 19,
    lastPaymentDate: '2026-07-04',
    remindersSentCount: 1,
    lastReminderDate: '2026-08-12',
    agingCategory: '8-30_JOURS',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    agencyId: 'org-1',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    category: 'GARDIENNAGE',
    amountFCFA: 150000,
    date: '2026-08-01',
    vendorName: 'SAGAM Sécurité Senegal',
    description: 'Facture gardiennage mensuel juillet 2026.',
    recordedBy: 'Mamadou Sy',
    createdAt: '2026-08-01',
  },
  {
    id: 'exp-2',
    agencyId: 'org-1',
    propertyId: 'prop-3',
    propertyName: 'Immeuble Liberté 6 Extension',
    category: 'ELECTRICITE',
    amountFCFA: 85000,
    date: '2026-08-10',
    vendorName: 'SENELEC',
    description: 'Facture électricité des communs.',
    recordedBy: 'Mamadou Sy',
    createdAt: '2026-08-10',
  },
  {
    id: 'exp-3',
    agencyId: 'org-1',
    propertyId: 'prop-2',
    propertyName: 'Villa Panoramique Mermoz',
    category: 'ENTRETIEN',
    amountFCFA: 65000,
    date: '2026-08-15',
    vendorName: 'Piscine Pro Services Dakar',
    description: 'Entretien bimensuel piscine et jardin.',
    recordedBy: 'Mamadou Sy',
    createdAt: '2026-08-15',
  },
];

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt-101',
    agencyId: 'org-1',
    title: 'Fuite d\'eau sous l\'évier de la cuisine',
    description: 'Pression d\'eau trop forte entraînant une fuite au niveau de la canalisation d\'évacuation.',
    category: 'PLOMBERIE',
    priority: 'URGENCE',
    status: 'EN_COURS',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 1A - RDC',
    tenantId: 'ten-1',
    tenantName: 'Mamadou Diallo',
    vendorId: 'ven-1',
    vendorName: 'Plomberie Express Dakar (M. Seck)',
    createdAt: '2026-08-20 10:30',
    updatedAt: '2026-08-22 15:00',
  },
  {
    id: 'tkt-102',
    agencyId: 'org-1',
    title: 'Climatiseur Split ne refroidit plus',
    description: 'Le climatiseur du salon souffle de l\'air chaud. Besoin d\'un contrôle de gaz réfrigérant.',
    category: 'CLIMATISATION',
    priority: 'ELEVES',
    status: 'ASSIGNE',
    propertyId: 'prop-4',
    propertyName: 'Espace Commercial Plateau',
    unitNumber: 'Bureau 201',
    tenantId: 'ten-4',
    tenantName: 'Fatou Bintou Seck',
    vendorId: 'ven-2',
    vendorName: 'ClimAfrik Services',
    createdAt: '2026-08-22 09:00',
    updatedAt: '2026-08-23 11:20',
  },
  {
    id: 'tkt-103',
    agencyId: 'org-1',
    title: 'Poignée de porte principale défectueuse',
    description: 'Remplacement nécessaire du canon et de la poignée de sécurité.',
    category: 'SERRURE',
    priority: 'MOYENNE',
    status: 'TERMINE',
    propertyId: 'prop-3',
    propertyName: 'Immeuble Liberté 6 Extension',
    unitNumber: 'Studio 1A - 1er Etage',
    tenantId: 'ten-2',
    tenantName: 'Aïssatou Kane',
    vendorId: 'ven-3',
    vendorName: 'Serrurerie Moderne Dakar',
    createdAt: '2026-08-10 14:00',
    updatedAt: '2026-08-12 17:30',
  },
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    agencyId: 'org-1',
    name: 'Plomberie Express Dakar (M. Seck)',
    phone: '+221 77 555 12 34',
    whatsapp: '+221 77 555 12 34',
    trade: 'PLOMBIER',
    zone: 'Almadies, Ngor, Mermoz, Ouakam',
    hourlyRateFCFA: 15000,
    interventionsCount: 14,
    notes: 'Réactif et disponible les week-ends.',
  },
  {
    id: 'ven-2',
    agencyId: 'org-1',
    name: 'ClimAfrik Services',
    phone: '+221 78 444 99 88',
    whatsapp: '+221 78 444 99 88',
    trade: 'FRIGORISTE',
    zone: 'Dakar Plateau, Fann, Point E',
    hourlyRateFCFA: 20000,
    interventionsCount: 9,
    notes: 'Spécialiste climatisation VRV et Splits.',
  },
  {
    id: 'ven-3',
    agencyId: 'org-1',
    name: 'Serrurerie Moderne Dakar',
    phone: '+221 70 333 22 11',
    whatsapp: '+221 70 333 22 11',
    trade: 'SERRURIER',
    zone: 'Toute la région de Dakar',
    hourlyRateFCFA: 12000,
    interventionsCount: 7,
  },
  {
    id: 'ven-4',
    agencyId: 'org-1',
    name: 'Électricité Générale Fall & Frères',
    phone: '+221 76 888 77 66',
    whatsapp: '+221 76 888 77 66',
    trade: 'ELECTRICIEN',
    zone: 'Dakar & Banlieue',
    hourlyRateFCFA: 18000,
    interventionsCount: 19,
  },
];

const INITIAL_DOCUMENTS: AppDocument[] = [
  {
    id: 'doc-1',
    title: 'Quittance de Loyer - Août 2026 - Mamadou Diallo',
    category: 'QUITTANCE',
    tenantName: 'Mamadou Diallo',
    propertyName: 'Résidence Les Almadies',
    amountFCFA: 430000,
    date: '2026-08-03',
  },
  {
    id: 'doc-2',
    title: 'Contrat de Location - Cheikh Faye - Villa Mermoz',
    category: 'CONTRAT',
    tenantName: 'Cheikh Faye',
    propertyName: 'Villa Panoramique Mermoz',
    amountFCFA: 1200000,
    date: '2026-01-15',
  },
  {
    id: 'doc-3',
    title: 'Lettre de Relance - Aïssatou Kane - Immeuble Liberté 6',
    category: 'RELANCE',
    tenantName: 'Aïssatou Kane',
    propertyName: 'Immeuble Liberté 6 Extension',
    amountFCFA: 215000,
    date: '2026-08-18',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'PAYMENT',
    title: 'Nouveau Paiement Reçu (Wave)',
    message: 'Mamadou Diallo a réglé le loyer d\'Août 2026 (430 000 FCFA).',
    date: '2026-08-03 14:21',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'ARREARS',
    title: 'Loyer en retard d\'échéance',
    message: 'Aïssatou Kane (Studio 1A) a dépassé la date limite du 5 août.',
    date: '2026-08-06 08:00',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'MAINTENANCE',
    title: 'Ticket de maintenance urgent',
    message: 'Signalement de fuite d\'eau à la Résidence Les Almadies.',
    date: '2026-08-20 10:32',
    read: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'usr-admin-1',
    userName: 'Mamadou Sy',
    userRole: 'ADMIN_AGENCE',
    action: 'ENREGISTREMENT_PAIEMENT',
    details: 'Enregistrement paiement 430 000 FCFA par Wave pour Mamadou Diallo',
    entity: 'PAIEMENT',
    timestamp: '2026-08-03 14:20:11',
  },
  {
    id: 'audit-2',
    userId: 'usr-admin-1',
    userName: 'Mamadou Sy',
    userRole: 'ADMIN_AGENCE',
    action: 'CREATION_BIEN',
    details: 'Ajout de la propriété Espace Commercial Plateau',
    entity: 'PROPRIETE',
    timestamp: '2026-03-01 09:00:00',
  },
];

const SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'STARTER',
    name: 'STARTER',
    priceMonthlyFCFA: 5000,
    maxProperties: 10,
    maxTenants: 20,
    features: [
      'Jusqu\'à 10 biens immobilisés',
      '20 locataires max',
      'Gestion automatique des loyers',
      'Quittances de loyer PDF',
      'Tableau de bord de base',
      'Support par email',
    ],
  },
  {
    id: 'PRO',
    name: 'PRO',
    priceMonthlyFCFA: 15000,
    maxProperties: 50,
    maxTenants: 'Illimité',
    recommended: true,
    features: [
      'Jusqu\'à 50 biens',
      'Locataires illimités',
      'Suivi des paiements & impayés',
      'Gestion de la maintenance',
      'Gestion des propriétaires & commissions',
      'Relances WhatsApp & SMS',
      'Exportation rapports financiers PDF & Excel',
    ],
  },
  {
    id: 'BUSINESS',
    name: 'BUSINESS',
    priceMonthlyFCFA: 30000,
    maxProperties: 150,
    maxTenants: 'Illimité',
    features: [
      'Jusqu\'à 150 biens',
      'Comptes utilisateurs multiples (RBAC)',
      'Portail Propriétaire & Portail Locataire',
      'Automatisation des avis d\'échéance',
      'Audit log & traçabilité complète',
      'Support prioritaire 24/7 par téléphone',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'ENTERPRISE',
    priceMonthlyFCFA: 75000,
    maxProperties: 'Illimité',
    maxTenants: 'Illimité',
    features: [
      'Nombre de biens & logements illimité',
      'Architecture SaaS dédiée',
      'Intégration API Wave & Orange Money sur mesure',
      'Nom de domaine personnalisé',
      'Formation sur site pour toute l\'équipe',
      'Chef de projet dédié',
    ],
  },
];

export function SunuGestionProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN_AGENCE');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [organization, setOrganization] = useState<Organization>(INITIAL_ORGANIZATION);
  
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [owners, setOwners] = useState<Owner[]>(INITIAL_OWNERS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [leases, setLeases] = useState<Lease[]>(INITIAL_LEASES);
  const [rentSchedules, setRentSchedules] = useState<RentSchedule[]>(INITIAL_RENT_SCHEDULES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [arrears, setArrears] = useState<Arrear[]>(INITIAL_ARREARS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [documents, setDocuments] = useState<AppDocument[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocumentForPrint, setSelectedDocumentForPrint] = useState<AppDocument | null>(null);

  // Synchronisation Fullstack Supabase
  useEffect(() => {
    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.getProperties().then((remoteProps) => {
        if (remoteProps && remoteProps.length > 0) {
          setProperties((prev) => {
            const remoteIds = new Set(remoteProps.map((p) => p.id));
            const existingFiltered = prev.filter((p) => !remoteIds.has(p.id));
            return [...remoteProps, ...existingFiltered];
          });
        }
      });
    }
  }, []);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    let roleName = 'Administrateur Agence';
    if (role === 'SUPER_ADMIN') roleName = 'Super Admin Plateforme';
    if (role === 'GESTIONNAIRE') roleName = 'Gestionnaire Immobilier';
    if (role === 'COMPTABLE') roleName = 'Comptable Agence';
    if (role === 'PROPRIETAIRE') roleName = 'Propriétaire (M. Ousmane Ndiaye)';
    if (role === 'LOCATAIRE') roleName = 'Locataire (Mamadou Diallo)';

    setCurrentUser((prev) => ({
      ...prev,
      role: role,
      name: role === 'PROPRIETAIRE' ? 'Ousmane Ndiaye' : role === 'LOCATAIRE' ? 'Mamadou Diallo' : prev.name,
    }));

    addAuditLog('CHANGEMENT_ROLE', `Rôle utilisateur basculé vers ${roleName}`, 'SYSTEME');
  };

  const addAuditLog = (action: string, details: string, entity: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      details,
      entity,
      timestamp: new Date().toLocaleString('fr-FR'),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const recordPayment = (data: {
    tenantId: string;
    leaseId: string;
    amountFCFA: number;
    method: PaymentMethod;
    referenceNumber: string;
    notes?: string;
  }) => {
    const tenant = tenants.find((t) => t.id === data.tenantId);
    const lease = leases.find((l) => l.id === data.leaseId);
    const receiptNum = `QUITT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      agencyId: organization.id,
      receiptNumber: receiptNum,
      tenantId: data.tenantId,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire Inconnu',
      leaseId: data.leaseId,
      unitNumber: tenant?.unitNumber || 'N/A',
      propertyName: tenant?.propertyName || 'Propriété',
      amountFCFA: Number(data.amountFCFA),
      date: new Date().toISOString().split('T')[0],
      method: data.method,
      referenceNumber: data.referenceNumber,
      recordedBy: currentUser.name,
      notes: data.notes,
      createdAt: new Date().toLocaleString('fr-FR'),
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update tenant total paid & arrears
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === data.tenantId) {
          const newArrears = Math.max(0, t.arrearsFCFA - data.amountFCFA);
          return {
            ...t,
            totalPaidFCFA: t.totalPaidFCFA + data.amountFCFA,
            arrearsFCFA: newArrears,
            status: newArrears === 0 ? 'ACTIF' : 'EN_RETARD',
          };
        }
        return t;
      })
    );

    // Update schedules
    setRentSchedules((prev) =>
      prev.map((sch) => {
        if (sch.tenantId === data.tenantId && (sch.status === 'EN_RETARD' || sch.status === 'DUE' || sch.status === 'A_VENIR')) {
          return {
            ...sch,
            paidAmountFCFA: sch.paidAmountFCFA + data.amountFCFA,
            remainingFCFA: Math.max(0, sch.totalDueFCFA - (sch.paidAmountFCFA + data.amountFCFA)),
            status: sch.paidAmountFCFA + data.amountFCFA >= sch.totalDueFCFA ? 'PAYE' : 'PARTIEL',
          };
        }
        return sch;
      })
    );

    // Clear from Arrears list if settled
    setArrears((prev) => prev.filter((a) => a.tenantId !== data.tenantId));

    // Generate Quittance Document
    const newDoc: AppDocument = {
      id: `doc-${Date.now()}`,
      title: `Quittance de Loyer - ${receiptNum} - ${tenant?.firstName} ${tenant?.lastName}`,
      category: 'QUITTANCE',
      tenantName: `${tenant?.firstName} ${tenant?.lastName}`,
      propertyName: tenant?.propertyName,
      amountFCFA: data.amountFCFA,
      date: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);

    // Push notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'PAYMENT',
      title: 'Paiement Enregistré avec Succès',
      message: `Quittance ${receiptNum} générée pour ${tenant?.firstName} ${tenant?.lastName} (${data.amountFCFA.toLocaleString('fr-FR')} FCFA via ${data.method}).`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog('ENREGISTREMENT_PAIEMENT', `Enregistrement du paiement ${data.amountFCFA} FCFA (${data.method}) ref: ${data.referenceNumber}`, 'PAIEMENT');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertPayment(data).catch((err) =>
        console.warn('Supabase payment sync notice:', err)
      );
    }
  };

  const addProperty = (propData: Omit<Property, 'id' | 'createdAt'>) => {
    const newProp: Property = {
      ...propData,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => [newProp, ...prev]);
    addAuditLog('CREATION_PROPRIETE', `Ajout de la propriété "${newProp.name}" à ${newProp.neighborhood}`, 'PROPRIETE');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertProperty(propData).catch((err) =>
        console.warn('Supabase property sync notice:', err)
      );
    }
  };

  const addUnit = (unitData: Omit<Unit, 'id'>) => {
    const newUnit: Unit = {
      ...unitData,
      id: `unit-${Date.now()}`,
    };
    setUnits((prev) => [...prev, newUnit]);
    
    // Update property unit counters
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === unitData.propertyId) {
          return {
            ...p,
            totalUnits: p.totalUnits + 1,
            occupiedUnits: unitData.status === 'OCCUPE' ? p.occupiedUnits + 1 : p.occupiedUnits,
          };
        }
        return p;
      })
    );

    addAuditLog('CREATION_LOGEMENT', `Ajout de l'unité ${newUnit.unitNumber} (${newUnit.propertyName})`, 'UNITE');
  };

  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'totalPaidFCFA' | 'arrearsFCFA'>) => {
    const newTenant: Tenant = {
      ...tenantData,
      id: `ten-${Date.now()}`,
      totalPaidFCFA: 0,
      arrearsFCFA: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [newTenant, ...prev]);
    addAuditLog('CREATION_LOCATAIRE', `Création du locataire ${newTenant.firstName} ${newTenant.lastName}`, 'LOCATAIRE');
  };

  const addOwner = (ownerData: Omit<Owner, 'id' | 'createdAt' | 'propertiesCount' | 'totalMonthlyRevenueFCFA'>) => {
    const newOwner: Owner = {
      ...ownerData,
      id: `own-${Date.now()}`,
      propertiesCount: 0,
      totalMonthlyRevenueFCFA: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOwners((prev) => [newOwner, ...prev]);
    addAuditLog('CREATION_PROPRIETAIRE', `Nouveau propriétaire enregistré: ${newOwner.firstName} ${newOwner.lastName}`, 'PROPRIETAIRE');
  };

  const createLease = (leaseData: Omit<Lease, 'id' | 'createdAt'>) => {
    const newLease: Lease = {
      ...leaseData,
      id: `lse-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeases((prev) => [newLease, ...prev]);

    // Create schedule for first month
    const newSchedule: RentSchedule = {
      id: `sch-${Date.now()}`,
      leaseId: newLease.id,
      tenantId: newLease.tenantId,
      tenantName: newLease.tenantName,
      propertyName: newLease.propertyName,
      unitNumber: newLease.unitNumber,
      periodMonthYear: 'Septembre 2026',
      dueDate: '2026-09-05',
      rentFCFA: newLease.rentAmountFCFA,
      chargesFCFA: newLease.chargesAmountFCFA,
      totalDueFCFA: newLease.rentAmountFCFA + newLease.chargesAmountFCFA,
      paidAmountFCFA: 0,
      remainingFCFA: newLease.rentAmountFCFA + newLease.chargesAmountFCFA,
      status: 'A_VENIR',
    };
    setRentSchedules((prev) => [newSchedule, ...prev]);

    addAuditLog('CREATION_CONTRAT', `Nouveau contrat de location créé pour ${newLease.tenantName} (${newLease.unitNumber})`, 'CONTRAT');
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addAuditLog('CREATION_DEPENSE', `Dépense de ${newExpense.amountFCFA} FCFA ajoutée (${newExpense.category})`, 'DEPENSE');
  };

  const createMaintenanceTicket = (ticketData: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toLocaleString('fr-FR');
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setMaintenanceTickets((prev) => [newTicket, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'MAINTENANCE',
      title: `Demande de Maintenance (${newTicket.priority})`,
      message: `${newTicket.title} - ${newTicket.unitNumber} (${newTicket.propertyName})`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog('CREATION_MAINTENANCE', `Signalement de panne: ${newTicket.title} (${newTicket.priority})`, 'MAINTENANCE');
  };

  const updateTicketStatus = (ticketId: string, status: MaintenanceTicket['status'], vendorId?: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    setMaintenanceTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            vendorId: vendorId || t.vendorId,
            vendorName: vendor ? vendor.name : t.vendorName,
            updatedAt: new Date().toLocaleString('fr-FR'),
          };
        }
        return t;
      })
    );
    addAuditLog('MAJ_MAINTENANCE', `Statut de la demande de maintenance modifié vers ${status}`, 'MAINTENANCE');
  };

  const sendRelance = (arrearId: string, channel: 'SMS' | 'WHATSAPP' | 'EMAIL') => {
    setArrears((prev) =>
      prev.map((arr) => {
        if (arr.id === arrearId) {
          return {
            ...arr,
            remindersSentCount: arr.remindersSentCount + 1,
            lastReminderDate: new Date().toISOString().split('T')[0],
          };
        }
        return arr;
      })
    );

    const arrear = arrears.find((a) => a.id === arrearId);
    const newDoc: AppDocument = {
      id: `doc-relance-${Date.now()}`,
      title: `Lettre de Relance (${channel}) - ${arrear?.tenantName}`,
      category: 'RELANCE',
      tenantName: arrear?.tenantName,
      propertyName: arrear?.propertyName,
      amountFCFA: arrear?.overdueAmountFCFA,
      date: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);

    addAuditLog('ENVOI_RELANCE', `Relance envoyée par ${channel} à ${arrear?.tenantName} (${arrear?.overdueAmountFCFA} FCFA en retard)`, 'RELANCE');
  };

  return (
    <SunuGestionContext.Provider
      value={{
        currentUser,
        organization,
        currentRole,
        switchRole,
        properties,
        units,
        owners,
        tenants,
        leases,
        rentSchedules,
        payments,
        arrears,
        expenses,
        maintenanceTickets,
        vendors,
        documents,
        notifications,
        auditLogs,
        saasPlans: SAAS_PLANS,
        recordPayment,
        addProperty,
        addUnit,
        addTenant,
        addOwner,
        createLease,
        addExpense,
        createMaintenanceTicket,
        updateTicketStatus,
        sendRelance,
        searchQuery,
        setSearchQuery,
        selectedDocumentForPrint,
        setSelectedDocumentForPrint,
      }}
    >
      {children}
    </SunuGestionContext.Provider>
  );
}

export function useSunuGestion() {
  const context = useContext(SunuGestionContext);
  if (!context) {
    throw new Error('useSunuGestion must be used within a SunuGestionProvider');
  }
  return context;
}

// Backward-compatibility aliases
export const SamaImmoProvider = SunuGestionProvider;
export const useSamaImmo = useSunuGestion;

