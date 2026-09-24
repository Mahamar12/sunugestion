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
  deleteProperty: (propertyId: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  deleteUnit: (unitId: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'totalPaidFCFA' | 'arrearsFCFA'>) => Promise<Tenant> | void;
  deleteTenant: (tenantId: string) => Promise<void> | void;
  addOwner: (owner: Omit<Owner, 'id' | 'createdAt'> & Partial<Pick<Owner, 'propertiesCount' | 'totalMonthlyRevenueFCFA'>>) => Promise<Owner> | void;
  deleteOwner: (ownerId: string) => Promise<void> | void;
  createLease: (lease: Omit<Lease, 'id' | 'createdAt'>) => void;
  deleteLease: (leaseId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'>) => void;
  deleteExpense: (expenseId: string) => void;
  deletePayment: (paymentId: string) => void;
  createMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicketStatus: (ticketId: string, status: MaintenanceTicket['status'], vendorId?: string) => void;
  sendRelance: (arrearId: string, channel: 'SMS' | 'WHATSAPP' | 'EMAIL') => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'agencyId'>) => void;
  deleteVendor: (vendorId: string) => void;
  updateOrganization: (orgData: Partial<Organization>) => void;
  updateSubscriptionPlan: (planId: string) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Document preview trigger
  selectedDocumentForPrint: AppDocument | null;
  setSelectedDocumentForPrint: (doc: AppDocument | null) => void;

  // Mobile Navigation
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '72bdeb8d-06d2-44b8-8cc4-60ae526d6297',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '82bdeb8d-06d2-44b8-8cc4-60ae526d6298',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '72bdeb8d-06d2-44b8-8cc4-60ae526d6297',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '82bdeb8d-06d2-44b8-8cc4-60ae526d6298',
    ownerName: 'M. El Hadji Diop',
  },
  {
    id: 'unit-402',
    propertyId: 'prop-4',
    propertyName: 'Espace Commercial Plateau',
    unitNumber: 'Magasin M02',
    type: 'MAGASIN',
    floor: 'RDC',
    surfaceM2: 60,
    roomsCount: 2,
    rentFCFA: 350000,
    chargesFCFA: 25000,
    status: 'OCCUPE',
    tenantId: 'ten-6',
    tenantName: 'Mariama Sy',
    ownerId: '82bdeb8d-06d2-44b8-8cc4-60ae526d6298',
    ownerName: 'M. El Hadji Diop',
  },
  {
    id: 'unit-202',
    propertyId: 'prop-2',
    propertyName: 'Villa Panoramique Mermoz',
    unitNumber: 'Maison F4 - R+1',
    type: 'MAISON',
    floor: 'RDC + 1',
    surfaceM2: 220,
    roomsCount: 4,
    rentFCFA: 700000,
    chargesFCFA: 50000,
    status: 'DISPONIBLE',
    ownerId: '72bdeb8d-06d2-44b8-8cc4-60ae526d6297',
    ownerName: 'Mme Aminata Sow',
  },
  {
    id: 'unit-103',
    propertyId: 'prop-1',
    propertyName: 'Résidence Les Almadies',
    unitNumber: 'Appt 2B - 2ème Etage',
    type: 'APPARTEMENT',
    floor: '2ème étage',
    surfaceM2: 130,
    roomsCount: 3,
    rentFCFA: 450000,
    chargesFCFA: 35000,
    status: 'DISPONIBLE',
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
    ownerName: 'M. Ousmane Ndiaye',
  },
  {
    id: 'unit-302',
    propertyId: 'prop-3',
    propertyName: 'Immeuble Liberté 6 Extension',
    unitNumber: 'Studio 2B - 2ème Etage',
    type: 'STUDIO',
    floor: '2ème étage',
    surfaceM2: 40,
    roomsCount: 1,
    rentFCFA: 180000,
    chargesFCFA: 15000,
    status: 'DISPONIBLE',
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
    ownerName: 'M. Ousmane Ndiaye',
  },
  {
    id: 'unit-403',
    propertyId: 'prop-4',
    propertyName: 'Espace Commercial Plateau',
    unitNumber: 'Magasin M01 - RDC',
    type: 'MAGASIN',
    floor: 'RDC',
    surfaceM2: 75,
    roomsCount: 2,
    rentFCFA: 400000,
    chargesFCFA: 30000,
    status: 'DISPONIBLE',
    ownerId: '82bdeb8d-06d2-44b8-8cc4-60ae526d6298',
    ownerName: 'M. El Hadji Diop',
  },
  {
    id: 'unit-404',
    propertyId: 'prop-4',
    propertyName: 'Espace Commercial Plateau',
    unitNumber: 'Bureau 305 - 3ème Etage',
    type: 'BUREAU',
    floor: '3ème étage',
    surfaceM2: 95,
    roomsCount: 3,
    rentFCFA: 600000,
    chargesFCFA: 45000,
    status: 'DISPONIBLE',
    ownerId: '82bdeb8d-06d2-44b8-8cc4-60ae526d6298',
    ownerName: 'M. El Hadji Diop',
  },
];

