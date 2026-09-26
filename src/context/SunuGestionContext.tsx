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
  RentScheduleStatus,
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
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
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
    leaseId?: string;
    amountFCFA: number;
    method: PaymentMethod;
    referenceNumber?: string;
    periodMonthYear?: string;
    paymentDate?: string;
    dueDate?: string;
    periodStartDate?: string;
    periodEndDate?: string;
    notes?: string;
  }) => AppDocument | void;

  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  updateProperty: (propertyId: string, updates: Partial<Property>) => void;
  deleteProperty: (propertyId: string) => Promise<void> | void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  deleteUnit: (unitId: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'totalPaidFCFA' | 'arrearsFCFA'>) => Promise<Tenant> | void;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Promise<void> | void;
  deleteTenant: (tenantId: string) => Promise<void> | void;
  addOwner: (owner: Omit<Owner, 'id' | 'createdAt'> & Partial<Pick<Owner, 'propertiesCount' | 'totalMonthlyRevenueFCFA'>>) => Promise<Owner> | void;
  updateOwner: (ownerId: string, updates: Partial<Owner>) => Promise<void> | void;
  deleteOwner: (ownerId: string) => Promise<void> | void;
  createLease: (lease: Omit<Lease, 'id' | 'createdAt'>) => void;
  updateLease: (leaseId: string, updates: Partial<Lease>) => Promise<void> | void;
  deleteLease: (leaseId: string) => Promise<void> | void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'>) => void;
  deleteExpense: (expenseId: string) => void;
  deletePayment: (paymentId: string) => void;
  deleteRentSchedule: (scheduleId: string) => void;
  addRentSchedule: (scheduleData: Omit<RentSchedule, 'id'>) => void;
  generateMonthlySchedules: (monthYear?: string) => number;
  resetRentSchedulesToDefault: () => void;
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
    totalPaidFCFA: 430000,
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
    totalPaidFCFA: 0,
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
    totalPaidFCFA: 1300000,
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
    totalPaidFCFA: 800000,
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
    totalPaidFCFA: 0,
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
    totalPaidFCFA: 0,
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
    id: "sch-sep-01",
    leaseId: "40c80870-e3ec-41a0-8928-1e05744a5b72",
    tenantId: "a8767da2-7502-4d94-8e49-6032acc9ee59",
    tenantName: "Fatou Faye",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 1er A",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 233100,
    chargesFCFA: 25000,
    totalDueFCFA: 258100,
    paidAmountFCFA: 258100,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-sep-02",
    leaseId: "46432105-5224-4919-94bf-32b2e63ee4ba",
    tenantId: "b1d1bfe2-c752-40f6-8f56-4f286dd68a76",
    tenantName: "Mor Diakhate",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 4eme",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 155400,
    chargesFCFA: 25000,
    totalDueFCFA: 180400,
    paidAmountFCFA: 0,
    remainingFCFA: 180400,
    status: "DUE",
  },
  {
    id: "sch-sep-03",
    leaseId: "e4b8eddd-07d8-4642-a085-7339de27f37d",
    tenantId: "7e9e1642-1ff0-4e33-b341-8e834849aba3",
    tenantName: "Seynabou Fofana",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 3eme B",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 233074,
    chargesFCFA: 25000,
    totalDueFCFA: 258074,
    paidAmountFCFA: 150000,
    remainingFCFA: 108074,
    status: "PARTIEL",
  },
  {
    id: "sch-sep-04",
    leaseId: "8e02d073-cb1d-441f-a50f-eb9c5a7b28d5",
    tenantId: "9c154239-e55c-4f4d-9cfc-412787896072",
    tenantName: "Edwina Kuyateh",
    propertyName: "IMMEUBLE DE ZACK MBAO AUCHAN",
    unitNumber: "Appartement 3eme A",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 233100,
    chargesFCFA: 25000,
    totalDueFCFA: 258100,
    paidAmountFCFA: 0,
    remainingFCFA: 258100,
    status: "DUE",
  },
  {
    id: "sch-sep-05",
    leaseId: "5525f1fd-4088-4a76-a846-b64c17dd0518",
    tenantId: "ddd720a2-90c9-4b5f-afbe-4670842cb1ee",
    tenantName: "Tigana Lamine",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 3eme",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 155400,
    chargesFCFA: 25000,
    totalDueFCFA: 180400,
    paidAmountFCFA: 180400,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-sep-06",
    leaseId: "b7e83e84-4635-4c73-9122-b34718e9ded2",
    tenantId: "c39a286e-45ea-4943-ab78-2f8e757f532b",
    tenantName: "Serigne Mbacké Lô",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 2eme",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 155400,
    chargesFCFA: 25000,
    totalDueFCFA: 180400,
    paidAmountFCFA: 0,
    remainingFCFA: 180400,
    status: "DUE",
  },
  {
    id: "sch-sep-07",
    leaseId: "f8c0e08c-dabf-44b8-aa9b-651daa4c63e6",
    tenantId: "89a4005c-c653-42d3-a44b-5c876271b4be",
    tenantName: "Alioune Touré",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 1er B",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 225000,
    chargesFCFA: 25000,
    totalDueFCFA: 250000,
    paidAmountFCFA: 0,
    remainingFCFA: 250000,
    status: "DUE",
  },
  {
    id: "sch-sep-08",
    leaseId: "352da138-f5d1-41f9-9b88-662e9e15f5d4",
    tenantId: "023665b9-8fb5-4826-acc7-5538462ca408",
    tenantName: "Mamadou Saidou Baldé",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 1er",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 158900,
    chargesFCFA: 25000,
    totalDueFCFA: 183900,
    paidAmountFCFA: 0,
    remainingFCFA: 183900,
    status: "DUE",
  },
  {
    id: "sch-sep-09",
    leaseId: "1dd580c3-8012-4e30-a0f9-2b9b407e6687",
    tenantId: "3ff16728-067f-4739-8b26-b6d8596d3c88",
    tenantName: "Thierno Souleymane Diallo",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Magasin M2",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 364800,
    chargesFCFA: 25000,
    totalDueFCFA: 389800,
    paidAmountFCFA: 389800,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-sep-10",
    leaseId: "97229779-5dc9-4557-b1ea-4cfbfd0984e5",
    tenantId: "a7de0c99-0b78-4f81-8148-3381ef85d8f2",
    tenantName: "Babacar Douf",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Magasin M3",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 247700,
    chargesFCFA: 25000,
    totalDueFCFA: 272700,
    paidAmountFCFA: 0,
    remainingFCFA: 272700,
    status: "DUE",
  },
  {
    id: "sch-sep-11",
    leaseId: "88893ed5-1c46-4cd7-b7ea-4056bd2094fb",
    tenantId: "6b1d11f6-c389-4a34-a47e-f0739af05d6e",
    tenantName: "Pathé Niang",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Magasin M5",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 243200,
    chargesFCFA: 25000,
    totalDueFCFA: 268200,
    paidAmountFCFA: 0,
    remainingFCFA: 268200,
    status: "DUE",
  },
  {
    id: "sch-sep-12",
    leaseId: "849113fe-01a3-4747-b96f-bbbcdad0b2e5",
    tenantId: "b59d2aa9-3687-44d3-834e-0eb5bae75cc6",
    tenantName: "Modou Tall",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Magasin M4",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 243200,
    chargesFCFA: 25000,
    totalDueFCFA: 268200,
    paidAmountFCFA: 0,
    remainingFCFA: 268200,
    status: "DUE",
  },
  {
    id: "sch-sep-13",
    leaseId: "073df3bd-7942-4f28-bc49-c0d0f2fb285c",
    tenantId: "d063c927-635b-47c1-89a6-2dab338dadfe",
    tenantName: "Yaya Sow",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 2eme A",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 233100,
    chargesFCFA: 25000,
    totalDueFCFA: 258100,
    paidAmountFCFA: 0,
    remainingFCFA: 258100,
    status: "DUE",
  },
  {
    id: "sch-sep-14",
    leaseId: "b2f90a06-8897-4719-9ed1-eff066d30ec6",
    tenantId: "4d5a1c00-8ac0-43a2-ba6e-6db04c2139c0",
    tenantName: "Ndeye Bigué N'diaye",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 1er A",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 278600,
    chargesFCFA: 25000,
    totalDueFCFA: 303600,
    paidAmountFCFA: 0,
    remainingFCFA: 303600,
    status: "DUE",
  },
  {
    id: "sch-sep-15",
    leaseId: "2b9371e7-ae6f-4269-a7f2-4c7322677bc0",
    tenantId: "ec4f5bc0-2004-44ea-ac24-82be94966a84",
    tenantName: "Aminata Dieng",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 4eme A",
    periodMonthYear: "Septembre 2026",
    dueDate: "2026-09-05",
    rentFCFA: 233100,
    chargesFCFA: 25000,
    totalDueFCFA: 258100,
    paidAmountFCFA: 0,
    remainingFCFA: 258100,
    status: "DUE",
  },
  {
    id: "sch-aou-01",
    leaseId: "40c80870-e3ec-41a0-8928-1e05744a5b72",
    tenantId: "a8767da2-7502-4d94-8e49-6032acc9ee59",
    tenantName: "Fatou Faye",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 1er A",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 233100,
    chargesFCFA: 25000,
    totalDueFCFA: 258100,
    paidAmountFCFA: 258100,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-02",
    leaseId: "46432105-5224-4919-94bf-32b2e63ee4ba",
    tenantId: "b1d1bfe2-c752-40f6-8f56-4f286dd68a76",
    tenantName: "Mor Diakhate",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 4eme",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 155400,
    chargesFCFA: 25000,
    totalDueFCFA: 180400,
    paidAmountFCFA: 180400,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-03",
    leaseId: "e4b8eddd-07d8-4642-a085-7339de27f37d",
    tenantId: "7e9e1642-1ff0-4e33-b341-8e834849aba3",
    tenantName: "Seynabou Fofana",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 3eme B",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 233074,
    chargesFCFA: 25000,
    totalDueFCFA: 258074,
    paidAmountFCFA: 258074,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-04",
    leaseId: "8e02d073-cb1d-441f-a50f-eb9c5a7b28d5",
    tenantId: "9c154239-e55c-4f4d-9cfc-412787896072",
    tenantName: "Edwina Kuyateh",
    propertyName: "IMMEUBLE DE ZACK MBAO AUCHAN",
    unitNumber: "Appartement 3eme A",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 233100,
    chargesFCFA: 25000,
    totalDueFCFA: 258100,
    paidAmountFCFA: 0,
    remainingFCFA: 258100,
    status: "EN_RETARD",
  },
  {
    id: "sch-aou-05",
    leaseId: "5525f1fd-4088-4a76-a846-b64c17dd0518",
    tenantId: "ddd720a2-90c9-4b5f-afbe-4670842cb1ee",
    tenantName: "Tigana Lamine",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 3eme",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 155400,
    chargesFCFA: 25000,
    totalDueFCFA: 180400,
    paidAmountFCFA: 180400,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-06",
    leaseId: "b7e83e84-4635-4c73-9122-b34718e9ded2",
    tenantId: "c39a286e-45ea-4943-ab78-2f8e757f532b",
    tenantName: "Serigne Mbacké Lô",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 2eme",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 155400,
    chargesFCFA: 25000,
    totalDueFCFA: 180400,
    paidAmountFCFA: 180400,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-07",
    leaseId: "f8c0e08c-dabf-44b8-aa9b-651daa4c63e6",
    tenantId: "89a4005c-c653-42d3-a44b-5c876271b4be",
    tenantName: "Alioune Touré",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Appartement 1er B",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 225000,
    chargesFCFA: 25000,
    totalDueFCFA: 250000,
    paidAmountFCFA: 250000,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-08",
    leaseId: "352da138-f5d1-41f9-9b88-662e9e15f5d4",
    tenantId: "023665b9-8fb5-4826-acc7-5538462ca408",
    tenantName: "Mamadou Saidou Baldé",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Studio 1er",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 158900,
    chargesFCFA: 25000,
    totalDueFCFA: 183900,
    paidAmountFCFA: 0,
    remainingFCFA: 183900,
    status: "EN_RETARD",
  },
  {
    id: "sch-aou-09",
    leaseId: "1dd580c3-8012-4e30-a0f9-2b9b407e6687",
    tenantId: "3ff16728-067f-4739-8b26-b6d8596d3c88",
    tenantName: "Thierno Souleymane Diallo",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Magasin M2",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 364800,
    chargesFCFA: 25000,
    totalDueFCFA: 389800,
    paidAmountFCFA: 389800,
    remainingFCFA: 0,
    status: "PAYE",
  },
  {
    id: "sch-aou-10",
    leaseId: "97229779-5dc9-4557-b1ea-4cfbfd0984e5",
    tenantId: "a7de0c99-0b78-4f81-8148-3381ef85d8f2",
    tenantName: "Babacar Douf",
    propertyName: "IMMEUBLE GRAND YOFF",
    unitNumber: "Magasin M3",
    periodMonthYear: "Août 2026",
    dueDate: "2026-08-05",
    rentFCFA: 247700,
    chargesFCFA: 25000,
    totalDueFCFA: 272700,
    paidAmountFCFA: 272700,
    remainingFCFA: 0,
    status: "PAYE",
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

const DUMMY_TENANT_NAMES = [
  'mamadou diallo',
  'aïssatou kane',
  'aissatou kane',
  'cheikh faye',
  'fatou bintou seck',
  'ibrahima ba',
  'mariama sy',
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
      const sessionRaw = localStorage.getItem('sunu_session_user');
      if (sessionRaw) {
        try {
          const parsedUser = JSON.parse(sessionRaw);
          if (parsedUser && parsedUser.name) {
            setCurrentUser(parsedUser);
            if (parsedUser.role) setCurrentRole(parsedUser.role);
          }
        } catch (e) {}
      }
      const cachedProperties = localStorage.getItem('sunu_properties');
      if (cachedProperties !== null) {
        const parsed = JSON.parse(cachedProperties);
        if (Array.isArray(parsed)) {
          setProperties(parsed);
        }
      }
      const cachedTenants = localStorage.getItem('sunu_tenants');
      if (cachedTenants !== null) {
        const parsed = JSON.parse(cachedTenants);
        if (Array.isArray(parsed)) {
          setTenants(parsed);
        }
      }
      const cachedOwners = localStorage.getItem('sunu_owners');
      if (cachedOwners !== null) {
        const parsedOwners = JSON.parse(cachedOwners);
        if (Array.isArray(parsedOwners)) {
          setOwners(parsedOwners);
        }
      }
      const cachedUnits = localStorage.getItem('sunu_units');
      if (cachedUnits !== null) {
        const parsedUnits = JSON.parse(cachedUnits);
        if (Array.isArray(parsedUnits)) {
          setUnits(parsedUnits);
        }
      }
      const cachedLeases = localStorage.getItem('sunu_leases');
      if (cachedLeases !== null) {
        const parsedLeases = JSON.parse(cachedLeases);
        if (Array.isArray(parsedLeases)) {
          setLeases(parsedLeases);
        }
      }
      const cachedSchedules = localStorage.getItem('sunu_rent_schedules');
      if (cachedSchedules !== null) {
        try {
          const parsedSchedules = JSON.parse(cachedSchedules);
          const hasDummy = Array.isArray(parsedSchedules) && parsedSchedules.some(s => DUMMY_TENANT_NAMES.includes((s.tenantName || '').toLowerCase().trim()));
          if (!hasDummy && Array.isArray(parsedSchedules) && parsedSchedules.length > 5) {
            setRentSchedules(parsedSchedules);
          } else {
            const cleaned = Array.isArray(parsedSchedules) 
              ? parsedSchedules.filter(s => !DUMMY_TENANT_NAMES.includes((s.tenantName || '').toLowerCase().trim()))
              : [];
            const finalSchedules = cleaned.length >= 10 ? cleaned : INITIAL_RENT_SCHEDULES;
            setRentSchedules(finalSchedules);
            try {
              localStorage.setItem('sunu_rent_schedules', JSON.stringify(finalSchedules));
            } catch (e) {}
          }
        } catch (e) {
          setRentSchedules(INITIAL_RENT_SCHEDULES);
        }
      } else {
        setRentSchedules(INITIAL_RENT_SCHEDULES);
        try {
          localStorage.setItem('sunu_rent_schedules', JSON.stringify(INITIAL_RENT_SCHEDULES));
        } catch (e) {}
      }
      const cachedPayments = localStorage.getItem('sunu_payments');
      if (cachedPayments !== null) {
        const parsedPayments = JSON.parse(cachedPayments);
        if (Array.isArray(parsedPayments)) {
          setPayments(parsedPayments);
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
        let deletedPropIds: string[] = [];
        try {
          const stored = localStorage.getItem('sunu_deleted_properties');
          if (stored) deletedPropIds = JSON.parse(stored);
        } catch (e) {}

        if (p && Array.isArray(p)) {
          const hasLocalProps = typeof window !== 'undefined' && localStorage.getItem('sunu_properties') !== null;
          const filteredRemote = p.filter((item) => !deletedPropIds.includes(item.id));
          if (filteredRemote.length > 0) {
            setProperties(filteredRemote);
            try {
              localStorage.setItem('sunu_properties', JSON.stringify(filteredRemote));
            } catch (e) {}
          } else if (hasLocalProps) {
            try {
              const localParsed = JSON.parse(localStorage.getItem('sunu_properties') || '[]');
              setProperties(localParsed);
            } catch (e) {}
          }
        }
        if (u && u.length > 0) setUnits(u);
        let deletedTenantIds: string[] = [];
        try {
          const stored = localStorage.getItem('sunu_deleted_tenants');
          if (stored) deletedTenantIds = JSON.parse(stored);
        } catch (e) {}

        let deletedLeaseIds: string[] = [];
        try {
          const stored = localStorage.getItem('sunu_deleted_leases');
          if (stored) deletedLeaseIds = JSON.parse(stored);
        } catch (e) {}

        if (o && Array.isArray(o) && o.length > 0) {
          setOwners(o);
          try {
            localStorage.setItem('sunu_owners', JSON.stringify(o));
          } catch (e) {}
        }
        if (t && Array.isArray(t)) {
          const hasLocalTenants = typeof window !== 'undefined' && localStorage.getItem('sunu_tenants') !== null;
          const filteredTenants = t.filter((item) => !deletedTenantIds.includes(item.id));
          if (filteredTenants.length > 0) {
            setTenants(filteredTenants);
            try {
              localStorage.setItem('sunu_tenants', JSON.stringify(filteredTenants));
            } catch (e) {}
          } else if (hasLocalTenants) {
            try {
              const localParsed = JSON.parse(localStorage.getItem('sunu_tenants') || '[]');
              setTenants(localParsed);
            } catch (e) {}
          }
        }
        if (l && Array.isArray(l)) {
          const hasLocalLeases = typeof window !== 'undefined' && localStorage.getItem('sunu_leases') !== null;
          const filteredLeases = l.filter((item) => !deletedLeaseIds.includes(item.id) && !deletedTenantIds.includes(item.tenantId));
          if (filteredLeases.length > 0) {
            setLeases(filteredLeases);
            try {
              localStorage.setItem('sunu_leases', JSON.stringify(filteredLeases));
            } catch (e) {}
          } else if (hasLocalLeases) {
            try {
              const localParsed = JSON.parse(localStorage.getItem('sunu_leases') || '[]');
              setLeases(localParsed);
            } catch (e) {}
          }
        }
        if (pay && pay.length > 0) setPayments(pay);
        if (exp && exp.length > 0) setExpenses(exp);
        if (v && v.length > 0) setVendors(v);

        // Synchronisation des échéances de loyers avec les vrais locataires
        const activeTenantsList = (t && Array.isArray(t) ? t : []).filter((item) => !deletedTenantIds.includes(item.id));
        const activeLeasesList = (l && Array.isArray(l) ? l : []).filter((item) => !deletedLeaseIds.includes(item.id) && !deletedTenantIds.includes(item.tenantId));

        if (activeTenantsList.length > 0) {
          const validIds = new Set(activeTenantsList.map((item) => item.id));
          const validNames = new Set(activeTenantsList.map((item) => `${item.firstName} ${item.lastName}`.trim().toLowerCase()));

          setRentSchedules((prev) => {
            let current = prev.filter((s) => {
              const name = (s.tenantName || '').trim().toLowerCase();
              if (DUMMY_TENANT_NAMES.includes(name)) return false;
              return validIds.has(s.tenantId) || validNames.has(name);
            });

            // S'assurer que chaque vrai locataire a son échéance pour Septembre 2026
            activeTenantsList.forEach((tenantItem) => {
              const fullName = `${tenantItem.firstName} ${tenantItem.lastName}`.trim();
              const hasSep = current.some(
                (s) =>
                  (s.tenantId === tenantItem.id ||
                    (s.tenantName || '').trim().toLowerCase() === fullName.toLowerCase()) &&
                  s.periodMonthYear.toLowerCase().includes('septembre 2026')
              );
              if (!hasSep) {
                const leaseItem = activeLeasesList.find((lease) => lease.tenantId === tenantItem.id);
                const rent = tenantItem.rentFCFA || leaseItem?.rentAmountFCFA || 200000;
                const charges = leaseItem?.chargesAmountFCFA || 25000;
                const total = rent + charges;
                current.push({
                  id: `sch-sep-${tenantItem.id.substring(0, 8)}`,
                  leaseId: leaseItem?.id || tenantItem.currentLeaseId || 'lse-1',
                  tenantId: tenantItem.id,
                  tenantName: fullName,
                  propertyName: tenantItem.propertyName || leaseItem?.propertyName || 'IMMEUBLE GRAND YOFF',
                  unitNumber: tenantItem.unitNumber || leaseItem?.unitNumber || 'Logement',
                  periodMonthYear: 'Septembre 2026',
                  dueDate: '2026-09-05',
                  rentFCFA: rent,
                  chargesFCFA: charges,
                  totalDueFCFA: total,
                  paidAmountFCFA: 0,
                  remainingFCFA: total,
                  status: 'DUE',
                });
              }
            });

            try {
              localStorage.setItem('sunu_rent_schedules', JSON.stringify(current));
            } catch (e) {}
            return current;
          });
        }
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
    leaseId?: string;
    amountFCFA: number;
    method: PaymentMethod;
    referenceNumber?: string;
    periodMonthYear?: string;
    paymentDate?: string;
    dueDate?: string;
    periodStartDate?: string;
    periodEndDate?: string;
    notes?: string;
  }): AppDocument => {
    const tenant = tenants.find((t) => t.id === data.tenantId);
    const lease = leases.find((l) => (data.leaseId ? l.id === data.leaseId : l.tenantId === data.tenantId));
    const receiptNum = `QUITT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newId = generateUUID();

    const payDate = data.paymentDate || new Date().toISOString().split('T')[0];
    const monthYear =
      data.periodMonthYear ||
      new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const formattedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    const pStart = data.periodStartDate || '2026-09-01';
    const pEnd = data.periodEndDate || '2026-09-30';
    const dueDay = data.dueDate || `Du ${pStart} au ${pEnd}`;

    const refNum =
      data.referenceNumber ||
      (data.method === 'ESPECES' ? 'Paiement Espèces (Sans référence)' : `REC-${Date.now().toString().slice(-6)}`);

    // Matching property & owner
    const matchedProp = properties.find(
      (p) =>
        p.id === tenant?.propertyId ||
        (p.name && tenant?.propertyName && p.name.trim().toLowerCase() === tenant?.propertyName.trim().toLowerCase())
    );
    const ownerName = matchedProp?.ownerName || 'Propriétaire Bailleur';

    const newPayment: Payment = {
      id: newId,
      agencyId: organization.id,
      receiptNumber: receiptNum,
      tenantId: data.tenantId,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire Inconnu',
      leaseId: data.leaseId || lease?.id || 'lse-1',
      unitNumber: tenant?.unitNumber || 'Logement',
      propertyName: tenant?.propertyName || 'Propriété',
      amountFCFA: Number(data.amountFCFA),
      date: payDate,
      method: data.method,
      referenceNumber: refNum,
      recordedBy: currentUser.name,
      notes: data.notes,
      createdAt: new Date().toLocaleString('fr-FR'),
      periodMonthYear: formattedMonth,
      dueDate: dueDay,
      periodStartDate: pStart,
      periodEndDate: pEnd,
    };

    setPayments((prev) => {
      const updatedPayments = [newPayment, ...prev];
      try {
        localStorage.setItem('sunu_payments', JSON.stringify(updatedPayments));
      } catch (e) {}
      return updatedPayments;
    });

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
    setRentSchedules((prev) => {
      const updated = prev.map((sch) => {
        if (sch.tenantId === data.tenantId && (sch.status === 'EN_RETARD' || sch.status === 'DUE' || sch.status === 'A_VENIR')) {
          return {
            ...sch,
            paidAmountFCFA: sch.paidAmountFCFA + data.amountFCFA,
            remainingFCFA: Math.max(0, sch.totalDueFCFA - (sch.paidAmountFCFA + data.amountFCFA)),
            status: (sch.paidAmountFCFA + data.amountFCFA >= sch.totalDueFCFA ? 'PAYE' : 'PARTIEL') as RentScheduleStatus,
          };
        }
        return sch;
      });
      try {
        localStorage.setItem('sunu_rent_schedules', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Clear from Arrears list if settled
    setArrears((prev) => prev.filter((a) => a.tenantId !== data.tenantId));

    // Generate Quittance Document with Complete & Professional Metadata
    const newDoc: AppDocument = {
      id: receiptNum,
      title: `Quittance de Loyer • ${formattedMonth} • ${tenant?.firstName} ${tenant?.lastName}`,
      category: 'QUITTANCE',
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire',
      propertyName: tenant?.propertyName || 'Bien Immobilier',
      ownerName: ownerName,
      amountFCFA: data.amountFCFA,
      date: payDate,
      metadata: {
        receiptNumber: receiptNum,
        periodMonthYear: formattedMonth,
        paymentDate: payDate,
        dueDate: dueDay,
        periodStartDate: pStart,
        periodEndDate: pEnd,
        method: data.method,
        referenceNumber: refNum,
        unitNumber: tenant?.unitNumber || 'Logement',
        propertyName: tenant?.propertyName || 'Bien Immobilier',
        ownerName: ownerName,
        tenantPhone: tenant?.phone || '',
        tenantCni: tenant?.identityDocNumber || '',
        rentFCFA: data.amountFCFA,
        chargesFCFA: 0,
        status: 'ACQUITTE',
      },
    };
    setDocuments((prev) => [newDoc, ...prev]);

    // Automatically display the professional receipt immediately for print/download/share
    setSelectedDocumentForPrint(newDoc);

    // Push notification
    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'PAYMENT',
      title: 'Paiement Enregistré avec Succès',
      message: `Quittance ${receiptNum} (${formattedMonth}) générée pour ${tenant?.firstName} ${tenant?.lastName} (${data.amountFCFA.toLocaleString('fr-FR')} FCFA via ${data.method}).`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog(
      'ENREGISTREMENT_PAIEMENT',
      `Paiement loyer ${formattedMonth} : ${data.amountFCFA} FCFA (${data.method}) ref: ${data.referenceNumber}`,
      'PAIEMENT'
    );

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.insertPayment(
        {
          tenantId: data.tenantId,
          leaseId: data.leaseId || lease?.id || 'lse-1',
          amountFCFA: data.amountFCFA,
          method: data.method,
          referenceNumber: refNum,
          notes: data.notes,
        },
        newId
      ).catch((err) => console.warn('Supabase payment sync notice:', err));
    }

    return newDoc;
  };

  const deletePayment = (paymentId: string) => {
    const paymentToDelete = payments.find((p) => p.id === paymentId);
    if (!paymentToDelete) return;

    setPayments((prev) => {
      const updated = prev.filter((p) => p.id !== paymentId);
      try {
        localStorage.setItem('sunu_payments', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addAuditLog('SUPPRESSION_PAIEMENT', `Suppression du paiement ${paymentToDelete.receiptNumber}`, 'PAIEMENT');

    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.deletePayment(paymentId).catch((err) =>
        console.warn('Supabase deletePayment error:', err)
      );
    }
  };

  const deleteRentSchedule = (scheduleId: string) => {
    const scheduleToDelete = rentSchedules.find((s) => s.id === scheduleId);
    if (!scheduleToDelete) return;

    setRentSchedules((prev) => {
      const updated = prev.filter((s) => s.id !== scheduleId);
      try {
        localStorage.setItem('sunu_rent_schedules', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addAuditLog(
      'SUPPRESSION_ECHEANCE',
      `Suppression de l'échéance ${scheduleToDelete.periodMonthYear} pour ${scheduleToDelete.tenantName}`,
      'LOYER'
    );

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Échéance Supprimée',
      message: `L'échéance ${scheduleToDelete.periodMonthYear} de ${scheduleToDelete.tenantName} (${scheduleToDelete.totalDueFCFA.toLocaleString('fr-FR')} FCFA) a été supprimée.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const addRentSchedule = (scheduleData: Omit<RentSchedule, 'id'>) => {
    const newId = `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSchedule: RentSchedule = {
      ...scheduleData,
      id: newId,
    };
    setRentSchedules((prev) => {
      const updated = [newSchedule, ...prev];
      try {
        localStorage.setItem('sunu_rent_schedules', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addAuditLog(
      'CREATION_ECHEANCE',
      `Nouvelle échéance créée pour ${newSchedule.tenantName} (${newSchedule.periodMonthYear})`,
      'LOYER'
    );

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Nouvelle Échéance Créée',
      message: `Échéance de ${newSchedule.periodMonthYear} pour ${newSchedule.tenantName} (${newSchedule.totalDueFCFA.toLocaleString('fr-FR')} FCFA).`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const generateMonthlySchedules = (monthYear: string = 'Septembre 2026'): number => {
    let createdCount = 0;
    const newSchedules: RentSchedule[] = [];
    const activeLeases = leases.filter((l) => l.status === 'ACTIF' || l.status === 'EXPIRANT_BIENTOT');
    const targetTenants = tenants.filter((t) => t.status === 'ACTIF' || t.status === 'EN_RETARD');

    targetTenants.forEach((t) => {
      const existing = rentSchedules.find(
        (s) =>
          (s.tenantId === t.id || s.tenantName.trim().toLowerCase() === `${t.firstName} ${t.lastName}`.trim().toLowerCase()) &&
          s.periodMonthYear.trim().toLowerCase() === monthYear.trim().toLowerCase()
      );
      if (!existing) {
        const lease = leases.find((l) => l.tenantId === t.id) || activeLeases[0];
        const rent = t.rentFCFA || lease?.rentAmountFCFA || 350000;
        const charges = lease?.chargesAmountFCFA || 0;
        const total = rent + charges;
        const dueDay = lease?.dueDayOfMonth || 5;
        const formattedDueDate = `2026-09-${String(dueDay).padStart(2, '0')}`;

        newSchedules.push({
          id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          leaseId: lease?.id || t.currentLeaseId || 'lse-1',
          tenantId: t.id,
          tenantName: `${t.firstName} ${t.lastName}`,
          propertyName: t.propertyName || lease?.propertyName || 'Bien Immobilier',
          unitNumber: t.unitNumber || lease?.unitNumber || 'Logement',
          periodMonthYear: monthYear,
          dueDate: formattedDueDate,
          rentFCFA: rent,
          chargesFCFA: charges,
          totalDueFCFA: total,
          paidAmountFCFA: 0,
          remainingFCFA: total,
          status: 'DUE',
        });
        createdCount++;
      }
    });

    if (newSchedules.length > 0) {
      setRentSchedules((prev) => {
        const updated = [...newSchedules, ...prev];
        try {
          localStorage.setItem('sunu_rent_schedules', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      addAuditLog('GENERATION_ECHEANCES', `${createdCount} échéances générées pour ${monthYear}`, 'LOYER');
    }
    return createdCount;
  };

  const resetRentSchedulesToDefault = () => {
    setRentSchedules(INITIAL_RENT_SCHEDULES);
    try {
      localStorage.setItem('sunu_rent_schedules', JSON.stringify(INITIAL_RENT_SCHEDULES));
    } catch (e) {}
    addAuditLog('REINITIALISATION_ECHEANCES', 'Échéances réinitialisées avec succès', 'LOYER');
  };

  const addProperty = (propData: Omit<Property, 'id' | 'createdAt'>) => {
    const newId = generateUUID();
    const newProp: Property = {
      ...propData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => {
      const updated = [newProp, ...prev];
      try {
        localStorage.setItem('sunu_properties', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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

  const deleteProperty = async (propertyId: string): Promise<void> => {
    const propToDelete = properties.find((p) => p.id === propertyId);
    if (!propToDelete) return;

    // 1. Enregistrer dans la liste noire des IDs supprimés
    try {
      const stored = localStorage.getItem('sunu_deleted_properties');
      const deletedList: string[] = stored ? JSON.parse(stored) : [];
      if (!deletedList.includes(propertyId)) {
        deletedList.push(propertyId);
      }
      localStorage.setItem('sunu_deleted_properties', JSON.stringify(deletedList));
    } catch (e) {}

    // 2. Supprimer immédiatement dans le state et LocalStorage
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== propertyId);
      try {
        localStorage.setItem('sunu_properties', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setUnits((prev) => {
      const updated = prev.filter((u) => u.propertyId !== propertyId);
      try {
        localStorage.setItem('sunu_units', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setLeases((prev) => {
      const updated = prev.filter((l) => l.propertyId !== propertyId);
      try {
        localStorage.setItem('sunu_leases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

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

    // 3. Supprimer dans Supabase Cloud
    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.deleteProperty(propertyId, propToDelete.name);
      } catch (err) {
        console.warn('Supabase deleteProperty error:', err);
      }
    }
  };

  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === propertyId ? { ...p, ...updates } : p));
      try {
        localStorage.setItem('sunu_properties', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (updates.ownerId || updates.ownerName) {
      setUnits((prev) =>
        prev.map((u) =>
          u.propertyId === propertyId
            ? {
                ...u,
                ...(updates.ownerId ? { ownerId: updates.ownerId } : {}),
                ...(updates.ownerName ? { ownerName: updates.ownerName } : {}),
              }
            : u
        )
      );
    }
    if (SupabaseDbService.isConfigured()) {
      SupabaseDbService.updateProperty(propertyId, updates).catch((err) =>
        console.warn('Supabase updateProperty error:', err)
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

    // 2. Mise à jour ou création de l'unité liée
    if (tenantData.unitId) {
      setUnits((prev) => {
        const exists = prev.some((u) => u.id === tenantData.unitId);
        let updatedUnits: Unit[];
        if (exists) {
          updatedUnits = prev.map((u) =>
            u.id === tenantData.unitId
              ? {
                  ...u,
                  status: 'OCCUPE',
                  tenantId: newTenant.id,
                  tenantName: `${newTenant.firstName} ${newTenant.lastName}`,
                }
              : u
          );
        } else {
          const newUnit: Unit = {
            id: tenantData.unitId,
            propertyId: tenantData.propertyId || '',
            propertyName: tenantData.propertyName || '',
            unitNumber: tenantData.unitNumber || 'Logement',
            type: 'APPARTEMENT',
            floor: '1er Étage',
            surfaceM2: 70,
            roomsCount: 3,
            rentFCFA: tenantData.rentFCFA || 350000,
            chargesFCFA: 20000,
            status: 'OCCUPE',
            tenantId: newTenant.id,
            tenantName: `${newTenant.firstName} ${newTenant.lastName}`,
            ownerId: '',
            ownerName: '',
          };
          updatedUnits = [newUnit, ...prev];
        }
        try {
          localStorage.setItem('sunu_units', JSON.stringify(updatedUnits));
        } catch (e) {}
        return updatedUnits;
      });
    }

    // 3. Mise à jour du bien immobilier (nombre d'unités occupées)
    if (tenantData.propertyId) {
      setProperties((prev) => {
        const updated = prev.map((p) => {
          if (
            p.id === tenantData.propertyId ||
            (p.name &&
              tenantData.propertyName &&
              p.name.trim().toLowerCase() === tenantData.propertyName.trim().toLowerCase())
          ) {
            const newOccupied = p.occupiedUnits + 1;
            return {
              ...p,
              occupiedUnits: newOccupied,
              status: newOccupied >= p.totalUnits && p.totalUnits > 0 ? ('OCCUPE' as const) : p.status,
            };
          }
          return p;
        });
        try {
          localStorage.setItem('sunu_properties', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    addAuditLog(
      'CREATION_LOCATAIRE',
      `Création du locataire ${newTenant.firstName} ${newTenant.lastName}`,
      'LOCATAIRE'
    );

    // 4. Persistance dans Supabase Cloud
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

  const updateTenant = async (tenantId: string, updates: Partial<Tenant>): Promise<void> => {
    setTenants((prev) => {
      const updated = prev.map((t) => (t.id === tenantId ? { ...t, ...updates } : t));
      try {
        localStorage.setItem('sunu_tenants', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updates.unitNumber || updates.propertyName || updates.rentFCFA || updates.propertyId) {
      setUnits((prev) => {
        const updated = prev.map((u) => {
          if (u.tenantId === tenantId) {
            return {
              ...u,
              unitNumber: updates.unitNumber || u.unitNumber,
              propertyName: updates.propertyName || u.propertyName,
              propertyId: updates.propertyId || u.propertyId,
              rentFCFA: updates.rentFCFA || u.rentFCFA,
              tenantName: updates.firstName || updates.lastName ? `${updates.firstName || ''} ${updates.lastName || ''}`.trim() : u.tenantName,
            };
          }
          return u;
        });
        try {
          localStorage.setItem('sunu_units', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    addAuditLog(
      'MODIFICATION_LOCATAIRE',
      `Modification du locataire ${updates.firstName || ''} ${updates.lastName || ''}`,
      'LOCATAIRE'
    );

    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.updateTenant(tenantId, updates);
      } catch (err) {
        console.warn('Supabase tenant update notice:', err);
      }
    }
  };

  const deleteTenant = async (tenantId: string): Promise<void> => {
    const tenantToDelete = tenants.find((t) => t.id === tenantId);
    if (!tenantToDelete) return;

    // 1. Ajouter à la liste noire des locataires supprimés
    try {
      const stored = localStorage.getItem('sunu_deleted_tenants');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(tenantId)) list.push(tenantId);
      localStorage.setItem('sunu_deleted_tenants', JSON.stringify(list));
    } catch (e) {}

    // 2. Libérer l'unité occupée si liée
    if (tenantToDelete.unitId) {
      setUnits((prev) => {
        const updated = prev.map((u) => (u.id === tenantToDelete.unitId ? { ...u, status: 'DISPONIBLE' as const } : u));
        try {
          localStorage.setItem('sunu_units', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      setProperties((prev) => {
        const updated = prev.map((p) => {
          if (p.id === tenantToDelete.propertyId) {
            return {
              ...p,
              occupiedUnits: Math.max(0, p.occupiedUnits - 1),
            };
          }
          return p;
        });
        try {
          localStorage.setItem('sunu_properties', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    // 3. Supprimer également les baux rattachés à ce locataire
    setLeases((prev) => {
      const updated = prev.filter((l) => l.tenantId !== tenantId);
      try {
        localStorage.setItem('sunu_leases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 4. Suppression instantanée dans le state et le LocalStorage
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

    // 5. Suppression dans Supabase Cloud
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

  const updateOwner = async (ownerId: string, updates: Partial<Owner>): Promise<void> => {
    setOwners((prev) => {
      const updated = prev.map((o) => (o.id === ownerId ? { ...o, ...updates } : o));
      try {
        localStorage.setItem('sunu_owners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const target = owners.find((o) => o.id === ownerId);
    const fullName = `${updates.firstName || target?.firstName || ''} ${updates.lastName || target?.lastName || ''}`.trim();
    addAuditLog('MODIFICATION_PROPRIETAIRE', `Mise à jour des informations du bailleur ${fullName}`, 'PROPRIETAIRE');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Propriétaire mis à jour',
      message: `Le bailleur ${fullName} a été mis à jour avec succès.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.updateOwner(ownerId, updates);
      } catch (err) {
        console.warn('Supabase updateOwner notice:', err);
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

    // 1. Sauvegarde instantanée dans le state et LocalStorage
    setLeases((prev) => {
      const updated = [newLease, ...prev];
      try {
        localStorage.setItem('sunu_leases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Marquer l'unité comme occupée
    setUnits((prev) => {
      const updated = prev.map((u) => (u.id === leaseData.unitId ? { ...u, status: 'OCCUPE' as const } : u));
      try {
        localStorage.setItem('sunu_units', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Créer l'échéance de loyer
    const newSchedule: RentSchedule = {
      id: generateUUID(),
      leaseId: newId,
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

  const deleteLease = async (leaseId: string): Promise<void> => {
    const leaseToDelete = leases.find((l) => l.id === leaseId);
    if (!leaseToDelete) return;

    // 1. Ajouter à la liste noire des contrats supprimés
    try {
      const stored = localStorage.getItem('sunu_deleted_leases');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(leaseId)) list.push(leaseId);
      localStorage.setItem('sunu_deleted_leases', JSON.stringify(list));
    } catch (e) {}

    // 2. Libérer le logement
    if (leaseToDelete.unitId) {
      setUnits((prev) => {
        const updated = prev.map((u) => (u.id === leaseToDelete.unitId ? { ...u, status: 'DISPONIBLE' as const } : u));
        try {
          localStorage.setItem('sunu_units', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    // 3. Supprimer le contrat du state et LocalStorage
    setLeases((prev) => {
      const updated = prev.filter((l) => l.id !== leaseId);
      try {
        localStorage.setItem('sunu_leases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addAuditLog('SUPPRESSION_CONTRAT', `Suppression du contrat de ${leaseToDelete.tenantName}`, 'CONTRAT');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Contrat Supprimé',
      message: `Le contrat de ${leaseToDelete.tenantName} a été supprimé.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.deleteLease(leaseId, leaseToDelete.tenantName);
      } catch (err) {
        console.warn('Supabase deleteLease error:', err);
      }
    }
  };

  const updateLease = async (leaseId: string, updates: Partial<Lease>): Promise<void> => {
    setLeases((prev) => {
      const updated = prev.map((l) => (l.id === leaseId ? { ...l, ...updates } : l));
      try {
        localStorage.setItem('sunu_leases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const target = leases.find((l) => l.id === leaseId);
    const targetName = updates.tenantName || target?.tenantName || 'Locataire';
    addAuditLog('MODIFICATION_CONTRAT', `Mise à jour du contrat de ${targetName}`, 'CONTRAT');

    const notif: NotificationItem = {
      id: generateUUID(),
      type: 'SYSTEM',
      title: 'Contrat Mis à Jour',
      message: `Le contrat de location de ${targetName} a été modifié avec succès.`,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (SupabaseDbService.isConfigured()) {
      try {
        await SupabaseDbService.updateLease(leaseId, updates);
      } catch (err) {
        console.warn('Supabase updateLease notice:', err);
      }
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
        setCurrentUser,
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
        deleteRentSchedule,
        addRentSchedule,
        generateMonthlySchedules,
        resetRentSchedulesToDefault,
        addProperty,
        updateProperty,
        deleteProperty,
        addUnit,
        deleteUnit,
        addTenant,
        updateTenant,
        deleteTenant,
        addOwner,
        updateOwner,
        deleteOwner,
        createLease,
        updateLease,
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

