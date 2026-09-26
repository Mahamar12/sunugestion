export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN_AGENCE' 
  | 'GESTIONNAIRE' 
  | 'COMPTABLE' 
  | 'PROPRIETAIRE' 
  | 'LOCATAIRE';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  phone: string;
  role: UserRole;
  agencyId: string;
  avatar?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  username: string; // Identifiant de connexion unique
  password: string; // Mot de passe attribué
  role: UserRole;
  phone: string;
  status: 'ACTIF' | 'SUSPENDU';
  createdAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  ninea?: string; // Identification fiscale Sénégal
  rccm?: string;
  subscriptionPlan: 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED';
  createdAt: string;
}

export type PropertyType = 
  | 'IMMEUBLE' 
  | 'APPARTEMENT' 
  | 'VILLA' 
  | 'MAISON' 
  | 'STUDIO' 
  | 'MAGASIN'
  | 'BOUTIQUE' 
  | 'BUREAU' 
  | 'TERRAIN' 
  | 'LOCAL_COMMERCIAL';

export type PropertyStatus = 
  | 'DISPONIBLE' 
  | 'OCCUPE' 
  | 'EN_MAINTENANCE' 
  | 'RESERVE' 
  | 'HORS_SERVICE'
  | 'EN_RETARD';

export interface Property {
  id: string;
  agencyId: string;
  name: string;
  type: PropertyType;
  address: string;
  neighborhood: string;
  city: string;
  region: string;
  description: string;
  ownerId: string;
  ownerName: string;
  status: PropertyStatus;
  valuationFCFA: number;
  totalUnits: number;
  occupiedUnits: number;
  image: string;
  notes?: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  type: PropertyType;
  floor: string;
  surfaceM2: number;
  roomsCount: number;
  rentFCFA: number;
  chargesFCFA: number;
  status: PropertyStatus;
  tenantId?: string;
  tenantName?: string;
  ownerId: string;
  ownerName: string;
}

export interface Owner {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  identityDocNumber: string;
  bankAccount: string;
  notes?: string;
  propertiesCount: number;
  totalMonthlyRevenueFCFA: number;
  commissionRatePercent: number; // e.g. 5% or 10%
  createdAt: string;
}

export interface Tenant {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  birthDate?: string;
  address: string;
  profession: string;
  identityDocType: 'CNI' | 'PASSPORT' | 'PERMIS' | 'CARTE_CONSULAIRE';
  identityDocNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  propertyId: string;
  rentFCFA: number;
  entryDate: string;
  currentLeaseId: string;
  totalPaidFCFA: number;
  arrearsFCFA: number;
  notes?: string;
  status: 'ACTIF' | 'EN_RETARD' | 'ANCIEN';
  createdAt: string;
}

export type LeaseStatus = 
  | 'BROUILLON' 
  | 'ACTIF' 
  | 'EXPIRANT_BIENTOT' 
  | 'EXPIRE' 
  | 'RESILIE';

export interface Lease {
  id: string;
  agencyId: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  rentAmountFCFA: number;
  chargesAmountFCFA: number;
  depositAmountFCFA: number;
  paymentFrequency: 'MENSUEL' | 'TRIMESTRIEL' | 'ANNUEL';
  dueDayOfMonth: number; // e.g. 5th of month
  specialConditions?: string;
  status: LeaseStatus;
  createdAt: string;
}

export type RentScheduleStatus = 
  | 'A_VENIR' 
  | 'DUE' 
  | 'PAYE' 
  | 'PARTIEL' 
  | 'EN_RETARD' 
  | 'IMPAYE';

export interface RentSchedule {
  id: string;
  leaseId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  periodMonthYear: string; // e.g. "Septembre 2026"
  dueDate: string;
  rentFCFA: number;
  chargesFCFA: number;
  totalDueFCFA: number;
  paidAmountFCFA: number;
  remainingFCFA: number;
  status: RentScheduleStatus;
}

export type PaymentMethod = 
  | 'ESPECES' 
  | 'VIREMENT_BANCAIRE' 
  | 'WAVE' 
  | 'ORANGE_MONEY' 
  | 'AUTRE_MOBILE';

export interface Payment {
  id: string;
  agencyId: string;
  receiptNumber: string;
  tenantId: string;
  tenantName: string;
  leaseId: string;
  unitNumber: string;
  propertyName: string;
  amountFCFA: number;
  date: string;
  method: PaymentMethod;
  referenceNumber: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
  periodMonthYear?: string;
  dueDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
}

export interface Arrear {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantWhatsapp: string;
  propertyName: string;
  unitNumber: string;
  overdueAmountFCFA: number;
  daysOverdue: number;
  lastPaymentDate: string;
  remindersSentCount: number;
  lastReminderDate?: string;
  agingCategory: '1-7_JOURS' | '8-30_JOURS' | '31-60_JOURS' | 'PLUS_60_JOURS';
}

export type ExpenseCategory = 
  | 'REPARATION' 
  | 'ENTRETIEN' 
  | 'EAU' 
  | 'ELECTRICITE' 
  | 'NETTOYAGE' 
  | 'GARDIENNAGE' 
  | 'TRAVAUX' 
  | 'TAXE' 
  | 'ASSURANCE' 
  | 'COMMISSION' 
  | 'AUTRES';

export interface Expense {
  id: string;
  agencyId: string;
  propertyId: string;
  propertyName: string;
  category: ExpenseCategory;
  amountFCFA: number;
  date: string;
  vendorName: string;
  description: string;
  receiptRef?: string;
  recordedBy: string;
  createdAt: string;
}

export type MaintenancePriority = 'FAIBLE' | 'MOYENNE' | 'ELEVES' | 'URGENCE';
export type MaintenanceStatus = 'NOUVEAU' | 'ASSIGNE' | 'EN_COURS' | 'TERMINE' | 'FERME';

export interface MaintenanceTicket {
  id: string;
  agencyId: string;
  title: string;
  description: string;
  category: 'PLOMBERIE' | 'ELECTRICITE' | 'CLIMATISATION' | 'SERRURE' | 'PEINTURE' | 'NETTOYAGE' | 'AUTRE';
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  tenantId: string;
  tenantName: string;
  vendorId?: string;
  vendorName?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  agencyId: string;
  name: string;
  phone: string;
  whatsapp: string;
  trade: 'PLOMBIER' | 'ELECTRICIEN' | 'MACON' | 'PEINTRE' | 'MENUISIER' | 'FRIGORISTE' | 'NETTOYEUR' | 'JARDINIER' | 'SERRURIER' | 'TECHNICIEN';
  zone: string; // e.g. "Dakar & Almadies"
  hourlyRateFCFA: number;
  interventionsCount: number;
  notes?: string;
}

export type DocumentCategory = 
  | 'CONTRAT' 
  | 'QUITTANCE' 
  | 'RECEU' 
  | 'AVIS_ECHEANCE' 
  | 'RELANCE' 
  | 'ETAT_LIEUX' 
  | 'RAPPORT_PROPRIETAIRE' 
  | 'FACTURE' 
  | 'MAINTENANCE';

export interface AppDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  tenantName?: string;
  propertyName?: string;
  ownerName?: string;
  amountFCFA?: number;
  date: string;
  fileUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  type: 'PAYMENT' | 'ARREARS' | 'LEASE' | 'MAINTENANCE' | 'SYSTEM';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  entity: string;
  timestamp: string;
}

export interface SaaSPlan {
  id: 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  name: string;
  priceMonthlyFCFA: number;
  maxProperties: number | 'Illimité';
  maxTenants: number | 'Illimité';
  features: string[];
  recommended?: boolean;
}