const INITIAL_OWNERS: Owner[] = [
  {
    id: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    id: '72bdeb8d-06d2-44b8-8cc4-60ae526d6297',
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
    id: '82bdeb8d-06d2-44b8-8cc4-60ae526d6298',
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
    id: 'afd3365b-cd0e-4a8c-a531-140da3df29f3',
    agencyId: 'org-1',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    phone: '+221 77 554 20 18',
    whatsapp: '+221 77 554 20 18',
    email: 'm.diallo@sonatel.sn',
    birthDate: '1988-04-14',
    address: 'Almadies, Dakar',
    profession: 'Ingénieur Télécom',
    identityDocType: 'CNI',
    identityDocNumber: '1 759 1986 00319',
    emergencyContact: 'Samba Diallo (Frère)',
    emergencyPhone: '+221 77 999 88 77',
    unitId: '365199fb-2624-4b1b-989d-130e6f3ecd9c',
    unitNumber: 'Appartement 2B',
    propertyName: 'Résidence Teranga Almadies',
    propertyId: 'd95c65a7-d3c6-47d2-83b1-2355f15acc7e',
    rentFCFA: 400000,
    entryDate: '2026-02-01',
    currentLeaseId: 'lse-1',
    totalPaidFCFA: 2800000,
    arrearsFCFA: 0,
    status: 'ACTIF',
    createdAt: '2026-02-01',
  },
  {
    id: 'afd3365b-cd0e-4a8c-a531-140da3df29f4',
    agencyId: 'org-1',
    firstName: 'Aïssatou',
    lastName: 'Kane',
    phone: '+221 78 234 56 78',
    whatsapp: '+221 78 234 56 78',
    email: 'aissatou.kane@bceao.int',
    birthDate: '1993-09-22',
    address: 'Liberté 6, Dakar',
    profession: 'Analyste Financière',
    identityDocType: 'CNI',
    identityDocNumber: '2 759 1991 00824',
    emergencyContact: 'Dr. Kane (Père)',
    emergencyPhone: '+221 77 500 12 34',
    unitId: '365199fb-2624-4b1b-989d-130e6f3ecd9b',
    unitNumber: 'Appartement 1A',
    propertyName: 'Immeuble Liberté 6 Extension',
    propertyId: 'e12a4567-e89b-12d3-a456-426614174002',
    rentFCFA: 450000,
    entryDate: '2026-03-01',
    currentLeaseId: 'lse-2',
    totalPaidFCFA: 1000000,
    arrearsFCFA: 0,
    status: 'ACTIF',
    createdAt: '2026-03-01',
  },
  {
    id: 'afd3365b-cd0e-4a8c-a531-140da3df29f5',
    agencyId: 'org-1',
    firstName: 'Cheikh',
    lastName: 'Faye',
    phone: '+221 76 345 67 89',
    whatsapp: '+221 76 345 67 89',
    email: 'cheikh.faye@invest-senegal.com',
    birthDate: '1979-11-05',
    address: 'Mermoz Pyrotechnie',
    profession: 'Directeur Général',
    identityDocType: 'CNI',
    identityDocNumber: '1 759 1975 00198',
    emergencyContact: 'Aminata Faye',
    emergencyPhone: '+221 77 622 33 44',
    unitId: '365199fb-2624-4b1b-989d-130e6f3ecd9d',
    unitNumber: 'Villa Complète Mermoz',
    propertyName: 'Villa Panoramique Mermoz',
    propertyId: 'e12a4567-e89b-12d3-a456-426614174001',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
    ownerId: '72bdeb8d-06d2-44b8-8cc4-60ae526d6297',
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
    ownerId: '42bdeb8d-06d2-44b8-8cc4-60ae526d6296',
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  // Helper UUID
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Hydratation instantanée LocalStorage pour éviter tout flash d'anciennes données
  useEffect(() => {
    try {
      const cachedTenants = localStorage.getItem('sunu_tenants');
      if (cachedTenants) {
        const parsed = JSON.parse(cachedTenants);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTenants(parsed);
        }
      }
      const cachedOwners = localStorage.getItem('sunu_owners');
      if (cachedOwners) {
        const parsedOwners = JSON.parse(cachedOwners);
        if (Array.isArray(parsedOwners) && parsedOwners.length > 0) {
          setOwners(parsedOwners);
        }
      }
    } catch (e) {
      console.warn('LocalStorage hydration notice:', e);
    }
  }, []);

  // Synchronisation Fullstack Supabase Cloud
  useEffect(() => {
    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.getOrganization().then((remoteOrg) => {
        if (remoteOrg) setOrganization(remoteOrg);
      });

      Promise.all([
        SupabaseDbService.getProperties(),
        SupabaseDbService.getUnits(),
        SupabaseDbService.getOwners(),
        SupabaseDbService.getTenants(),
        SupabaseDbService.getLeases(),
        SupabaseDbService.getPayments(),
        SupabaseDbService.getExpenses(),
        SupabaseDbService.getVendors(),
      ]).then(([p, u, o, t, l, pay, exp, v]) => {
        if (p && p.length > 0) setProperties(p);
        if (u && u.length > 0) setUnits(u);
        if (o && Array.isArray(o) && o.length > 0) {
          setOwners(o);
          try {
            localStorage.setItem('sunu_owners', JSON.stringify(o));
          } catch (e) {}
        }
        if (t && Array.isArray(t)) {
          setTenants(t);
          try {
            localStorage.setItem('sunu_tenants', JSON.stringify(t));
          } catch (e) {}
        }
        if (l && l.length > 0) setLeases(l);
        if (pay && pay.length > 0) setPayments(pay);
        if (exp && exp.length > 0) setExpenses(exp);
        if (v && v.length > 0) setVendors(v);
      }).catch((err) => console.warn('Supabase sync notice:', err));
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
    const newId = generateUUID();

    const newPayment: Payment = {
      id: newId,
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
      id: generateUUID(),
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
      id: generateUUID(),
      type: 'PAYMENT',
      title: 'Paiement Enregistré avec Succès',
      message: `Quittance ${receiptNum} générée pour ${tenant?.firstName} ${tenant?.lastName} (${data.amountFCFA.toLocaleString('fr-FR')} FCFA via ${data.method}).`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog('ENREGISTREMENT_PAIEMENT', `Enregistrement du paiement ${data.amountFCFA} FCFA (${data.method}) ref: ${data.referenceNumber}`, 'PAIEMENT');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertPayment(data, newId).catch((err) =>
        console.warn('Supabase payment sync notice:', err)
      );
    }
  };

  const deletePayment = (paymentId: string) => {
    const paymentToDelete = payments.find((p) => p.id === paymentId);
    if (!paymentToDelete) return;

    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    addAuditLog('SUPPRESSION_PAIEMENT', `Suppression du paiement ${paymentToDelete.receiptNumber}`, 'PAIEMENT');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deletePayment(paymentId).catch((err) =>
        console.warn('Supabase deletePayment error:', err)
      );
    }
  };

  const addProperty = (propData: Omit<Property, 'id' | 'createdAt'>) => {
    const newId = generateUUID();
    const newProp: Property = {
      ...propData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => [newProp, ...prev]);
    addAuditLog('CREATION_PROPRIETE', `Ajout de la propriété "${newProp.name}" à ${newProp.neighborhood}`, 'PROPRIETE');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Bien Immobilier Ajouté',
      message: `Le bien "${newProp.name}" (${newProp.type}) à ${newProp.neighborhood} a été créé avec succès.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertProperty(propData, newId).catch((err) =>
        console.warn('Supabase property sync notice:', err)
      );
    }
  };

  const deleteProperty = (propertyId: string) => {
    const propToDelete = properties.find((p) => p.id === propertyId);
    if (!propToDelete) return;

    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setUnits((prev) => prev.filter((u) => u.propertyId !== propertyId));
    setLeases((prev) => prev.filter((l) => l.propertyId !== propertyId));

    addAuditLog('SUPPRESSION_PROPRIETE', `Suppression du bien ${propToDelete.name}`, 'PROPRIETE');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Bien Immobilier Supprimé',
      message: `Le bien "${propToDelete.name}" (${propToDelete.neighborhood}) a été supprimé.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deleteProperty(propertyId).catch((err) =>
        console.warn('Supabase deleteProperty error:', err)
      );
    }
  };

  const addUnit = (unitData: Omit<Unit, 'id'>) => {
    const newId = generateUUID();
    const newUnit: Unit = {
      ...unitData,
      id: newId,
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

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Logement Ajouté',
      message: `L'unité "${newUnit.unitNumber}" a été ajoutée à ${newUnit.propertyName}.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertUnit(unitData, newId).catch((err) =>
        console.warn('Supabase unit insert notice:', err)
      );
    }
  };

  const deleteUnit = (unitId: string) => {
    const unitToDelete = units.find((u) => u.id === unitId);
    if (!unitToDelete) return;

    setUnits((prev) => prev.filter((u) => u.id !== unitId));
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === unitToDelete.propertyId) {
          return {
            ...p,
            totalUnits: Math.max(0, p.totalUnits - 1),
            occupiedUnits: unitToDelete.status === 'OCCUPE' ? Math.max(0, p.occupiedUnits - 1) : p.occupiedUnits,
          };
        }
        return p;
      })
    );

    addAuditLog('SUPPRESSION_LOGEMENT', `Suppression de l'unité ${unitToDelete.unitNumber}`, 'UNITE');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deleteUnit(unitId).catch((err) =>
        console.warn('Supabase deleteUnit error:', err)
      );
    }
  };

  const addTenant = async (
    tenantData: Omit<Tenant, 'id' | 'createdAt' | 'totalPaidFCFA' | 'arrearsFCFA'>
  ): Promise<Tenant> => {
    const newId = generateUUID();
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
      totalPaidFCFA: 0,
      arrearsFCFA: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 1. Mise à jour instantanée du state et du LocalStorage
    setTenants((prev) => {
      const updated = [newTenant, ...prev.filter((t) => t.id !== newId)];
      try {
        localStorage.setItem('sunu_tenants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (tenantData.unitId) {
      setUnits((prev) =>
        prev.map((u) => (u.id === tenantData.unitId ? { ...u, status: 'OCCUPE' } : u))
      );
    }

    addAuditLog(
      'CREATION_LOCATAIRE',
      `Création du locataire ${newTenant.firstName} ${newTenant.lastName}`,
      'LOCATAIRE'
    );

    // 2. Persistance dans Supabase Cloud
    if (SupabaseDbService.isConfigured()) {
      try {
        const remoteId = await SupabaseDbService.insertTenant(newTenant, newId);
        if (remoteId && remoteId !== newId) {
          newTenant.id = remoteId;
          setTenants((prev) => {
            const updated = prev.map((t) => (t.id === newId ? { ...t, id: remoteId } : t));
            try {
              localStorage.setItem('sunu_tenants', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      } catch (err) {
        console.warn('Supabase tenant insert notice:', err);
      }
    }

    return newTenant;
  };

  const deleteTenant = async (tenantId: string): Promise<void> => {
    const tenantToDelete = tenants.find((t) => t.id === tenantId);
    if (!tenantToDelete) return;

    // 1. Libérer l'unité occupée si liée
    if (tenantToDelete.unitId) {
      setUnits((prev) =>
        prev.map((u) => (u.id === tenantToDelete.unitId ? { ...u, status: 'DISPONIBLE' } : u))
      );
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === tenantToDelete.propertyId) {
            return {
              ...p,
              occupiedUnits: Math.max(0, p.occupiedUnits - 1),
            };
          }
          return p;
        })
      );
    }

    // 2. Suppression instantanée dans le state et le LocalStorage
    setTenants((prev) => {
      const updated = prev.filter((t) => t.id !== tenantId);
      try {
        localStorage.setItem('sunu_tenants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addAuditLog(
      'SUPPRESSION_LOCATAIRE',
      `Suppression définitive du locataire ${tenantToDelete.firstName} ${tenantToDelete.lastName}`,
      'LOCATAIRE'
    );

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'SYSTEM',
      title: 'Locataire supprimé',
      message: `Le locataire ${tenantToDelete.firstName} ${tenantToDelete.lastName} a été supprimé. Le logement ${tenantToDelete.unitNumber} est désormais disponible.`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    // 3. Suppression dans Supabase Cloud
    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.deleteTenant(
          tenantId,
          `${tenantToDelete.firstName} ${tenantToDelete.lastName}`,
          tenantToDelete.phone
        );
      } catch (err) {
        console.warn('Supabase tenant delete notice:', err);
      }
    }
  };

  const addOwner = async (
    ownerData: Omit<Owner, 'id' | 'createdAt'> & Partial<Pick<Owner, 'propertiesCount' | 'totalMonthlyRevenueFCFA'>>
  ): Promise<Owner> => {
    const newId = generateUUID();
    const newOwner: Owner = {
      ...ownerData,
      id: newId,
      propertiesCount: ownerData.propertiesCount ?? 1,
      totalMonthlyRevenueFCFA: ownerData.totalMonthlyRevenueFCFA ?? 1500000,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 1. Mise à jour instantanée du state et du LocalStorage
    setOwners((prev) => {
      const updated = [newOwner, ...prev.filter((o) => o.id !== newId)];
      try {
        localStorage.setItem('sunu_owners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addAuditLog('CREATION_PROPRIETAIRE', `Nouveau propriétaire enregistré: ${newOwner.firstName} ${newOwner.lastName}`, 'PROPRIETAIRE');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Nouveau Propriétaire',
      message: `Le bailleur ${newOwner.firstName} ${newOwner.lastName} a été ajouté avec succès.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    // 2. Persistance dans Supabase Cloud
    if (SupabaseDbService.isConfigured()) {
      try {
        const remoteId = await SupabaseDbService.insertOwner(ownerData, newId);
        if (remoteId && remoteId !== newId) {
          newOwner.id = remoteId;
          setOwners((prev) => {
            const updated = prev.map((o) => (o.id === newId ? { ...o, id: remoteId } : o));
            try {
              localStorage.setItem('sunu_owners', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      } catch (err) {
        console.warn('Supabase owner insert notice:', err);
      }
    }

    return newOwner;
  };

  const deleteOwner = async (ownerId: string): Promise<void> => {
    const ownerToDelete = owners.find((o) => o.id === ownerId);
    if (!ownerToDelete) return;

    // 1. Suppression instantanée dans le state et le LocalStorage
    setOwners((prev) => {
      const updated = prev.filter((o) => o.id !== ownerId);
      try {
        localStorage.setItem('sunu_owners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addAuditLog('SUPPRESSION_PROPRIETAIRE', `Suppression du bailleur ${ownerToDelete.firstName} ${ownerToDelete.lastName}`, 'PROPRIETAIRE');

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'SYSTEM',
      title: 'Propriétaire supprimé',
      message: `Le bailleur ${ownerToDelete.firstName} ${ownerToDelete.lastName} a été supprimé avec succès.`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    // 2. Suppression dans Supabase Cloud
    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.deleteOwner(
          ownerId,
          `${ownerToDelete.firstName} ${ownerToDelete.lastName}`,
          ownerToDelete.phone
        );
      } catch (err) {
        console.warn('Supabase owner delete notice:', err);
      }
    }
  };

  const createLease = (leaseData: Omit<Lease, 'id' | 'createdAt'>) => {
    const newId = generateUUID();
    const newLease: Lease = {
      ...leaseData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeases((prev) => [newLease, ...prev]);

    // Mark unit as occupied
    setUnits((prev) =>
      prev.map((u) => (u.id === leaseData.unitId ? { ...u, status: 'OCCUPE' } : u))
    );

    // Create schedule for first month
    const newSchedule: RentSchedule = {
      id: generateUUID(),
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

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Nouveau Contrat de Bail',
      message: `Contrat établi pour ${newLease.tenantName} (${newLease.unitNumber}).`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertLease(leaseData, newId).catch((err) =>
        console.warn('Supabase lease insert notice:', err)
      );
    }
  };

  const deleteLease = (leaseId: string) => {
    const leaseToDelete = leases.find((l) => l.id === leaseId);
    if (!leaseToDelete) return;

    if (leaseToDelete.unitId) {
      setUnits((prev) =>
        prev.map((u) => (u.id === leaseToDelete.unitId ? { ...u, status: 'DISPONIBLE' } : u))
      );
    }

    setLeases((prev) => prev.filter((l) => l.id !== leaseId));
    addAuditLog('SUPPRESSION_CONTRAT', `Suppression du contrat ${leaseId}`, 'CONTRAT');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deleteLease(leaseId).catch((err) =>
        console.warn('Supabase deleteLease error:', err)
      );
    }
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'>) => {
    const newId = generateUUID();
    const newExpense: Expense = {
      ...expenseData,
      id: newId,
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addAuditLog('CREATION_DEPENSE', `Dépense de ${newExpense.amountFCFA} FCFA ajoutée (${newExpense.category})`, 'DEPENSE');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Dépense Enregistrée',
      message: `Dépense de ${newExpense.amountFCFA.toLocaleString('fr-FR')} FCFA (${newExpense.category}) enregistrée.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertExpense(expenseData, newId).catch((err) =>
        console.warn('Supabase expense insert notice:', err)
      );
    }
  };

  const deleteExpense = (expenseId: string) => {
    const expToDelete = expenses.find((e) => e.id === expenseId);
    if (!expToDelete) return;

    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    addAuditLog('SUPPRESSION_DEPENSE', `Suppression de la dépense ${expToDelete.description}`, 'DEPENSE');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deleteExpense(expenseId).catch((err) =>
        console.warn('Supabase deleteExpense error:', err)
      );
    }
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

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'SYSTEM',
      title: `Relance ${channel} Envoyée`,
      message: `Relance envoyée avec succès à ${arrear?.tenantName} (${arrear?.overdueAmountFCFA.toLocaleString('fr-FR')} FCFA).`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const addVendor = (vendorData: Omit<Vendor, 'id' | 'agencyId'>) => {
    const newId = generateUUID();
    const newVendor: Vendor = {
      ...vendorData,
      id: newId,
      agencyId: 'org-1',
    };
    setVendors((prev) => [newVendor, ...prev]);
    addAuditLog('CREATION_PRESTATAIRE', `Ajout du prestataire ${newVendor.name} (${newVendor.trade})`, 'ORGANISATION');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Prestataire Ajouté',
      message: `${newVendor.name} (${newVendor.trade}) ajouté au répertoire.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertVendor(vendorData, newId).catch((err) =>
        console.warn('Supabase vendor insert notice:', err)
      );
    }
  };

  const deleteVendor = (vendorId: string) => {
    const vendorToDelete = vendors.find((v) => v.id === vendorId);
    if (!vendorToDelete) return;

    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    addAuditLog('SUPPRESSION_PRESTATAIRE', `Suppression du prestataire ${vendorToDelete.name}`, 'ORGANISATION');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deleteVendor(vendorId).catch((err) =>
        console.warn('Supabase deleteVendor error:', err)
      );
    }
  };

  const updateOrganization = (orgData: Partial<Organization>) => {
    setOrganization((prev) => ({
      ...prev,
      ...orgData,
    }));
    addAuditLog('MAJ_ORGANISATION', `Mise à jour des informations de l'agence`, 'ORGANISATION');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Paramètres Agence Mis à Jour',
      message: 'Les coordonnées et identifiants de l\'agence ont été enregistrés.',
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.updateOrganization(orgData).catch((err) =>
        console.warn('Supabase organization update notice:', err)
      );
    }
  };

  const updateSubscriptionPlan = (planId: string) => {
    setOrganization((prev) => ({
      ...prev,
      subscriptionPlan: planId as any,
    }));
    addAuditLog('MAJ_ABONNEMENT', `Changement de forfait SaaS vers ${planId}`, 'ORGANISATION');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Abonnement Mis à Niveau',
      message: `Votre agence est désormais sous le forfait ${planId}.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
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
        deletePayment,
        addProperty,
        deleteProperty,
        addUnit,
        deleteUnit,
        addTenant,
        deleteTenant,
        addOwner,
        deleteOwner,
        createLease,
        deleteLease,
        addExpense,
        deleteExpense,
        createMaintenanceTicket,
        updateTicketStatus,
        sendRelance,
        addVendor,
        deleteVendor,
        updateOrganization,
        updateSubscriptionPlan,
        searchQuery,
        setSearchQuery,
        selectedDocumentForPrint,
        setSelectedDocumentForPrint,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
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

